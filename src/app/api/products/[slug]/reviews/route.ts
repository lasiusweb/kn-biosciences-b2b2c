import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cache } from "@/lib/enterprise/redis-cache";
import { ProductReview, ReviewFilter, ReviewStats, ReviewAggregates } from "@/types/reviews";

// GET /api/products/[slug]/reviews - Get product reviews
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const filter: ReviewFilter = {
      rating: searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined,
      verified_purchase: searchParams.get('verified') === 'true',
      has_images: searchParams.get('images') === 'true',
      sort_by: searchParams.get('sort') as any || 'newest',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: Math.min(searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10, 50),
    };

    // First, try to get product info
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("slug", params.slug)
      .single();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check cache for review aggregates
    const cacheKey = `reviews:${product.id}:aggregates`;
    let aggregates = await cache.get<ReviewAggregates>(cacheKey);

    if (!aggregates) {
      // Calculate aggregates from database
      const { data: reviews } = await supabase
        .from("product_reviews")
        .select("rating, verified_purchase")
        .eq("product_id", product.id)
        .eq("status", "approved");

      const totalReviews = reviews?.length || 0;
      const verifiedReviews = reviews?.filter(r => r.verified_purchase) || [];
      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

      reviews?.forEach(review => {
        if (review.rating >= 1 && review.rating <= 5) {
          ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
        }
      });

      const avgRating = totalReviews > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0;

      const avgVerifiedRating = verifiedReviews.length > 0
        ? verifiedReviews.reduce((sum, r) => sum + r.rating, 0) / verifiedReviews.length
        : 0;

      aggregates = {
        product_id: product.id,
        average_rating: Math.round(avgRating * 100) / 100,
        total_reviews: totalReviews,
        rating_distribution: ratingDistribution,
        verified_purchase_reviews: verifiedReviews.length,
        average_rating_verified: Math.round(avgVerifiedRating * 100) / 100,
        recent_reviews: []
      };

      // Cache for 15 minutes
      await cache.set(cacheKey, aggregates, 900);
    }

    // Build query with filters
    let query = supabase
      .from("product_reviews")
      .select(`
        *,
        users!inner(
          first_name,
          last_name
        ),
        order_items!inner(
          created_at
        )
      `)
      .eq("product_id", product.id)
      .eq("status", "approved");

    // Apply filters
    if (filter.rating) {
      query = query.eq("rating", filter.rating);
    }
    if (filter.verified_purchase !== undefined) {
      query = query.eq("verified_purchase", filter.verified_purchase);
    }

    // Apply sorting
    switch (filter.sort_by) {
      case 'oldest':
        query = query.order("created_at", { ascending: true });
        break;
      case 'rating_high':
        query = query.order("rating", { ascending: false });
        break;
      case 'rating_low':
        query = query.order("rating", { ascending: true });
        break;
      case 'helpful':
        query = query.order("helpful_count", { ascending: false });
        break;
      default: // newest
        query = query.order("created_at", { ascending: false });
        break;
    }

    // Apply pagination
    const offset = (filter.page! - 1) * filter.limit!;
    query = query.range(offset, offset + filter.limit! - 1);

    const { data: reviews, error, count } = await query;

    if (error) {
      throw error;
    }

    const response = {
      product: {
        id: product.id,
        slug: params.slug,
      },
      aggregates,
      reviews: reviews || [],
      pagination: {
        page: filter.page,
        limit: filter.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / filter.limit!),
      },
    };

    // Cache individual reviews
    if (reviews && reviews.length > 0) {
      const reviewsCacheKey = `reviews:${product.id}:${JSON.stringify(filter)}`;
      await cache.set(reviewsCacheKey, reviews, 300); // 5 minutes
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Reviews API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/products/[slug]/reviews - Create a new review
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rating, title, content } = body;

    // Validate review data
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5 stars" },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { error: "Review content must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Review content cannot exceed 2000 characters" },
        { status: 400 }
      );
    }

    // Get product and verify user purchased it
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("slug", params.slug)
      .single();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if user has purchased this product
    const { data: orderItem } = await supabase
      .from("order_items")
      .select(`
        id,
        orders!inner(
          user_id,
          status
        )
      `)
      .eq("variant_id", in `
        SELECT id FROM product_variants WHERE product_id = '${product.id}'
      `)
      .eq("orders.user_id", user.id)
      .eq("orders.status", "delivered")
      .single();

    const verifiedPurchase = !!orderItem;

    // Create review
    const { data: review, error } = await supabase
      .from("product_reviews")
      .insert({
        product_id: product.id,
        user_id: user.id,
        order_item_id: orderItem?.id,
        rating,
        title: title?.trim() || undefined,
        content: content.trim(),
        verified_purchase: verifiedPurchase,
        status: "pending", // Require admin approval
        helpful_count: 0,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Clear cache for this product
    await cache.clear(`reviews:${product.id}:*`);
    await cache.clear(`reviews:${product.id}:aggregates`);

    // Send notification to admin for new review approval
    if (verifiedPurchase) {
      // Auto-approve verified purchase reviews
      await supabase
        .from("product_reviews")
        .update({ status: "approved" })
        .eq("id", review.id);
    }

    return NextResponse.json({
      review: {
        ...review,
        verified_purchase: verifiedPurchase,
        status: verifiedPurchase ? "approved" : "pending"
      },
      message: verifiedPurchase 
        ? "Review published successfully" 
        : "Review submitted for approval. You'll be notified once approved."
    }, { status: 201 });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}