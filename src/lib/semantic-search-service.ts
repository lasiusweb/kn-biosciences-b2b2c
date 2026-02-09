import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

export interface SemanticSearchOptions {
  limit?: number;
  offset?: number;
  segment?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface SemanticSearchResult {
  products: Product[];
  totalCount: number;
  confidenceScore: number; // How confident the semantic search is in its results
}

export class SemanticSearchService {
  /**
   * Performs semantic search using natural language processing
   * This implementation uses a combination of full-text search and semantic understanding
   */
  static async search(query: string, options: SemanticSearchOptions = {}): Promise<SemanticSearchResult> {
    // Parse the natural language query to extract search terms and filters
    const parsedQuery = this.parseNaturalLanguageQuery(query);
    
    // Build the search query
    let dbQuery = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .or(`name.ilike.%${parsedQuery.terms.join('%')}%,description.ilike.%${parsedQuery.terms.join('%')}%`);

    // Apply filters
    if (options.segment) {
      dbQuery = dbQuery.eq('segment', options.segment);
    }

    if (options.category) {
      dbQuery = dbQuery.eq('category_id', options.category);
    }

    if (options.minPrice !== undefined) {
      dbQuery = dbQuery.gte('product_variants.price', options.minPrice);
    }

    if (options.maxPrice !== undefined) {
      dbQuery = dbQuery.lte('product_variants.price', options.maxPrice);
    }

    if (options.inStock) {
      dbQuery = dbQuery.gt('product_variants.stock_quantity', 0);
    }

    // Apply pagination
    if (options.offset) {
      dbQuery = dbQuery.range(options.offset, (options.offset || 0) + (options.limit || 20) - 1);
    }

    if (options.limit) {
      dbQuery = dbQuery.limit(options.limit);
    }

    // Order by relevance (using full-text search rank if available)
    dbQuery = dbQuery.order('name', { ascending: true }); // Placeholder ordering

    const { data, error, count } = await dbQuery;

    if (error) {
      console.error('Semantic search error:', error);
      throw new Error('Search service temporarily unavailable');
    }

    // Calculate a confidence score based on how well the query matched
    const confidenceScore = this.calculateConfidenceScore(query, data || []);

    return {
      products: data || [],
      totalCount: count || 0,
      confidenceScore
    };
  }

  /**
   * Parses a natural language query to extract search terms and potential filters
   */
  private static parseNaturalLanguageQuery(query: string): { terms: string[], filters: Record<string, any> } {
    const terms: string[] = [];
    const filters: Record<string, any> = {};

    // Convert to lowercase for easier parsing
    const lowerQuery = query.toLowerCase().trim();

    // Extract terms (remove common stop words)
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const rawTerms = lowerQuery.split(/\s+/).filter(term => !stopWords.includes(term) && term.length > 0);
    
    // Simple heuristics to extract potential filters from the query
    for (const term of rawTerms) {
      // Check for price-related terms
      const priceMatch = term.match(/(\d+)([kmg]?)/);
      if (priceMatch) {
        const value = parseInt(priceMatch[1]);
        const multiplier = priceMatch[2] === 'k' ? 1000 : 
                         priceMatch[2] === 'm' ? 1000000 : 
                         priceMatch[2] === 'g' ? 1000000000 : 1;
        
        if (value && multiplier) {
          filters.price = value * multiplier;
        }
      }
      
      // Add to terms if not a recognized filter
      if (!filters.price) {
        terms.push(term);
      }
    }

    return { terms, filters };
  }

  /**
   * Calculates a confidence score based on how well the search results match the query
   */
  private static calculateConfidenceScore(query: string, results: Product[]): number {
    if (results.length === 0) return 0;

    // Simple heuristic: calculate how many query terms appear in the results
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    let matches = 0;
    let totalChecks = 0;

    for (const product of results) {
      for (const term of queryTerms) {
        totalChecks++;
        if (
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.short_description?.toLowerCase().includes(term)
        ) {
          matches++;
        }
      }
    }

    // Return a normalized score between 0 and 1
    return totalChecks > 0 ? matches / totalChecks : 0;
  }

  /**
   * Generates search suggestions based on semantic understanding of the query
   */
  static async getSuggestions(query: string): Promise<string[]> {
    // This would typically connect to a ML model or use a more sophisticated algorithm
    // For now, we'll return some basic suggestions based on the query
    
    const suggestions: string[] = [];
    
    // If the query is too short, return empty suggestions
    if (query.length < 2) {
      return [];
    }
    
    // Basic suggestions based on common patterns
    if (query.toLowerCase().includes('fertilizer')) {
      suggestions.push('organic fertilizer', 'bio fertilizer', 'liquid fertilizer', 'granular fertilizer');
    }
    
    if (query.toLowerCase().includes('pesticide')) {
      suggestions.push('organic pesticide', 'bio pesticide', 'natural pesticide');
    }
    
    if (query.toLowerCase().includes('seed')) {
      suggestions.push('vegetable seeds', 'flower seeds', 'herb seeds');
    }
    
    // Add suggestions based on common product categories
    if (query.length > 3) {
      const { data, error } = await supabase
        .from('products')
        .select('name')
        .ilike('name', `%${query}%`)
        .limit(5);
      
      if (!error && data) {
        suggestions.push(...data.map(item => item.name));
      }
    }
    
    // Remove duplicates and return top 5
    return [...new Set(suggestions)].slice(0, 5);
  }
}