import { useState, useEffect } from "react";

export interface CartItem {
  id: string;
  variant_id: string;
  quantity: number;
  added_at: string;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  loading: boolean;
}

export function useCart() {
  const [cart, setCart] = useState<CartState>({
    items: [],
    totalItems: 0,
    totalAmount: 0,
    loading: false,
  });

  const calculateTotals = (items: CartItem[]) => {
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalAmount = items.reduce(
      (total, item) =>
        total + (item.product_variants?.price || 0) * item.quantity,
      0,
    );

    return { totalItems, totalAmount };
  };

  const addItem = (item: Omit<CartItem, "id">) => {
    setCart((prev) => {
      const newItem = {
        ...item,
        id: Date.now().toString(),
        added_at: new Date().toISOString(),
      };
      const updatedItems = [...prev.items, newItem];
      const totals = calculateTotals(updatedItems);

      return {
        ...prev,
        items: updatedItems,
        ...totals,
      };
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => {
      const updatedItems = prev.items.filter((item) => item.id !== id);
      const totals = calculateTotals(updatedItems);

      return {
        ...prev,
        items: updatedItems,
        ...totals,
      };
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) => {
      const updatedItems = prev.items.map((item) =>
        item.id === id ? { ...item, quantity } : item,
      );
      const totals = calculateTotals(updatedItems);

      return {
        ...prev,
        items: updatedItems,
        ...totals,
      };
    });
  };

  const clearCart = () => {
    setCart({
      items: [],
      totalItems: 0,
      totalAmount: 0,
      loading: false,
    });
  };

  return {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
