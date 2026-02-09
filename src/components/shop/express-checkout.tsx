import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/lib/supabase';
import { 
  CreditCard, 
  MapPin, 
  Truck, 
  Clock, 
  Shield, 
  User, 
  Phone, 
  Mail,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface ExpressCheckoutProps {
  orderId: string;
  amount: number;
  onProceed: (method: 'oneclick' | 'apple-pay' | 'google-pay' | 'amazon-pay') => void;
  onBack?: () => void;
}

export function ExpressCheckout({ orderId, amount, onProceed, onBack }: ExpressCheckoutProps) {
  const [selectedMethod, setSelectedMethod] = useState<'oneclick' | 'apple-pay' | 'google-pay' | 'amazon-pay' | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Load saved addresses
      const { data: addresses, error: addrError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id);

      if (addrError) throw addrError;
      setSavedAddresses(addresses || []);

      // Load saved payment methods (in a real app, this would come from a payment provider)
      // For demo purposes, we'll simulate saved payment methods
      setSavedPaymentMethods([
        { id: 'pm-1', type: 'card', last4: '1234', brand: 'Visa', expiry: '12/25' },
        { id: 'pm-2', type: 'card', last4: '5678', brand: 'Mastercard', expiry: '08/26' }
      ]);
    } catch (err) {
      setError('Failed to load user data');
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (!selectedMethod) {
      setError('Please select an express checkout method');
      return;
    }
    
    onProceed(selectedMethod);
  };

  // Mock express checkout methods
  const expressMethods = [
    {
      id: 'oneclick',
      name: 'One-Click Checkout',
      description: 'Complete purchase with stored address and payment method',
      icon: <Clock className="h-5 w-5" />,
      available: savedAddresses.length > 0 && savedPaymentMethods.length > 0,
      badge: savedAddresses.length > 0 && savedPaymentMethods.length > 0 ? 'Fastest' : 'Requires Setup'
    },
    {
      id: 'google-pay',
      name: 'Google Pay',
      description: 'Pay securely with Google Pay',
      icon: <div className="bg-blue-500 rounded-full p-1"><span className="text-white text-xs font-bold">G</span></div>,
      available: true,
      badge: 'Secure'
    },
    {
      id: 'apple-pay',
      name: 'Apple Pay',
      description: 'Pay securely with Apple Pay',
      icon: <div className="bg-black rounded-full p-1"><span className="text-white text-xs font-bold">A</span></div>,
      available: true,
      badge: 'Secure'
    },
    {
      id: 'amazon-pay',
      name: 'Amazon Pay',
      description: 'Pay securely with Amazon Pay',
      icon: <div className="bg-yellow-400 rounded-full p-1"><span className="text-black text-xs font-bold">A</span></div>,
      available: true,
      badge: 'Secure'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-organic-600" />
          <p>Loading express checkout options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-earth-900">Express Checkout</h2>
          <p className="text-earth-600">Complete your purchase quickly and securely</p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back to Standard Checkout
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Choose Express Method</CardTitle>
          <CardDescription>
            Select a fast checkout option to complete your purchase in seconds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedMethod || ''} 
            onValueChange={(value) => setSelectedMethod(value as any)}
            className="space-y-4"
          >
            {expressMethods.map((method) => (
              <div 
                key={method.id}
                className={`flex items-start space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === method.id 
                    ? "border-organic-500 bg-organic-50" 
                    : method.available 
                      ? "hover:border-organic-300" 
                      : "opacity-50 cursor-not-allowed"
                }`}
              >
                <RadioGroupItem 
                  value={method.id} 
                  id={method.id} 
                  disabled={!method.available}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={method.id} className="font-medium flex items-center">
                      <span className="mr-2">{method.icon}</span>
                      {method.name}
                    </Label>
                    <Badge 
                      variant={method.badge === 'Fastest' ? 'default' : 'secondary'}
                      className={method.badge === 'Requires Setup' ? 'bg-gray-200' : ''}
                    >
                      {method.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                  
                  {method.id === 'oneclick' && method.available && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-organic-600" />
                        <span>
                          {savedAddresses[0]?.address_line1}, {savedAddresses[0]?.city}, {savedAddresses[0]?.state}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CreditCard className="h-4 w-4 mr-2 text-organic-600" />
                        <span>
                          {savedPaymentMethods[0]?.brand} ending in {savedPaymentMethods[0]?.last4}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{(amount * 0.18).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{(amount * 1.18).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center text-sm text-gray-500">
          <Shield className="h-4 w-4 mr-1" />
          <span>Secured by industry-standard encryption</span>
        </div>
        <Button 
          onClick={handleProceed}
          disabled={!selectedMethod}
          className="bg-organic-500 hover:bg-organic-600"
        >
          {selectedMethod ? 'Complete Purchase' : 'Select Method First'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}