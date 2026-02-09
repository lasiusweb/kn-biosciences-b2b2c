import { supabase } from './supabase';
import { Product, ProductVariant } from '@/types';
import { searchRateLimiter } from './rate-limiter';
import { InputValidator, validateTextField, sanitizeInput } from './input-validator';

export interface SearchFilters {
  segment?: string;
  cropId?: string;
  problemId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  category?: string;
  
  // New filters for enhanced product attributes
  brandName?: string;
  gtin?: string;
  countryOfOrigin?: string;
  chemicalComposition?: string;
  safetyWarnings?: string;
  cbircCompliance?: string;
  manufacturingLicense?: string;
  marketBy?: string;
  netContent?: string;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'name' | 'price' | 'created_at' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  includeVariants?: boolean;
}

export interface SearchResult {
  products: Product[];
  variants: ProductVariant[];
  totalCount: number;
  facets: {
    segments: { segment: string; count: number }[];
    categories: { category: string; count: number }[];
    priceRanges: { range: string; count: number }[];
    crops: { crop: string; count: number }[];
    
    // New facets for enhanced product attributes
    brands: { brand: string; count: number }[];
    countriesOfOrigin: { country: string; count: number }[];
    certifications: { certification: string; count: number }[];
    manufacturers: { manufacturer: string; count: number }[];
  };
  hasMore: boolean;
}

export class ImprovedSearchService {
  private readonly defaultLimit = 20;
  private readonly maxLimit = 100;

