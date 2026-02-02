"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { ShippingMethodSelector } from "@/components/shop/shipping-method-selector";
import { ShippingRate } from "@/types";

interface CheckoutFlowProps {
  orderId: string;
  amount: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    pincode?: string; // Added for shipping calculation
  };
}

type CheckoutStep = "shipping-method" | "payment-method" | "processing" | "success" | "failure";

export function CheckoutFlow({
  orderId,
  amount,
  customerInfo,
}: CheckoutFlowProps) {
  const [currentStep, setCurrentStep] =
    useState<CheckoutStep>("shipping-method");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingRate[]>([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingRate | null>(null);
  const [selectedTransportCarrier, setSelectedTransportCarrier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentId, setPaymentId] = useState("");

  const fetchShippingOptions = useCallback(async () => {
    setIsLoading(true);
    try {
      // Pincode is needed for shipping calculation. Fallback to a default or require it.
      const pincode = customerInfo.pincode || "500001"; 
      const response = await fetch(`/api/shipping/serviceability?pincode=${pincode}&weight=1000`);
      
      // The serviceability API returns a single result. 
      // We need a more comprehensive API or client-side calculation.
      // For now, let's assume we call our unified calculation utility (simulated via API or direct)
      // Actually, let's mock the options for now if the API isn't fully ready for all options.
      
      const data = await response.json();
      
      const options: ShippingRate[] = [];
      if (data.serviceable) {
        options.push({
          type: "COURIER",
          carrier_name: "Delhivery",
          cost: 100, // Dynamic cost would be calculated here
          handling_fee: 0,
          is_serviceable: true,
          description: "Home Delivery",
          estimated_delivery_days: 5
        });
      }
      
      // Always add Transport as fallback/alternative
      options.push({
        type: "TRANSPORT",
        carrier_name: "Regional Transport (Godown Delivery)",
        cost: 0,
        handling_fee: 150,
        is_serviceable: true,
        description: "Pay freight at Godown. Carriers: Navata, VRL, etc."
      });

      setShippingOptions(options);
      // Auto-select first available
      if (options.length > 0) setSelectedShippingOption(options[0]);
    } catch (err) {
      console.error("Failed to fetch shipping options:", err);
      setError("Failed to load shipping methods.");
    } finally {
      setIsLoading(false);
    }
  }, [customerInfo.pincode]);

  useEffect(() => {
    if (currentStep === "shipping-method") {
      fetchShippingOptions();
    }
  }, [currentStep, fetchShippingOptions]);

  const handleShippingProceed = async () => {
    if (!selectedShippingOption) return;
    
    // If Transport is selected, ensure a carrier is chosen
    if (selectedShippingOption.type === "TRANSPORT" && !selectedTransportCarrier) {
      setError("Please select a transport carrier.");
      return;
    }

    // Update order with shipping info
    try {
      setIsLoading(true);
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shipping_type: selectedShippingOption.type,
          shipping_carrier: selectedShippingOption.type === "TRANSPORT" ? selectedTransportCarrier : selectedShippingOption.carrier_name,
          shipping_amount: selectedShippingOption.cost + selectedShippingOption.handling_fee,
        }),
      });
      setCurrentStep("payment-method");
    } catch (err) {
      console.error("Error updating shipping:", err);
      setError("Failed to save shipping preference.");
    } finally {
      setIsLoading(false);
    }
  };

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
          amount: amount + (selectedShippingOption?.cost || 0) + (selectedShippingOption?.handling_fee || 0),
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
      const { Razorpay } = await (window as any).Razorpay ? { Razorpay: (window as any).Razorpay } : import("razorpay");

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
    setCurrentStep("shipping-method");
    setError("");
    setSelectedPaymentMethod("");
  };

  const renderStep = () => {
    switch (currentStep) {
      case "shipping-method":
        return (
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {isLoading && shippingOptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p>Calculating shipping options...</p>
              </div>
            ) : (
              <ShippingMethodSelector
                options={shippingOptions}
                selectedOption={selectedShippingOption}
                onSelect={setSelectedShippingOption}
                selectedTransportCarrier={selectedTransportCarrier}
                onTransportCarrierChange={setSelectedTransportCarrier}
                onProceed={handleShippingProceed}
                disabled={isLoading}
              />
            )}
          </div>
        );

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
            <Button variant="ghost" onClick={() => setCurrentStep("shipping-method")} className="mt-4">
              Back to Shipping
            </Button>
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
              {currentStep === 'shipping-method' ? 'Choose how you want your items delivered' : 'Complete your purchase by selecting a payment method'}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CheckoutFlow;