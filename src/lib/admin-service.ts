import { supabase } from './supabase';
import { AdminAnalytics, BulkImportResult, SEOMetadata, CouponConfig, InventoryItem } from '@/types/admin';
import { Order } from '@/types';

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const { data, error } = await supabase.rpc('get_admin_analytics');

  if (error) {
    console.error('Error fetching admin analytics:', error);
    throw new Error('Failed to fetch admin analytics');
  }

  return data;
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, shipping_address(*), billing_address(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders');
  }

  return data || [];
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
    throw new Error('Failed to update order status');
  }
}

export async function getInventory(): Promise<InventoryItem[]> {
  const { data, error } = await supabase.rpc('get_inventory_status');

  if (error) {
    console.error('Error fetching inventory:', error);
    throw new Error('Failed to fetch inventory');
  }

  return data || [];
}

export async function bulkImportProducts(data: any[]): Promise<BulkImportResult> {
  const { data: result, error } = await supabase.from('products').insert(data);

  if (error) {
    console.error('Error during bulk import:', error);
    return {
      success: false,
      importedCount: 0,
      errors: [{ row: 0, message: error.message }]
    };
  }

  return {
    success: true,
    importedCount: data.length,
    errors: []
  };
}

export async function updatePageSEO(pagePath: string, metadata: SEOMetadata): Promise<void> {
  const { error } = await supabase
    .from('seo_metadata')
    .update(metadata)
    .eq('page_path', pagePath);

  if (error) {
    console.error(`Error updating SEO for ${pagePath}:`, error);
    throw new Error('Failed to update SEO metadata');
  }
}

export async function createCoupon(config: CouponConfig): Promise<void> {
  const { error } = await supabase.from('coupons').insert(config);

  if (error) {
    console.error('Error creating coupon:', error);
    throw new Error('Failed to create coupon');
  }
}