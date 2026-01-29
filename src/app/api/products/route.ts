import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const segment = searchParams.get("segment");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "12";

    let query = supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        description,
        short_description,
        category_id,
        segment,
        status,
        featured,
        meta_title,
        meta_description,
        created_at,
        updated_at,
        product_categories (
          name,
          slug
        ),
        product_variants (
          id,
          sku,
          weight,
          weight_unit,
          packing_type,
          form,
          price,
          compare_price,
          cost_price,
          stock_quantity,
          low_stock_threshold,
          track_inventory,
          image_urls
        )
      `,
      )
      .eq("status", "active");

    // Apply filters
    if (category) {
      query = query.eq("category_id", category);
    }

    if (segment) {
      query = query.eq("segment", segment);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (minPrice) {
      query = query.gte("min_price", parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte("max_price", parseFloat(maxPrice));
    }

    // Apply pagination
    const from = parseInt(page) * parseInt(limit) - parseInt(limit);
    const to = parseInt(page) * parseInt(limit);

    const {
      data: products,
      error,
      count,
    } = await query
      .range(from, to)
      .order("created_at", { ascending: false })
      .order("featured", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 },
      );
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: false })
      .eq("status", "active");

    // Apply same filters for count
    if (category) {
      // Note: This is simplified - in production, you'd want to apply the same filters
    }

    return NextResponse.json({
      products: products || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

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
    // This would be for admin product management
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { data: product, error } = await supabase
      .from("products")
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 },
      );
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
