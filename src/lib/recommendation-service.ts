import { Product } from '@/types';
import { supabase } from '@/lib/supabase';

export interface RecommendationContext {
  userId?: string;
  sessionId: string;
  currentProductId?: string;
  category?: string;
  segment?: string;
  searchQuery?: string;
  cartItems?: string[];
  purchasedProducts?: string[];
  viewedProducts?: string[];
  preferences?: {
    preferredCategories?: string[];
    preferredSegments?: string[];
    preferredPriceRange?: [number, number];
  };
}

export interface RecommendationAlgorithm {
  id: string;
  name: string;
  description: string;
  weight: number; // How much this algorithm contributes to the final result
}

export interface RecommendationResult {
  products: Product[];
  algorithmUsed: string;
  confidence: number; // 0-1 scale
  reason: string; // Explanation for why these products were recommended
}

export class RecommendationService {
  /**
   * Gets personalized product recommendations based on context
   */
  static async getRecommendations(context: RecommendationContext): Promise<RecommendationResult[]> {
    const results: RecommendationResult[] = [];
    
    // Algorithm 1: Collaborative Filtering (users who bought X also bought Y)
    if (context.userId) {
      const collaborativeResults = await this.getCollaborativeRecommendations(context);
      if (collaborativeResults) {
        results.push(collaborativeResults);
      }
    }
    
    // Algorithm 2: Content-Based (similar products based on attributes)
    if (context.currentProductId) {
      const contentResults = await this.getContentBasedRecommendations(context);
      if (contentResults) {
        results.push(contentResults);
      }
    }
    
    // Algorithm 3: Category-Based (other products in the same category)
    if (context.category) {
      const categoryResults = await this.getCategoryBasedRecommendations(context);
      if (categoryResults) {
        results.push(categoryResults);
      }
    }
    
    // Algorithm 4: Segment-Based (other products in the same segment)
    if (context.segment) {
      const segmentResults = await this.getSegmentBasedRecommendations(context);
      if (segmentResults) {
        results.push(segmentResults);
      }
    }
    
    // Algorithm 5: Trending/Popular (currently popular products)
    const trendingResults = await this.getTrendingRecommendations(context);
    if (trendingResults) {
      results.push(trendingResults);
    }
    
    // Algorithm 6: Recently Viewed (products user has viewed)
    if (context.viewedProducts && context.viewedProducts.length > 0) {
      const recentlyViewedResults = await this.getRecentlyViewedRecommendations(context);
      if (recentlyViewedResults) {
        results.push(recentlyViewedResults);
      }
    }
    
    // Algorithm 7: Frequently Bought Together (products often purchased together)
    if (context.cartItems && context.cartItems.length > 0) {
      const frequentlyBoughtResults = await this.getFrequentlyBoughtTogether(context);
      if (frequentlyBoughtResults) {
        results.push(frequentlyBoughtResults);
      }
    }
    
    // Combine and deduplicate results
    return this.combineRecommendations(results, context);
  }

  /**
   * Collaborative filtering recommendations based on user behavior
   */
  private static async getCollaborativeRecommendations(context: RecommendationContext): Promise<RecommendationResult | null> {
    if (!context.userId) return null;

    try {
      // Get products purchased by users with similar purchase history
      const { data: similarUsers } = await supabase
        .from('user_interactions')
        .select('user_id')
        .in('product_id', context.purchasedProducts || [])
        .neq('user_id', context.userId)
        .limit(10);

      if (!similarUsers || similarUsers.length === 0) return null;

      // Get products these similar users purchased but current user hasn't
      const similarUserIds = similarUsers.map(u => u.user_id);
      
      const { data: recommendations } = await supabase
        .from('order_items')
        .select(`
          product_variants!inner (
            product_id,
            products!inner (
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
              updated_at
            )
          )
        `)
        .in('orders.user_id', similarUserIds)
        .limit(10);

      if (!recommendations || recommendations.length === 0) return null;

      const products = recommendations
        .map(r => r.product_variants.products)
        .filter(p => p && !context.purchasedProducts?.includes(p.id)); // Exclude already purchased

      return {
        products: products.slice(0, 5),
        algorithmUsed: 'collaborative-filtering',
        confidence: 0.75,
        reason: 'Based on what similar users purchased'
      };
    } catch (error) {
      console.error('Error in collaborative recommendations:', error);
      return null;
    }
  }

  /**
   * Content-based recommendations based on product attributes
   */
  private static async getContentBasedRecommendations(context: RecommendationContext): Promise<RecommendationResult | null> {
    if (!context.currentProductId) return null;

    try {
      // Get the current product to find similar ones
      const { data: currentProduct } = await supabase
        .from('products')
        .select('*')
        .eq('id', context.currentProductId)
        .single();

      if (!currentProduct) return null;

      // Find products in the same category and segment
      const { data: recommendations } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', currentProduct.category_id)
        .eq('segment', currentProduct.segment)
        .neq('id', context.currentProductId) // Exclude current product
        .limit(10);

      if (!recommendations || recommendations.length === 0) return null;

      return {
        products: recommendations,
        algorithmUsed: 'content-based',
        confidence: 0.8,
        reason: 'Similar products in the same category and segment'
      };
    } catch (error) {
      console.error('Error in content-based recommendations:', error);
      return null;
    }
  }

  /**
   * Category-based recommendations
   */
  private static async getCategoryBasedRecommendations(context: RecommendationContext): Promise<RecommendationResult | null> {
    if (!context.category) return null;

    try {
      const { data: recommendations } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', context.category)
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (!recommendations || recommendations.length === 0) return null;

      return {
        products: recommendations,
        algorithmUsed: 'category-based',
        confidence: 0.7,
        reason: 'Other popular products in the same category'
      };
    } catch (error) {
      console.error('Error in category-based recommendations:', error);
      return null;
    }
  }

