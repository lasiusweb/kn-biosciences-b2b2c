import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ShoppingCart, Clock, ArrowRight } from 'lucide-react';

interface CartRecoveryEmailProps {
  firstName: string;
  cartItemsCount: number;
  cartValue: number;
  recoveryLink: string;
  daysSinceAbandonment?: number;
}

export function CartRecoveryEmail({ 
  firstName, 
  cartItemsCount, 
  cartValue, 
  recoveryLink,
  daysSinceAbandonment = 1
}: CartRecoveryEmailProps) {
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <div className="mx-auto bg-organic-100 p-3 rounded-full w-16 h-16 flex items-center justify-center">
          <ShoppingCart className="h-8 w-8 text-organic-600" />
        </div>
        <h1 className="text-3xl font-bold text-earth-900 mt-4">Don't Forget Your Items!</h1>
        <p className="text-earth-600 mt-2">
          {daysSinceAbandonment === 1 
            ? "We noticed you left some items in your cart." 
            : `We noticed you left some items in your cart ${daysSinceAbandonment} days ago.`}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Unfinished Order</CardTitle>
          <CardDescription>
            {cartItemsCount} item{cartItemsCount !== 1 ? 's' : ''} worth ₹{cartValue.toLocaleString()} are waiting for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-organic-50 rounded-lg">
            <div className="flex items-center">
              <div className="bg-organic-100 p-2 rounded-lg mr-4">
                <ShoppingCart className="h-6 w-6 text-organic-600" />
              </div>
              <div>
                <p className="font-medium">{cartItemsCount} items in your cart</p>
                <p className="text-sm text-earth-500">Total: ₹{cartValue.toLocaleString()}</p>
              </div>
            </div>
            <Clock className="h-5 w-5 text-earth-400" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="w-full sm:w-auto bg-organic-500 hover:bg-organic-600">
            <a href={recoveryLink}>
              Complete Your Purchase <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              View Cart
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center text-sm text-earth-500">
          <p>This is an automated reminder. Your cart items are reserved for a limited time.</p>
          <p className="mt-2">Questions? Contact us at support@knbiosciences.com</p>
        </div>
      </div>
    </div>
  );
}