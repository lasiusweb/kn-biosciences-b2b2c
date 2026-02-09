import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { 
  User, 
  MapPin, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  Loader2,
  Mail,
  Phone,
  Home,
  Building2
} from 'lucide-react';

interface StreamlinedCheckoutProps {
  orderId: string;
  amount: number;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review' | 'complete';

export function StreamlinedCheckout({ orderId, amount, customerInfo }: StreamlinedCheckoutProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [addressData, setAddressData] = useState({
    name: customerInfo?.name || '',
    email: customerInfo?.email || '',
    phone: customerInfo?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isBillingSame: true
  });

  const [billingAddress, setBillingAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  const [shippingMethod, setShippingMethod] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Mock shipping options
  const shippingOptions = [
    { id: 'standard', name: 'Standard Delivery', description: '5-7 business days', price: 0 },
    { id: 'express', name: 'Express Delivery', description: '2-3 business days', price: 100 },
    { id: 'same-day', name: 'Same Day Delivery', description: 'Within 24 hours', price: 200 }
  ];

  // Mock payment options
  const paymentOptions = [
    { id: 'razorpay', name: 'Credit/Debit Card', processor: 'Razorpay' },
    { id: 'payu', name: 'Net Banking', processor: 'PayU' },
    { id: 'easebuzz', name: 'UPI', processor: 'Easebuzz' },
    { id: 'cod', name: 'Cash on Delivery', processor: 'COD' }
  ];

  const stepConfig = {
    address: { title: 'Delivery Information', icon: <User className="h-4 w-4" /> },
    shipping: { title: 'Shipping Method', icon: <Truck className="h-4 w-4" /> },
    payment: { title: 'Payment Method', icon: <CreditCard className="h-4 w-4" /> },
    review: { title: 'Review Order', icon: <CheckCircle className="h-4 w-4" /> },
    complete: { title: 'Order Complete', icon: <CheckCircle className="h-4 w-4" /> }
  };

  const stepOrder: CheckoutStep[] = ['address', 'shipping', 'payment', 'review'];

  const currentStepIndex = stepOrder.indexOf(currentStep);
  const progress = currentStepIndex >= 0 ? (currentStepIndex / (stepOrder.length - 1)) * 100 : 0;

  const validateAddress = () => {
    if (!addressData.name || !addressData.email || !addressData.phone || 
        !addressData.addressLine1 || !addressData.city || 
        !addressData.state || !addressData.postalCode) {
      setError('Please fill in all required address fields');
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    setError('');
    
    if (currentStep === 'address') {
      if (!validateAddress()) return;
    } else if (currentStep === 'shipping') {
      if (!shippingMethod) {
        setError('Please select a shipping method');
        return;
      }
    } else if (currentStep === 'payment') {
      if (!paymentMethod) {
        setError('Please select a payment method');
        return;
      }
    }

    setLoading(true);
    try {
      // Update order with current step data
      if (currentStep === 'address') {
        // Save address data to order
        const { error } = await supabase
          .from('orders')
          .update({
            shipping_address: {
              name: addressData.name,
              email: addressData.email,
              phone: addressData.phone,
              address_line1: addressData.addressLine1,
              address_line2: addressData.addressLine2,
              city: addressData.city,
              state: addressData.state,
              postal_code: addressData.postalCode,
              country: addressData.country
            },
            billing_address: addressData.isBillingSame ? {
              name: addressData.name,
              email: addressData.email,
              phone: addressData.phone,
              address_line1: addressData.addressLine1,
              address_line2: addressData.addressLine2,
              city: addressData.city,
              state: addressData.state,
              postal_code: addressData.postalCode,
              country: addressData.country
            } : {
              name: addressData.name,
              email: addressData.email,
              phone: addressData.phone,
              address_line1: billingAddress.addressLine1,
              address_line2: billingAddress.addressLine2,
              city: billingAddress.city,
              state: billingAddress.state,
              postal_code: billingAddress.postalCode,
              country: billingAddress.country
            }
          })
          .eq('id', orderId);

        if (error) throw error;
      } else if (currentStep === 'shipping') {
        // Save shipping method
        const { error } = await supabase
          .from('orders')
          .update({
            shipping_type: shippingMethod,
            shipping_amount: shippingOptions.find(opt => opt.id === shippingMethod)?.price || 0
          })
          .eq('id', orderId);

        if (error) throw error;
      } else if (currentStep === 'payment') {
        // Save payment method
        const { error } = await supabase
          .from('orders')
          .update({
            payment_method: paymentMethod
          })
          .eq('id', orderId);

        if (error) throw error;
      }

      // Move to next step
      const currentIndex = stepOrder.indexOf(currentStep);
      if (currentIndex < stepOrder.length - 1) {
        setCurrentStep(stepOrder[currentIndex + 1]);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      // Finalize order
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: paymentMethod === 'cod' ? 'pending' : 'initiated',
          notes: orderNotes
        })
        .eq('id', orderId);

      if (error) throw error;

      // Move to complete step
      setCurrentStep('complete');
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'address':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      value={addressData.name}
                      onChange={(e) => setAddressData({...addressData, name: e.target.value})}
                      className="pl-10"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={addressData.email}
                      onChange={(e) => setAddressData({...addressData, email: e.target.value})}
                      className="pl-10"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={addressData.phone}
                      onChange={(e) => setAddressData({...addressData, phone: e.target.value})}
                      className="pl-10"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address-line1">Address Line 1 *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="address-line1"
                      value={addressData.addressLine1}
                      onChange={(e) => setAddressData({...addressData, addressLine1: e.target.value})}
                      className="pl-10"
                      placeholder="123 Main Street"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address-line2">Address Line 2</Label>
                  <Input
                    id="address-line2"
                    value={addressData.addressLine2}
                    onChange={(e) => setAddressData({...addressData, addressLine2: e.target.value})}
                    placeholder="Apartment, suite, etc."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={addressData.city}
                      onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                      placeholder="City"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={addressData.state}
                      onChange={(e) => setAddressData({...addressData, state: e.target.value})}
                      placeholder="State"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postal-code">Postal Code *</Label>
                    <Input
                      id="postal-code"
                      value={addressData.postalCode}
                      onChange={(e) => setAddressData({...addressData, postalCode: e.target.value})}
                      placeholder="500001"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={addressData.country}
                      onChange={(e) => setAddressData({...addressData, country: e.target.value})}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="is-billing-same"
                  checked={addressData.isBillingSame}
                  onCheckedChange={(checked) => setAddressData({...addressData, isBillingSame: !!checked})}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="is-billing-same"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Billing address same as shipping address
                  </label>
                </div>
              </div>
            </div>
            
            {!addressData.isBillingSame && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-4 flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Billing Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billing-address-line1">Address Line 1 *</Label>
                    <Input
                      id="billing-address-line1"
                      value={billingAddress.addressLine1}
                      onChange={(e) => setBillingAddress({...billingAddress, addressLine1: e.target.value})}
                      placeholder="123 Main Street"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="billing-address-line2">Address Line 2</Label>
                    <Input
                      id="billing-address-line2"
                      value={billingAddress.addressLine2}
                      onChange={(e) => setBillingAddress({...billingAddress, addressLine2: e.target.value})}
                      placeholder="Apartment, suite, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="billing-city">City *</Label>
                    <Input
                      id="billing-city"
                      value={billingAddress.city}
                      onChange={(e) => setBillingAddress({...billingAddress, city: e.target.value})}
                      placeholder="City"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="billing-state">State *</Label>
                    <Input
                      id="billing-state"
                      value={billingAddress.state}
                      onChange={(e) => setBillingAddress({...billingAddress, state: e.target.value})}
                      placeholder="State"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="billing-postal-code">Postal Code *</Label>
                    <Input
                      id="billing-postal-code"
                      value={billingAddress.postalCode}
                      onChange={(e) => setBillingAddress({...billingAddress, postalCode: e.target.value})}
                      placeholder="500001"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="billing-country">Country</Label>
                    <Input
                      id="billing-country"
                      value={billingAddress.country}
                      onChange={(e) => setBillingAddress({...billingAddress, country: e.target.value})}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'shipping':
        return (
          <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-4">
            {shippingOptions.map((option) => (
              <div 
                key={option.id}
                className={cn(
                  "flex items-start space-x-4 p-4 border rounded-lg cursor-pointer transition-colors",
                  shippingMethod === option.id 
                    ? "border-organic-500 bg-organic-50" 
                    : "hover:border-organic-300"
                )}
              >
                <RadioGroupItem value={option.id} id={option.id} className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={option.id} className="font-medium">
                      {option.name}
                    </Label>
                    <span className="font-semibold text-organic-600">
                      {option.price === 0 ? 'FREE' : `₹${option.price}`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'payment':
        return (
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
            {paymentOptions.map((option) => (
              <div 
                key={option.id}
                className={cn(
                  "flex items-start space-x-4 p-4 border rounded-lg cursor-pointer transition-colors",
                  paymentMethod === option.id 
                    ? "border-organic-500 bg-organic-50" 
                    : "hover:border-organic-300"
                )}
              >
                <RadioGroupItem value={option.id} id={option.id} className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={option.id} className="font-medium">
                      {option.name}
                    </Label>
                    <Badge variant="outline">{option.processor}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {option.id === 'cod' 
                      ? 'Pay cash when your order is delivered' 
                      : 'Secure payment processing'}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'review':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Delivery Information</h3>
              <p className="text-sm">{addressData.name}</p>
              <p className="text-sm text-gray-600">{addressData.addressLine1}, {addressData.addressLine2}</p>
              <p className="text-sm text-gray-600">{addressData.city}, {addressData.state} {addressData.postalCode}</p>
              <p className="text-sm text-gray-600">{addressData.phone}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Shipping Method</h3>
              <p className="text-sm">
                {shippingOptions.find(opt => opt.id === shippingMethod)?.name || 'Standard Delivery'}
              </p>
              <p className="text-sm text-gray-600">
                {shippingOptions.find(opt => opt.id === shippingMethod)?.description || '5-7 business days'}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Payment Method</h3>
              <p className="text-sm">
                {paymentOptions.find(opt => opt.id === paymentMethod)?.name || 'Credit/Debit Card'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="order-notes">Order Notes (Optional)</Label>
              <Input
                id="order-notes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Any special instructions for delivery..."
              />
            </div>
            
            <div className="bg-organic-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingOptions.find(opt => opt.id === shippingMethod)?.price === 0 
                    ? 'FREE' 
                    : `₹${shippingOptions.find(opt => opt.id === shippingMethod)?.price || 0}`}
                </span>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Total</span>
                <span>
                  ₹{(amount + (shippingOptions.find(opt => opt.id === shippingMethod)?.price || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        );
      
      case 'complete':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your order. Your order ID is <span className="font-mono font-bold">{orderId}</span>.
              We've sent a confirmation email to {addressData.email}.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => window.location.href = '/'}>Continue Shopping</Button>
              <Button variant="outline" onClick={() => window.location.href = '/account/orders'}>
                View Order History
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Checkout</span>
              <Badge variant="outline">Order #{orderId.substring(0, 8)}</Badge>
            </CardTitle>
            <CardDescription>
              Complete your purchase in just a few simple steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex justify-between mb-2 text-sm text-gray-500">
                {stepOrder.map((step, index) => (
                  <div 
                    key={step} 
                    className={cn(
                      "flex items-center",
                      index < stepOrder.length - 1 && "flex-1"
                    )}
                  >
                    <div className={cn(
                      "flex items-center",
                      index < stepOrder.length - 1 && "w-full"
                    )}>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs",
                        currentStep === step || stepOrder.indexOf(step) < currentStepIndex
                          ? "bg-organic-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      )}>
                        {stepOrder.indexOf(step) < currentStepIndex ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      {index < stepOrder.length - 1 && (
                        <div className={cn(
                          "h-1 flex-1",
                          stepOrder.indexOf(step) < currentStepIndex ? "bg-organic-500" : "bg-gray-200"
                        )}></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 px-1">
                {stepOrder.map((step) => (
                  <span 
                    key={step} 
                    className={cn(
                      currentStep === step || stepOrder.indexOf(step) < currentStepIndex
                        ? "font-medium text-organic-600"
                        : "text-gray-500"
                    )}
                  >
                    {stepConfig[step].title}
                  </span>
                ))}
              </div>
            </div>

            {/* Step Content */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                {stepConfig[currentStep].icon}
                <span className="ml-2">{stepConfig[currentStep].title}</span>
              </h3>
              {renderStepContent()}
            </div>

            {/* Navigation */}
            {currentStep !== 'complete' && (
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0 || loading}
                >
                  ← Previous
                </Button>
                
                {currentStep !== 'review' ? (
                  <Button
                    onClick={handleNext}
                    disabled={loading}
                    className="bg-organic-500 hover:bg-organic-600"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Next →
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="bg-organic-500 hover:bg-organic-600"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Place Order
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}