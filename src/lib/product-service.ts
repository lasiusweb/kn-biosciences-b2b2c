import { supabase } from './supabase';
import { Product } from '@/types';

/**
 * Fetches all active products from database.
 */
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }

  return data || [];
}

/**
 * Fetches products filtered by segment with Knowledge Center integration.
 */
export async function getProductsBySegment(segment: string): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants!inner(
        id,
        sku,
        price,
        stock_quantity,
        weight,
        weight_unit,
        image_urls,
        zoho_books_id,
        zoho_crm_id
      ),
      problem_solutions!inner(
        id,
        title,
        slug,
        segment,
        content,
        featured,
        published_at
      )
    `)
    .eq('status', 'active')
    .eq('segment', segment)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching products for segment ${segment}:`, error);
    throw new Error(`Failed to fetch products by segment: ${segment}`);
  }

  return data || [];
}

/**
 * Fetches products filtered by crop with Knowledge Center integration.
 */
export async function getProductsByCrop(cropId: string): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants!inner(
        id,
        sku,
        price,
        stock_quantity,
        weight,
        weight_unit,
        image_urls,
        zoho_books_id,
        zoho_crm_id
      ),
      product_crops!inner(
        id,
        crop_id,
        crop_name
      ),
      problem_solutions!inner(
        id,
        title,
        slug,
        segment,
        content,
        featured,
        published_at
      )
    `)
    .eq('status', 'active')

    .eq('product_crops.crop_id', cropId)
    .order('products.created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching products for crop ${cropId}:`, error);
    throw new Error(`Failed to fetch products by crop: ${cropId}`);
  }

  return data || [];
}

/**
 * Fetches products filtered by problem with Knowledge Center integration.
 */
export async function getProductsByProblem(problemId: string): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants!inner(
        id,
        sku,
        price,
        stock_quantity,
        weight,
        weight_unit,
        image_urls,
        zoho_books_id,
        zoho_crm_id
      ),
      problem_solutions!inner(
        id,
        title,
        slug,
        segment,
        content,
        featured,
        published_at
      )
    `)
    .eq('status', 'active')
    .contains('problem_ids', [problemId])
    .order('products.created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching products for problem ${problemId}:`, error);
    throw new Error(`Failed to fetch products by problem: ${problemId}`);
  }

  return data || [];
}


/**
 * Fetches a single product by its slug.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error(`Error fetching product with slug ${slug}:`, error);
    throw new Error('Failed to fetch product by slug');
  }

  return data;
}

/**
 * Fetches all product variants.
 */
export async function getVariants(): Promise<ProductVariant[]> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*');

  if (error) {
    console.error('Error fetching variants:', error);
    throw new Error('Failed to fetch variants');
  }

  return data || [];
}
