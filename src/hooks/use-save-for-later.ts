import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ProductVariant } from '@/types';

export interface SavedItem {
  id: string;
  user_id: string;
  variant_id: string;
  added_at: string;
  product_variant: ProductVariant;
}

export function useSaveForLater() {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSavedItems = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          user_id,
          variant_id,
          added_at,
          product_variants!inner (
            *
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedItems(data as SavedItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saved items');
      console.error('Error loading saved items:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveItem = async (variantId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if item is already saved
      const { data: existingItem } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('variant_id', variantId)
        .single();

      if (existingItem) {
        throw new Error('Item already saved for later');
      }

      const { data, error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          variant_id: variantId
        })
        .select(`
          id,
          user_id,
          variant_id,
          added_at,
          product_variants!inner (
            *
          )
        `)
        .single();

      if (error) throw error;

      setSavedItems(prev => [...prev, data as SavedItem]);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save item';
      setError(errorMessage);
      console.error('Error saving item:', err);
      return { success: false, error: errorMessage };
    }
  };

  const removeSavedItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setSavedItems(prev => prev.filter(item => item.id !== itemId));
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove saved item';
      setError(errorMessage);
      console.error('Error removing saved item:', err);
      return { success: false, error: errorMessage };
    }
  };

  const moveToCart = async (itemId: string, quantity: number = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const savedItem = savedItems.find(item => item.id === itemId);
      if (!savedItem) {
        throw new Error('Saved item not found');
      }

      // Add to cart
      const { error: cartError } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          variant_id: savedItem.variant_id,
          quantity
        });

      if (cartError) throw cartError;

      // Remove from saved items
      await removeSavedItem(itemId);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move item to cart';
      setError(errorMessage);
      console.error('Error moving item to cart:', err);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    loadSavedItems();
  }, []);

  return {
    savedItems,
    loading,
    error,
    loadSavedItems,
    saveItem,
    removeSavedItem,
    moveToCart
  };
}