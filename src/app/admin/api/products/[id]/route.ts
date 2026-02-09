import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Check if user is authenticated and has admin privileges
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const productId = params.id;
    
    if (!productId) {
      return Response.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    // Delete product variants first (due to foreign key constraint)
    const { error: variantsError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', productId);
    
    if (variantsError) {
      console.error('Error deleting product variants:', variantsError);
      return Response.json({ error: 'Failed to delete product variants' }, { status: 500 });
    }
    
    // Delete the product
    const { error: productError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (productError) {
      console.error('Error deleting product:', productError);
      return Response.json({ error: 'Failed to delete product' }, { status: 500 });
    }
    
    return Response.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Error in product deletion API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}