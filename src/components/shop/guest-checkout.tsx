import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { CheckoutFlow } from '@/components/shop/checkout-flow';
import { Mail, Lock, User, Phone, MapPin } from 'lucide-react';

interface GuestCheckoutProps {
  orderId: string;
  amount: number;
}

export function GuestCheckout({ orderId, amount }: GuestCheckoutProps) {
  const [step, setStep] = useState<'login' | 'guest' | 'checkout'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guestDetails, setGuestDetails] = useState({
    name: '',
    email: '',
    phone: '',
    pincode: ''
  });
  const [createAccount, setCreateAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Proceed to checkout flow
      setStep('checkout');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = async () => {
    if (!guestDetails.name || !guestDetails.email || !guestDetails.phone) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // If user wants to create an account, register them first
      if (createAccount && password) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: guestDetails.email,
          password,
          options: {
            data: {
              first_name: guestDetails.name.split(' ')[0],
              last_name: guestDetails.name.split(' ').slice(1).join(' '),
              phone: guestDetails.phone
            }
          }
        });

        if (signUpError) throw signUpError;
      }

      // Proceed to checkout flow
      setStep('checkout');
    } catch (err: any) {
      setError(err.message || 'Failed to continue as guest');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'checkout') {
    return (
      <CheckoutFlow
        orderId={orderId}
        amount={amount}
        customerInfo={{
          name: guestDetails.name || 'Guest',
          email: guestDetails.email,
          phone: guestDetails.phone,
          pincode: guestDetails.pincode
        }}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription>
              Sign in to your account or continue as a guest
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 'login' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-organic-500 hover:bg-organic-600" 
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue as guest</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep('guest')}
                >
                  Continue as Guest
                </Button>
              </div>
            )}

            {step === 'guest' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="guest-name">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="guest-name"
                        type="text"
                        placeholder="John Doe"
                        value={guestDetails.name}
                        onChange={(e) => setGuestDetails({...guestDetails, name: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="guest-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="guest-email"
                        type="email"
                        placeholder="your@email.com"
                        value={guestDetails.email}
                        onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="guest-phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="guest-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={guestDetails.phone}
                        onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="guest-pincode">Pincode</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="guest-pincode"
                        type="text"
                        placeholder="500001"
                        value={guestDetails.pincode}
                        onChange={(e) => setGuestDetails({...guestDetails, pincode: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="guest-password">Create Password (Optional)</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="guest-password"
                        type="password"
                        placeholder="Create a password (optional)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="create-account"
                      checked={createAccount}
                      onCheckedChange={(checked) => setCreateAccount(!!checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="create-account"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Create an account for faster checkout in the future
                      </label>
                      <p className="text-xs text-gray-500">
                        We'll create an account using the information you provided
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-organic-500 hover:bg-organic-600" 
                  onClick={handleGuestContinue}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Continue to Checkout'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep('login')}
                >
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}