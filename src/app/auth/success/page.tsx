"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "Authentication successful!";
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(redirectTo);
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, redirectTo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-organic-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-earth-900">
            Success!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-earth-600">{message}</p>
          <p className="text-sm text-earth-500">
            Redirecting you in 3 seconds...
          </p>
          <Button 
            onClick={() => router.push(redirectTo)}
            className="w-full"
          >
            Continue Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}