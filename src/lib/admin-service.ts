import { supabase } from './supabase';
import { AdminAnalytics, BulkImportResult, SEOMetadata, CouponConfig, InventoryItem, ContentPage } from '@/types/admin';
import { Order, BlogPost } from '@/types';

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
    .select('*, shipping_address(*), billing_address(*), user:users(*)')
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

export async function getContentPage(slug: string): Promise<ContentPage | null> {
  const { data, error } = await supabase
    .from('content_pages')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error(`Error fetching page ${slug}:`, error);
    throw new Error('Failed to fetch content page');
  }

  return data;
}

export async function updateContentPage(slug: string, page: Partial<ContentPage>): Promise<void> {
  const { error } = await supabase
    .from('content_pages')
    .update(page)
    .eq('slug', slug);

  if (error) {
    console.error(`Error updating page ${slug}:`, error);
    throw new Error('Failed to update content page');
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    throw new Error('Failed to fetch blog posts');
  }

  return data || [];
}

export async function createBlogPost(post: Partial<BlogPost>): Promise<void> {
  const { error } = await supabase.from('blog_posts').insert(post);

  if (error) {
    console.error('Error creating blog post:', error);
    throw new Error('Failed to create blog post');
  }
}

export async function bulkImportProducts(data: any[]): Promise<BulkImportResult> {
  // For now, using the Supabase insert directly
  // In a real implementation, this would call the new API endpoint
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

export async function getProducts(): Promise<{ products: any[], variants: any[] }> {
  const response = await fetch('/admin/api/products/get');
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch products');
  }
  
  const result = await response.json();
  return {
    products: result.products,
    variants: result.variants
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