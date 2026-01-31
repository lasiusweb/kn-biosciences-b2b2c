import { supabase } from './supabase';
import { Product } from '@/types';

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query) return [];
  
  // Clean query: remove special chars, maybe handle spaces
  const cleanQuery = query.replace(/[^\w\s]/gi, '').trim();

  if (!cleanQuery) return [];
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
    .eq('status', 'active')
    .limit(4);

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }

  return data || [];
}
