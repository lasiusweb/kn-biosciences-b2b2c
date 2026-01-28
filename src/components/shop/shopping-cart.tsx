"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { CartItem, ProductVariant } from "@/types";
import { supabase } from "@/lib/supabase";

interface CartProps {
  className?: string;
}

export function Cart({ className }: CartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(
          `
          *,
          product_variants (
            id,
            sku,
            price,
            products (
              name,
              images
            )
          )
        `,
        )
        .eq("cart_id", "current"); // Assuming single cart per user

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", itemId);

      if (error) throw error;

      // Update local state
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      // Update local state
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const totalAmount = cartItems.reduce(
    (total, item) =>
      total + (item.product_variants?.price || 0) * item.quantity,
    0,
  );

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Shopping Cart ({totalItems})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-organic-200 border-t-organic-600" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto text-earth-300 mb-4" />
            <p className="text-earth-600">Your cart is empty</p>
            <Button
              onClick={() => (window.location.href = "/shop")}
              className="bg-organic-500 hover:bg-organic-600"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 p-4 border-b"
              >
                <img
                  src={
                    item.product_variants?.products?.images?.[0] ||
                    "/placeholder-product.jpg"
                  }
                  alt={item.product_variants?.products?.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1">
                  <div>
                    <h3 className="font-semibold text-earth-900">
                      {item.product_variants?.products?.name}
                    </h3>
                    <p className="text-sm text-earth-600">
                      SKU: {item.product_variants?.sku}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-earth-700 font-medium">
                      ₹{item.product_variants?.price}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-organic-600">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex space-x-4 mt-4">
                <Button
                  onClick={() => (window.location.href = "/shop")}
                  variant="outline"
                  className="flex-1"
                >
                  Continue Shopping
                </Button>
                <Button
                  className="flex-1 bg-organic-500 hover:bg-organic-600"
                  onClick={() => (window.location.href = "/checkout")}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
