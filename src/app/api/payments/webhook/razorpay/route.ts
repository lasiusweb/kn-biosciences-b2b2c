import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    // Verify webhook signature
    const isValid = verifyWebhookSignature(
      body,
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET || "",
    );

    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    console.log("Webhook event received:", event.event);

    switch (event.event) {
      case "payment.authorized":
        await handlePaymentAuthorized(event.payload.payment.entity);
        break;

      case "payment.captured":
        await handlePaymentCaptured(event.payload.payment.entity);
        break;

      case "payment.failed":
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      case "refund.processed":
        await handleRefundProcessed(event.payload.refund.entity);
        break;

      case "order.paid":
        await handleOrderPaid(event.payload.order.entity);
        break;

      default:
        console.log("Unhandled webhook event:", event.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function handlePaymentAuthorized(payment: any) {
  try {
    console.log("Payment authorized:", payment.id);

    // Update order status to authorized
    await supabase
      .from("orders")
      .update({
        payment_status: "authorized",
        payment_response: payment,
        updated_at: new Date().toISOString(),
      })
      .eq("payment_order_id", payment.order_id);
  } catch (error) {
    console.error("Error handling payment authorization:", error);
  }
}

async function handlePaymentCaptured(payment: any) {
  try {
    console.log("Payment captured:", payment.id);

    // Update order status to completed
    await supabase
      .from("orders")
      .update({
        payment_status: "completed",
        status: "confirmed",
        payment_response: payment,
        updated_at: new Date().toISOString(),
      })
      .eq("payment_order_id", payment.order_id);

    // Send order confirmation email
    await sendOrderConfirmation(payment.order_id);

    // Get the order ID from the database
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("id")
      .eq("payment_order_id", payment.order_id)
      .single();

    if (orderError || !orderData) {
      console.error("Razorpay webhook: Order not found for payment_order_id", payment.order_id);
      return;
    }

    // Queue for Zoho Books sync
    await zohoQueueService.addToQueue({
      entity_type: 'order',
      entity_id: orderData.id,
      operation: 'create',
      zoho_service: 'books',
      zoho_entity_type: 'Invoice'
    });
  } catch (error) {
    console.error("Error handling payment capture:", error);
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    console.log("Payment failed:", payment.id);

    // Update order status to failed
    await supabase
      .from("orders")
      .update({
        payment_status: "failed",
        payment_response: payment,
        updated_at: new Date().toISOString(),
      })
      .eq("payment_order_id", payment.order_id);

    // Send payment failure notification
    await sendPaymentFailureNotification(payment.order_id, payment);
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}

async function handleRefundProcessed(refund: any) {
  try {
    console.log("Refund processed:", refund.id);

    // Update order refund status
    await supabase
      .from("orders")
      .update({
        refund_status: "processed",
        refund_response: refund,
        updated_at: new Date().toISOString(),
      })
      .eq("payment_id", refund.payment_id);

    // Send refund confirmation email
    await sendRefundConfirmation(refund.payment_id);
  } catch (error) {
    console.error("Error handling refund processed:", error);
  }
}

async function handleOrderPaid(order: any) {
  try {
    console.log("Order paid:", order.id);

    // Update order status
    await supabase
      .from("orders")
      .update({
        status: "processing",
        payment_status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);
  } catch (error) {
    console.error("Error handling order paid:", error);
  }
}

// Email notification functions (to be implemented)
async function sendOrderConfirmation(orderId: string) {
  console.log("Order confirmation email sent for:", orderId);
  // TODO: Implement email service
}

async function sendPaymentFailureNotification(orderId: string, payment: any) {
  console.log("Payment failure notification sent for:", orderId);
  // TODO: Implement email service
}

async function sendRefundConfirmation(paymentId: string) {
  console.log("Refund confirmation email sent for payment:", paymentId);
  // TODO: Implement email service
}
