import { supabase } from './supabase';
import { Product, ProductWithRelations, ProductVariant } from '@/types';

/**
 * Fetches all active products from database.
 */
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      description,
      short_description,
      category_id,
      segment,
      status,
      featured,
      meta_title,
      meta_description,
      created_at,
      updated_at,
      featured_image,
      brand_name,
      gtin,
      country_of_origin,
      chemical_composition,
      safety_warnings,
      antidote_statement,
      directions_of_use,
      precautions,
      recommendations,
      cbirc_compliance,
      manufacturing_license,
      customer_care_details,
      market_by,
      net_content,
      leaflet_urls
    `)
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
      id,
      name,
      slug,
      description,
      short_description,
      category_id,
      segment,
      status,
      featured,
      meta_title,
      meta_description,
      created_at,
      updated_at,
      featured_image,
      brand_name,
      gtin,
      country_of_origin,
      chemical_composition,
      safety_warnings,
      antidote_statement,
      directions_of_use,
      precautions,
      recommendations,
      cbirc_compliance,
      manufacturing_license,
      customer_care_details,
      market_by,
      net_content,
      leaflet_urls,
      product_variants!inner(
        id,
        product_id,
        sku,
        weight,
        weight_unit,
        packing_type,
        form,
        price,
        compare_price,
        cost_price,
        stock_quantity,
        low_stock_threshold,
        track_inventory,
        image_urls,
        created_at,
        updated_at,
        net_weight,
        gross_weight,
        net_content as variant_net_content
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
      id,
      name,
      slug,
      description,
      short_description,
      category_id,
      segment,
      status,
      featured,
      meta_title,
      meta_description,
      created_at,
      updated_at,
      featured_image,
      brand_name,
      gtin,
      country_of_origin,
      chemical_composition,
      safety_warnings,
      antidote_statement,
      directions_of_use,
      precautions,
      recommendations,
      cbirc_compliance,
      manufacturing_license,
      customer_care_details,
      market_by,
      net_content,
      leaflet_urls,
      product_variants!inner(
        id,
        product_id,
        sku,
        weight,
        weight_unit,
        packing_type,
        form,
        price,
        compare_price,
        cost_price,
        stock_quantity,
        low_stock_threshold,
        track_inventory,
        image_urls,
        created_at,
        updated_at,
        net_weight,
        gross_weight,
        net_content as variant_net_content
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
      id,
      name,
      slug,
      description,
      short_description,
      category_id,
      segment,
      status,
      featured,
      meta_title,
      meta_description,
      created_at,
      updated_at,
      featured_image,
      brand_name,
      gtin,
      country_of_origin,
      chemical_composition,
      safety_warnings,
      antidote_statement,
      directions_of_use,
      precautions,
      recommendations,
      cbirc_compliance,
      manufacturing_license,
      customer_care_details,
      market_by,
      net_content,
      leaflet_urls,
      product_variants!inner(
        id,
        product_id,
        sku,
        weight,
        weight_unit,
        packing_type,
        form,
        price,
        compare_price,
        cost_price,
        stock_quantity,
        low_stock_threshold,
        track_inventory,
        image_urls,
        created_at,
        updated_at,
        net_weight,
        gross_weight,
        net_content as variant_net_content
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
    .select(`
      id,
      name,
      slug,
      description,
      short_description,
      category_id,
      segment,
      status,
      featured,
      meta_title,
      meta_description,
      created_at,
      updated_at,
      featured_image,
      brand_name,
      gtin,
      country_of_origin,
      chemical_composition,
      safety_warnings,
      antidote_statement,
      directions_of_use,
      precautions,
      recommendations,
      cbirc_compliance,
      manufacturing_license,
      customer_care_details,
      market_by,
      net_content,
      leaflet_urls
    `)
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
    .select(`
      id,
      product_id,
      sku,
      weight,
      weight_unit,
      packing_type,
      form,
      price,
      compare_price,
      cost_price,
      stock_quantity,
      low_stock_threshold,
      track_inventory,
      image_urls,
      created_at,
      updated_at,
      net_weight,
      gross_weight,
      net_content
    `);

  if (error) {
    console.error('Error fetching variants:', error);
    throw new Error('Failed to fetch variants');
  }

  return data || [];
}
