import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Package, 
  Receipt, 
  Calculator, 
  Percent, 
  Truck, 
  IndianRupee,
  Info
} from 'lucide-react';

interface OrderSummaryProps {
  subtotal: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  fees?: { name: string; amount: number }[];
  total: number;
  className?: string;
  showDetailedBreakdown?: boolean;
}

export function OrderSummary({ 
  subtotal, 
  discount = 0, 
  shipping = 0, 
  tax = 0, 
  fees = [], 
  total, 
  className,
  showDetailedBreakdown = true
}: OrderSummaryProps) {
  const hasDiscount = discount > 0;
  const hasFees = fees.length > 0;
  const hasTax = tax > 0;
  const hasShipping = shipping > 0;

  return (
    <Card className={cn("bg-white", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Order Summary
        </CardTitle>
        <CardDescription>Price breakdown for your order</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-earth-600">Subtotal</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>

          {hasDiscount && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1">
                <Percent className="h-4 w-4" />
                Discount
              </span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}

          {hasShipping && (
            <div className="flex justify-between">
              <span className="flex items-center gap-1 text-earth-600">
                <Truck className="h-4 w-4" />
                Shipping
              </span>
              <span>
                {shipping === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  `₹${shipping.toFixed(2)}`
                )}
              </span>
            </div>
          )}

          {hasTax && (
            <div className="flex justify-between text-earth-600">
              <span className="flex items-center gap-1">
                <Calculator className="h-4 w-4" />
                Tax (18%)
              </span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
          )}

          {hasFees && fees.map((fee, index) => (
            <div key={index} className="flex justify-between text-earth-600">
              <span className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                {fee.name}
              </span>
              <span>₹{fee.amount.toFixed(2)}</span>
            </div>
          ))}

          <Separator />

          <div className="flex justify-between text-lg font-bold pt-2">
            <span>Total</span>
            <span className="flex items-center text-organic-600">
              <IndianRupee className="h-4 w-4" />
              {total.toFixed(2)}
            </span>
          </div>

          {showDetailedBreakdown && (
            <div className="mt-6 p-4 bg-organic-50 rounded-lg">
              <h4 className="font-medium text-organic-700 mb-2 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Included Items
              </h4>
              <ul className="text-sm text-organic-600 space-y-1">
                <li className="flex justify-between">
                  <span>3 x BioGrow Pro Fertilizer (500g)</span>
                  <span>₹2,499.00</span>
                </li>
                <li className="flex justify-between">
                  <span>1 x SoilRevive Organic Mix (1kg)</span>
                  <span>₹899.00</span>
                </li>
                <li className="flex justify-between">
                  <span>2 x AquaVital Plus (250ml)</span>
                  <span>₹2,198.00</span>
                </li>
              </ul>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              Free delivery over ₹10,000
            </Badge>
            <Badge variant="secondary" className="text-xs">
              30-day return policy
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Certified organic products
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}