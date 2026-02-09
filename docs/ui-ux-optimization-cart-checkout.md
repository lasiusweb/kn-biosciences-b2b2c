# Cart & Checkout UI/UX Optimization for KN Biosciences

## Executive Summary

This document provides comprehensive UI/UX optimization recommendations for the cart and checkout pages of the KN Biosciences e-commerce platform. The optimizations focus on improving conversion rates, reducing cart abandonment, and enhancing the user experience for agricultural customers.

## Current State Analysis

### Cart Page Issues Identified
1. **Complex variant management**: Users struggle with multiple weight/packing/form options
2. **Limited product information**: Insufficient details to confirm selections
3. **Mobile usability**: Poor touch experience for farmers using mobile devices outdoors
4. **Trust signals**: Lack of security and credibility indicators
5. **Progress visibility**: Unclear indication of checkout progress
6. **Error handling**: Insufficient feedback for failed operations

### Checkout Page Issues Identified
1. **Multi-step process**: Too many steps causing friction
2. **Shipping complexity**: Confusing courier vs transport options
3. **Payment options**: Limited payment methods for rural customers
4. **Address validation**: Insufficient validation for rural addresses
5. **Progress tracking**: Unclear checkout progress indicator
6. **Security concerns**: Insufficient security reassurance

## Optimization Recommendations

### 1. Cart Page Improvements

#### A. Enhanced Product Information
```tsx
// components/cart/enhanced-cart-item.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2, Package, Weight, Droplets } from 'lucide-react';
import { ProductVariant } from '@/types';

interface EnhancedCartItemProps {
  item: {
    id: string;
    variant: ProductVariant;
    quantity: number;
  };
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function EnhancedCartItem({ 
  item, 
  onUpdateQuantity, 
  onRemove 
}: EnhancedCartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 99) return;
    
    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.id, newQuantity);
      setQuantity(newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="overflow-hidden border-earth-200 hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Product Image */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <img
              src={item.variant.image_urls?.[0] || '/placeholder-product.jpg'}
              alt={item.variant.products.name}
              className="w-full h-full object-cover rounded-lg"
            />
            {item.variant.stock_quantity <= 5 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Low Stock
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-earth-900 line-clamp-2">
                {item.variant.products.name}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Variant Details */}
            <div className="flex flex-wrap gap-2 mb-3">
              {item.variant.weight && (
                <div className="flex items-center gap-1 text-sm text-earth-600 bg-earth-50 px-2 py-1 rounded">
                  <Weight className="h-3 w-3" />
                  <span>{item.variant.weight}{item.variant.weight_unit}</span>
                </div>
              )}
              {item.variant.packing_type && (
                <div className="flex items-center gap-1 text-sm text-earth-600 bg-earth-50 px-2 py-1 rounded">
                  <Package className="h-3 w-3" />
                  <span>{item.variant.packing_type}</span>
                </div>
              )}
              {item.variant.form && (
                <div className="flex items-center gap-1 text-sm text-earth-600 bg-earth-50 px-2 py-1 rounded">
                  <Droplets className="h-3 w-3" />
                  <span>{item.variant.form}</span>
                </div>
              )}
            </div>

            {/* Price Information */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-organic-600">
                  ₹{(item.variant.price * quantity).toLocaleString()}
                </span>
                <div className="text-sm text-earth-500">
                  <span>₹{item.variant.price.toLocaleString()} × {quantity}</span>
                  {item.variant.compare_price && item.variant.compare_price > item.variant.price && (
                    <span className="block text-red-500 text-xs">
                      Save ₹{((item.variant.compare_price - item.variant.price) * quantity).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isUpdating}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  max="99"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  onBlur={() => handleQuantityChange(quantity)}
                  className="h-8 w-16 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 99 || isUpdating}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### B. Cart Summary Enhancements
```tsx
// components/cart/cart-summary.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Truck, Shield, Leaf, Clock } from 'lucide-react';

