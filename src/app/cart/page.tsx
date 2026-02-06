"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Truck, 
  Shield, 
  RefreshCw,
  Gift,
  Tag,
  Star,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { CartItem, ProductVariant, Product } from "@/types";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface CartItemWithProduct extends CartItem {
  product_variants: ProductVariant & {
    products: Product;
  };
}

interface CartSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  savings: number;
}

const SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 50;
const TAX_RATE = 0.18; // 18% GST

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    subtotal: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    savings: 0
  });

  useEffect(() => {
    fetchCartItems();
  }, []);

  useEffect(() => {
    calculateCartSummary();
  }, [cartItems, appliedCoupon]);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth?redirect=/cart');
        return;
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          product_variants (
            *,
            products (
              id,
              name,
              slug,
              images,
              description,
              category_id
            )
          )
        `)
        .eq("user_id", user.id)
        .order("added_at", { ascending: false });

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCartSummary = () => {
    const subtotal = cartItems.reduce(
      (total, item) => {
        const price = item.product_variants?.price || 0;
        const comparePrice = item.product_variants?.compare_price || price;
        const itemTotal = price * item.quantity;
        const itemSavings = (comparePrice - price) * item.quantity;
        return total + itemTotal;
      },
      0
    );

    const savings = cartItems.reduce(
      (total, item) => {
        const price = item.product_variants?.price || 0;
        const comparePrice = item.product_variants?.compare_price || price;
        return total + (comparePrice - price) * item.quantity;
      },
      0
    );

    const discount = appliedCoupon ? (appliedCoupon.type === 'percentage' 
      ? subtotal * (appliedCoupon.value / 100) 
      : appliedCoupon.value) : 0;

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const shipping = discountedSubtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const tax = discountedSubtotal * TAX_RATE;
    const total = discountedSubtotal + shipping + tax;

    setCartSummary({
      subtotal,
      discount,
      shipping,
      tax,
      total,
      savings
    });
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", itemId);

      if (error) throw error;

      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !data) {
        alert("Invalid coupon code");
        return;
      }

      // Check if coupon is valid
      const now = new Date();
      const startsAt = new Date(data.starts_at);
      const expiresAt = new Date(data.expires_at);

      if (now < startsAt || now > expiresAt) {
        alert("Coupon has expired");
        return;
      }

      if (data.used_count >= data.usage_limit) {
        alert("Coupon usage limit reached");
        return;
      }

      if (cartSummary.subtotal < (data.minimum_amount || 0)) {
        alert(`Minimum order amount is ₹${data.minimum_amount}`);
        return;
      }

      setAppliedCoupon(data);
      setCouponCode("");
    } catch (error) {
      console.error("Error applying coupon:", error);
      alert("Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const proceedToCheckout = () => {
    const queryParams = new URLSearchParams();
    if (appliedCoupon) {
      queryParams.append('coupon', appliedCoupon.code);
    }
    router.push(`/checkout?${queryParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-organic-200 border-t-organic-600" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-16">
            <ShoppingCart className="h-24 w-24 mx-auto text-earth-300 mb-6" />
            <h2 className="text-2xl font-bold text-earth-900 mb-4">Your cart is empty</h2>
            <p className="text-earth-600 mb-8">Looks like you haven't added any products yet.</p>
            <Button 
              onClick={() => router.push('/shop')}
              className="bg-organic-500 hover:bg-organic-600 px-8"
              size="lg"
            >
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-earth-900 mb-2">Shopping Cart</h1>
        <div className="flex items-center space-x-2 text-sm text-earth-600">
          <span>Home</span>
          <ChevronRight className="h-4 w-4" />
          <span>Cart</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart Items ({cartItems.length})
                </span>
                <Badge variant="outline">
                  {cartItems.reduce((total, item) => total + item.quantity, 0)} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {cartItems.map((item) => {
                const price = item.product_variants?.price || 0;
                const comparePrice = item.product_variants?.compare_price || price;
                const hasDiscount = comparePrice > price;
                const isUpdating = updatingItems.has(item.id);

                return (
                  <div key={item.id} className={cn(
                    "space-y-4 pb-6 border-b last:border-b-0",
                    isUpdating && "opacity-50"
                  )}>
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={
                            item.product_variants?.products?.images?.[0] ||
                            "/placeholder-product.jpg"
                          }
                          alt={item.product_variants?.products?.name}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-semibold text-earth-900 text-lg">
                            {item.product_variants?.products?.name}
                          </h3>
                          <p className="text-sm text-earth-600">
                            SKU: {item.product_variants?.sku}
                          </p>
                          {item.product_variants?.weight && (
                            <p className="text-sm text-earth-600">
                              {item.product_variants.weight} {item.product_variants.weight_unit}
                            </p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-organic-600">
                            ₹{price.toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <>
                              <span className="text-sm text-earth-500 line-through">
                                ₹{comparePrice.toFixed(2)}
                              </span>
                              <Badge className="bg-red-100 text-red-700">
                                {Math.round(((comparePrice - price) / comparePrice) * 100)}% OFF
                              </Badge>
                            </>
                          )}
                        </div>

                        {/* Quantity and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isUpdating}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isUpdating}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg min-w-[100px] text-right">
                              ₹{(price * item.quantity).toFixed(2)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              disabled={isUpdating}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Trust Badges */}
          <Card>
            <CardContent className="py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-organic-600" />
                  <p className="text-sm font-medium">Fast Delivery</p>
                </div>
                <div className="text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-organic-600" />
                  <p className="text-sm font-medium">Secure Payment</p>
                </div>
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 mx-auto mb-2 text-organic-600" />
                  <p className="text-sm font-medium">Easy Returns</p>
                </div>
                <div className="text-center">
                  <Gift className="h-8 w-8 mx-auto mb-2 text-organic-600" />
                  <p className="text-sm font-medium">Best Prices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Coupon Code */}
              <div className="space-y-2">
                <Label htmlFor="coupon">Coupon Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="coupon"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                  />
                  <Button
                    variant="outline"
                    onClick={appliedCoupon ? removeCoupon : applyCoupon}
                    disabled={couponLoading || (!appliedCoupon && !couponCode.trim())}
                  >
                    {appliedCoupon ? "Remove" : couponLoading ? "Applying..." : "Apply"}
                  </Button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>
                      {appliedCoupon.code} applied (-₹{cartSummary.discount.toFixed(2)})
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-earth-600">Subtotal</span>
                  <span>₹{cartSummary.subtotal.toFixed(2)}</span>
                </div>

                {cartSummary.savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>You Saved</span>
                    <span>₹{cartSummary.savings.toFixed(2)}</span>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{cartSummary.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-earth-600">Shipping</span>
                  <span>
                    {cartSummary.shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${cartSummary.shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                {cartSummary.shipping > 0 && (
                  <p className="text-sm text-earth-500">
                    Add ₹{(SHIPPING_THRESHOLD - cartSummary.subtotal).toFixed(2)} more for FREE shipping
                  </p>
                )}

                <div className="flex justify-between">
                  <span className="text-earth-600">GST (18%)</span>
                  <span>₹{cartSummary.tax.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-organic-600">₹{cartSummary.total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={proceedToCheckout}
                className="w-full bg-organic-500 hover:bg-organic-600"
                size="lg"
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push('/shop')}
                className="w-full"
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-sm text-earth-600">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Secure checkout powered by industry-leading encryption</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}