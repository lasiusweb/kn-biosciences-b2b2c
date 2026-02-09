import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

export interface PurchaseHistoryItem {
  id: string;
  order_id: string;
  order_number: string;
  product_id: string;
  product_name: string;
  variant_id: string;
  variant_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  purchased_at: string;
  order_status: string;
}

export interface PurchasePattern {
  product_id: string;
  product_name: string;
  total_purchases: number;
  total_quantity: number;
  total_spent: number;
  first_purchase: string;
  last_purchase: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'occasional';
  average_interval_days: number;
}

export interface UsageHistory {
  viewed_products: Array<{
    id: string;
    name: string;
    last_viewed: string;
    view_count: number;
  }>;
  cart_additions: Array<{
    id: string;
    name: string;
    added_to_cart_count: number;
    last_added: string;
  }>;
  purchase_frequency: PurchasePattern[];
  seasonal_patterns: Array<{
    month: string;
    total_spent: number;
    order_count: number;
  }>;
  preferred_categories: Array<{
    category_id: string;
    category_name: string;
    purchase_count: number;
    total_spent: number;
  }>;
  preferred_segments: Array<{
    segment: string;
    purchase_count: number;
    total_spent: number;
  }>;
}

export class UsageHistoryService {
  /**
   * Gets a user's purchase history
   */
  static async getPurchaseHistory(userId: string, limit: number = 20): Promise<PurchaseHistoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          variant_id,
          quantity,
          unit_price,
          total_price,
          orders!inner (
            order_number,
            status,
            created_at
          ),
          product_variants!inner (
            sku,
            products!inner (
              id,
              name
            )
          )
        `)
        .eq('orders.user_id', userId)
        .order('orders.created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching purchase history:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      return data.map(item => ({
        id: item.id,
        order_id: item.order_id,
        order_number: item.orders.order_number,
        product_id: item.product_variants.products.id,
        product_name: item.product_variants.products.name,
        variant_id: item.variant_id,
        variant_sku: item.product_variants.sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        purchased_at: item.orders.created_at,
        order_status: item.orders.status
      }));
    } catch (error) {
      console.error('Error getting purchase history:', error);
      return [];
    }
  }

  /**
   * Gets purchase patterns for a user
   */
  static async getPurchasePatterns(userId: string): Promise<PurchasePattern[]> {
    try {
      // Get all order items for the user
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          product_variants!inner (
            products!inner (
              id,
              name
            )
          ),
          quantity,
          unit_price,
          total_price,
          orders!inner (
            created_at
          )
        `)
        .eq('orders.user_id', userId)
        .order('orders.created_at', { ascending: true });

      if (error) {
        console.error('Error fetching purchase patterns:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      // Group by product
      const productGroups: Record<string, PurchaseHistoryItem[]> = {};
      data.forEach(item => {
        const productId = item.product_variants.products.id;
        if (!productGroups[productId]) {
          productGroups[productId] = [];
        }

        productGroups[productId].push({
          id: item.id,
          order_id: item.order_id,
          order_number: item.orders.order_number,
          product_id: productId,
          product_name: item.product_variants.products.name,
          variant_id: item.variant_id,
          variant_sku: item.product_variants.sku,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          purchased_at: item.orders.created_at,
          order_status: item.orders.status
        });
      });

      // Calculate patterns for each product
      const patterns: PurchasePattern[] = [];
      for (const [productId, items] of Object.entries(productGroups)) {
        const firstPurchase = new Date(items[0].purchased_at);
        const lastPurchase = new Date(items[items.length - 1].purchased_at);
        
        // Calculate average interval between purchases
        let totalIntervalDays = 0;
        let intervalsCount = 0;
        
        for (let i = 1; i < items.length; i++) {
          const prevDate = new Date(items[i - 1].purchased_at);
          const currDate = new Date(items[i].purchased_at);
          const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          totalIntervalDays += diffDays;
          intervalsCount++;
        }
        
        const averageIntervalDays = intervalsCount > 0 ? totalIntervalDays / intervalsCount : 0;
        
        // Determine frequency based on average interval
        let frequency: PurchasePattern['frequency'] = 'occasional';
        if (averageIntervalDays <= 1) frequency = 'daily';
        else if (averageIntervalDays <= 7) frequency = 'weekly';
        else if (averageIntervalDays <= 30) frequency = 'monthly';
        else if (averageIntervalDays <= 90) frequency = 'quarterly';
        else if (averageIntervalDays <= 365) frequency = 'yearly';

        patterns.push({
          product_id: productId,
          product_name: items[0].product_name,
          total_purchases: items.length,
          total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
          total_spent: items.reduce((sum, item) => sum + item.total_price, 0),
          first_purchase: firstPurchase.toISOString(),
          last_purchase: lastPurchase.toISOString(),
          frequency,
          average_interval_days: averageIntervalDays
        });
      }

      return patterns;
    } catch (error) {
      console.error('Error getting purchase patterns:', error);
      return [];
    }
  }

  /**
   * Gets user's product viewing history
   */
  static async getViewingHistory(userId: string, limit: number = 20): Promise<UsageHistory['viewed_products']> {
    try {
      const { data, error } = await supabase
        .from('user_interactions')
        .select(`
          product_id,
          interaction_type,
          created_at,
          products!inner (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .eq('interaction_type', 'view')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching viewing history:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      // Group by product and count views
      const viewCounts: Record<string, { name: string; last_viewed: string; count: number }> = {};
      
      data.forEach(interaction => {
        const productId = interaction.product_id;
        if (!viewCounts[productId]) {
          viewCounts[productId] = {
            name: interaction.products.name,
            last_viewed: interaction.created_at,
            count: 0
          };
        }
        
        viewCounts[productId].count++;
        if (new Date(interaction.created_at) > new Date(viewCounts[productId].last_viewed)) {
          viewCounts[productId].last_viewed = interaction.created_at;
        }
      });

      return Object.entries(viewCounts).map(([id, details]) => ({
        id,
        name: details.name,
        last_viewed: details.last_viewed,
        view_count: details.count
      }));
    } catch (error) {
      console.error('Error getting viewing history:', error);
      return [];
    }
  }

  /**
   * Gets user's cart addition history
   */
  static async getCartHistory(userId: string, limit: number = 20): Promise<UsageHistory['cart_additions']> {
    try {
      const { data, error } = await supabase
        .from('user_interactions')
        .select(`
          product_id,
          interaction_type,
          created_at,
          products!inner (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .eq('interaction_type', 'add_to_cart')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching cart history:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      // Group by product and count additions
      const additionCounts: Record<string, { name: string; last_added: string; count: number }> = {};
      
      data.forEach(interaction => {
        const productId = interaction.product_id;
        if (!additionCounts[productId]) {
          additionCounts[productId] = {
            name: interaction.products.name,
            last_added: interaction.created_at,
            count: 0
          };
        }
        
        additionCounts[productId].count++;
        if (new Date(interaction.created_at) > new Date(additionCounts[productId].last_added)) {
          additionCounts[productId].last_added = interaction.created_at;
        }
      });

      return Object.entries(additionCounts).map(([id, details]) => ({
        id,
        name: details.name,
        added_to_cart_count: details.count,
        last_added: details.last_added
      }));
    } catch (error) {
      console.error('Error getting cart history:', error);
      return [];
    }
  }

  /**
   * Gets seasonal purchasing patterns
   */
  static async getSeasonalPatterns(userId: string): Promise<UsageHistory['seasonal_patterns']> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          total_amount,
          created_at
        `)
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()) // Last year
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching seasonal patterns:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      // Group by month
      const monthlyData: Record<string, { total_spent: number; order_count: number }> = {};
      
      data.forEach(order => {
        const date = new Date(order.created_at);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { total_spent: 0, order_count: 0 };
        }
        
        monthlyData[monthYear].total_spent += order.total_amount;
        monthlyData[monthYear].order_count++;
      });

      return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        total_spent: data.total_spent,
        order_count: data.order_count
      }));
    } catch (error) {
      console.error('Error getting seasonal patterns:', error);
      return [];
    }
  }

  /**
   * Gets preferred categories based on purchase history
   */
  static async getPreferredCategories(userId: string): Promise<UsageHistory['preferred_categories']> {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          total_price,
          product_variants!inner (
            products!inner (
              id,
              name,
              category_id,
              categories!inner (
                id,
                name
              )
            )
          ),
          orders!inner (
            user_id
          )
        `)
        .eq('orders.user_id', userId);

      if (error) {
        console.error('Error fetching preferred categories:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      // Group by category
      const categoryData: Record<string, { name: string; purchase_count: number; total_spent: number }> = {};
      
      data.forEach(item => {
        const categoryId = item.product_variants.products.categories.id;
        const categoryName = item.product_variants.products.categories.name;
        
        if (!categoryData[categoryId]) {
          categoryData[categoryId] = { name: categoryName, purchase_count: 0, total_spent: 0 };
        }
        
        categoryData[categoryId].purchase_count++;
        categoryData[categoryId].total_spent += item.total_price;
      });

      return Object.entries(categoryData)
        .map(([category_id, data]) => ({
          category_id,
          category_name: data.name,
          purchase_count: data.purchase_count,
          total_spent: data.total_spent
        }))
        .sort((a, b) => b.total_spent - a.total_spent); // Sort by spending
    } catch (error) {
      console.error('Error getting preferred categories:', error);
      return [];
    }
  }

  /**
   * Gets preferred segments based on purchase history
   */
  static async getPreferredSegments(userId: string): Promise<UsageHistory['preferred_segments']> {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          total_price,
          product_variants!inner (
            products!inner (
              id,
              name,
              segment
            )
          ),
          orders!inner (
            user_id
          )
        `)
        .eq('orders.user_id', userId);

      if (error) {
        console.error('Error fetching preferred segments:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      // Group by segment
      const segmentData: Record<string, { purchase_count: number; total_spent: number }> = {};
      
      data.forEach(item => {
        const segment = item.product_variants.products.segment;
        
        if (!segmentData[segment]) {
          segmentData[segment] = { purchase_count: 0, total_spent: 0 };
        }
        
        segmentData[segment].purchase_count++;
        segmentData[segment].total_spent += item.total_price;
      });

      return Object.entries(segmentData)
        .map(([segment, data]) => ({
          segment,
          purchase_count: data.purchase_count,
          total_spent: data.total_spent
        }))
        .sort((a, b) => b.total_spent - a.total_spent); // Sort by spending
    } catch (error) {
      console.error('Error getting preferred segments:', error);
      return [];
    }
  }

  /**
   * Gets complete usage history for a user
   */
  static async getUsageHistory(userId: string): Promise<UsageHistory> {
    const [
      viewedProducts,
      cartAdditions,
      purchaseFrequency,
      seasonalPatterns,
      preferredCategories,
      preferredSegments
    ] = await Promise.all([
      this.getViewingHistory(userId),
      this.getCartHistory(userId),
      this.getPurchasePatterns(userId),
      this.getSeasonalPatterns(userId),
      this.getPreferredCategories(userId),
      this.getPreferredSegments(userId)
    ]);

    return {
      viewed_products: viewedProducts,
      cart_additions: cartAdditions,
      purchase_frequency: purchaseFrequency,
      seasonal_patterns: seasonalPatterns,
      preferred_categories: preferredCategories,
      preferred_segments: preferredSegments
    };
  }

  /**
   * Gets product recommendations based on usage history
   */
  static async getHistoryBasedRecommendations(userId: string, limit: number = 10): Promise<Product[]> {
    try {
      // Get user's viewing and cart history
      const [viewedProducts, cartAdditions, purchasePatterns] = await Promise.all([
        this.getViewingHistory(userId, 20),
        this.getCartHistory(userId, 20),
        this.getPurchasePatterns(userId)
      ]);

      // Combine all product IDs from history
      const allProductIds = [
        ...viewedProducts.map(p => p.id),
        ...cartAdditions.map(p => p.id),
        ...purchasePatterns.map(p => p.product_id)
      ];

      // Get unique product IDs
      const uniqueProductIds = [...new Set(allProductIds)];

      // Fetch product details
      if (uniqueProductIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', uniqueProductIds)
        .limit(limit);

      if (error) {
        console.error('Error fetching history-based recommendations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting history-based recommendations:', error);
      return [];
    }
  }

  /**
   * Records a product view for analytics
   */
  static async recordProductView(userId: string, productId: string): Promise<void> {
    try {
      await supabase
        .from('user_interactions')
        .insert({
          user_id: userId,
          product_id: productId,
          interaction_type: 'view',
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error recording product view:', error);
    }
  }

  /**
   * Records a product addition to cart for analytics
   */
  static async recordCartAddition(userId: string, productId: string): Promise<void> {
    try {
      await supabase
        .from('user_interactions')
        .insert({
          user_id: userId,
          product_id: productId,
          interaction_type: 'add_to_cart',
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error recording cart addition:', error);
    }
  }
}