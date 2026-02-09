import { supabase } from '@/lib/supabase';
import { Product, ProductVariant } from '@/types';

export interface WishListItem {
  id: string;
  user_id: string;
  variant_id: string;
  added_at: string;
  product: Product;
  variant: ProductVariant;
}

export interface WishListStats {
  total_items: number;
  total_value: number;
  recently_added: number;
}

export class WishListService {
  /**
   * Gets a user's wish list items
   */
  static async getWishList(userId: string): Promise<WishListItem[]> {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          user_id,
          variant_id,
          added_at,
          product_variants!inner (
            id,
            product_id,
            sku,
            price,
            compare_price,
            cost_price,
            stock_quantity,
            low_stock_threshold,
            track_inventory,
            image_urls,
            created_at,
            updated_at,
            products!inner (
              id,
              name,
              slug,
              description,
              short_description,
              category_id,
              segment,
              status,
              featured,
              meta_title,
              meta_description,
              created_at,
              updated_at
            )
          )
        `)
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching wish list:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      return data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        variant_id: item.variant_id,
        added_at: item.added_at,
        product: item.product_variants.products,
        variant: item.product_variants
      }));
    } catch (error) {
      console.error('Error getting wish list:', error);
      return [];
    }
  }

  /**
   * Adds an item to the wish list
   */
  static async addToWishList(userId: string, variantId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if item already exists in wish list
      const { data: existingItem, error: checkError } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('variant_id', variantId)
        .single();

      if (existingItem) {
        return {
          success: false,
          message: 'Item is already in your wish list'
        };
      }

      // Add item to wish list
      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: userId,
          variant_id: variantId
        });

      if (error) {
        console.error('Error adding to wish list:', error);
        return {
          success: false,
          message: 'Failed to add item to wish list'
        };
      }

      return {
        success: true,
        message: 'Item added to wish list successfully'
      };
    } catch (error) {
      console.error('Error adding to wish list:', error);
      return {
        success: false,
        message: 'An error occurred while adding to wish list'
      };
    }
  }

  /**
   * Removes an item from the wish list
   */
  static async removeFromWishList(wishListItemId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishListItemId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing from wish list:', error);
        return {
          success: false,
          message: 'Failed to remove item from wish list'
        };
      }

      return {
        success: true,
        message: 'Item removed from wish list successfully'
      };
    } catch (error) {
      console.error('Error removing from wish list:', error);
      return {
        success: false,
        message: 'An error occurred while removing from wish list'
      };
    }
  }

  /**
   * Removes an item from the wish list by variant ID
   */
  static async removeItemByVariantId(variantId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('variant_id', variantId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing from wish list:', error);
        return {
          success: false,
          message: 'Failed to remove item from wish list'
        };
      }

      return {
        success: true,
        message: 'Item removed from wish list successfully'
      };
    } catch (error) {
      console.error('Error removing from wish list:', error);
      return {
        success: false,
        message: 'An error occurred while removing from wish list'
      };
    }
  }

  /**
   * Checks if an item is in the wish list
   */
  static async isInWishList(variantId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('variant_id', variantId)
        .single();

      if (error) {
        // If no rows found, that's not an error for this use case
        if (error.code === 'PGRST116') {
          return false;
        }
        console.error('Error checking wish list:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking wish list:', error);
      return false;
    }
  }

  /**
   * Moves an item from wish list to cart
   */
  static async moveToCart(wishListItemId: string, userId: string, quantity: number = 1): Promise<{ success: boolean; message: string }> {
    try {
      // Get the wish list item
      const { data: wishItem, error: getItemError } = await supabase
        .from('wishlist')
        .select(`
          id,
          variant_id,
          product_variants!inner (
            stock_quantity,
            track_inventory
          )
        `)
        .eq('id', wishListItemId)
        .eq('user_id', userId)
        .single();

      if (getItemError || !wishItem) {
        return {
          success: false,
          message: 'Wish list item not found'
        };
      }

      // Check if item is in stock
      if (wishItem.product_variants.track_inventory && wishItem.product_variants.stock_quantity < quantity) {
        return {
          success: false,
          message: `Only ${wishItem.product_variants.stock_quantity} available in stock`
        };
      }

      // Get user's active cart
      let cartId = await this.getActiveCartId(userId);
      if (!cartId) {
        // Create a new cart
        const { data: newCart, error: cartError } = await supabase
          .from('carts')
          .insert({
            user_id: userId,
            status: 'active'
          })
          .select('id')
          .single();

        if (cartError) {
          console.error('Error creating cart:', cartError);
          return {
            success: false,
            message: 'Failed to create cart'
          };
        }

        cartId = newCart.id;
      }

      // Add item to cart
      const { error: cartError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          variant_id: wishItem.variant_id,
          quantity: quantity
        });

      if (cartError) {
        console.error('Error adding to cart:', cartError);
        return {
          success: false,
          message: 'Failed to add item to cart'
        };
      }

      // Remove item from wish list
      await this.removeFromWishList(wishListItemId, userId);

      return {
        success: true,
        message: 'Item moved to cart successfully'
      };
    } catch (error) {
      console.error('Error moving to cart:', error);
      return {
        success: false,
        message: 'An error occurred while moving item to cart'
      };
    }
  }

  /**
   * Gets wish list statistics
   */
  static async getWishListStats(userId: string): Promise<WishListStats> {
    try {
      // Get all wish list items
      const items = await this.getWishList(userId);

      const totalItems = items.length;
      const totalValue = items.reduce((sum, item) => sum + item.variant.price, 0);
      const recentPeriod = new Date();
      recentPeriod.setDate(recentPeriod.getDate() - 7); // Last 7 days
      
      const recentlyAdded = items.filter(item => 
        new Date(item.added_at) > recentPeriod
      ).length;

      return {
        total_items: totalItems,
        total_value: totalValue,
        recently_added: recentlyAdded
      };
    } catch (error) {
      console.error('Error getting wish list stats:', error);
      return {
        total_items: 0,
        total_value: 0,
        recently_added: 0
      };
    }
  }

  /**
   * Gets the active cart ID for a user
   */
  private static async getActiveCartId(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching user cart:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error getting user cart ID:', error);
      return null;
    }
  }

  /**
   * Gets wish list items with availability status
   */
  static async getWishListWithAvailability(userId: string): Promise<(WishListItem & { in_stock: boolean })[]> {
    try {
      const items = await this.getWishList(userId);
      
      return items.map(item => ({
        ...item,
        in_stock: item.variant.track_inventory 
          ? item.variant.stock_quantity > 0 
          : true // If not tracking inventory, assume in stock
      }));
    } catch (error) {
      console.error('Error getting wish list with availability:', error);
      return [];
    }
  }

  /**
   * Shares the wish list with others
   */
  static async shareWishList(userId: string, message?: string): Promise<{ success: boolean; shareUrl?: string; message: string }> {
    try {
      // In a real implementation, this would generate a shareable link
      // For now, we'll just return a mock URL
      const shareUrl = `${window.location.origin}/wishlist/${userId}`;
      
      // Optionally save the share event to the database
      if (message) {
        await supabase
          .from('wishlist_shares')
          .insert({
            user_id: userId,
            message,
            shared_at: new Date().toISOString()
          });
      }

      return {
        success: true,
        shareUrl,
        message: 'Wish list share link generated successfully'
      };
    } catch (error) {
      console.error('Error sharing wish list:', error);
      return {
        success: false,
        message: 'Failed to generate share link'
      };
    }
  }

  /**
   * Clears the entire wish list
   */
  static async clearWishList(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing wish list:', error);
        return {
          success: false,
          message: 'Failed to clear wish list'
        };
      }

      return {
        success: true,
        message: 'Wish list cleared successfully'
      };
    } catch (error) {
      console.error('Error clearing wish list:', error);
      return {
        success: false,
        message: 'An error occurred while clearing wish list'
      };
    }
  }

  /**
   * Batch adds items to wish list
   */
  static async addMultipleToWishList(userId: string, variantIds: string[]): Promise<{ success: boolean; added: number; skipped: number; message: string }> {
    try {
      // Check which items already exist in the wish list
      const { data: existingItems } = await supabase
        .from('wishlist')
        .select('variant_id')
        .eq('user_id', userId)
        .in('variant_id', variantIds);

      const existingVariantIds = new Set(existingItems?.map(item => item.variant_id) || []);
      const newVariantIds = variantIds.filter(id => !existingVariantIds.has(id));

      if (newVariantIds.length === 0) {
        return {
          success: true,
          added: 0,
          skipped: variantIds.length,
          message: 'All items were already in your wish list'
        };
      }

      // Add new items to wish list
      const { error } = await supabase
        .from('wishlist')
        .insert(
          newVariantIds.map(variantId => ({
            user_id: userId,
            variant_id: variantId
          }))
        );

      if (error) {
        console.error('Error adding multiple items to wish list:', error);
        return {
          success: false,
          added: 0,
          skipped: variantIds.length,
          message: 'Failed to add items to wish list'
        };
      }

      return {
        success: true,
        added: newVariantIds.length,
        skipped: existingVariantIds.size,
        message: `${newVariantIds.length} items added to wish list`
      };
    } catch (error) {
      console.error('Error adding multiple items to wish list:', error);
      return {
        success: false,
        added: 0,
        skipped: variantIds.length,
        message: 'An error occurred while adding items to wish list'
      };
    }
  }
}