'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, RefreshCcw, MessageSquare } from "lucide-react";
import Link from 'next/link';

export default function CheckoutFailurePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams.get('reason') || 'Your payment could not be processed.';
  const orderId = searchParams.get('order_id');

  const errorMessages: Record<string, string> = {
    'user_cancelled': 'The payment was cancelled by you.',
    'invalid_hash': 'Secure verification failed. Please try again.',
    'payment_failed': 'The bank or gateway declined the transaction.',
    'server_error': 'A technical error occurred on our end. We haven\'t charged you.',
  };

  const displayMessage = errorMessages[reason] || reason;

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-red-100 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-zinc-900">Payment Failed</CardTitle>
          <CardDescription className="text-zinc-600 mt-2">
            {displayMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="bg-zinc-100 p-4 rounded-lg text-sm text-zinc-700">
            <p><strong>Note:</strong> If money was deducted from your account, it will be automatically refunded within 5-7 working days.</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => router.push('/checkout')}
              className="w-full bg-earth-900 hover:bg-earth-800"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.open('https://wa.me/911234567890', '_blank')}
              className="w-full border-zinc-300"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat with Support
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t pt-4">
          <Link href="/shop" className="text-sm text-zinc-500 hover:text-organic-600 flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            Back to Shop
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