interface CartSummaryProps {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  savings: number;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

export function CartSummary({ 
  subtotal, 
  discount, 
  shipping, 
  tax, 
  total,
  savings,
  onProceedToCheckout,
  onContinueShopping
}: CartSummaryProps) {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-xl">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-earth-600">Subtotal</span>
            <span className="font-medium">₹{subtotal.toLocaleString()}</span>
          </div>
          
          {savings > 0 && (
            <div className="flex justify-between text-green-600">
              <span>You Saved</span>
              <span>-₹{savings.toLocaleString()}</span>
            </div>
          )}
          
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{discount.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-earth-600">Shipping</span>
            <span>
              {shipping === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                `₹${shipping.toLocaleString()}`
              )}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-earth-600">Tax (18%)</span>
            <span>₹{tax.toLocaleString()}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-organic-600">₹{total.toLocaleString()}</span>
          </div>
        </div>

        <Button 
          onClick={onProceedToCheckout}
          className="w-full bg-organic-500 hover:bg-organic-600 py-6 text-lg"
          size="lg"
        >
          Proceed to Checkout
        </Button>

        <Button 
          variant="outline" 
          onClick={onContinueShopping}
          className="w-full"
        >
          Continue Shopping
        </Button>

        {/* Trust Indicators */}
        <div className="pt-4 border-t border-earth-100">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-earth-600">
              <Truck className="h-4 w-4 text-organic-500" />
              <span>Free delivery on orders over ₹10,000</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-earth-600">
              <Shield className="h-4 w-4 text-organic-500" />
              <span>Secure payment guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-earth-600">
              <Leaf className="h-4 w-4 text-organic-500" />
              <span>Certified organic products</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2. Checkout Process Improvements

#### A. Streamlined Checkout Flow
```tsx
// components/checkout/streamlined-checkout.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  MapPin, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';
import { AddressForm } from './address-form';
import { PaymentMethodSelector } from './payment-method-selector';

interface StreamlinedCheckoutProps {
  cartItems: any[];
  totalAmount: number;
  onPlaceOrder: (orderData: any) => Promise<void>;
}

export function StreamlinedCheckout({ 
  cartItems, 
  totalAmount, 
  onPlaceOrder 
}: StreamlinedCheckoutProps) {
  const [currentStep, setCurrentStep] = useState<'address' | 'payment' | 'review' | 'processing' | 'success'>('address');
  const [shippingAddress, setShippingAddress] = useState<any>({});
  const [billingAddress, setBillingAddress] = useState<any>({});
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod,
        items: cartItems,
        totalAmount
      };
      
      await onPlaceOrder(orderData);
      setCurrentStep('success');
      setOrderPlaced(true);
    } catch (error) {
      console.error('Order placement failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'address':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AddressForm 
                  address={shippingAddress}
                  onChange={setShippingAddress}
                  title="Shipping Address"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Billing Address
                  </div>
                  <div className="flex items-center">
                    <Label className="mr-2 text-sm">Same as shipping</Label>
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="h-4 w-4 rounded border-earth-300 text-organic-600 focus:ring-organic-500"
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!sameAsShipping && (
                  <AddressForm 
                    address={billingAddress}
                    onChange={setBillingAddress}
                    title="Billing Address"
                  />
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => window.history.back()}>
                ← Back to Cart
              </Button>
              <Button 
                onClick={() => setCurrentStep('payment')}
                className="bg-organic-500 hover:bg-organic-600"
              >
                Continue to Payment →
              </Button>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentMethodSelector 
                  selectedMethod={paymentMethod}
                  onMethodChange={setPaymentMethod}
                />
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('address')}>
                ← Back to Address
              </Button>
              <Button 
                onClick={() => setCurrentStep('review')}
                disabled={!paymentMethod}
                className="bg-organic-500 hover:bg-organic-600"
              >
                Review Order →
              </Button>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Review Your Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-earth-900 mb-2">Shipping Address</h4>
                    <p className="text-earth-600">{shippingAddress.full_name}</p>
                    <p className="text-earth-600">{shippingAddress.address_line1}</p>
                    <p className="text-earth-600">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-earth-900 mb-2">Payment Method</h4>
                    <p className="text-earth-600 capitalize">{paymentMethod.replace('_', ' ')}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-earth-900 mb-2">Order Summary</h4>
                    <div className="space-y-2">
                      {cartItems.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.variant.products.name} × {item.quantity}</span>
                          <span>₹{(item.variant.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>₹{totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('payment')}>
                ← Back to Payment
              </Button>
              <Button 
                onClick={handlePlaceOrder}
                disabled={loading}
                className="bg-organic-500 hover:bg-organic-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    Place Order Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-organic-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-earth-900 mb-2">Processing Your Order</h2>
            <p className="text-earth-600">Please wait while we process your payment and prepare your order.</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-earth-900 mb-2">Order Placed Successfully!</h2>
            <p className="text-earth-600 mb-6">Thank you for your order. Your order number is ORD-{Date.now()}.</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-organic-500 hover:bg-organic-600"
            >
              Continue Shopping
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-earth-200 -z-10"></div>
        <div 
          className="absolute top-4 left-0 h-0.5 bg-organic-500 transition-all duration-500 -z-10"
          style={{ 
            width: currentStep === 'address' ? '33%' : 
                   currentStep === 'payment' ? '66%' : 
                   currentStep === 'review' ? '100%' : '0%' 
          }}
        ></div>
        
        {['Address', 'Payment', 'Review'].map((step, index) => (
          <div key={step} className="flex flex-col items-center relative z-10">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${index < ['address', 'payment', 'review', 'success'].indexOf(currentStep) ? 
                'bg-organic-500 text-white' : 
                index === ['address', 'payment', 'review', 'success'].indexOf(currentStep) ? 
                'bg-organic-100 text-organic-600 border-2 border-organic-500' : 
                'bg-earth-100 text-earth-400'}
            `}>
              {index + 1}
            </div>
            <span className="mt-2 text-sm text-earth-600">{step}</span>
          </div>
        ))}
      </div>

      {renderStep()}
    </div>
  );
}
```

#### B. Address Form Component
```tsx
// components/checkout/address-form.tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressFormProps {
  address: any;
  onChange: (address: any) => void;
  title: string;
}

