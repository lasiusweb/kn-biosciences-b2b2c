import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Get user from session or authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's cart with full product details
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        quantity,
        added_at,
        product_variants (
          id,
          sku,
          price,
          compare_price,
          weight,
          weight_unit,
          products (
            id,
            name,
            slug,
            description,
            images,
            category_id
          )
        )
      `,
      )
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch cart" },
        { status: 500 },
      );
    }

    // Calculate cart totals
    const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const subtotal = cartItems?.reduce(
      (sum, item) => sum + (item.product_variants?.price || 0) * item.quantity,
      0
    ) || 0;

    return NextResponse.json({
      cartItems: cartItems || [],
      summary: {
        totalItems,
        subtotal,
        itemCount: cartItems?.length || 0,
      },
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Cart API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { variantId, quantity } = body;

    if (!variantId || !quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Check if variant exists and has enough stock
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("*, products(*)")
      .eq("id", variantId)
      .single();

    if (variantError || !variant) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if ((variant as any).stock_quantity < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 },
      );
    }

    // Check if item already exists in cart and update quantity
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("variant_id", variantId)
      .single();

    let cartItem;
    let cartError;

    if (existingItem) {
      // Update existing item
      const newQuantity = (existingItem as any).quantity + quantity;
      const result = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", (existingItem as any).id)
        .select()
        .single();
      cartItem = result.data;
      cartError = result.error;
    } else {
      // Add new item to cart
      const result = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          variant_id: variantId,
          quantity,
        })
        .select()
        .single();
      cartItem = result.data;
      cartError = result.error;
    }

    if (cartError) {
      return NextResponse.json(
        { error: "Failed to add to cart" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        cartItem,
        message: "Item added to cart successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || !quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Update cart item quantity
    const { data: cartItem, error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update cart item" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      cartItem,
      message: "Cart item updated successfully",
    });
  } catch (error) {
    console.error("Cart PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    // Delete cart item
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to remove cart item" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Cart item removed successfully",
    });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
