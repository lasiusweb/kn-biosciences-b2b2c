'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Package, Truck, MessageSquare, ArrowRight, ShoppingBag } from "lucide-react";
import Link from 'next/link';
import { OrderPDFData, downloadOrderInvoice } from '@/lib/order-pdf';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const [order, setOrder] = useState<OrderPDFData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!paymentId) {
          // If no payment ID, we might be here via direct redirect with order info
          // For now, let's assume we always have a payment_id or we need to find the latest confirmed order
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase
              .from('orders')
              .select('*, order_items(*, product_variants(*, products(name)))')
              .eq('user_id', user.id)
              .eq('payment_status', 'paid')
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            
            if (data) setOrder(data as any);
          }
        } else {
          const { data } = await supabase
            .from('orders')
            .select('*, order_items(*, product_variants(*, products(name)))')
            .eq('payment_id', paymentId)
            .single();
          
          if (data) setOrder(data as any);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [paymentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center space-y-4">
          <LoadingSpinner className="h-12 w-12 mx-auto text-organic-600" />
          <p className="text-earth-600 font-medium">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-organic-600 mx-auto mb-4" />
            <CardTitle>Thank You for your Purchase!</CardTitle>
            <CardDescription>We've received your order and are processing it.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild className="bg-organic-600 hover:bg-organic-700">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-2">
          <div className="bg-organic-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle className="h-12 w-12 text-organic-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-earth-900">Order Confirmed!</h1>
          <p className="text-lg text-earth-600">
            Hi { (order.shipping_address as any).first_name }, thank you for choosing KN Biosciences.
          </p>
          <div className="inline-block bg-white px-4 py-2 rounded-full border border-organic-200 text-organic-700 font-bold mt-4 shadow-sm">
            Order #{order.order_number}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Details */}
          <Card className="md:col-span-2 shadow-sm border-zinc-200">
            <CardHeader className="border-b bg-zinc-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-earth-700" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-zinc-100 p-0">
              {order.order_items.map((item) => (
                <div key={item.variant_id} className="p-4 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-medium text-zinc-900">{item.product_variants.products.name}</span>
                    <span className="text-sm text-zinc-500">Qty: {item.quantity} × ₹{item.unit_price.toLocaleString()}</span>
                  </div>
                  <span className="font-bold text-zinc-900">₹{item.total_price.toLocaleString()}</span>
                </div>
              ))}
              <div className="p-4 bg-zinc-50/30 space-y-2">
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Tax (GST)</span>
                  <span>₹{order.tax_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Shipping ({order.shipping_type})</span>
                  <span>₹{order.shipping_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-zinc-900 pt-2 border-t border-zinc-200">
                  <span>Total Paid</span>
                  <span>₹{order.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-zinc-50/50 p-4 border-t flex justify-between items-center">
              <span className="text-sm text-zinc-500 italic">Estimated delivery: 5-7 working days</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => downloadOrderInvoice(order)}
                className="text-earth-700 border-earth-200 hover:bg-earth-50"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
            </CardFooter>
          </Card>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <Card className="shadow-sm border-zinc-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm uppercase tracking-wider text-zinc-500 font-bold">What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Truck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Track Order</span>
                    <Link href={`/api/shipping/track?order_id=${order.id}`} className="text-xs text-organic-600 hover:underline">View tracking status</Link>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Need Help?</span>
                    <button 
                      onClick={() => window.open(`https://wa.me/911234567890?text=I need help with Order ${order.order_number}`, '_blank')}
                      className="text-xs text-organic-600 hover:underline text-left"
                    >
                      Chat with support
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button asChild className="w-full bg-earth-900 hover:bg-earth-800 h-12 shadow-md">
              <Link href="/shop">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
