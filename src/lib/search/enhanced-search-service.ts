// lib/search/enhanced-search-service.ts
import { supabase } from '@/lib/supabase';
import { Product, ProductVariant } from '@/types';

export interface SearchFilters {
  segment?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  organic?: boolean;
  rating?: number;
  crop?: string;
  problem?: string;
  form?: string; // powder, liquid, granules, etc.
  weight?: string; // specific weight filter
  packing?: string; // box, drum, bag, etc.
  searchQuery?: string;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'price-low' | 'price-high' | 'name' | 'rating' | 'created-at';
  includeFacets?: boolean;
}

export interface SearchResults {
  products: Product[];
  totalCount: number;
  facets?: {
    segments: { segment: string; count: number }[];
    categories: { category: string; count: number }[];
    priceRanges: { range: string; min: number; max: number; count: number }[];
    ratings: { rating: number; count: number }[];
    forms: { form: string; count: number }[];
    crops: { crop: string; count: number }[];
    problems: { problem: string; count: number }[];
  };
  hasMore: boolean;
}

export class EnhancedSearchService {
  private readonly defaultLimit = 20;
  private readonly maxLimit = 100;

  /**
   * Performs an enhanced search with multiple filters and options
   */
  async search(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResults> {
    try {
      // Sanitize and validate inputs
      const cleanQuery = this.sanitizeQuery(query);
      const limit = Math.min(options.limit || this.defaultLimit, this.maxLimit);
      const offset = options.offset || 0;

      // Build the search query
      let dbQuery = supabase
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
            packing_type,
            form,
            image_urls,
            created_at,
            updated_at
          ),
          product_crops (
            crop_id,
            crop_name
          ),
          problem_solutions (
            id,
            title,
            slug,
            segment
          )
        `, { count: 'exact' })
        .eq('status', 'active');

      // Apply text search if query is provided
      if (cleanQuery) {
        // Use full-text search for better relevance
        dbQuery = dbQuery.or(`
          name.ilike.%${cleanQuery}%,
          short_description.ilike.%${cleanQuery}%,
          description.ilike.%${cleanQuery}%,
          product_variants.sku.ilike.%${cleanQuery}%,
          tags.cs.{${cleanQuery}}
        `);
      }

      // Apply filters
      if (filters.segment) {
        dbQuery = dbQuery.eq('segment', filters.segment);
      }

      if (filters.category) {
        dbQuery = dbQuery.eq('category_id', filters.category);
      }

      if (filters.minPrice !== undefined) {
        dbQuery = dbQuery.gte('product_variants.price', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        dbQuery = dbQuery.lte('product_variants.price', filters.maxPrice);
      }

      if (filters.inStock) {
        dbQuery = dbQuery.gt('product_variants.stock_quantity', 0);
      }

      if (filters.organic) {
        dbQuery = dbQuery.eq('is_organic', true);
      }

      if (filters.rating) {
        dbQuery = dbQuery.gte('average_rating', filters.rating);
      }

      if (filters.crop) {
        dbQuery = dbQuery.contains('crop_ids', [filters.crop]);
      }

      if (filters.problem) {
        dbQuery = dbQuery.contains('problem_ids', [filters.problem]);
      }

      if (filters.form) {
        dbQuery = dbQuery.eq('product_variants.form', filters.form);
      }

      if (filters.weight) {
        dbQuery = dbQuery.eq('product_variants.weight', parseFloat(filters.weight));
      }

      if (filters.packing) {
        dbQuery = dbQuery.eq('product_variants.packing_type', filters.packing);
      }

      // Apply sorting
      switch (options.sortBy) {
        case 'price-low':
          dbQuery = dbQuery.order('price', { referencedTable: 'product_variants', ascending: true });
          break;
        case 'price-high':
          dbQuery = dbQuery.order('price', { referencedTable: 'product_variants', ascending: false });
          break;
        case 'name':
          dbQuery = dbQuery.order('name', { ascending: true });
          break;
        case 'rating':
          dbQuery = dbQuery.order('average_rating', { ascending: false });
          break;
        case 'created-at':
          dbQuery = dbQuery.order('created_at', { ascending: false });
          break;
        case 'relevance':
        default:
          // For relevance, we'll use the text search rank if available
          if (cleanQuery) {
            dbQuery = dbQuery.order('relevance', { referencedTable: 'products', ascending: false }); // Assuming FTS column exists
          } else {
            dbQuery = dbQuery.order('created_at', { ascending: false });
          }
      }

      // Apply pagination
      dbQuery = dbQuery.range(offset, offset + limit - 1);

      const { data, error, count } = await dbQuery;

      if (error) {
        throw new Error(`Search failed: ${error.message}`);
      }

      // Process results to match Product type
      const products = this.processSearchResults(data);

      // Get facets if requested
      let facets;
      if (options.includeFacets) {
        facets = await this.getFacets(cleanQuery, filters);
      }

      return {
        products,
        totalCount: count || 0,
        facets,
        hasMore: offset + limit < (count || 0)
      };
    } catch (error) {
      console.error('Enhanced search error:', error);
      throw new Error('Search service temporarily unavailable');
    }
  }

  /**
   * Gets search facets for filtering
   */
  private async getFacets(query: string, filters: SearchFilters): Promise<SearchResults['facets']> {
    // Get segments facet
    const segmentsQuery = supabase
      .from('products')
      .select('segment, count(*)', { count: 'exact' })
      .eq('status', 'active')
      .gt('product_variants.stock_quantity', 0)
      .order('count', { ascending: false })
      .limit(10);

    if (query) {
      segmentsQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data: segmentsData } = await segmentsQuery;

    // Get categories facet
    const categoriesQuery = supabase
      .from('products')
      .select('category_id, count(*)', { count: 'exact' })
      .eq('status', 'active')
      .gt('product_variants.stock_quantity', 0)
      .order('count', { ascending: false })
      .limit(10);

    if (query) {
      categoriesQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data: categoriesData } = await categoriesQuery;

    // Get price ranges
    const priceQuery = supabase
      .from('product_variants')
      .select('price')
      .in('product_id', 
        supabase
          .from('products')
          .select('id')
          .eq('status', 'active')
      );

    if (query) {
      priceQuery.in('product_id',
        supabase
          .from('products')
          .select('id')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      );
    }

    const { data: pricesData } = await priceQuery;

    // Calculate price ranges
    const priceRanges = this.calculatePriceRanges(pricesData?.map(p => p.price) || []);

    // Get forms facet
    const formsQuery = supabase
      .from('product_variants')
      .select('form, count(*)', { count: 'exact' })
      .not('form', 'is', null)
      .in('product_id',
        supabase
          .from('products')
          .select('id')
          .eq('status', 'active')
      )
      .order('count', { ascending: false })
      .limit(10);

    if (query) {
      formsQuery.in('product_id',
        supabase
          .from('products')
          .select('id')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      );
    }

    const { data: formsData } = await formsQuery;

    return {
      segments: segmentsData?.map(s => ({ 
        segment: s.segment, 
        count: s.count 
      })) || [],
      categories: categoriesData?.map(c => ({ 
        category: c.category_id, 
        count: c.count 
      })) || [],
      priceRanges,
      ratings: [
        { rating: 4, count: 0 }, // Placeholder - would need actual query
        { rating: 3, count: 0 },
        { rating: 2, count: 0 },
        { rating: 1, count: 0 }
      ],
      forms: formsData?.map(f => ({ 
        form: f.form, 
        count: f.count 
      })) || [],
      crops: [], // Would need to query product_crops table
      problems: [] // Would need to query problem_solutions table
    };
  }

  /**
   * Calculates price ranges for facet display
   */
  private calculatePriceRanges(prices: number[]): { range: string; min: number; max: number; count: number }[] {
    if (prices.length === 0) return [];

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;

    // Create 4 price ranges
    const ranges = [];
    const step = range / 4;

    for (let i = 0; i < 4; i++) {
      const min = Math.round(minPrice + (step * i));
      const max = i === 3 ? Math.round(maxPrice) : Math.round(minPrice + (step * (i + 1)));
      
      ranges.push({
        range: `₹${min} - ₹${max}`,
        min,
        max,
        count: prices.filter(p => p >= min && p <= max).length
      });
    }

    return ranges;
  }

  /**
   * Sanitizes search query to prevent injection
   */
  private sanitizeQuery(query: string): string {
    if (!query) return '';
    
    // Remove potentially dangerous characters
    return query
      .trim()
      .substring(0, 100) // Limit length
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/['"]/g, '') // Remove quotes
      .replace(/;/g, '') // Remove semicolons
      .replace(/--/g, ''); // Remove SQL comment indicators
  }

  /**
   * Processes search results to match Product type
   */
  private processSearchResults(data: any[]): Product[] {
    // Group variants by product
    const productMap = new Map();
    
    for (const row of data) {
      if (!productMap.has(row.id)) {
        productMap.set(row.id, {
          ...row,
          product_variants: []
        });
      }
      
      const product = productMap.get(row.id);
      if (row.product_variants) {
        product.product_variants.push(row.product_variants);
      }
    }
    
    return Array.from(productMap.values());
  }

  /**
   * Gets search suggestions for autocomplete
   */
  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const cleanQuery = this.sanitizeQuery(query);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('name')
        .ilike('name', `%${cleanQuery}%`)
        .eq('status', 'active')
        .limit(8);

      if (error) {
        throw error;
      }

      // Extract unique product names
      const names = Array.from(new Set(data?.map(p => p.name) || []));
      return names.slice(0, 5); // Return top 5 suggestions
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Logs search analytics
   */
  async logSearch(query: string, resultsCount: number, filters: SearchFilters = {}): Promise<void> {
    try {
      await supabase
        .from('search_analytics')
        .insert({
          query,
          results_count: resultsCount,
          filters: JSON.stringify(filters),
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging search analytics:', error);
    }
  }
}

// Create and export singleton instance
export const enhancedSearchService = new EnhancedSearchService();