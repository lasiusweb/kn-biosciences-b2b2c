import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const offset = (page - 1) * limit;

    const { data: wishlist, error, count } = await supabase
      .from("wishlist")
      .select(`
        *,
        product_variants (
          *,
          products (
            name,
            slug,
            price,
            compare_price,
            image_urls,
            status
          )
        )
      `)
      .eq("user_id", user.id)
      .order("added_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      wishlist: wishlist || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Wishlist fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { variant_id } = body;

    if (!variant_id) {
      return NextResponse.json(
        { error: "Variant ID is required" },
        { status: 400 }
      );
    }

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("variant_id", variant_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Item already in wishlist" },
        { status: 409 }
      );
    }

    const { data: wishlistItem, error } = await supabase
      .from("wishlist")
      .insert({
        user_id: user.id,
        variant_id,
      })
      .select(`
        *,
        product_variants (
          *,
          products (
            name,
            slug,
            price,
            compare_price,
            image_urls
          )
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: "Added to wishlist",
      item: wishlistItem,
    }, { status: 201 });
  } catch (error) {
    console.error("Wishlist add error:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const variant_id = searchParams.get('variant_id');

    if (!variant_id) {
      return NextResponse.json(
        { error: "Variant ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", user.id)
      .eq("variant_id", variant_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: "Removed from wishlist",
    });
  } catch (error) {
    console.error("Wishlist remove error:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}