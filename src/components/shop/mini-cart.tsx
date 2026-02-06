"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  ChevronRight,
  Truck,
  Shield
} from "lucide-react";
import { useEnterpriseCart } from "@/hooks/use-enterprise-cart";
import { cn } from "@/lib/utils";

export function MiniCart() {
  const router = useRouter();
  const { cart, isCartOpen, updateQuantity, removeItem, closeMiniCart } = useEnterpriseCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(itemId));
    await updateQuantity(itemId, newQuantity);
    setUpdatingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    await removeItem(itemId);
    setUpdatingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const handleCheckout = () => {
    closeMiniCart();
    router.push('/cart');
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={closeMiniCart}
      />

      {/* Mini Cart */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out",
        isCartOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <Card className="h-full rounded-none border-0 shadow-none">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <h2 className="text-lg font-semibold">
                Shopping Cart ({cart.totalItems})
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeMiniCart}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <CardContent className="flex flex-col h-[calc(100%-80px)] p-0">
            {cart.loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-organic-200 border-t-organic-600" />
              </div>
            ) : cart.items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
                <ShoppingCart className="h-16 w-16 text-earth-300 mb-4" />
                <h3 className="text-lg font-medium text-earth-900 mb-2">Your cart is empty</h3>
                <p className="text-earth-600 text-sm text-center mb-4">
                  Add some products to get started!
                </p>
                <Button
                  onClick={() => {
                    closeMiniCart();
                    router.push('/shop');
                  }}
                  className="bg-organic-500 hover:bg-organic-600"
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-4">
                    {cart.items.slice(0, 5).map((item: any) => {
                      const price = item.product_variants?.price || 0;
                      const comparePrice = item.product_variants?.compare_price || price;
                      const hasDiscount = comparePrice > price;
                      const isUpdating = updatingItems.has(item.id);

                      return (
                        <div key={item.id} className={cn(
                          "flex gap-3 pb-4 border-b last:border-b-0",
                          isUpdating && "opacity-50"
                        )}>
                          {/* Product Image */}
                          <img
                            src={
                              item.product_variants?.products?.images?.[0] ||
                              "/placeholder-product.jpg"
                            }
                            alt={item.product_variants?.products?.name}
                            className="w-16 h-16 object-cover rounded-lg border flex-shrink-0"
                          />

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="mb-2">
                              <h4 className="font-medium text-earth-900 text-sm truncate">
                                {item.product_variants?.products?.name}
                              </h4>
                              <p className="text-xs text-earth-600">
                                {item.product_variants?.sku}
                              </p>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-organic-600">
                                ₹{price.toFixed(2)}
                              </span>
                              {hasDiscount && (
                                <span className="text-xs text-earth-500 line-through">
                                  ₹{comparePrice.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || isUpdating}
                                  className="h-7 w-7 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  disabled={isUpdating}
                                  className="h-7 w-7 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={isUpdating}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* View More Items */}
                    {cart.items.length > 5 && (
                      <div className="text-center pt-2">
                        <Button
                          variant="ghost"
                          onClick={handleCheckout}
                          className="text-organic-600 hover:text-organic-700"
                        >
                          View {cart.items.length - 5} more items
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t bg-white p-4">
                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 mb-4 text-xs text-earth-600">
                    <div className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      <span>Free Shipping</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>Secure Payment</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-earth-600">Total</span>
                    <span className="text-lg font-bold text-organic-600">
                      ₹{cart.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-organic-500 hover:bg-organic-600"
                    >
                      View Cart & Checkout
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        closeMiniCart();
                        router.push('/shop');
                      }}
                      className="w-full"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}