// Enhanced Cart API with better error handling and product details integration
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Cart item interface with product details
interface CartItemWithProduct extends CartItem {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_price?: number;
    image_urls: string[];
    segment: string;
    stock_quantity: number;
    track_inventory: boolean;
    description?: string;
    short_description?: string;
    meta_title?: string;
    meta_description?: string;
  };
  product_variants: {
    id: string;
    sku: string;
    price: number;
    compare_price?: number;
    weight: number;
    weight: string;
    weight: string;
    packing_type: string;
    form: string;
    image_urls?: string[];
    stock_quantity: number;
  };
}

// Constants for shipping calculation
const SHIPPING_THRESHOLD = 500;
const TAX_RATE = 0.18; // 18% GST

// GET /api/cart - Get user's cart with full product details
export async function GET(request: NextRequest) {
  try {
    const { data: { user } = await supabase.auth.getUser();
    
    if (!data.user) {
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
      .eq("user_id", data.user.id)
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
    
    for (const item of cart.cart_items) {
      // Get product details for each item
      const { data: variant } = await supabase
        .from("product_variants")
        .select(`
          id,
          price,
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

      cartItemsWithProducts.push({
        ...item,
        product: product || {
          name: `Product ${item.id}`,
          price: item.quantity * (variant?.price || 0),
          image_urls: variant?.image_urls || product?.image_urls || [],
          },
        product_variant: variant || {
          id: variant_id,
          sku: variant?.sku || `VAR-${item.id}`,
          price: variant?.price || 0,
          weight: variant?.weight || 0,
          weight_unit: variant?.weight_unit || 'g',
          form: variant?.form || 'solid',
          stock_quantity: variant?.stock_quantity || 0,
        },
        quantity: item.quantity,
        added_at: item.added_at,
      });
    }

    // Calculate cart summary
    const subtotal = cartItemsWithProducts.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    const discount = 0; // Would be calculated from coupon codes
    const tax = subtotal * TAX_RATE;
    const shipping = subtotal >= SHIPPING_THRESHOLD ? SHIPPING_COST : 0;
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