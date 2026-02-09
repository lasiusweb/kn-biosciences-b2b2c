import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Product, ProductVariant } from '@/types';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Check if user is authenticated and has admin privileges
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
      return Response.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
    
    // Get all variants
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*');
    
    if (variantsError) {
      console.error('Error fetching variants:', variantsError);
      return Response.json({ error: 'Failed to fetch variants' }, { status: 500 });
    }
    
    return Response.json({ 
      success: true, 
      products: products || [],
      variants: variants || [],
      message: 'Products retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in products GET API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}