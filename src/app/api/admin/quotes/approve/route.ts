import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import paymentService from "@/lib/payments/razorpay";
import { zohoQueueService } from "@/lib/integrations/zoho/queue-service"; // Import the queue service

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check Role (Admin or Sales Manager)
    const role = currentUser.user_metadata?.role;
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
      .select("*, b2b_quote_items(*), user:users(*)")
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

    // Queue new order for Zoho Books sync as Invoice
    await zohoQueueService.addToQueue({
      entity_type: 'order',
      entity_id: order.id,
      operation: 'create',
      zoho_service: 'books',
      zoho_entity_type: 'Invoice'
    });

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
      return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
    }

    // 6. Generate Payment Link
    let paymentLinkUrl = null;
    try {
      const customer = {
        name: `${quote.user?.first_name || ""} ${quote.user?.last_name || ""}`.trim() || "B2B Customer",
        email: quote.user?.email || "",
        contact: quote.user?.phone || undefined
      };

      const paymentLink = await paymentService.generatePaymentLink(
        quote.total_amount,
        `Payment for B2B Order ${orderNumber}`,
        customer,
        order.id
      );
      paymentLinkUrl = paymentLink.short_url;
    } catch (error) {
      console.error("Payment link generation failed:", error);
      // We don't fail the whole process if payment link fails, 
      // but it's better to log it and maybe notify admin.
    }

    // 7. Update Quote and Order
    const { error: updateQuoteError } = await supabaseAdmin
      .from("b2b_quotes")
      .update({
        status: "approved",
        linked_order_id: order.id
      })
      .eq("id", quoteId);

    if (updateQuoteError) {
      console.error("Quote update failed:", updateQuoteError);
      return NextResponse.json({ error: "Failed to update quote status" }, { status: 500 });
    }

    // Queue approved quote for Zoho Books sync as Estimate
    await zohoQueueService.addToQueue({
      entity_type: 'b2b_quote',
      entity_id: quote.id,
      operation: 'update', // or 'create' if it's the first time
      zoho_service: 'books',
      zoho_entity_type: 'Estimate'
    });

    if (paymentLinkUrl) {
      await supabaseAdmin
        .from("orders")
        .update({ payment_link_url: paymentLinkUrl })
        .eq("id", order.id);
    }

    return NextResponse.json({
      message: "Quote approved successfully",
      orderId: order.id,
      orderNumber: order.order_number,
      paymentLinkUrl
    });

  } catch (error: any) {
    console.error("Quote approval API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
