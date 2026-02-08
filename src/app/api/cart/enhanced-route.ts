// Enhanced Cart API with better error handling and product details integration
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Cart item interface with product details
interface CartItemWithProduct {
  id: string;
  quantity: number;
  variant_id: string;
  added_at: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_price?: number;
    image_urls: string[];
    segment: string;
    stock_quantity: number;
  };
  product_variant: {
    id: string;
    sku: string;
    price: number;
    compare_price?: number;
    weight: number;
    weight_unit: string;
    packing_type?: string;
    form?: string;
    image_urls?: string[];
    stock_quantity: number;
  };
}

// Constants for shipping calculation
const SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 50; // Added missing constant
const TAX_RATE = 0.18; // 18% GST

// GET /api/cart - Get user's cart with full product details
export async function GET(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's active cart
    const { data: cart } = await supabase
      .from("carts")
      .select(`
        id,
        created_at,
        updated_at,
        cart_items (
          id,
          quantity,
          variant_id,
          added_at
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!cart) {
      return NextResponse.json({
        cart: null,
        items: [],
        summary: {
          subtotal: 0,
          discount: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          item_count: 0,
        },
      });
    }

    // Get cart items with product details
    const cartItemsWithProducts: CartItemWithProduct[] = [];
    
    for (const item of (cart.cart_items as any[])) {
      // Get product details for each item
      const { data: variant } = await supabase
        .from("product_variants")
        .select(`
          id,
          product_id,
          sku,
          price,
          compare_price,
          weight,
          weight_unit,
          packing_type,
          form,
          image_urls,
          stock_quantity
        `)
      .eq("id", item.variant_id)
      .single();

      if (!variant) {
        continue;
      }

      // Get the product for the variant
      const { data: product } = await supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          price,
          compare_price,
          image_urls,
          segment,
          stock_quantity
        `)
      .eq("id", variant.product_id)
        .single();

      if (!product) continue;

      cartItemsWithProducts.push({
        id: item.id,
        quantity: item.quantity,
        variant_id: item.variant_id,
        added_at: item.added_at,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          compare_price: product.compare_price,
          image_urls: product.image_urls || [],
          segment: product.segment,
          stock_quantity: product.stock_quantity,
        },
        product_variant: {
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          compare_price: variant.compare_price,
          weight: variant.weight,
          weight_unit: variant.weight_unit,
          packing_type: variant.packing_type,
          form: variant.form,
          image_urls: variant.image_urls,
          stock_quantity: variant.stock_quantity,
        },
      });
    }

    // Calculate cart summary
    const subtotal = cartItemsWithProducts.reduce((sum, item) => sum + (item.product_variant?.price || 0) * item.quantity, 0);
    const discount = 0; // Would be calculated from coupon codes
    const tax = subtotal * TAX_RATE;
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + tax + shipping - discount;

    return NextResponse.json({
      cart: {
        id: cart.id,
        created_at: cart.created_at,
        updated_at: cart.updated_at,
      },
      items: cartItemsWithProducts,
      summary: {
        subtotal,
        discount,
        shipping,
        tax,
        total,
        item_count: cartItemsWithProducts.length,
      },
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}
