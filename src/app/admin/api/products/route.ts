import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Product, ProductVariant } from '@/types';

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Check if user is authenticated and has admin privileges
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Additional admin check would go here
    // For now, assuming any authenticated user can create products
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.slug) {
      return Response.json({ error: 'Name and slug are required' }, { status: 400 });
    }
    
    // Insert product into database
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert([{
        name: body.name,
        slug: body.slug,
        description: body.description,
        short_description: body.short_description,
        category_id: body.category_id,
        segment: body.segment,
        status: body.status || 'draft',
        featured: body.featured || false,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        featured_image: body.featured_image,
        
        // New fields for safety and compliance
        brand_name: body.brand_name,
        gtin: body.gtin,
        country_of_origin: body.country_of_origin,
        chemical_composition: body.chemical_composition,
        safety_warnings: body.safety_warnings,
        antidote_statement: body.antidote_statement,
        directions_of_use: body.directions_of_use,
        precautions: body.precautions,
        recommendations: body.recommendations,
        cbirc_compliance: body.cbirc_compliance,
        manufacturing_license: body.manufacturing_license,
        customer_care_details: body.customer_care_details,
        market_by: body.market_by,
        net_content: body.net_content,
        leaflet_urls: body.leaflet_urls || []
      }])
      .select()
      .single();
    
    if (productError) {
      console.error('Error inserting product:', productError);
      return Response.json({ error: 'Failed to create product' }, { status: 500 });
    }
    
    // Insert product variant if provided
    if (body.variants && body.variants.length > 0) {
      const variant = body.variants[0]; // Using first variant
      
      const { error: variantError } = await supabase
        .from('product_variants')
        .insert([{
          product_id: productData.id,
          sku: variant.sku,
          weight: variant.weight,
          weight_unit: variant.weight_unit,
          packing_type: variant.packing_type,
          form: variant.form,
          price: variant.price,
          compare_price: variant.compare_price,
          cost_price: variant.cost_price,
          stock_quantity: variant.stock_quantity,
          low_stock_threshold: variant.low_stock_threshold,
          track_inventory: variant.track_inventory,
          image_urls: variant.image_urls || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          net_weight: variant.net_weight,
          gross_weight: variant.gross_weight,
          net_content: variant.net_content
        }]);
      
      if (variantError) {
        console.error('Error inserting variant:', variantError);
        return Response.json({ error: 'Failed to create product variant' }, { status: 500 });
      }
    }
    
    return Response.json({ 
      success: true, 
      product: productData,
      message: 'Product created successfully' 
    });
  } catch (error) {
    console.error('Error in product creation API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Check if user is authenticated and has admin privileges
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return Response.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    // Update product in database
    const { data: productData, error: productError } = await supabase
      .from('products')
      .update({
        name: updateData.name,
        slug: updateData.slug,
        description: updateData.description,
        short_description: updateData.short_description,
        category_id: updateData.category_id,
        segment: updateData.segment,
        status: updateData.status,
        featured: updateData.featured,
        meta_title: updateData.meta_title,
        meta_description: updateData.meta_description,
        updated_at: new Date().toISOString(),
        featured_image: updateData.featured_image,
        
        // New fields for safety and compliance
        brand_name: updateData.brand_name,
        gtin: updateData.gtin,
        country_of_origin: updateData.country_of_origin,
        chemical_composition: updateData.chemical_composition,
        safety_warnings: updateData.safety_warnings,
        antidote_statement: updateData.antidote_statement,
        directions_of_use: updateData.directions_of_use,
        precautions: updateData.precautions,
        recommendations: updateData.recommendations,
        cbirc_compliance: updateData.cbirc_compliance,
        manufacturing_license: updateData.manufacturing_license,
        customer_care_details: updateData.customer_care_details,
        market_by: updateData.market_by,
        net_content: updateData.net_content,
        leaflet_urls: updateData.leaflet_urls || []
      })
      .eq('id', id)
      .select()
      .single();
    
    if (productError) {
      console.error('Error updating product:', productError);
      return Response.json({ error: 'Failed to update product' }, { status: 500 });
    }
    
    // Update product variant if provided
    if (updateData.variants && updateData.variants.length > 0) {
      const variant = updateData.variants[0]; // Using first variant
      
      // Check if variant exists
      const { data: existingVariant } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', id)
        .limit(1);
      
      if (existingVariant && existingVariant.length > 0) {
        // Update existing variant
        const { error: variantError } = await supabase
          .from('product_variants')
          .update({
            sku: variant.sku,
            weight: variant.weight,
            weight_unit: variant.weight_unit,
            packing_type: variant.packing_type,
            form: variant.form,
            price: variant.price,
            compare_price: variant.compare_price,
            cost_price: variant.cost_price,
            stock_quantity: variant.stock_quantity,
            low_stock_threshold: variant.low_stock_threshold,
            track_inventory: variant.track_inventory,
            image_urls: variant.image_urls || [],
            updated_at: new Date().toISOString(),
            net_weight: variant.net_weight,
            gross_weight: variant.gross_weight,
            net_content: variant.net_content
          })
          .eq('product_id', id);
        
        if (variantError) {
          console.error('Error updating variant:', variantError);
          return Response.json({ error: 'Failed to update product variant' }, { status: 500 });
        }
      } else {
        // Create new variant
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert([{
            product_id: id,
            sku: variant.sku,
            weight: variant.weight,
            weight_unit: variant.weight_unit,
            packing_type: variant.packing_type,
            form: variant.form,
            price: variant.price,
            compare_price: variant.compare_price,
            cost_price: variant.cost_price,
            stock_quantity: variant.stock_quantity,
            low_stock_threshold: variant.low_stock_threshold,
            track_inventory: variant.track_inventory,
            image_urls: variant.image_urls || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            net_weight: variant.net_weight,
            gross_weight: variant.gross_weight,
            net_content: variant.net_content
          }]);
        
        if (variantError) {
          console.error('Error inserting variant:', variantError);
          return Response.json({ error: 'Failed to create product variant' }, { status: 500 });
        }
      }
    }
    
    return Response.json({ 
      success: true, 
      product: productData,
      message: 'Product updated successfully' 
    });
  } catch (error) {
    console.error('Error in product update API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}