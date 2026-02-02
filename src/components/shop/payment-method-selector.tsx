"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Building, CheckCircle } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  badges?: string[];
  isRecommended?: boolean;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  onProceed: () => void;
  disabled?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "easebuzz",
    name: "Online Payment (Cards, UPI, Net Banking)",
    description: "Pay securely with Easebuzz - supports all major cards and apps",
    icon: <CreditCard className="h-5 w-5" />,
    badges: ["Fast", "Secure", "Recommended"],
    isRecommended: true,
  },
  {
    id: "razorpay",
    name: "Razorpay",
    description: "Pay securely with Visa, Mastercard, Rupay, and more",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: "payu",
    name: "PayU",
    description: "Alternative payment gateway with multiple options",
    icon: <Building className="h-5 w-5" />,
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay when you receive your order",
    icon: <CreditCard className="h-5 w-5" />,
    badges: ["Available for orders below ₹10,000"],
  },
];

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  onProceed,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProceed = async () => {
    if (!selectedMethod || disabled) return;

    setIsProcessing(true);
    try {
      await onProceed();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMethodSelect = (methodId: string) => {
    if (!disabled) {
      onMethodChange(methodId);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Select Payment Method
        </CardTitle>
        <CardDescription>
          Choose your preferred payment method for a secure checkout experience
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            onClick={() => handleMethodSelect(method.id)}
            className={`relative flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
              selectedMethod === method.id
                ? "border-primary bg-primary/5"
                : "border-border"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="flex-shrink-0">
              <input
                type="radio"
                name="payment-method"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={() => handleMethodSelect(method.id)}
                className="sr-only"
                disabled={disabled}
              />
            </div>

            <div className="flex-shrink-0">{method.icon}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Label className="text-base font-medium cursor-pointer">
                  {method.name}
                </Label>

                {method.isRecommended && (
                  <Badge variant="secondary" className="text-xs">
                    Recommended
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                {method.description}
              </p>

              {method.badges && (
                <div className="flex gap-1 mt-2">
                  {method.badges.map((badge, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-shrink-0">
              {selectedMethod === method.id && (
                <CheckCircle className="h-5 w-5 text-primary" />
              )}
            </div>
          </div>
        ))}

        {selectedMethod === "cod" && (
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
            <p className="text-sm text-yellow-800">
              <strong>Cash on Delivery:</strong> Please note that COD is
              available only for orders below ₹10,000. You can pay delivery
              person when they arrive with your order.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>• All payments are secured with 256-bit SSL encryption</p>
          <p>• Your payment information is never stored on our servers</p>
          <p>• We support instant refunds for eligible transactions</p>
        </div>

        <Button
          onClick={handleProceed}
          disabled={!selectedMethod || disabled || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing...
            </>
          ) : (
            `Proceed with ${paymentMethods.find((m) => m.id === selectedMethod)?.name || "Payment"}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default PaymentMethodSelector;
