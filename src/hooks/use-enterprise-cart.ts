import { useState, useEffect } from "react";
import { CartItem } from "@/types";
import { supabase } from "@/lib/supabase";

interface CartState {
  items: any[];
  totalItems: number;
  totalAmount: number;
  loading: boolean;
}

interface CartItemWithProduct extends CartItem {
  product_variants: {
    id: string;
    sku: string;
    price: number;
    compare_price?: number;
    weight?: number;
    weight_unit?: string;
    products: {
      id: string;
      name: string;
      slug: string;
      images: string[];
    };
  };
}

interface CartResponse {
  cartItems: CartItemWithProduct[];
  summary: {
    totalItems: number;
    subtotal: number;
    itemCount: number;
  };
}

export function useEnterpriseCart() {
  const [cart, setCart] = useState<CartState>({
    items: [],
    totalItems: 0,
    totalAmount: 0,
    loading: true,
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, return empty cart
          setCart({
            items: [],
            totalItems: 0,
            totalAmount: 0,
            loading: false,
          });
          return;
        }
        throw new Error('Failed to fetch cart');
      }
      
      const data: CartResponse = await response.json();
      
      setCart({
        items: data.cartItems || [],
        totalItems: data.summary?.totalItems || 0,
        totalAmount: data.summary?.subtotal || 0,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addItem = async (variantId: string, quantity: number = 1) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variantId, quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add item to cart');
      }

      await fetchCart(); // Refresh cart data
      setIsCartOpen(true); // Show mini cart
      
      return { success: true };
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add item' 
      };
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      await fetchCart(); // Refresh cart data
      return { success: true };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update quantity' 
      };
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      await fetchCart(); // Refresh cart data
      return { success: true };
    } catch (error) {
      console.error('Error removing item:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove item' 
      };
    }
  };

  const clearCart = async () => {
    try {
      // Remove all items one by one (bulk delete might be more efficient)
      const removePromises = cart.items.map(item => removeItem(item.id));
      await Promise.all(removePromises);
      
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to clear cart' 
      };
    }
  };

  const toggleMiniCart = () => {
    setIsCartOpen(prev => !prev);
  };

  const closeMiniCart = () => {
    setIsCartOpen(false);
  };

  return {
    cart,
    isCartOpen,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart,
    toggleMiniCart,
    closeMiniCart,
  };
}