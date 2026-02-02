'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckoutFlow } from '@/components/shop/checkout-flow';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<{
    id: string;
    total_amount: number;
    user: {
      name: string;
      email: string;
      phone: string;
      pincode: string;
    };
  } | null>(null);

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setLoading(true);
        
        // 1. Get User
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/auth?redirect=/checkout';
          return;
        }

        // 2. Fetch Profile details for customerInfo
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        // 3. Fetch Shipping Address for Pincode
        const { data: address } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'shipping')
          .eq('is_default', true)
          .single();

        // 4. Fetch Cart Items to calculate amount
        const { data: cartItems } = await supabase
          .from('cart_items')
          .select('*, product_variants(price)')
          .eq('user_id', user.id);

        if (!cartItems || cartItems.length === 0) {
          setError('Your cart is empty.');
          return;
        }

        const subtotal = cartItems.reduce((acc, item) => acc + (item.product_variants.price * item.quantity), 0);
        
        // 5. Create Preliminary Order if not exists or use existing pending one
        // For simplicity, create a new one for this session
        const orderNumber = `ORD-${Date.now()}`;
        
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            user_id: user.id,
            total_amount: subtotal,
            subtotal: subtotal,
            status: 'pending',
            payment_status: 'pending',
            shipping_address: address || {}, // Placeholder if no address
            billing_address: address || {},
          })
          .select()
          .single();

        if (orderError) throw orderError;

        setOrderData({
          id: newOrder.id,
          total_amount: subtotal,
          user: {
            name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Customer',
            email: user.email || '',
            phone: profile?.phone || '',
            pincode: address?.postal_code || '500001',
          }
        });

      } catch (err: any) {
        console.error('Checkout initialization failed:', err);
        setError(err.message || 'Failed to initialize checkout.');
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center space-y-4">
          <LoadingSpinner className="h-12 w-12 mx-auto text-organic-600" />
          <p className="text-earth-600 font-medium">Preparing your checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Checkout Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!orderData) return null;

  return (
    <div className="bg-zinc-50 min-h-screen">
      <CheckoutFlow
        orderId={orderData.id}
        amount={orderData.total_amount}
        customerInfo={orderData.user}
      />
    </div>
  );
}
