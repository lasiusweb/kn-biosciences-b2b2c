// Payment Gateway Integration - Razorpay
import Razorpay from "razorpay";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export interface PaymentOrder {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id?: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RefundResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  notes: Record<string, string>;
  receipt: string;
  status: string;
  created_at: number;
}

class PaymentService {
  // Create a new payment order
  async createOrder(orderData: PaymentOrder): Promise<PaymentResponse> {
    try {
      const order = await razorpay.orders.create({
        amount: orderData.amount * 100, // Convert to paise
        currency: orderData.currency || "INR",
        receipt: orderData.receipt,
        notes: orderData.notes || {},
      });

      return order as unknown as PaymentResponse;
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      throw new Error("Failed to create payment order");
    }
  }

  // Capture payment after successful transaction
  async capturePayment(
    paymentId: string,
    amount: number,
  ): Promise<PaymentResponse> {
    try {
      const payment = await razorpay.payments.capture(paymentId, amount * 100);
      return payment as unknown as PaymentResponse;
    } catch (error) {
      console.error("Error capturing payment:", error);
      throw new Error("Failed to capture payment");
    }
  }

  // Verify payment signature
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const body = `${orderId}|${paymentId}`;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    return expectedSignature === signature;
  }

  // Get payment details
  async getPaymentDetails(paymentId: string): Promise<PaymentResponse> {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return payment as unknown as PaymentResponse;
    } catch (error) {
      console.error("Error fetching payment details:", error);
      throw new Error("Failed to fetch payment details");
    }
  }

  // Process refunds
  async processRefund(
    paymentId: string,
    amount?: number,
    notes?: Record<string, string>,
  ): Promise<RefundResponse> {
    try {
      const refundOptions: any = {
        notes: notes || {},
      };

      if (amount) {
        refundOptions.amount = amount * 100;
      }

      const refund = await razorpay.payments.refund(paymentId, refundOptions);
      return refund as unknown as RefundResponse;
    } catch (error) {
      console.error("Error processing refund:", error);
      throw new Error("Failed to process refund");
    }
  }

  // Get all payments for an order
  async getOrderPayments(orderId: string): Promise<PaymentResponse[]> {
    try {
      const payments = await razorpay.orders.fetchPayments(orderId);
      return payments.items as unknown as PaymentResponse[];
    } catch (error) {
      console.error("Error fetching order payments:", error);
      throw new Error("Failed to fetch order payments");
    }
  }

  // Check payment status
  async getPaymentStatus(paymentId: string): Promise<string> {
    try {
      const payment = await this.getPaymentDetails(paymentId);
      return payment.status;
    } catch (error) {
      console.error("Error checking payment status:", error);
      return "failed";
    }
  }

  // Generate payment link for UPI/Net Banking
  async generatePaymentLink(
    amount: number,
    description: string,
    customer: {
      name: string;
      email: string;
      contact?: string;
    },
    orderId?: string,
  ): Promise<any> {
    try {
      const paymentLink = await razorpay.paymentLink.create({
        amount: amount * 100,
        currency: "INR",
        accept_partial: false,
        description,
        customer,
        notify: {
          sms: true,
          email: true,
        },
        reminder_enable: true,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify`,
        callback_method: "get",
      });

      return paymentLink;
    } catch (error) {
      console.error("Error generating payment link:", error);
      throw new Error("Failed to generate payment link");
    }
  }
}

export const paymentService = new PaymentService();

// Webhook handling
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

export default paymentService;
