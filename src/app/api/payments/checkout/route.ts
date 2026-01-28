import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/lib/payments/razorpay";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId, customerInfo, paymentMethod } =
      await request.json();

    if (!amount || !orderId || !customerInfo || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate customer info
    if (!customerInfo.email || !customerInfo.name) {
      return NextResponse.json(
        { error: "Invalid customer information" },
        { status: 400 },
      );
    }

    // Check if order exists and belongs to user
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Create payment order based on payment method
    let paymentOrder;

    switch (paymentMethod) {
      case "razorpay":
        paymentOrder = await paymentService.createOrder({
          amount: Math.round(amount),
          currency: "INR",
          receipt: orderId,
          notes: {
            customer_name: customerInfo.name,
            customer_email: customerInfo.email,
            customer_phone: customerInfo.phone || "",
            order_id: orderId,
          },
        });
        break;

      case "payu":
        const { payuService } = await import("@/lib/payments/payu");
        const payuOrder = payuService.createOrder({
          txnid: `txn_${Date.now()}_${orderId}`,
          amount: Math.round(amount),
          productinfo: `Order #${orderId}`,
          firstname: customerInfo.name.split(" ")[0],
          email: customerInfo.email,
          phone: customerInfo.phone || "",
          udf1: orderId,
        });

        return NextResponse.json({
          success: true,
          paymentMethod: "payu",
          paymentUrl: payuService.getPaymentUrl(),
          orderData: payuOrder,
        });

      default:
        return NextResponse.json(
          { error: "Unsupported payment method" },
          { status: 400 },
        );
    }

    // Update order with payment information
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_method: paymentMethod,
        payment_status: "pending",
        payment_order_id: paymentOrder.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order:", updateError);
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      paymentMethod: "razorpay",
      orderId: paymentOrder.id,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      customer: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone,
      },
      notes: paymentOrder.notes,
    });
  } catch (error) {
    console.error("Payment checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Handle payment verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      payu_txn_status,
      txnid,
      mihpayid,
    } = Object.fromEntries(searchParams.entries());

    // Handle Razorpay callback
    if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
      const isValid = paymentService.verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      );

      if (!isValid) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure?reason=invalid_signature`,
        );
      }

      // Capture payment
      const payment = await paymentService.capturePayment(
        razorpay_payment_id,
        0, // Razorpay can capture full amount without specifying amount
      );

      // Update order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "completed",
          payment_id: razorpay_payment_id,
          payment_response: payment,
          updated_at: new Date().toISOString(),
        })
        .eq("payment_order_id", razorpay_order_id);

      if (updateError) {
        console.error("Error updating order after payment:", updateError);
      }

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?payment_id=${razorpay_payment_id}`,
      );
    }

    // Handle PayU callback
    if (payu_txn_status && txnid) {
      const { payuService } = await import("@/lib/payments/payu");
      const response = await payuService.getTransactionStatus(txnid);

      if (response && payuService.processResponse(response).success) {
        // Update order status
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            payment_status: "completed",
            payment_id: response.mihpayid,
            payment_response: response,
            updated_at: new Date().toISOString(),
          })
          .eq("payment_order_id", txnid);

        if (updateError) {
          console.error("Error updating order after payment:", updateError);
        }

        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?payment_id=${response.mihpayid}`,
        );
      }

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure?reason=payment_failed`,
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure?reason=invalid_request`,
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure?reason=server_error`,
    );
  }
}