export function AddressForm({ address, onChange, title }: AddressFormProps) {
  const handleChange = (field: string, value: string) => {
    onChange({
      ...address,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="full_name">Full Name *</Label>
        <Input
          id="full_name"
          value={address.full_name || ''}
          onChange={(e) => handleChange('full_name', e.target.value)}
          placeholder="Enter your full name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={address.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Enter your phone number"
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={address.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address_line1">Address Line 1 *</Label>
        <Input
          id="address_line1"
          value={address.address_line1 || ''}
          onChange={(e) => handleChange('address_line1', e.target.value)}
          placeholder="Street address, P.O. Box, company name, c/o"
        />
      </div>

      <div>
        <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
        <Input
          id="address_line2"
          value={address.address_line2 || ''}
          onChange={(e) => handleChange('address_line2', e.target.value)}
          placeholder="Apartment, suite, unit, building, floor, etc."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={address.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="City"
          />
        </div>
        <div>
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={address.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="State"
          />
        </div>
        <div>
          <Label htmlFor="postal_code">PIN Code *</Label>
          <Input
            id="postal_code"
            value={address.postal_code || ''}
            onChange={(e) => handleChange('postal_code', e.target.value)}
            placeholder="500001"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="landmark">Landmark (Optional)</Label>
        <Input
          id="landmark"
          value={address.landmark || ''}
          onChange={(e) => handleChange('landmark', e.target.value)}
          placeholder="Nearby landmark for easy delivery"
        />
      </div>
    </div>
  );
}
```

### 3. Mobile-First Optimizations

#### A. Mobile Cart Experience
```tsx
// components/cart/mobile-cart.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Minus, Plus, Trash2, ShoppingCart, X } from 'lucide-react';

interface MobileCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  totalAmount: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export function MobileCart({ 
  isOpen, 
  onClose, 
  cartItems, 
  totalAmount, 
  onUpdateQuantity, 
  onRemove, 
  onCheckout 
}: MobileCartProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart ({cartItems.length})
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="py-4 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
              <img
                src={item.variant.image_urls?.[0] || '/placeholder-product.jpg'}
                alt={item.variant.products.name}
                className="w-16 h-16 object-cover rounded"
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-earth-900 line-clamp-1">
                  {item.variant.products.name}
                </h3>
                <p className="text-sm text-earth-600">
                  ₹{item.variant.price.toLocaleString()} × {item.quantity}
                </p>
                <p className="text-sm text-organic-600 font-medium">
                  ₹{(item.variant.price * item.quantity).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(item.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= 99}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {cartItems.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto text-earth-300 mb-4" />
              <h3 className="text-lg font-medium text-earth-900 mb-2">Your cart is empty</h3>
              <p className="text-earth-600">Looks like you haven't added any products yet.</p>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Total</span>
              <span className="text-organic-600">₹{totalAmount.toLocaleString()}</span>
            </div>
            <Button 
              onClick={onCheckout}
              className="w-full bg-organic-500 hover:bg-organic-600 py-6 text-lg"
              size="lg"
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

### 4. Performance Optimizations

#### A. Lazy Loading for Cart Components
```tsx
// components/cart/lazy-cart-components.tsx
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LazyCartItems = lazy(() => import('./cart-items'));
const LazyCartSummary = lazy(() => import('./cart-summary'));

export function LazyCartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Suspense fallback={<CartItemsSkeleton />}>
            <LazyCartItems />
          </Suspense>
        </div>
        
        <div>
          <Suspense fallback={<CartSummarySkeleton />}>
            <LazyCartSummary />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function CartItemsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border rounded-lg">
          <Skeleton className="w-24 h-24 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CartSummarySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/2" />
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
```

### 5. Accessibility Improvements

#### A. Enhanced Cart Accessibility
```tsx
// components/cart/accessibility-cart.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface AccessibleCartItemProps {
  item: any;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function AccessibleCartItem({ item, onUpdateQuantity, onRemove }: AccessibleCartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 99) return;
    
    setQuantity(newQuantity);
    onUpdateQuantity(item.id, newQuantity);
  };

  return (
    <div 
      className="flex gap-4 p-4 border rounded-lg"
      role="group"
      aria-labelledby={`cart-item-${item.id}-name`}
    >
      <img
        src={item.variant.image_urls?.[0] || '/placeholder-product.jpg'}
        alt={item.variant.products.name}
        className="w-24 h-24 object-cover rounded"
      />
      
      <div className="flex-1">
        <h3 
          id={`cart-item-${item.id}-name`}
          className="font-semibold text-earth-900"
        >
          {item.variant.products.name}
        </h3>
        
        <div className="mt-2 space-y-2">
          <p className="text-sm text-earth-600">
            Price: ₹{item.variant.price.toLocaleString()} per unit
          </p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor={`quantity-${item.id}`} className="sr-only">
                Quantity for {item.variant.products.name}
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                aria-label={`Decrease quantity for ${item.variant.products.name}`}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Input
                id={`quantity-${item.id}`}
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="h-9 w-16 text-center"
                aria-label={`Quantity for ${item.variant.products.name}`}
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= 99}
                aria-label={`Increase quantity for ${item.variant.products.name}`}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(item.id)}
              className="text-red-600 hover:text-red-700"
              aria-label={`Remove ${item.variant.products.name} from cart`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="font-semibold text-organic-600">
            Total: ₹{(item.variant.price * quantity).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 6. Error Handling & Validation

#### A. Enhanced Form Validation
```tsx
// lib/validation/checkout-validation.ts
import { z } from 'zod';

export const addressSchema = z.object({
  full_name: z.string().min(2, 'Full name is required').max(100),
  phone: z.string().regex(/^(\+91[-\s]?)?[0-9]{10}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email address'),
  address_line1: z.string().min(5, 'Address line 1 is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().regex(/^\d{6}$/, 'Invalid PIN code'),
  landmark: z.string().optional(),
});

export const paymentMethodSchema = z.enum(['razorpay', 'payu', 'easebuzz', 'cod']);

export type AddressValidation = z.infer<typeof addressSchema>;
export type PaymentMethodValidation = z.infer<typeof paymentMethodSchema>;

export const validateAddress = (address: any) => {
  try {
    addressSchema.parse(address);
    return { success: true, data: address };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {} as Record<string, string>) 
      };
    }
    return { success: false, errors: { general: 'Invalid address format' } };
  }
};
```

### 7. Performance Monitoring

#### A. Cart Performance Tracking
```tsx
// lib/analytics/cart-analytics.ts
import { trackEvent } from './tracking';

export const cartAnalytics = {
  // Track when items are added to cart
  trackAddToCart: (productId: string, variantId: string, quantity: number, price: number) => {
    trackEvent('add_to_cart', {
      product_id: productId,
      variant_id: variantId,
      quantity,
      price,
      timestamp: Date.now(),
    });
  },

  // Track when items are removed from cart
  trackRemoveFromCart: (productId: string, variantId: string, quantity: number) => {
    trackEvent('remove_from_cart', {
      product_id: productId,
      variant_id: variantId,
      quantity,
      timestamp: Date.now(),
    });
  },

  // Track when cart is viewed
  trackCartView: (cartItemCount: number, cartTotal: number) => {
    trackEvent('view_cart', {
      cart_item_count: cartItemCount,
      cart_total: cartTotal,
      timestamp: Date.now(),
    });
  },

  // Track checkout initiation
  trackBeginCheckout: (cartTotal: number, itemCount: number) => {
    trackEvent('begin_checkout', {
      value: cartTotal,
      items: itemCount,
      timestamp: Date.now(),
    });
  },

  // Track successful order placement
  trackPurchase: (orderId: string, value: number, currency: string = 'INR') => {
    trackEvent('purchase', {
      transaction_id: orderId,
      value,
      currency,
      timestamp: Date.now(),
    });
  }
};
```

## Implementation Priorities

### Phase 1: Critical Issues (Week 1)
1. Fix the inverted logic in PaymentGatewayManager
2. Add proper error handling and validation
3. Implement mobile-responsive cart UI
4. Add accessibility improvements

### Phase 2: Performance (Week 2)
1. Implement lazy loading for cart components
2. Optimize database queries for cart operations
3. Add performance monitoring
4. Implement proper caching strategies

### Phase 3: UX Enhancements (Week 3)
1. Implement streamlined checkout flow
2. Add progress indicators
3. Improve trust signals and security indicators
4. Add cart recovery functionality

### Phase 4: Advanced Features (Week 4)
1. Implement cart abandonment recovery
2. Add product recommendations in cart
3. Implement guest checkout with email capture
4. Add order tracking integration

## Expected Outcomes

1. **Improved Conversion Rate**: Streamlined checkout process should increase conversion by 15-25%
2. **Reduced Cart Abandonment**: Better UX should reduce abandonment by 20-30%
3. **Enhanced Mobile Experience**: Mobile-optimized interface should improve mobile conversion
4. **Better Accessibility**: Improved accessibility will expand user base
5. **Performance Gains**: Optimized components should reduce load times by 30-50%

These optimizations will significantly improve the user experience for the KN Biosciences e-commerce platform, making it more user-friendly, accessible, and performant while maintaining the agricultural focus and functionality needed for the target audience.