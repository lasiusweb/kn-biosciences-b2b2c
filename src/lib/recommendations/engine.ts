// AI-Powered Product Recommendations Engine
import { supabase } from "@/lib/supabase";

// Recommendation types
export interface RecommendationContext {
  userId?: string;
  currentProductId?: string;
  searchQuery?: string;
  category?: string;
  priceRange?: { min: number; max: number };
  viewedProducts?: string[];
  purchasedProducts?: string[];
  userSegment?: string;
  limit?: number;
}

export interface ProductRecommendation {
  productId: string;
  score: number;
  reason: string;
  type:
    | "similar"
    | "complementary"
    | "trending"
    | "personalized"
    | "cross_sell"
    | "up_sell";
  confidence: number;
}

export interface RecommendationResult {
  products: any[];
  recommendations: ProductRecommendation[];
  metadata: {
    algorithm: string;
    processed_at: string;
    total_analyzed: number;
    user_id?: string;
    session_id: string;
  };
}

class RecommendationEngine {
  // Product vector similarity threshold
  private readonly SIMILARITY_THRESHOLD = 0.7;
  private readonly TRENDING_THRESHOLD = 10; // Products with >10 views in last 7 days

  // Create recommendation model
  async generateRecommendations(
    context: RecommendationContext,
  ): Promise<RecommendationResult> {
    try {
      const sessionId = this.generateSessionId();

      // Gather user behavior data
      const userBehavior = await this.getUserBehavior(context.userId);

      // Get base product pool
      const candidateProducts = await this.getCandidateProducts(context);

      // Apply different recommendation algorithms
      const recommendations: ProductRecommendation[] = [];

      // 1. Content-based recommendations (similar products)
      if (context.currentProductId) {
        const similarProducts = await this.findSimilarProducts(
          context.currentProductId,
          candidateProducts,
        );
        recommendations.push(...similarProducts);
      }

      // 2. Collaborative filtering recommendations
      if (context.userId && userBehavior.purchases.length > 0) {
        const collaborativeRecs = await this.collaborativeFiltering(
          context.userId,
          userBehavior,
          candidateProducts,
        );
        recommendations.push(...collaborativeRecs);
      }

      // 3. Trending products recommendations
      const trendingProducts =
        await this.getTrendingProducts(candidateProducts);
      recommendations.push(...trendingProducts);

      // 4. Personalized recommendations
      if (context.userId && userBehavior.views.length > 0) {
        const personalizedRecs = await this.getPersonalizedRecommendations(
          userBehavior,
          candidateProducts,
        );
        recommendations.push(...personalizedRecs);
      }

      // 5. Cross-sell and up-sell recommendations
      if (context.currentProductId) {
        const crossSellRecs = await this.getCrossSellRecommendations(
          context.currentProductId,
          candidateProducts,
        );
        const upSellRecs = await this.getUpSellRecommendations(
          context.currentProductId,
          candidateProducts,
        );
        recommendations.push(...crossSellRecs, ...upSellRecs);
      }

      // Sort and limit recommendations
      const sortedRecommendations = this.sortAndLimitRecommendations(
        recommendations,
        20,
      );

      // Get detailed product information
      const productIds = sortedRecommendations.map((r) => r.productId);
      const detailedProducts = await this.getProductsByIds(productIds);

      // Log recommendation generation for analytics
      await this.logRecommendationGeneration(context, sortedRecommendations);

      return {
        products: detailedProducts,
        recommendations: sortedRecommendations,
        metadata: {
          algorithm: "hybrid_content_collaborative_trending_personalized",
          processed_at: new Date().toISOString(),
          total_analyzed: candidateProducts.length,
          user_id: context.userId,
          session_id: sessionId,
        },
      };
    } catch (error) {
      console.error("Recommendation engine error:", error);
      return {
        products: [],
        recommendations: [],
        metadata: {
          algorithm: "error",
          processed_at: new Date().toISOString(),
          total_analyzed: 0,
          session_id: this.generateSessionId(),
        },
      };
    }
  }

  // Content-based filtering (similar products)
  private async findSimilarProducts(
    productId: string,
    candidates: any[],
  ): Promise<ProductRecommendation[]> {
    try {
      // Get current product details
      const currentProduct = await this.getProductById(productId);
      if (!currentProduct) return [];

      const similarProducts: ProductRecommendation[] = [];

      for (const candidate of candidates) {
        if (candidate.id === productId) continue;

        // Calculate similarity score
        const similarityScore = this.calculateProductSimilarity(
          currentProduct,
          candidate,
        );

        if (similarityScore >= this.SIMILARITY_THRESHOLD) {
          similarProducts.push({
            productId: candidate.id,
            score: similarityScore,
            reason: this.getSimilarityReason(
              similarityScore,
              currentProduct,
              candidate,
            ),
            type: "similar",
            confidence: this.calculateConfidence(similarityScore, "similar"),
          });
        }
      }

      return similarProducts.sort((a, b) => b.score - a.score).slice(0, 5);
    } catch (error) {
      console.error("Error finding similar products:", error);
      return [];
    }
  }

