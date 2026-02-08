import { NextRequest, NextResponse } from "next/server";
import { easebuzzService } from "@/lib/payments/easebuzz";
import { supabase } from "@/lib/supabase";
import { notificationService } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const response = Object.fromEntries(formData.entries()) as any;

    // 1. Verify Hash
    const isValidHash = easebuzzService.verifyResponseHash(response);
    if (!isValidHash) {
      console.error("Easebuzz webhook: Invalid hash", response);
      return NextResponse.json({ error: "Invalid hash" }, { status: 400 });
    }

    const { status, txnid, easepayid, udf1: orderId } = response;

    if (status === "success") {
      // 2. Check Order Status (Idempotency)
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        console.error("Easebuzz webhook: Order not found", orderId);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (order.status === "confirmed" || order.status === "shipped" || order.status === "delivered") {
        return NextResponse.json({ message: "Order already processed" }, { status: 200 });
      }

      // 3. Atomically Confirm Order and Deduct Inventory
      const { error: fulfillmentError } = await supabase.rpc("confirm_order_and_deduct_inventory", {
        p_order_id: orderId,
        p_payment_id: easepayid,
        p_payment_method: "easebuzz"
      });

      if (fulfillmentError) {
        console.error("Easebuzz webhook: Fulfillment error", fulfillmentError);
        return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
      }

      // 4. Trigger Notifications (Async)
      notificationService.sendOrderConfirmation(order).catch(err => 
        console.error("Webhook notification error:", err)
      );

      // 5. Queue for Zoho Books sync
      await zohoQueueService.addToQueue({
        entity_type: 'order',
        entity_id: orderId,
        operation: 'create',
        zoho_service: 'books',
        zoho_entity_type: 'Invoice'
      });

      return NextResponse.json({ message: "Order confirmed successfully" }, { status: 200 });
    } else {
      // Payment failed
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      return NextResponse.json({ message: "Payment failure logged" }, { status: 200 });
    }
  } catch (error) {
    console.error("Easebuzz webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
