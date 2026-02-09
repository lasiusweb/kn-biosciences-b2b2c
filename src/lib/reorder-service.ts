import { supabase } from '@/lib/supabase';
import { Product, ProductVariant } from '@/types';

export interface PreviousOrder {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  status: string;
  items: Array<{
    id: string;
    product_variant_id: string;
    quantity: number;
    price: number;
    product: Product;
    variant: ProductVariant;
  }>;
}

export interface ReorderResult {
  success: boolean;
  newCartId?: string;
  message: string;
  itemsAdded?: number;
}

export class ReorderService {
  /**
   * Gets previous orders for a user
   */
  static async getPreviousOrders(userId: string): Promise<PreviousOrder[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          created_at,
          total_amount,
          status,
          order_items (
            id,
            variant_id,
            quantity,
            unit_price,
            product_variants (
              id,
              sku,
              weight,
              weight_unit,
              packing_type,
              form,
              price,
              compare_price,
              cost_price,
              stock_quantity,
              low_stock_threshold,
              track_inventory,
              image_urls,
              created_at,
              updated_at,
              products (
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
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching previous orders:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      // Transform the data to match our interface
      return data.map(order => ({
        id: order.id,
        order_number: order.order_number,
        created_at: order.created_at,
        total_amount: order.total_amount,
        status: order.status,
        items: order.order_items.map(item => ({
          id: item.id,
          product_variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.unit_price,
          product: item.product_variants.products,
          variant: item.product_variants
        }))
      }));
    } catch (error) {
      console.error('Error getting previous orders:', error);
      return [];
    }
  }

  /**
   * Gets a specific previous order
   */
  static async getPreviousOrder(orderId: string, userId: string): Promise<PreviousOrder | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          created_at,
          total_amount,
          status,
          order_items (
            id,
            variant_id,
            quantity,
            unit_price,
            product_variants (
              id,
              sku,
              weight,
              weight_unit,
              packing_type,
              form,
              price,
              compare_price,
              cost_price,
              stock_quantity,
              low_stock_threshold,
              track_inventory,
              image_urls,
              created_at,
              updated_at,
              products (
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
          )
        `)
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching previous order:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        order_number: data.order_number,
        created_at: data.created_at,
        total_amount: data.total_amount,
        status: data.status,
        items: data.order_items.map(item => ({
          id: item.id,
          product_variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.unit_price,
          product: item.product_variants.products,
          variant: item.product_variants
        }))
      };
    } catch (error) {
      console.error('Error getting previous order:', error);
      return null;
    }
  }

  /**
   * Reorders items from a previous order
   */
  static async reorderItems(orderId: string, userId: string, itemQuantities?: { [itemId: string]: number }): Promise<ReorderResult> {
    try {
      // Get the previous order
      const order = await this.getPreviousOrder(orderId, userId);
      
      if (!order) {
        return {
          success: false,
          message: 'Order not found or you do not have permission to reorder this order'
        };
      }

      // Get current user's cart or create a new one
      let cartId = await this.getCurrentUserCartId(userId);
      
      if (!cartId) {
        // Create a new cart for the user
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
            message: 'Failed to create cart for reorder'
          };
        }

        cartId = newCart.id;
      }

      // Add items to cart
      let itemsAdded = 0;
      const reorderPromises = order.items.map(async (orderItem) => {
        // Determine quantity to add
        const quantity = itemQuantities?.[orderItem.id] || orderItem.quantity;

        // Check if item is still available
        if (orderItem.variant.stock_quantity < quantity && orderItem.variant.track_inventory) {
          console.warn(`Item ${orderItem.product.name} only has ${orderItem.variant.stock_quantity} in stock, requested ${quantity}`);
          // Adjust quantity to available stock
          const adjustedQuantity = Math.min(quantity, orderItem.variant.stock_quantity);
          if (adjustedQuantity <= 0) {
            return; // Skip this item if out of stock
          }
        }

        // Check if item already exists in cart
        const { data: existingCartItem } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', cartId!)
          .eq('variant_id', orderItem.product_variant_id)
          .single();

        if (existingCartItem) {
          // Update existing cart item
          const newQuantity = existingCartItem.quantity + quantity;
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', existingCartItem.id);

          if (updateError) {
            console.error('Error updating cart item:', updateError);
          } else {
            itemsAdded++;
          }
        } else {
          // Add new cart item
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert({
              cart_id: cartId,
              variant_id: orderItem.product_variant_id,
              quantity: quantity
            });

          if (insertError) {
            console.error('Error adding cart item:', insertError);
          } else {
            itemsAdded++;
          }
        }
      });

      await Promise.all(reorderPromises);

      return {
        success: true,
        newCartId: cartId,
        message: `Successfully added ${itemsAdded} items to your cart from order ${order.order_number}`,
        itemsAdded
      };
    } catch (error) {
      console.error('Error reordering items:', error);
      return {
        success: false,
        message: 'An error occurred while reordering items'
      };
    }
  }

  /**
   * Reorders all items from a previous order
   */
  static async reorderAllItems(orderId: string, userId: string): Promise<ReorderResult> {
    return this.reorderItems(orderId, userId);
  }

  /**
   * Reorders specific items from a previous order with custom quantities
   */
  static async reorderSpecificItems(
    orderId: string,
    userId: string,
    itemQuantities: { [itemId: string]: number }
  ): Promise<ReorderResult> {
    return this.reorderItems(orderId, userId, itemQuantities);
  }

  /**
   * Gets the current active cart ID for a user
   */
  private static async getCurrentUserCartId(userId: string): Promise<string | null> {
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
   * Creates a reorder cart with items from a previous order
   */
  static async createReorderCart(orderId: string, userId: string): Promise<ReorderResult> {
    try {
      // Get the previous order
      const order = await this.getPreviousOrder(orderId, userId);
      
      if (!order) {
        return {
          success: false,
          message: 'Order not found or you do not have permission to reorder this order'
        };
      }

      // Create a new cart for the reorder
      const { data: newCart, error: cartError } = await supabase
        .from('carts')
        .insert({
          user_id: userId,
          status: 'active',
          notes: `Reorder of order ${order.order_number}`
        })
        .select('id')
        .single();

      if (cartError) {
        console.error('Error creating reorder cart:', cartError);
        return {
          success: false,
          message: 'Failed to create reorder cart'
        };
      }

      // Add items to the new cart
      let itemsAdded = 0;
      const reorderPromises = order.items.map(async (orderItem) => {
        // Check if item is still available
        if (orderItem.variant.stock_quantity < orderItem.quantity && orderItem.variant.track_inventory) {
          // Adjust quantity to available stock
          const adjustedQuantity = Math.min(orderItem.quantity, orderItem.variant.stock_quantity);
          if (adjustedQuantity <= 0) {
            return; // Skip this item if out of stock
          }
        }

        // Add item to cart
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            cart_id: newCart.id,
            variant_id: orderItem.product_variant_id,
            quantity: orderItem.quantity
          });

        if (insertError) {
          console.error('Error adding item to reorder cart:', insertError);
        } else {
          itemsAdded++;
        }
      });

      await Promise.all(reorderPromises);

      return {
        success: true,
        newCartId: newCart.id,
        message: `Successfully created reorder cart with ${itemsAdded} items from order ${order.order_number}`,
        itemsAdded
      };
    } catch (error) {
      console.error('Error creating reorder cart:', error);
      return {
        success: false,
        message: 'An error occurred while creating reorder cart'
      };
    }
  }

  /**
   * Gets reorder recommendations based on purchase history
   */
  static async getReorderRecommendations(userId: string, limit: number = 5): Promise<Product[]> {
    try {
      // Get user's most frequently purchased items
      const { data, error } = await supabase
        .rpc('get_frequently_purchased_products', { user_id: userId, limit_param: limit });

      if (error) {
        console.error('Error getting reorder recommendations:', error);
        return [];
      }

      // If the RPC doesn't exist, fall back to manual query
      if (!data) {
        // Manual query to get frequently purchased products
        const { data: manualData, error: manualError } = await supabase
          .from('order_items')
          .select(`
            product_variants (
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
          .eq('orders.user_id', userId)
          .order('created_at', { foreignTable: 'orders', ascending: false })
          .limit(limit);

        if (manualError) {
          console.error('Error getting reorder recommendations (manual):', manualError);
          return [];
        }

        return manualData
          .map(item => item.product_variants.products)
          .filter((product, index, self) => 
            index === self.findIndex(p => p.id === product.id)
          ); // Remove duplicates
      }

      return data.map((item: any) => item.products);
    } catch (error) {
      console.error('Error getting reorder recommendations:', error);
      return [];
    }
  }

  /**
   * Checks if a product is eligible for reorder
   */
  static async isReorderEligible(productId: string, userId: string): Promise<boolean> {
    try {
      // Check if user has previously purchased this product
      const { count, error } = await supabase
        .from('order_items')
        .select('*', { count: 'exact', head: true })
        .eq('product_variants.product_id', productId)
        .eq('orders.user_id', userId);

      if (error) {
        console.error('Error checking reorder eligibility:', error);
        return false;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('Error checking reorder eligibility:', error);
      return false;
    }
  }
}