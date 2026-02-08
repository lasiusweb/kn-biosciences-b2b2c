/**
 * Enhanced Product Service with Segment/Crop Discovery and Knowledge Center Integration
 */

import { supabase } from './supabase';
import { Product, ProductVariant, ProblemSolution } from '@/types';

export interface SegmentProduct extends Product {
  product_variants: ProductVariant[];
  problem_solutions: ProblemSolution[];
}

export interface ProductCrop {
  id: string;
  product_id: string;
  crop_id: string;
  crop_name: string;
  description?: string;
  growing_season?: string;
  harvest_time?: string;
  applications?: string[];
}

export interface CropDiscoveryCard {
  id: string;
  title: string;
  description: string;
  image_url: string;
  crop_type: string;
  featured: boolean;
  products_count: number;
  quick_stats: {
    min_price: number;
    max_price: number;
    avg_yield: string;
  };
  segment_url: string;
  educational_articles: Array<{
    id: string;
    title: string;
    excerpt: string;
    published_at: string;
  }>;
  is_interactive: boolean;
}

export interface CropFilter {
  segment?: string;
  cropId?: string;
  problemId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export interface ProductSearchParams extends CropFilter {
  sortBy?: 'name' | 'price' | 'created_at' | 'featured';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Fetches products with advanced filtering and pagination
 */
export async function getProducts(params: ProductSearchParams = {}): Promise<{
  products: SegmentProduct[];
  totalCount: number;
  hasMore: boolean;
}> {
  let query = supabase
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
    `, { count: 'exact' })
    .eq('status', 'active');

  // Apply filters
  if (params.segment) {
    query = query.eq('segment', params.segment);
  }

  if (params.cropId) {
    query = query.eq('product_crops.crop_id', params.cropId);
  }

  if (params.problemId) {
    query = query.contains('problem_ids', [params.problemId]);
  }

  if (params.minPrice) {
    query = query.gte('product_variants.price', params.minPrice);
  }
  
  if (params.maxPrice) {
    query = query.lte('product_variants.price', params.maxPrice);
  }

  if (params.inStock) {
    query = query.gt('product_variants.stock_quantity', 0);
  }

  if (params.featured) {
    query = query.eq('featured', true);
  }

  // Apply sorting
  if (params.sortBy) {
    const column = params.sortBy === 'name' ? 'name' : 
                  params.sortBy === 'price' ? 'product_variants.price' :
                  params.sortBy === 'created_at' ? 'created_at' : 'featured';
    const order = params.sortOrder === 'asc' ? true : false;
    
    query = query.order(column, { ascending: order });
  }

  // Apply pagination
  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (params.offset) {
    const limit = params.limit || 20;
    query = query.range(params.offset, params.offset + limit - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }

  const totalCount = count ? count : data?.length || 0;

  return {
    products: data || [],
    totalCount,
    hasMore: (params.offset || 0) + (params.limit || 20) < totalCount
  };
}

/**
 * Mock data for development/testing
 */
function getMockSegmentData(segment: string) {
  const mockData: Record<string, any> = {
    cereals: {
      title: 'Cereal Crop Solutions',
      description: 'Comprehensive protection and nutrition solutions for wheat, rice, maize, and other cereal crops. Boost yields and quality with our scientifically formulated products.',
      stats: {
        total_products: 156,
        total_crops: 12,
        featured_crops: 8
      },
      featured_crops: [
        {
          id: 'wheat-sol-1',
          title: 'Wheat Protection Bundle',
          description: 'Complete protection solution for wheat cultivation including fungicides, insecticides, and growth regulators.',
          image_url: '/images/crops/wheat-field.jpg',
          crop_type: 'wheat',
          featured: true,
          products_count: 12,
          quick_stats: {
            min_price: 450,
            max_price: 2800,
            avg_yield: '+25%'
          },
          segment_url: '/segments/cereals/wheat',
          educational_articles: [
            {
              id: 'wheat-guide-1',
              title: 'Complete Wheat Cultivation Guide',
              excerpt: 'Learn best practices for wheat cultivation from sowing to harvest.',
              published_at: '2024-01-15'
            }
          ],
          is_interactive: false
        },
        {
          id: 'rice-sol-1',
          title: 'Rice Nutrition System',
          description: 'Advanced nutrient management system for optimal rice growth and grain quality.',
          image_url: '/images/crops/rice-paddy.jpg',
          crop_type: 'rice',
          featured: true,
          products_count: 8,
          quick_stats: {
            min_price: 320,
            max_price: 1850,
            avg_yield: '+30%'
          },
          segment_url: '/segments/cereals/rice',
          educational_articles: [],
          is_interactive: false
        }
      ],
      contextual_sidebar: {
        recommended_reading: [
          {
            id: 'rec-1',
            title: 'Seasonal Crop Planning Guide',
            description: 'Plan your cereal crop cultivation schedule for maximum productivity.',
            url: '/knowledge/seasonal-planning',
            category: 'Planning',
            type: 'guide' as const,
            read_time: '15 min'
          },
          {
            id: 'rec-2',
            title: 'Integrated Pest Management',
            description: 'Sustainable pest control strategies for cereal crops.',
            url: '/knowledge/ipm-cereals',
            category: 'Pest Management',
            type: 'tutorial' as const,
            video_url: 'https://example.com/ipm-video'
          }
        ],
        upcoming_crops: [
          {
            id: 'up-1',
            name: 'Summer Maize',
            harvest_time: 'March-April',
            application_method: 'Foliar Spray',
            disease_solutions: 'Northern Leaf Blight',
            region: 'North India',
            crop_stage: 'Flowering'
          }
        ],
        crop_tips: [
          {
            title: 'Optimal Fertilizer Timing',
            description: 'Apply nitrogen fertilizers during active tillering stage for best results.',
            url: '/tips/fertilizer-timing',
            crop_stage: 'Tillering',
            application_rate: '120-150 kg/ha'
          }
        ]
      }
    },
    fruits: {
      title: 'Fruit Crop Solutions',
      description: 'Specialized treatments for mango, citrus, banana, and other fruit varieties. Enhance fruit quality, size, and shelf life.',
      stats: {
        total_products: 203,
        total_crops: 18,
        featured_crops: 10
      },
      featured_crops: [
        {
          id: 'mango-sol-1',
          title: 'Mango Flowering Enhancer',
          description: 'Promotes uniform flowering and fruit set in mango orchards.',
          image_url: '/images/crops/mango-orchard.jpg',
          crop_type: 'mango',
          featured: true,
          products_count: 6,
          quick_stats: {
            min_price: 550,
            max_price: 3200,
            avg_yield: '+20%'
          },
          segment_url: '/segments/fruits/mango',
          educational_articles: [],
          is_interactive: false
        }
      ],
      contextual_sidebar: {
        recommended_reading: [],
        upcoming_crops: [],
        crop_tips: []
      }
    }
  };

  return mockData[segment] || {
    title: `${segment.charAt(0).toUpperCase() + segment.slice(1)} Solutions`,
    description: `Premium agricultural solutions for ${segment} crops`,
    stats: { total_products: 50, total_crops: 5, featured_crops: 3 },
    featured_crops: [],
    contextual_sidebar: { recommended_reading: [], upcoming_crops: [], crop_tips: [] }
  };
}

/**
 * Gets available segments with product counts
 */
export async function getSegments(): Promise<Array<{
  segment: string;
  name: string;
  count: number;
  description?: string;
  image_url?: string;
}>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('segment')
      .eq('status', 'active');

    if (error) {
      throw new Error('Failed to fetch segments');
    }

    const segments = [...new Set(data.map(item => item.segment))];
    const segmentCounts = await Promise.all(
      segments.map(async (segment) => {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .eq('segment', segment);
        
        return { segment, count: count || 0 };
      })
    );

    return segmentCounts.map(item => ({
      segment: item.segment,
      name: item.segment.charAt(0).toUpperCase() + item.segment.slice(1),
      count: item.count
    }));

  } catch (error) {
    console.error('Error getting segments:', error);
    return [];
  }
}

/**
 * Gets available crops within a segment
 */
export async function getCropsBySegment(segment: string): Promise<Array<{
  id: string;
  crop_name: string;
  crop_id: string;
  description?: string;
  image_url?: string;
  count: number;
}>> {
  try {
    const { data, error } = await supabase
      .from('product_crops')
      .select(`
        crop_id,
        crop_name,
        description,
        image_url,
        products!inner(id, segment, status)
      `)
      .eq('products.segment', segment)
      .eq('products.status', 'active');

    if (error) throw error;

    const uniqueCrops = data ? [...new Map(data.map(item => [item.crop_id, item])).values()].map(item => ({
      id: item.crop_id,
      crop_name: item.crop_name,
      crop_id: item.crop_id,
      description: item.description,
      image_url: item.image_url,
      count: data.filter(d => d.crop_id === item.crop_id).length
    })) : [];

    return uniqueCrops;
  } catch (error) {
    console.error('Error getting crops by segment:', error);
    return [];
  }
}

/**
 * Gets available problem solutions with Knowledge Center integration
 */
export async function getProblems(): Promise<Array<{
  id: string;
  title: string;
  slug: string;
  segment: string;
  count: number;
  featured: boolean;
}>> {
  try {
    const { data, error } = await supabase
      .from('problem_solutions')
      .select('*')
      .eq('status', 'active')
      .order('published_at', { ascending: false });

    if (error) throw error;

    return data.map(problem => ({
      ...problem,
      count: 0 // In a real app, you'd count related products
    }));
  } catch (error) {
    console.error('Error getting problems:', error);
    return [];
  }
}

/**
 * Gets Knowledge Center articles for a specific segment
 */
export async function getKnowledgeCenterArticles(
  segment?: string, 
  limit: number = 5
): Promise<Array<{
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  published_at: string;
}>> {
  try {
    let query = supabase
      .from('problem_solutions')
      .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image,
        published_at
      `)
      .eq('status', 'active')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (segment) {
      query = query.eq('segment', segment);
    }

    const { data, error } = await query;
    return data || [];
  } catch (error) {
    console.error('Error getting knowledge center articles:', error);
    return [];
  }
}