  /**
   * Segment-based recommendations
   */
  private static async getSegmentBasedRecommendations(context: RecommendationContext): Promise<RecommendationResult | null> {
    if (!context.segment) return null;

    try {
      const { data: recommendations } = await supabase
        .from('products')
        .select('*')
        .eq('segment', context.segment)
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (!recommendations || recommendations.length === 0) return null;

      return {
        products: recommendations,
        algorithmUsed: 'segment-based',
        confidence: 0.7,
        reason: 'Other popular products in the same segment'
      };
    } catch (error) {
      console.error('Error in segment-based recommendations:', error);
      return null;
    }
  }

  /**
   * Trending/popular products
   */
  private static async getTrendingRecommendations(context: RecommendationContext): Promise<RecommendationResult | null> {
    try {
      const { data: recommendations } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('popularity_score', { ascending: false })
        .limit(10);

      if (!recommendations || recommendations.length === 0) return null;

      // Filter out products already purchased by user
      const filteredProducts = context.purchasedProducts
        ? recommendations.filter(p => !context.purchasedProducts?.includes(p.id))
        : recommendations;

      return {
        products: filteredProducts.slice(0, 5),
        algorithmUsed: 'trending',
        confidence: 0.6,
        reason: 'Currently popular products'
      };
    } catch (error) {
      console.error('Error in trending recommendations:', error);
      return null;
    }
  }

  /**
   * Recently viewed products
   */
  private static async getRecentlyViewedRecommendations(context: RecommendationContext): Promise<RecommendationResult | null> {
    if (!context.viewedProducts || context.viewedProducts.length === 0) return null;

    try {
      const { data: recommendations } = await supabase
        .from('products')
        .select('*')
        .in('id', context.viewedProducts)
        .eq('status', 'active')
        .limit(10);

      if (!recommendations || recommendations.length === 0) return null;

      return {
        products: recommendations,
        algorithmUsed: 'recently-viewed',
        confidence: 0.85,
        reason: 'Products you recently viewed'
      };
    } catch (error) {
      console.error('Error in recently viewed recommendations:', error);
      return null;
    }
  }

  /**
   * Frequently bought together
   */
  private static async getFrequentlyBoughtTogether(context: RecommendationContext): Promise<RecommendationResult | null> {
    if (!context.cartItems || context.cartItems.length === 0) return null;

    try {
      // This is a simplified implementation
      // In a real system, you'd have a table storing co-purchased products
      const { data: recommendations } = await supabase
        .from('products')
        .select('*')
        .neq('id', context.cartItems[0]) // Use first item in cart as reference
        .eq('status', 'active')
        .limit(5);

      if (!recommendations || recommendations.length === 0) return null;

      return {
        products: recommendations,
        algorithmUsed: 'frequently-bought-together',
        confidence: 0.65,
        reason: 'Products frequently bought with items in your cart'
      };
    } catch (error) {
      console.error('Error in frequently bought together recommendations:', error);
      return null;
    }
  }

  /**
   * Combines multiple recommendation results into a single ranked list
   */
  private static combineRecommendations(
    results: RecommendationResult[],
    context: RecommendationContext
  ): RecommendationResult[] {
    // Create a map to track products and their scores
    const productScores = new Map<string, { product: Product; score: number; reasons: string[] }>();

    // Assign scores based on algorithm confidence and relevance
    results.forEach(result => {
      result.products.forEach(product => {
        if (!productScores.has(product.id)) {
          productScores.set(product.id, {
            product,
            score: 0,
            reasons: []
          });
        }

        const current = productScores.get(product.id)!;
        current.score += result.confidence;
        current.reasons.push(result.reason);
      });
    });

    // Sort products by score
    const sortedProducts = Array.from(productScores.values())
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);

    // Return top recommendations grouped by algorithm
    return results.map(result => ({
      ...result,
      products: result.products.filter(p => 
        sortedProducts.slice(0, 10).some(sp => sp.id === p.id)
      ).slice(0, 5)
    })).filter(result => result.products.length > 0);
  }

  /**
   * Records a recommendation impression for analytics
   */
  static async recordImpression(
    userId: string | undefined,
    sessionId: string,
    algorithmUsed: string,
    recommendedProducts: string[]
  ): Promise<void> {
    try {
      await supabase
        .from('recommendation_analytics')
        .insert({
          user_id: userId,
          session_id: sessionId,
          algorithm_used: algorithmUsed,
          recommended_products: recommendedProducts,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error recording recommendation impression:', error);
    }
  }

  /**
   * Records a recommendation click for analytics
   */
  static async recordClick(
    userId: string | undefined,
    sessionId: string,
    algorithmUsed: string,
    productId: string
  ): Promise<void> {
    try {
      await supabase
        .from('recommendation_analytics')
        .insert({
          user_id: userId,
          session_id: sessionId,
          algorithm_used: algorithmUsed,
          clicked_product: productId,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error recording recommendation click:', error);
    }
  }

  /**
   * Gets trending products for a specific segment
   */
  static async getTrendingProducts(segment?: string, limit: number = 10): Promise<Product[]> {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('popularity_score', { ascending: false });

      if (segment) {
        query = query.eq('segment', segment);
      }

      const { data, error } = await query.limit(limit);

      if (error) {
        console.error('Error getting trending products:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting trending products:', error);
      return [];
    }
  }
}