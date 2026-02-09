import { Product } from '@/types';
import { supabase } from '@/lib/supabase';

export interface PersonalizationPreferences {
  preferredCategories: string[];
  preferredPriceRange: [number, number];
  favoriteBrands: string[];
  preferredSegments: string[];
  recentlyViewed: string[];
  purchasedProducts: string[];
}

export interface PersonalizedSearchResult {
  products: Product[];
  reason: string; // Why these products were personalized for the user
}

export class SearchPersonalizationService {
  /**
   * Gets personalized search results based on user preferences and behavior
   */
  static async getPersonalizedResults(
    query: string, 
    userId?: string,
    preferences?: PersonalizationPreferences
  ): Promise<PersonalizedSearchResult> {
    // If no user ID is provided, return standard search results
    if (!userId) {
      return {
        products: [],
        reason: 'Generic results for all users'
      };
    }

    try {
      // Fetch user's browsing and purchase history
      const userHistory = await this.getUserHistory(userId);
      
      // Combine provided preferences with inferred preferences from history
      const combinedPrefs = this.combinePreferences(preferences, userHistory);
      
      // Get personalized results based on preferences
      const personalizedProducts = await this.getPersonalizedProducts(
        query, 
        combinedPrefs
      );
      
      // Add some popular products to diversify results
      const popularProducts = await this.getPopularProducts(query, 3);
      
      // Combine and deduplicate results
      const allProducts = this.combineAndDeduplicate(
        personalizedProducts, 
        popularProducts
      );
      
      return {
        products: allProducts,
        reason: this.generatePersonalizationReason(combinedPrefs)
      };
    } catch (error) {
      console.error('Error in search personalization:', error);
      // Fallback to standard search if personalization fails
      return {
        products: [],
        reason: 'Generic results due to personalization error'
      };
    }
  }

  /**
   * Gets user's browsing and purchase history
   */
  private static async getUserHistory(userId: string) {
    // Fetch user's interaction history
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('interaction_type, product_id, rating')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50); // Get last 50 interactions