  // Collaborative filtering
  private async collaborativeFiltering(
    userId: string,
    userBehavior: any,
    candidates: any[],
  ): Promise<ProductRecommendation[]> {
    try {
      const collaborativeRecs: ProductRecommendation[] = [];

      // Find users with similar purchase history
      const similarUsers = await this.findSimilarUsers(userId, userBehavior);

      // Get products liked by similar users
      const recommendedProducts = await this.getProductsBySimilarUsers(
        similarUsers,
        userId,
      );

      // Calculate collaborative scores
      for (const product of recommendedProducts) {
        const score = this.calculateCollaborativeScore(
          product,
          similarUsers,
          userId,
        );

        if (score > 0.5) {
          const candidate = candidates.find((c) => c.id === product.product_id);
          if (candidate) {
            collaborativeRecs.push({
              productId: product.product_id,
              score: score,
              reason: this.getCollaborativeReason(score),
              type: "personalized",
              confidence: this.calculateConfidence(score, "collaborative"),
            });
          }
        }
      }

      return collaborativeRecs.sort((a, b) => b.score - a.score).slice(0, 5);
    } catch (error) {
      console.error("Error in collaborative filtering:", error);
      return [];
    }
  }

  // Trending products
  private async getTrendingProducts(
    candidates: any[],
  ): Promise<ProductRecommendation[]> {
    try {
      // Get products sorted by recent views/purchases
      const { data: trendingData } = await supabase
        .from("product_analytics")
        .select("product_id, view_count, purchase_count, last_viewed_at")
        .gte(
          "last_viewed_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        )
        .order("view_count", { ascending: false })
        .order("purchase_count", { ascending: false })
        .limit(20);

      const trendingRecs: ProductRecommendation[] = [];

      for (const trending of trendingData || []) {
        if (trending.view_count > this.TRENDING_THRESHOLD) {
          const candidate = candidates.find(
            (c) => c.id === trending.product_id,
          );
          if (candidate) {
            const score = this.calculateTrendingScore(trending);

            trendingRecs.push({
              productId: trending.product_id,
              score: score,
              reason: this.getTrendingReason(trending),
              type: "trending",
              confidence: this.calculateConfidence(score, "trending"),
            });
          }
        }
      }

      return trendingRecs.sort((a, b) => b.score - a.score).slice(0, 8);
    } catch (error) {
      console.error("Error getting trending products:", error);
      return [];
    }
  }

  // Personalized recommendations based on user behavior
  private async getPersonalizedRecommendations(
    userBehavior: any,
    candidates: any[],
  ): Promise<ProductRecommendation[]> {
    try {
      const personalizedRecs: ProductRecommendation[] = [];

      // Analyze user preferences from behavior
      const userPreferences = this.analyzeUserPreferences(userBehavior);

      for (const candidate of candidates) {
        const score = this.calculatePersonalizationScore(
          candidate,
          userPreferences,
        );

        if (score > 0.3) {
          personalizedRecs.push({
            productId: candidate.id,
            score: score,
            reason: this.getPersonalizationReason(
              score,
              candidate,
              userPreferences,
            ),
            type: "personalized",
            confidence: this.calculateConfidence(score, "personalized"),
          });
        }
      }

      return personalizedRecs.sort((a, b) => b.score - a.score).slice(0, 5);
    } catch (error) {
      console.error("Error getting personalized recommendations:", error);
      return [];
    }
  }

  // Cross-sell recommendations (related products)
  private async getCrossSellRecommendations(
    productId: string,
    candidates: any[],
  ): Promise<ProductRecommendation[]> {
    try {
      const currentProduct = await this.getProductById(productId);
      if (!currentProduct || !currentProduct.category_id) return [];

      const crossSellRecs: ProductRecommendation[] = [];

      for (const candidate of candidates) {
        if (candidate.id === productId) continue;

        // Cross-sell: same category, different product
        if (candidate.category_id === currentProduct.category_id) {
          const score = this.calculateCrossSellScore(candidate, currentProduct);

          if (score > 0.4) {
            crossSellRecs.push({
              productId: candidate.id,
              score: score,
              reason: this.getCrossSellReason(candidate, currentProduct),
              type: "cross_sell",
              confidence: this.calculateConfidence(score, "cross_sell"),
            });
          }
        }
      }

      return crossSellRecs.sort((a, b) => b.score - a.score).slice(0, 3);
    } catch (error) {
      console.error("Error getting cross-sell recommendations:", error);
      return [];
    }
  }

  // Up-sell recommendations (higher-value alternatives)
  private async getUpSellRecommendations(
    productId: string,
    candidates: any[],
  ): Promise<ProductRecommendation[]> {
    try {
      const currentProduct = await this.getProductById(productId);
      if (!currentProduct) return [];

      const upSellRecs: ProductRecommendation[] = [];

      for (const candidate of candidates) {
        if (candidate.id === productId) continue;

        // Up-sell: same category, higher price or better features
        if (
          candidate.category_id === currentProduct.category_id &&
          candidate.price > currentProduct.price
        ) {
          const score = this.calculateUpSellScore(candidate, currentProduct);

          if (score > 0.3) {
            upSellRecs.push({
              productId: candidate.id,
              score: score,
              reason: this.getUpSellReason(candidate, currentProduct),
              type: "up_sell",
              confidence: this.calculateConfidence(score, "up_sell"),
            });
          }
        }
      }

      return upSellRecs.sort((a, b) => b.score - a.score).slice(0, 3);
    } catch (error) {
      console.error("Error getting up-sell recommendations:", error);
      return [];
    }
  }

  // Similarity calculation helper
  private calculateProductSimilarity(product1: any, product2: any): number {
    let score = 0;

    // Category similarity
    if (product1.category_id === product2.category_id) score += 0.4;

    // Price similarity (within 30%)
    const priceRatio = product1.price / product2.price;
    if (priceRatio >= 0.7 && priceRatio <= 1.3) score += 0.2;

    // Brand similarity
    if (product1.brand === product2.brand) score += 0.3;

    // Tags overlap
    if (product1.tags && product2.tags) {
      const commonTags = product1.tags.filter((tag: string) =>
        product2.tags.includes(tag),
      );
      score +=
        (commonTags.length /
          Math.max(product1.tags.length, product2.tags.length)) *
        0.1;
    }

    return Math.min(score, 1.0);
  }

  // Helper methods for scoring and reasoning
  private calculateCollaborativeScore(
    product: any,
    similarUsers: any[],
    currentUserId: string,
  ): number {
    // Score based on how many similar users liked this product
    const userRatings = similarUsers.filter((user) =>
      user.interactions.some(
        (interaction: any) =>
          interaction.product_id === product.product_id &&
          interaction.rating >= 4,
      ),
    );

    return Math.min(userRatings.length / similarUsers.length, 1.0);
  }

  private calculateTrendingScore(trending: any): number {
    // Score based on view and purchase counts
    const viewScore = Math.min(trending.view_count / 100, 1.0);
    const purchaseScore = Math.min(trending.purchase_count / 50, 1.0);

    return (viewScore + purchaseScore) / 2;
  }

  private calculatePersonalizationScore(
    product: any,
    preferences: any,
  ): number {
    let score = 0;

    if (preferences.categories.includes(product.category_id)) score += 0.4;
    if (preferences.brands.includes(product.brand)) score += 0.3;
    if (
      preferences.priceRange &&
      product.price >= preferences.priceRange.min &&
      product.price <= preferences.priceRange.max
    )
      score += 0.2;

    return Math.min(score, 1.0);
  }

  private calculateCrossSellScore(candidate: any, currentProduct: any): number {
    // Score based on complementary features
    let score = 0.5; // Base score for same category

    // Add points for complementary features
    if (
      currentProduct.product_type === "fertilizer" &&
      candidate.product_type === "pesticide"
    )
      score += 0.2;
    if (
      currentProduct.product_type === "seed" &&
      candidate.product_type === "fertilizer"
    )
      score += 0.2;

    return Math.min(score, 1.0);
  }

  private calculateUpSellScore(candidate: any, currentProduct: any): number {
    // Score based on upgrade potential
    const priceRatio = candidate.price / currentProduct.price;

    // Higher price indicates potential up-sell
    let score = Math.min((priceRatio - 1) * 0.5, 0.5);

    // Add points for better features/specifications
    if (candidate.specifications && currentProduct.specifications) {
      // This would compare specific features
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  private calculateConfidence(score: number, type: string): number {
    // Different confidence levels for different recommendation types
    const baseConfidence = score;

    switch (type) {
      case "similar":
        return baseConfidence * 0.9; // High confidence in similarity
      case "trending":
        return baseConfidence * 0.8; // Medium-high confidence
      case "personalized":
        return baseConfidence * 0.85; // High confidence for personalization
      case "collaborative":
        return baseConfidence * 0.75; // Medium confidence
      case "cross_sell":
        return baseConfidence * 0.8;
      case "up_sell":
        return baseConfidence * 0.7; // Lower confidence for up-sell
      default:
        return baseConfidence * 0.5;
    }
  }

  // Helper methods for reasons
  private getSimilarityReason(
    score: number,
    product1: any,
    product2: any,
  ): string {
    if (product1.category_id === product2.category_id) {
      return "Same category with similar features";
    } else if (product1.brand === product2.brand) {
      return "Same brand product";
    } else if (
      Math.abs(product1.price - product2.price) / product1.price <
      0.3
    ) {
      return "Similar price range";
    } else {
      return "Similar characteristics";
    }
  }

  private getCollaborativeReason(score: number): string {
    return `Popular with similar customers (${Math.round(score * 100)}% match)`;
  }

  private getTrendingReason(trending: any): string {
    return `${trending.view_count} views in the last week`;
  }

  private getPersonalizationReason(
    score: number,
    product: any,
    preferences: any,
  ): string {
    if (preferences.categories.includes(product.category_id)) {
      return "Matches your interests";
    } else if (preferences.brands.includes(product.brand)) {
      return "From your favorite brands";
    } else {
      return "Recommended for you";
    }
  }

  private getCrossSellReason(candidate: any, currentProduct: any): string {
    return "Complements this item";
  }

  private getUpSellReason(candidate: any, currentProduct: any): string {
    return "Premium version with better features";
  }

  // Data helper methods
  private async getCandidateProducts(
    context: RecommendationContext,
  ): Promise<any[]> {
    let query = supabase.from("products").select("*");

    if (context.category) {
      query = query.eq("category_id", context.category);
    }

    if (context.priceRange) {
      query = query
        .gte("price", context.priceRange.min)
        .lte("price", context.priceRange.max);
    }

    const { data } = await query.limit(100);
    return data || [];
  }

  private async getProductById(productId: string): Promise<any> {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    return data;
  }

  private async getProductsByIds(productIds: string[]): Promise<any[]> {
    if (productIds.length === 0) return [];

    const { data } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    return data || [];
  }

  private async getUserBehavior(userId?: string): Promise<any> {
    if (!userId) {
      return {
        views: [],
        purchases: [],
        categories: [],
        brands: [],
      };
    }

    // Get user's viewing and purchase history
    const { data: views } = await supabase
      .from("user_interactions")
      .select("product_id, interaction_type, created_at")
      .eq("user_id", userId)
      .eq("interaction_type", "view")
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: purchases } = await supabase
      .from("user_interactions")
      .select("product_id, interaction_type, created_at")
      .eq("user_id", userId)
      .eq("interaction_type", "purchase")
      .order("created_at", { ascending: false })
      .limit(20);

    return {
      views: views || [],
      purchases: purchases || [],
      categories: [],
      brands: [],
    };
  }

  private analyzeUserPreferences(userBehavior: any): any {
    const preferences = {
      categories: [],
      brands: [],
      priceRange: { min: 0, max: Infinity },
    };

    // Analyze purchase history for preferences
    for (const purchase of userBehavior.purchases) {
      // Get product details to extract preferences
      // This would involve joining with products table
    }

    return preferences;
  }

  private async findSimilarUsers(
    userId: string,
    userBehavior: any,
  ): Promise<any[]> {
    // Simplified implementation - in production, this would use more sophisticated algorithms
    return [];
  }

  private async getProductsBySimilarUsers(
    similarUsers: any[],
    currentUserId: string,
  ): Promise<any[]> {
    return [];
  }

  private sortAndLimitRecommendations(
    recommendations: ProductRecommendation[],
    limit: number,
  ): ProductRecommendation[] {
    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private generateSessionId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async logRecommendationGeneration(
    context: RecommendationContext,
    recommendations: ProductRecommendation[],
  ): Promise<void> {
    try {
      await supabase.from("recommendation_logs").insert({
        user_id: context.userId,
        context: context,
        recommendations: recommendations,
        generated_at: new Date().toISOString(),
        session_id: this.generateSessionId(),
      });
    } catch (error) {
      console.error("Error logging recommendations:", error);
    }
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();
export default RecommendationEngine;
