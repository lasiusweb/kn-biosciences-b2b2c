import { supabase } from './supabase';
import { AdminAnalytics, BulkImportResult, SEOMetadata, CouponConfig } from '@/types/admin';

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const { data, error } = await supabase.rpc('get_admin_analytics');

  if (error) {
    console.error('Error fetching admin analytics:', error);
    throw new Error('Failed to fetch admin analytics');
  }

  return data;
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