  async search(
    query: string, 
    filters: SearchFilters = {}, 
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    // Validate and sanitize inputs
    const validationResult = validateTextField(query, 'Search query', {
      minLength: 1,
      maxLength: 100,
      required: false
    });
    
    if (!validationResult.isValid) {
      throw new Error(`Invalid search query: ${validationResult.errors.join(', ')}`);
    }
    
    const sanitizedQuery = sanitizeInput(query).trim();
    
    // Apply rate limiting
    const identifier = `search_${this.getClientIdentifier()}`;
    const rateLimitResult = await searchRateLimiter.check(identifier);
    
    if (!rateLimitResult.allowed) {
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)} seconds.`);
    }

    // Set defaults
    const limit = Math.min(options.limit || this.defaultLimit, this.maxLimit);
    const offset = options.offset || 0;
    const includeVariants = options.includeVariants ?? true;

    try {
      // Build the search query
      let dbQuery = supabase
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
          )
        `, { count: 'exact' })
        .eq('status', 'active');

      // Apply search term if provided
      if (sanitizedQuery) {
        // Use full-text search if available, otherwise use ilike
        dbQuery = dbQuery.or(
          `name.ilike.%${sanitizedQuery}%,short_description.ilike.%${sanitizedQuery}%,description.ilike.%${sanitizedQuery}%`
        );
      }

      // Apply filters
      if (filters.segment) {
        dbQuery = dbQuery.eq('segment', filters.segment);
      }

      if (filters.category) {
        dbQuery = dbQuery.eq('category_id', filters.category);
      }

      if (filters.cropId) {
        dbQuery = dbQuery.contains('crop_ids', [filters.cropId]); // Assuming crop_ids is a text array column
      }

      if (filters.problemId) {
        dbQuery = dbQuery.contains('problem_ids', [filters.problemId]); // Assuming problem_ids is a text array column
      }

      if (filters.minPrice !== undefined) {
        if (includeVariants) {
          // This requires joining with product_variants table
          dbQuery = dbQuery.gte('product_variants.price', filters.minPrice);
        }
      }

      if (filters.maxPrice !== undefined) {
        if (includeVariants) {
          dbQuery = dbQuery.lte('product_variants.price', filters.maxPrice);
        }
      }

      if (filters.inStock) {
        if (includeVariants) {
          dbQuery = dbQuery.gt('product_variants.stock_quantity', 0);
        }
      }

      // Apply new filters for enhanced product attributes
      if (filters.brandName) {
        dbQuery = dbQuery.ilike('brand_name', `%${filters.brandName}%`);
      }

      if (filters.gtin) {
        dbQuery = dbQuery.ilike('gtin', `%${filters.gtin}%`);
      }

      if (filters.countryOfOrigin) {
        dbQuery = dbQuery.ilike('country_of_origin', `%${filters.countryOfOrigin}%`);
      }

      if (filters.chemicalComposition) {
        dbQuery = dbQuery.ilike('chemical_composition', `%${filters.chemicalComposition}%`);
      }

      if (filters.safetyWarnings) {
        dbQuery = dbQuery.ilike('safety_warnings', `%${filters.safetyWarnings}%`);
      }

      if (filters.cbircCompliance) {
        dbQuery = dbQuery.ilike('cbirc_compliance', `%${filters.cbircCompliance}%`);
      }

      if (filters.manufacturingLicense) {
        dbQuery = dbQuery.ilike('manufacturing_license', `%${filters.manufacturingLicense}%`);
      }

      if (filters.marketBy) {
        dbQuery = dbQuery.ilike('market_by', `%${filters.marketBy}%`);
      }

      if (filters.netContent) {
        dbQuery = dbQuery.ilike('net_content', `%${filters.netContent}%`);
      }

      // Apply sorting
      let sortColumn = 'created_at';
      let ascending = false;

      switch (options.sortBy) {
        case 'name':
          sortColumn = 'name';
          ascending = options.sortOrder === 'asc';
          break;
        case 'price':
          sortColumn = 'product_variants.price';
          ascending = options.sortOrder === 'asc';
          break;
        case 'popularity':
          sortColumn = 'popularity_score'; // Assuming this column exists
          ascending = false;
          break;
        case 'relevance':
        case 'created_at':
        default:
          sortColumn = 'created_at';
          ascending = false;
      }

      dbQuery = dbQuery.order(sortColumn, { ascending });

      // Apply pagination
      dbQuery = dbQuery.range(offset, offset + limit - 1);

      const { data, error, count } = await dbQuery;

      if (error) {
        console.error('Error searching products:', error);
        throw new Error('Search service temporarily unavailable');
      }

      // Extract products and variants
      const productsMap = new Map<string, Product>();
      const variantsMap = new Map<string, ProductVariant[]>();

      data.forEach(row => {
        const product = {
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description,
          short_description: row.short_description,
          category_id: row.category_id,
          segment: row.segment,
          status: row.status,
          featured: row.featured,
          meta_title: row.meta_title,
          meta_description: row.meta_description,
          created_at: row.created_at,
          updated_at: row.updated_at,
          featured_image: row.featured_image,
          brand_name: row.brand_name,
          gtin: row.gtin,
          country_of_origin: row.country_of_origin,
          chemical_composition: row.chemical_composition,
          safety_warnings: row.safety_warnings,
          antidote_statement: row.antidote_statement,
          directions_of_use: row.directions_of_use,
          precautions: row.precautions,
          recommendations: row.recommendations,
          cbirc_compliance: row.cbirc_compliance,
          manufacturing_license: row.manufacturing_license,
          customer_care_details: row.customer_care_details,
          market_by: row.market_by,
          net_content: row.net_content,
          leaflet_urls: row.leaflet_urls
        };

        productsMap.set(product.id, product);

        if (row.product_variants) {
          const variants = variantsMap.get(product.id) || [];
          variants.push(...row.product_variants.map((v: any) => ({
            id: v.id,
            product_id: v.product_id,
            sku: v.sku,
            weight: v.weight,
            weight_unit: v.weight_unit,
            packing_type: v.packing_type,
            form: v.form,
            price: v.price,
            compare_price: v.compare_price,
            cost_price: v.cost_price,
            stock_quantity: v.stock_quantity,
            low_stock_threshold: v.low_stock_threshold,
            track_inventory: v.track_inventory,
            image_urls: v.image_urls,
            created_at: v.created_at,
            updated_at: v.updated_at,
            net_weight: v.net_weight,
            gross_weight: v.gross_weight,
            net_content: v.variant_net_content
          })));
          variantsMap.set(product.id, variants);
        }
      });

      const products = Array.from(productsMap.values());
      const variants = Array.from(variantsMap.values()).flat();

      // Generate facets
      const facets = await this.generateFacets(sanitizedQuery, filters);

      return {
        products,
        variants,
        totalCount: count || 0,
        facets,
        hasMore: offset + limit < (count || 0)
      };
    } catch (error) {
      console.error('Search service error:', error);
      throw new Error('Search service temporarily unavailable');
    }
  }

  private async generateFacets(query: string, filters: SearchFilters) {
    // This would typically aggregate data from the database
    // For now, returning empty facets - in a real implementation,
    // this would make separate queries to generate facet counts

    const facetsQuery = supabase
      .from('products')
      .select(`
        segment,
        category_id,
        brand_name,
        country_of_origin,
        cbirc_compliance,
        market_by
      `)
      .eq('status', 'active');

    if (query) {
      facetsQuery.or(
        `name.ilike.%${query}%,short_description.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    const { data, error } = await facetsQuery;

    if (error) {
      console.error('Error generating facets:', error);
      return {
        segments: [],
        categories: [],
        priceRanges: [],
        crops: [],
        brands: [],
        countriesOfOrigin: [],
        certifications: [],
        manufacturers: []
      };
    }

    // Aggregate segments
    const segmentCounts: Record<string, number> = {};
    // Aggregate categories
    const categoryCounts: Record<string, number> = {};
    // Aggregate brands
    const brandCounts: Record<string, number> = {};
    // Aggregate countries of origin
    const countryCounts: Record<string, number> = {};
    // Aggregate certifications
    const certificationCounts: Record<string, number> = {};
    // Aggregate manufacturers
    const manufacturerCounts: Record<string, number> = {};

    data?.forEach(item => {
      if (item.segment) {
        segmentCounts[item.segment] = (segmentCounts[item.segment] || 0) + 1;
      }
      if (item.category_id) {
        categoryCounts[item.category_id] = (categoryCounts[item.category_id] || 0) + 1;
      }
      if (item.brand_name) {
        brandCounts[item.brand_name] = (brandCounts[item.brand_name] || 0) + 1;
      }
      if (item.country_of_origin) {
        countryCounts[item.country_of_origin] = (countryCounts[item.country_of_origin] || 0) + 1;
      }
      if (item.cbirc_compliance) {
        certificationCounts[item.cbirc_compliance] = (certificationCounts[item.cbirc_compliance] || 0) + 1;
      }
      if (item.market_by) {
        manufacturerCounts[item.market_by] = (manufacturerCounts[item.market_by] || 0) + 1;
      }
    });

    return {
      segments: Object.entries(segmentCounts).map(([segment, count]) => ({ segment, count })),
      categories: Object.entries(categoryCounts).map(([category, count]) => ({ category, count })),
      priceRanges: [
        { range: 'Under ₹500', count: 0 },
        { range: '₹500 - ₹1000', count: 0 },
        { range: '₹1000 - ₹2000', count: 0 },
        { range: 'Over ₹2000', count: 0 }
      ], // Placeholder - would be calculated from variants
      crops: [], // Placeholder - would be calculated from crop associations
      brands: Object.entries(brandCounts).map(([brand, count]) => ({ brand, count })),
      countriesOfOrigin: Object.entries(countryCounts).map(([country, count]) => ({ country, count })),
      certifications: Object.entries(certificationCounts).map(([certification, count]) => ({ certification, count })),
      manufacturers: Object.entries(manufacturerCounts).map(([manufacturer, count]) => ({ manufacturer, count }))
    };
  }

  private getClientIdentifier(): string {
    // In a real implementation, this would derive from request context
    // For now, returning a placeholder
    return 'anonymous_client';
  }

  // Method to get search suggestions
  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const sanitizedQuery = sanitizeInput(query).trim().toLowerCase();

    // Get products that match the beginning of the query for suggestions
    const { data, error } = await supabase
      .from('products')
      .select('name')
      .ilike('name', `${sanitizedQuery}%`)
      .eq('status', 'active')
      .limit(5);

    if (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }

    // Return unique product names that start with the query
    const suggestions = Array.from(
      new Set(
        (data || [])
          .map(item => item.name)
          .filter(name => name.toLowerCase().startsWith(sanitizedQuery))
      )
    ).slice(0, 5);

    return suggestions;
  }
}

export const improvedSearchService = new ImprovedSearchService();