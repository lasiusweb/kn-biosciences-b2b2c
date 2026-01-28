import { supabase } from './supabase';
import { Product } from '@/types';

/**
 * Fetches all active products from the database.
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
 * Fetches products filtered by segment.
 */
export async function getProductsBySegment(segment: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .eq('segment', segment)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching products for segment ${segment}:`, error);
    throw new Error('Failed to fetch products by segment');
  }

  return data || [];
}

/**
 * Fetches products filtered by crop.
 */
export async function getProductsByCrop(cropId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .eq('crop_id', cropId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching products for crop ${cropId}:`, error);
    throw new Error('Failed to fetch products by crop');
  }

  return data || [];
}

/**
 * Fetches products filtered by problem.
 */
export async function getProductsByProblem(problemId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .contains('problem_ids', [problemId])
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching products for problem ${problemId}:`, error);
    throw new Error('Failed to fetch products by problem');
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
