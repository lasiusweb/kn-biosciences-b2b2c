"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface Order {
  id: string;
  total_amount: number;
  payment_status: string;
  payment_id?: string;
  payment_method: string;
  created_at: string;
  customer_email: string;
}

interface PaymentConfirmationProps {
  orderId?: string;
  paymentId?: string;
}

export function PaymentConfirmation({
  orderId,
  paymentId,
}: PaymentConfirmationProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, paymentId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const url = paymentId
        ? `/api/payments/verify?payment_id=${paymentId}`
        : `/api/orders/${orderId}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order || data);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentId) return;

    setVerifying(true);
    try {
      await fetchOrderDetails();
    } finally {
      setVerifying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "authorized":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-4">
            We couldn't find the order details you're looking for.
          </p>
          <Button onClick={() => (window.location.href = "/shop")}>
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {getStatusIcon(order.payment_status)}
            </div>
            <CardTitle className="text-2xl">
              {order.payment_status.toLowerCase() === "completed"
                ? "Payment Successful!"
                : order.payment_status.toLowerCase() === "failed"
                  ? "Payment Failed"
                  : "Payment Processing"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <Badge
                className={`text-lg px-4 py-2 ${getStatusColor(order.payment_status)}`}
              >
                {order.payment_status.toUpperCase()}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Order ID
                  </p>
                  <p className="font-mono">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Payment ID
                  </p>
                  <p className="font-mono">{order.payment_id || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Payment Method
                  </p>
                  <p className="capitalize">
                    {order.payment_method.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Amount Paid
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    ₹{order.total_amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Order Date
                  </p>
                  <p>{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p>{order.customer_email}</p>
                </div>
              </div>
            </div>

            {order.payment_status.toLowerCase() === "completed" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  What happens next?
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>
                    • Order confirmation email has been sent to your registered
                    email
                  </li>
                  <li>• Your order will be processed within 24 hours</li>
                  <li>• You'll receive shipping updates via email and SMS</li>
                  <li>• Expected delivery: 3-7 business days</li>
                </ul>
              </div>
            )}

            {order.payment_status.toLowerCase() === "failed" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">
                  Payment Failed
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  We couldn't process your payment. This could be due to
                  insufficient funds, incorrect card details, or bank
                  connectivity issues.
                </p>
                <Button
                  onClick={() => (window.location.href = "/checkout")}
                  variant="outline"
                  className="mr-2"
                >
                  Try Again
                </Button>
                <Button onClick={() => (window.location.href = "/shop")}>
                  Continue Shopping
                </Button>
              </div>
            )}

            {order.payment_status.toLowerCase() === "pending" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  Payment Processing
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  Your payment is currently being processed by the payment
                  gateway. This usually takes a few minutes.
                </p>
                <Button
                  onClick={handleVerifyPayment}
                  disabled={verifying}
                  variant="outline"
                  size="sm"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Verify Status
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => (window.location.href = `/orders/${order.id}`)}
            variant="outline"
          >
            View Order Details
          </Button>
          <Button onClick={() => (window.location.href = "/shop")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaymentConfirmation;