    // Fetch user's purchase history
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        product_variants!inner (
          product_id
        )
      `)
      .eq('orders.user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch user's wishlist
    const { data: wishlist } = await supabase
      .from('wishlist')
      .select('variant_id')
      .eq('user_id', userId);

    return {
      interactions: interactions || [],
      purchases: orderItems?.map(item => item.product_variants.product_id) || [],
      wishlist: wishlist?.map(item => item.variant_id) || []
    };
  }

  /**
   * Combines provided preferences with inferred preferences from history
   */
  private static combinePreferences(
    providedPrefs: PersonalizationPreferences | undefined, 
    history: any
  ): PersonalizationPreferences {
    const inferredPrefs: PersonalizationPreferences = {
      preferredCategories: this.inferPreferredCategories(history),
      preferredPriceRange: this.inferPreferredPriceRange(history),
      favoriteBrands: this.inferFavoriteBrands(history),
      preferredSegments: this.inferPreferredSegments(history),
      recentlyViewed: history.interactions
        .filter((i: any) => i.interaction_type === 'view')
        .slice(0, 10)
        .map((i: any) => i.product_id),
      purchasedProducts: history.purchases,
    };

    // Merge provided preferences with inferred ones
    return {
      preferredCategories: providedPrefs?.preferredCategories || inferredPrefs.preferredCategories,
      preferredPriceRange: providedPrefs?.preferredPriceRange || inferredPrefs.preferredPriceRange,
      favoriteBrands: providedPrefs?.favoriteBrands || inferredPrefs.favoriteBrands,
      preferredSegments: providedPrefs?.preferredSegments || inferredPrefs.preferredSegments,
      recentlyViewed: [...new Set([...(providedPrefs?.recentlyViewed || []), ...inferredPrefs.recentlyViewed])],
      purchasedProducts: [...new Set([...(providedPrefs?.purchasedProducts || []), ...inferredPrefs.purchasedProducts])]
    };
  }

  /**
   * Infers preferred categories from user history
   */
  private static inferPreferredCategories(history: any): string[] {
    // Count category occurrences in interactions and purchases
    const categoryCounts: Record<string, number> = {};
    
    // Process interactions
    history.interactions.forEach((interaction: any) => {
      // In a real implementation, we would map product_id to category
      // For now, we'll return a default
    });
    
    // Process purchases
    history.purchases.forEach((productId: string) => {
      // In a real implementation, we would map product_id to category
    });
    
    // Return top categories
    return ['agriculture', 'bio-fertilizers']; // Default fallback
  }

  /**
   * Infers preferred price range from user history
   */
  private static inferPreferredPriceRange(history: any): [number, number] {
    // Calculate average price of purchased items
    // For now, return a default range
    return [100, 5000];
  }

  /**
   * Infers favorite brands from user history
   */
  private static inferFavoriteBrands(history: any): string[] {
    // In a real implementation, we would analyze brand preferences
    return ['KN BioSciences', 'BioGrow']; // Default fallback
  }

  /**
   * Infers preferred segments from user history
   */
  private static inferPreferredSegments(history: any): string[] {
    // In a real implementation, we would analyze segment preferences
    return ['agriculture', 'organic-farming']; // Default fallback
  }

  /**
   * Gets personalized products based on preferences
   */
  private static async getPersonalizedProducts(
    query: string, 
    preferences: PersonalizationPreferences
  ): Promise<Product[]> {
    // In a real implementation, this would call a recommendation engine
    // For now, we'll simulate by querying products that match preferences
    
    let dbQuery = supabase
      .from('products')
      .select('*')
      .eq('status', 'active');

    // Apply search term if provided
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Apply preferred segments filter
    if (preferences.preferredSegments.length > 0) {
      dbQuery = dbQuery.in('segment', preferences.preferredSegments);
    }

    // Apply preferred categories filter
    if (preferences.preferredCategories.length > 0) {
      dbQuery = dbQuery.in('category_id', preferences.preferredCategories);
    }

    // Apply price range filter
    if (preferences.preferredPriceRange) {
      dbQuery = dbQuery.gte('product_variants.price', preferences.preferredPriceRange[0])
                   .lte('product_variants.price', preferences.preferredPriceRange[1]);
    }

    const { data, error } = await dbQuery.limit(10);

    if (error) {
      console.error('Error fetching personalized products:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Gets popular products for diversification
   */
  private static async getPopularProducts(query: string, limit: number = 5): Promise<Product[]> {
    let dbQuery = supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('popularity_score', { ascending: false });

    // Apply search term if provided
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data, error } = await dbQuery.limit(limit);

    if (error) {
      console.error('Error fetching popular products:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Combines and removes duplicate products
   */
  private static combineAndDeduplicate(personalized: Product[], popular: Product[]): Product[] {
    const seenIds = new Set<string>();
    const result: Product[] = [];

    // Add personalized products first
    for (const product of personalized) {
      if (!seenIds.has(product.id)) {
        seenIds.add(product.id);
        result.push(product);
      }
    }

    // Add popular products that aren't already in the list
    for (const product of popular) {
      if (!seenIds.has(product.id)) {
        seenIds.add(product.id);
        result.push(product);
      }
    }

    return result;
  }

  /**
   * Generates a reason for why these products were personalized
   */
  private static generatePersonalizationReason(preferences: PersonalizationPreferences): string {
    const reasons = [];

    if (preferences.preferredSegments.length > 0) {
      reasons.push(`based on your interest in ${preferences.preferredSegments[0]}`);
    }

    if (preferences.purchasedProducts.length > 0) {
      reasons.push('similar to products you purchased before');
    }

    if (preferences.recentlyViewed.length > 0) {
      reasons.push('based on items you recently viewed');
    }

    if (reasons.length > 0) {
      return `Personalized for you: ${reasons.join(', ')}`;
    }

    return 'Personalized for you based on your preferences';
  }

  /**
   * Updates user preferences based on new interaction
   */
  static async updateUserPreferences(
    userId: string, 
    productId: string, 
    interactionType: 'view' | 'purchase' | 'like' | 'dislike'
  ): Promise<void> {
    try {
      // Log the interaction
      await supabase
        .from('user_interactions')
        .insert({
          user_id: userId,
          product_id: productId,
          interaction_type: interactionType,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }
}