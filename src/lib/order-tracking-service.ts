import { supabase } from '@/lib/supabase';

export interface OrderTrackingStatus {
  id: string;
  order_id: string;
  status: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  status_label: string;
  status_description: string;
  timestamp: string;
  location?: string;
  courier?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  proof_of_delivery?: string;
}

export interface OrderTrackingDetails {
  order_id: string;
  current_status: OrderTrackingStatus;
  status_history: OrderTrackingStatus[];
  estimated_delivery: string;
  tracking_number: string;
  courier: string;
  shipping_address: {
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  items: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    image_url?: string;
  }>;
}

export interface RealTimeOrderUpdate {
  order_id: string;
  new_status: OrderTrackingStatus;
  timestamp: string;
}

export class OrderTrackingService {
  /**
   * Gets detailed tracking information for an order
   */
  static async getOrderTracking(orderId: string, userId?: string): Promise<OrderTrackingDetails | null> {
    try {
      // Get order details
      let query = supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          shipping_address,
          shipping_carrier,
          shipping_tracking_number,
          estimated_delivery,
          created_at,
          order_items (
            id,
            quantity,
            product_variants (
              sku,
              image_urls,
              products (
                id,
                name
              )
            )
          )
        `)
        .eq('id', orderId);

      // If user ID is provided, restrict to user's orders
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: orderData, error: orderError } = await query.single();

      if (orderError) {
        console.error('Error fetching order:', orderError);
        return null;
      }

      if (!orderData) {
        return null;
      }

      // Get order status history
      const { data: statusHistory, error: historyError } = await supabase
        .from('order_tracking')
        .select('*')
        .eq('order_id', orderId)
        .order('timestamp', { ascending: true });

      if (historyError) {
        console.error('Error fetching order status history:', historyError);
        return null;
      }

      // Determine current status
      const currentStatus = this.getCurrentStatus(orderData.status, statusHistory);

      // Format items
      const items = orderData.order_items.map(item => ({
        id: item.product_variants.products.id,
        name: item.product_variants.products.name,
        sku: item.product_variants.sku,
        quantity: item.quantity,
        image_url: item.product_variants.image_urls?.[0]
      }));

      return {
        order_id: orderData.id,
        current_status: currentStatus,
        status_history: statusHistory || [],
        estimated_delivery: orderData.estimated_delivery || '',
        tracking_number: orderData.shipping_tracking_number || '',
        courier: orderData.shipping_carrier || 'Self-Delivery',
        shipping_address: orderData.shipping_address,
        items
      };
    } catch (error) {
      console.error('Error getting order tracking:', error);
      return null;
    }
  }

  /**
   * Gets the current status based on order status and tracking history
   */
  private static getCurrentStatus(orderStatus: string, trackingHistory: OrderTrackingStatus[] = []): OrderTrackingStatus {
    // If we have tracking history, use the latest entry
    if (trackingHistory.length > 0) {
      return trackingHistory[trackingHistory.length - 1];
    }

    // Otherwise, map the order status to a tracking status
    const statusMap: Record<string, OrderTrackingStatus> = {
      placed: {
        id: 'initial',
        order_id: '',
        status: 'placed',
        status_label: 'Order Placed',
        status_description: 'Your order has been placed successfully',
        timestamp: new Date().toISOString()
      },
      confirmed: {
        id: 'confirmed',
        order_id: '',
        status: 'confirmed',
        status_label: 'Order Confirmed',
        status_description: 'Your order has been confirmed and is being processed',
        timestamp: new Date().toISOString()
      },
      processing: {
        id: 'processing',
        order_id: '',
        status: 'processing',
        status_label: 'Processing',
        status_description: 'Your order is being prepared for shipment',
        timestamp: new Date().toISOString()
      },
      shipped: {
        id: 'shipped',
        order_id: '',
        status: 'shipped',
        status_label: 'Shipped',
        status_description: 'Your order has been shipped and is on the way',
        timestamp: new Date().toISOString()
      },
      delivered: {
        id: 'delivered',
        order_id: '',
        status: 'delivered',
        status_label: 'Delivered',
        status_description: 'Your order has been delivered',
        timestamp: new Date().toISOString()
      },
      cancelled: {
        id: 'cancelled',
        order_id: '',
        status: 'cancelled',
        status_label: 'Cancelled',
        status_description: 'Your order has been cancelled',
        timestamp: new Date().toISOString()
      },
      returned: {
        id: 'returned',
        order_id: '',
        status: 'returned',
        status_label: 'Returned',
        status_description: 'Your order has been returned',
        timestamp: new Date().toISOString()
      }
    };

    return statusMap[orderStatus] || statusMap.placed;
  }

  /**
   * Subscribes to real-time order updates
   */
  static subscribeToOrderUpdates(
    orderId: string,
    onUpdate: (update: RealTimeOrderUpdate) => void,
    onError?: (error: any) => void
  ): () => void {
    // Subscribe to real-time updates for this order
    const subscription = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_tracking',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          const newStatus: OrderTrackingStatus = payload.new as OrderTrackingStatus;
          const update: RealTimeOrderUpdate = {
            order_id: newStatus.order_id,
            new_status: newStatus,
            timestamp: new Date().toISOString()
          };
          onUpdate(update);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to order updates for order ${orderId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to order updates for order ${orderId}`);
          onError?.(new Error('Channel subscription error'));
        }
      });

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(subscription);
    };
  }

  /**
   * Gets recent orders for a user
   */
  static async getRecentOrders(userId: string, limit: number = 5): Promise<OrderTrackingDetails[]> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          created_at,
          total_amount,
          shipping_tracking_number,
          shipping_carrier
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent orders:', error);
        return [];
      }

      // Get tracking details for each order
      const trackingDetails = await Promise.all(
        orders.map(order => this.getOrderTracking(order.id, userId))
      );

      return trackingDetails.filter(detail => detail !== null) as OrderTrackingDetails[];
    } catch (error) {
      console.error('Error getting recent orders:', error);
      return [];
    }
  }

  /**
   * Gets order status statistics for a user
   */
  static async getOrderStatistics(userId: string): Promise<{
    total_orders: number;
    pending_orders: number;
    shipped_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status', { count: 'exact' })
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching order statistics:', error);
        return {
          total_orders: 0,
          pending_orders: 0,
          shipped_orders: 0,
          delivered_orders: 0,
          cancelled_orders: 0
        };
      }

      const total_orders = data?.length || 0;
      const pending_orders = data?.filter(o => o.status === 'placed' || o.status === 'processing').length || 0;
      const shipped_orders = data?.filter(o => o.status === 'shipped').length || 0;
      const delivered_orders = data?.filter(o => o.status === 'delivered').length || 0;
      const cancelled_orders = data?.filter(o => o.status === 'cancelled').length || 0;

      return {
        total_orders,
        pending_orders,
        shipped_orders,
        delivered_orders,
        cancelled_orders
      };
    } catch (error) {
      console.error('Error getting order statistics:', error);
      return {
        total_orders: 0,
        pending_orders: 0,
        shipped_orders: 0,
        delivered_orders: 0,
        cancelled_orders: 0
      };
    }
  }

  /**
   * Updates order status (for admin use)
   */
  static async updateOrderStatus(
    orderId: string,
    status: OrderTrackingStatus['status'],
    statusDescription: string,
    location?: string,
    userId?: string
  ): Promise<boolean> {
    try {
      // Verify this is the user's order if userId is provided
      if (userId) {
        const { data: order, error } = await supabase
          .from('orders')
          .select('id')
          .eq('id', orderId)
          .eq('user_id', userId)
          .single();

        if (error || !order) {
          console.error('Unauthorized order status update attempt');
          return false;
        }
      }

      // Insert new tracking status
      const { error } = await supabase
        .from('order_tracking')
        .insert({
          order_id: orderId,
          status,
          status_label: this.getStatusLabel(status),
          status_description: statusDescription,
          timestamp: new Date().toISOString(),
          location
        });

      if (error) {
        console.error('Error updating order status:', error);
        return false;
      }

      // Update the main order status
      await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  /**
   * Gets status label for display
   */
  private static getStatusLabel(status: OrderTrackingStatus['status']): string {
    const labels: Record<OrderTrackingStatus['status'], string> = {
      placed: 'Order Placed',
      confirmed: 'Order Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned'
    };

    return labels[status] || status;
  }

  /**
   * Estimates delivery date based on shipping method
   */
  static estimateDeliveryDate(shippingMethod: string): string {
    const today = new Date();
    
    // Add days based on shipping method
    let daysToAdd = 0;
    switch (shippingMethod) {
      case 'express':
        daysToAdd = 2;
        break;
      case 'standard':
        daysToAdd = 5;
        break;
      case 'same-day':
        daysToAdd = 1;
        break;
      default:
        daysToAdd = 5; // Default to standard shipping
    }

    const estimatedDate = new Date(today);
    estimatedDate.setDate(today.getDate() + daysToAdd);
    
    return estimatedDate.toISOString().split('T')[0];
  }
}