/**
 * Searches products across multiple criteria
 */
export async function searchProducts(query: string, filters?: {
  segment?: string;
  cropId?: string;
  problemId?: string;
}): Promise<{
  products: SegmentProduct[];
  totalCount: number;
}> {
  try {
    let dbQuery = supabase
      .from('products')
      .select(`
        *,
        product_variants(*),
        problem_solutions(*)
      `, { count: 'exact' })
      .eq('status', 'active')
      .or(`name.ilike.%${query}%,short_description.ilike.%${query}%`);

    if (filters?.segment) {
      dbQuery = dbQuery.eq('segment', filters.segment);
    }

    const { data, error, count } = await dbQuery;

    return {
      products: (data as any) || [],
      totalCount: count || 0
    };
  } catch (error) {
    console.error('Error searching products:', error);
    return { products: [], totalCount: 0 };
  }
}

/**
 * Gets segment data including featured crops and contextual sidebar
 * Used by the segment hub layout component
 */
export async function getProductsBySegment(segment: string) {
  try {
    if (process.env.NODE_ENV === 'development') {
      return getMockSegmentData(segment);
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        product_variants(*),
        product_crops!inner(
          crop_id,
          crop_name,
          description
        )
      `)
      .eq('segment', segment)
      .eq('status', 'active')
      .eq('featured', true)
      .limit(8);

    if (productsError) throw productsError;

    const featuredCrops = products?.map(product => ({
      id: product.id,
      title: product.name,
      description: product.short_description || '',
      image_url: product.featured_image || '/images/placeholder-product.jpg',
      crop_type: product.product_crops[0]?.crop_id || 'general',
      featured: product.featured,
      products_count: 1,
      quick_stats: {
        min_price: Math.min(...product.product_variants.map((v: any) => v.price)),
        max_price: Math.max(...product.product_variants.map((v: any) => v.price)),
        avg_yield: '+15%'
      },
      segment_url: `/segments/${segment}/${product.product_crops[0]?.crop_id}`,
      educational_articles: [],
      is_interactive: false
    })) || [];

    return {
      title: `${segment.charAt(0).toUpperCase() + segment.slice(1)} Solutions`,
      description: `Premium agricultural solutions for ${segment} crops`,
      stats: {
        total_products: products?.length || 0,
        total_crops: new Set(products?.map(p => p.product_crops[0]?.crop_id).filter(Boolean)).size,
        featured_crops: featuredCrops.length
      },
      featured_crops: featuredCrops,
      contextual_sidebar: {
        recommended_reading: [],
        upcoming_crops: [],
        crop_tips: []
      }
    };
  } catch (error) {
    console.error(`Error getting products for segment ${segment}:`, error);
    return getMockSegmentData(segment);
  }
}

export class EnhancedProductService {
  async getProductsBySegment(segment: string) {
    return getProductsBySegment(segment);
  }
}
