import { NextRequest, NextResponse } from "next/server";
import {
  recommendationEngine,
  RecommendationContext,
} from "@/lib/recommendations/engine";
import { supabase } from "@/lib/supabase";

async function checkAdminAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;
  const {
    data: { user },
  } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  return user?.user_metadata?.role === "admin";
}

export async function POST(request: NextRequest) {
  try {
    const recommendationRequest = await request.json();

    // Validate request
    if (!recommendationRequest.context) {
      return NextResponse.json(
        { error: "Recommendation context is required" },
        { status: 400 },
      );
    }

    // Generate recommendations
    const recommendations = await recommendationEngine.generateRecommendations(
      recommendationRequest.context,
    );

    // Log recommendation request for analytics
    await logRecommendationRequest(recommendationRequest, recommendations);

    return NextResponse.json({
      success: true,
      ...recommendations,
    });
  } catch (error) {
    console.error("Recommendations API error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate recommendations",
        message: "Please try again later",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const context: RecommendationContext = {
      userId: searchParams.get("user_id") || undefined,
      currentProductId: searchParams.get("product_id") || undefined,
      searchQuery: searchParams.get("q") || undefined,
      category: searchParams.get("category") || undefined,
      priceRange:
        searchParams.get("min_price") || searchParams.get("max_price")
          ? {
              min: parseFloat(searchParams.get("min_price") || "0"),
              max: parseFloat(searchParams.get("max_price") || "999999"),
            }
          : undefined,
      limit: parseInt(searchParams.get("limit") || "10"),
    };

    // Generate recommendations based on query parameters
    const recommendations =
      await recommendationEngine.generateRecommendations(context);

    return NextResponse.json({
      success: true,
      ...recommendations,
      query_parameters: context,
    });
  } catch (error) {
    console.error("GET recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 },
    );
  }
}

// Recommendations for specific product page
export async function PUT(request: NextRequest) {
  try {
    const { product_id, user_id, limit = 10 } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const context: RecommendationContext = {
      userId: user_id,
      currentProductId: product_id,
      limit,
    };

    const recommendations =
      await recommendationEngine.generateRecommendations(context);

    return NextResponse.json({
      success: true,
      ...recommendations,
    });
  } catch (error) {
    console.error("Product recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to get product recommendations" },
      { status: 500 },
    );
  }
}

// User behavior tracking for improving recommendations
export async function PATCH(request: NextRequest) {
  try {
    const { user_id, interaction_type, product_id, rating, session_id } =
      await request.json();

    if (!user_id || !interaction_type || !product_id) {
      return NextResponse.json(
        { error: "User ID, interaction type, and product ID are required" },
        { status: 400 },
      );
    }

    // Validate interaction type
    const validInteractions = [
      "view",
      "add_to_cart",
      "purchase",
      "wishlist",
      "rating",
      "search_click",
    ];
    if (!validInteractions.includes(interaction_type)) {
      return NextResponse.json(
        { error: "Invalid interaction type", valid_types: validInteractions },
        { status: 400 },
      );
    }

    // Log user interaction
    await supabase.from("user_interactions").insert({
      user_id,
      interaction_type,
      product_id,
      rating,
      session_id: session_id || null,
      created_at: new Date().toISOString(),
      metadata: {
        user_agent: request.headers.get("user-agent"),
        ip_address:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip"),
      },
    });

    // Update user profile for personalization
    if (interaction_type === "purchase") {
      await updateUserProfile(user_id, product_id);
    }

    return NextResponse.json({
      success: true,
      message: "Interaction logged successfully",
    });
  } catch (error) {
    console.error("User behavior tracking error:", error);
    return NextResponse.json(
      { error: "Failed to log interaction" },
      { status: 500 },
    );
  }
}

// Get user's recommendation history
export async function GET_history(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Get user's interaction history
    const { data: interactions } = await supabase
      .from("user_interactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    // Get user's recommendation logs
    const { data: recommendationLogs } = await supabase
      .from("recommendation_logs")
      .select("*")
      .eq("user_id", userId)
      .order("generated_at", { ascending: false })
      .limit(limit);

    // Get user's preference profile
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    return NextResponse.json({
      success: true,
      user_profile: userProfile,
      interaction_history: interactions || [],
      recommendation_history: recommendationLogs || [],
    });
  } catch (error) {
    console.error("User history error:", error);
    return NextResponse.json(
      { error: "Failed to get user history" },
      { status: 500 },
    );
  }
}

// Helper functions
async function logRecommendationRequest(
  request: any,
  recommendations: any,
): Promise<void> {
  try {
    await supabase.from("recommendation_analytics").insert({
      request_context: request.context,
      recommendation_count: recommendations.recommendations?.length || 0,
      algorithm_used: recommendations.metadata?.algorithm,
      processing_time_ms: 0, // Would calculate actual processing time
      user_id: request.context.userId,
      session_id: recommendations.metadata?.session_id,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error logging recommendation request:", error);
  }
}

async function updateUserProfile(
  userId: string,
  productId: string,
): Promise<void> {
  try {
    // Get product details to extract preferences
    const { data: product } = await supabase
      .from("products")
      .select("category_id, brand, price, tags")
      .eq("id", productId)
      .single();

    if (!product) return;

    // Update user's preference profile
    await supabase.rpc("update_user_preferences", {
      p_user_id: userId,
      p_category_id: product.category_id,
      p_brand: product.brand,
      p_avg_price: product.price,
      p_tags: product.tags,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
  }
}
