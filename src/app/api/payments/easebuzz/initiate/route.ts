import { NextRequest, NextResponse } from "next/server";
import { easebuzzService } from "@/lib/payments/easebuzz";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId, customerInfo } = await request.json();

    if (!amount || !orderId || !customerInfo || !customerInfo.email || !customerInfo.name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. Fetch Order to verify
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Generate Transaction ID (if not already present or use order_number)
    const txnid = order.order_number;
    const amountStr = Number(amount).toFixed(2);
    const productinfo = `Order #${txnid}`;
    const firstname = customerInfo.name.split(" ")[0];
    const email = customerInfo.email;
    const phone = customerInfo.phone || "";

    // 3. Generate Hash
    const udfs = {
      udf1: orderId,
      udf2: txnid,
    };
    const hash = easebuzzService.generateHash(txnid, amountStr, productinfo, firstname, email, udfs);

    // 4. Call Easebuzz Initiate API to get access_key
    // Easebuzz requires fields as form-data
    const formData = new URLSearchParams();
    formData.append("key", process.env.EASEBUZZ_MERCHANT_KEY || "");
    formData.append("txnid", txnid);
    formData.append("amount", amountStr);
    formData.append("productinfo", productinfo);
    formData.append("firstname", firstname);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("surl", `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/easebuzz/callback`);
    formData.append("furl", `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/easebuzz/callback`);
    formData.append("hash", hash);
    formData.append("udf1", udfs.udf1);
    formData.append("udf2", udfs.udf2);

    const easebuzzUrl = easebuzzService.getPaymentUrl();
    const response = await fetch(easebuzzUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: formData,
    });

    const result = await response.json();

    if (result.status === 1) {
      // 5. Update order with payment initiation info
      await supabase
        .from("orders")
        .update({
          payment_method: "easebuzz",
          payment_status: "pending",
          payment_order_id: txnid,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      return NextResponse.json({
        success: true,
        access_key: result.data, // Easebuzz returns access_key in .data
        key: process.env.EASEBUZZ_MERCHANT_KEY,
      });
    } else {
      console.error("Easebuzz initiation failed:", result);
      return NextResponse.json(
        { error: result.data || "Failed to initiate payment with Easebuzz" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Easebuzz initiation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
