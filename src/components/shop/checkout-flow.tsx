"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PaymentMethodSelector } from "@/components/shop/payment-method-selector";
import { PaymentConfirmation } from "@/components/shop/payment-confirmation";

interface CheckoutFlowProps {
  orderId: string;
  amount: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

type CheckoutStep = "payment-method" | "processing" | "success" | "failure";

export function CheckoutFlow({
  orderId,
  amount,
  customerInfo,
}: CheckoutFlowProps) {
  const [currentStep, setCurrentStep] =
    useState<CheckoutStep>("payment-method");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentId, setPaymentId] = useState("");

  const handlePaymentMethodProceed = async () => {
    if (!selectedPaymentMethod) return;

    setIsLoading(true);
    setError("");

    try {
      // If COD, skip payment gateway
      if (selectedPaymentMethod === "cod") {
        await updateOrderStatus("cod", null);
        setCurrentStep("success");
        return;
      }

      // Create payment order
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          orderId,
          customerInfo,
          paymentMethod: selectedPaymentMethod,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment order");
      }

      const paymentData = await response.json();

      if (paymentData.paymentMethod === "payu") {
        // Redirect to PayU payment page
        const form = document.createElement("form");
        form.method = "POST";
        form.action = paymentData.paymentUrl;

        Object.entries(paymentData.orderData).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        return;
      }

      // Initialize Razorpay
      const { Razorpay } = await import("razorpay");

      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        order_id: paymentData.orderId,
        name: "KN Biosciences",
        description: `Order #${orderId}`,
        image: "/logo.png",
        handler: function (response: any) {
          handlePaymentSuccess(response.razorpay_payment_id);
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone,
        },
        theme: {
          color: "#8BC34A",
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            setError("Payment cancelled");
          },
        },
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Payment error:", error);
      setError("Failed to initiate payment");
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentId(paymentId);
    setCurrentStep("success");
    setIsLoading(false);
  };

  const updateOrderStatus = async (
    paymentMethod: string,
    paymentId: string | null,
  ) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_method: paymentMethod,
          payment_id: paymentId,
          payment_status: paymentId ? "completed" : "pending",
          status: paymentId ? "confirmed" : "processing",
        }),
      });
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleRetry = () => {
    setCurrentStep("payment-method");
    setError("");
    setSelectedPaymentMethod("");
  };

  const renderStep = () => {
    switch (currentStep) {
      case "payment-method":
        return (
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onMethodChange={setSelectedPaymentMethod}
              onProceed={handlePaymentMethodProceed}
              disabled={isLoading}
            />
          </div>
        );

      case "processing":
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-2xl font-semibold mb-2">
                Processing Payment
              </h2>
              <p className="text-muted-foreground">
                Please wait while we process your payment...
              </p>
            </div>
          </div>
        );

      case "success":
        return <PaymentConfirmation orderId={orderId} paymentId={paymentId} />;

      case "failure":
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  {error ||
                    "Payment failed. Please try again or choose a different payment method."}
                </AlertDescription>
              </Alert>

              <div className="space-x-4">
                <Button onClick={handleRetry} variant="outline">
                  Try Again
                </Button>
                <Button onClick={() => (window.location.href = "/shop")}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription>
              Complete your purchase by selecting a payment method
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CheckoutFlow;
