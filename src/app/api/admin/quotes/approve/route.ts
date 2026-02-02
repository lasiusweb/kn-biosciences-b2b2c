import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check Role (Admin or Sales Manager)
    const role = user.user_metadata?.role;
    if (role !== "admin" && role !== "sales_manager") {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const { quoteId } = await req.json();
    if (!quoteId) {
      return NextResponse.json({ error: "Quote ID is required" }, { status: 400 });
    }

    // 3. Fetch Quote and Items
    const { data: quote, error: quoteError } = await supabaseAdmin
      .from("b2b_quotes")
      .select("*, b2b_quote_items(*)")
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (quote.status === "approved") {
      return NextResponse.json({ error: "Quote is already approved" }, { status: 400 });
    }

    // 4. Create Order
    const orderNumber = `ORD-B2B-${Date.now()}`;
    
    // We need shipping/billing address. For now, we take it from the user's default if available,
    // or use a placeholder if the quote doesn't have it.
    // In a real scenario, the quote should probably have these addresses.
    // Let's check if the user has a default shipping address.
    const { data: addresses } = await supabaseAdmin
      .from("addresses")
      .select("*")
      .eq("user_id", quote.user_id);
    
    const shippingAddress = addresses?.find(a => a.type === "shipping" && a.is_default) || addresses?.find(a => a.type === "shipping") || {};
    const billingAddress = addresses?.find(a => a.type === "billing" && a.is_default) || addresses?.find(a => a.type === "billing") || shippingAddress;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: quote.user_id,
        status: "confirmed",
        payment_status: "pending",
        currency: "INR",
        subtotal: quote.subtotal,
        tax_amount: quote.tax_amount,
        total_amount: quote.total_amount,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        notes: quote.notes
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation failed:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // 5. Create Order Items
    const orderItems = quote.b2b_quote_items.map((item: any) => ({
      order_id: order.id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items insertion failed:", itemsError);
      // Ideally rollback order creation here if possible, 
      // but without transactions we'd have to delete the order manually or use RPC.
      return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
    }

    // 6. Update Quote
    const { error: updateError } = await supabaseAdmin
      .from("b2b_quotes")
      .update({
        status: "approved",
        linked_order_id: order.id
      })
      .eq("id", quoteId);

    if (updateError) {
      console.error("Quote update failed:", updateError);
      return NextResponse.json({ error: "Failed to update quote status" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Quote approved successfully",
      orderId: order.id,
      orderNumber: order.order_number
    });

  } catch (error: any) {
    console.error("Quote approval API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
