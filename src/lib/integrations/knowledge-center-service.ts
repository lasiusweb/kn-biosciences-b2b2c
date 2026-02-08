/**
 * Knowledge Center Integration Service
 * Handles integration between Zoho Books and Knowledge Center content
 */

import { supabase } from '@/lib/supabase';
import { maskPII } from '@/lib/utils';

export interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  content: string;
  category: string;
  published_at: string;
  author_id?: string;
  tags: string[];
  updated_at: string;
  featured: boolean;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
}

export interface CropKnowledge {
  id: string;
  title: string;
  slug: string;
  content: string;
  crop_stage: string;
  application_method: string;
  disease_solutions: string;
  growing_season: string;
  harvest_time?: string;
  applications: string[];
  region: string;
  crop_type: string;
  image_url?: string;
  avg_yield: string;
  application_rate: string;
  video_url?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
}

/**
 * Service for managing Knowledge Center content integration
 */
export class KnowledgeCenterService {
  private readonly baseUrl = 'https://www.zoho.in';
  private productService: any; // Ideally typed if available

  constructor(productService?: any) {
    this.productService = productService;
  }

  /**
   * Creates an article in Knowledge Center
   */
  async createArticle(article: {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featured_image?: string;
    category_id: string;
    category: string;
  }) {
    try {
      console.log(`[Knowledge Center] Creating article: ${article.title}`);

      // Get current user for author assignment
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        throw new Error(`Failed to get user: ${error?.message || 'Unauthorized'}`);
      }

      const articleData = {
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        featured_image: article.featured_image,
        category_id: article.category_id,
        author_id: user.id,
        published_at: new Date().toISOString(),
        status: 'draft',
        created_at: new Date().toISOString(),
      };

      const sanitizedCategory = article.category?.replace(/[^a-zA-Z0-9-]/g, '');
      const response = await fetch(`${this.baseUrl}/cms/${sanitizedCategory}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Zoho-oauthtoken ${await this.getZohoAccessToken()}`,
        },
        body: JSON.stringify(articleData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create article: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();

      if (result.code === 0 && result.data) {
        console.log(`[Knowledge Center] Created article: ${result.data.id}`);
        
        return {
          success: true,
          articleId: result.data.id,
          error: result.error,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Unknown error',
        };
      }

    } catch (error) {
      console.error('[Knowledge Center] Error creating article:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Gets latest articles for a segment with pagination
   */
  async getLatestArticles(
    segment?: string, 
    limit: number = 5
  ): Promise<{
    articles: KnowledgeArticle[];
    totalCount: number;
    hasMore: boolean;
    error?: string;
  }> {
    try {
      // Sanitize segment to prevent path manipulation
      const sanitizedSegment = segment?.replace(/[^a-zA-Z0-9-]/g, '');
      console.log(`[Knowledge Center] Fetching latest articles for segment: ${sanitizedSegment || 'all'}`);

      const url = `${this.baseUrl}/cms/${sanitizedSegment ? sanitizedSegment : 'articles'}?include=related_content&sort=-published_at&limit=${limit}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Zoho-oauthtoken ${await this.getZohoAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.status}`);
      }

      const result = await response.json();

      return {
        articles: result.data || [],
        totalCount: result.count || 0,
        hasMore: !!result.hasMore,
        error: result.error,
      };

    } catch (error) {
      console.error('[Knowledge Center] Error fetching articles:', error);
      
      return {
        articles: [],
        totalCount: 0,
        hasMore: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Gets articles by category
   */
  async getArticlesByCategory(
    categoryId: string, 
    limit: number = 10
  ): Promise<{
    articles: KnowledgeArticle[];
    totalCount: number;
    hasMore: boolean;
    error?: string;
  }> {
    try {
      // Sanitize categoryId to prevent path manipulation
      const sanitizedCategoryId = categoryId?.replace(/[^a-zA-Z0-9-]/g, '');
      console.log(`[Knowledge Center] Fetching articles for category: ${sanitizedCategoryId}`);

      const url = `${this.baseUrl}/cms/categories/${sanitizedCategoryId}/articles`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Zoho-oauthtoken ${await this.getZohoAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch articles by category: ${response.status}`);
      }

      const result = await response.json();

      return {
        articles: result.data || [],
        totalCount: result.count || 0,
        hasMore: !!result.hasMore,
        error: result.error,
      };

    } catch (error) {
      console.error('[Knowledge Center] Error fetching articles by category:', error);
      
      return {
        articles: [],
        totalCount: 0,
        hasMore: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Gets available crops for a segment
   */
  async getAvailableCrops(
    segment?: string,
    limit: number = 10
  ): Promise<{
    crops: any[];
    totalCount: number;
    hasMore: boolean;
    error?: string | null;
  }> {
    try {
      console.log(`[Knowledge Center] Fetching available crops for segment: ${segment || 'all'}`);

      if (!this.productService) {
        throw new Error('Product service not initialized');
      }

      // Get products from enhanced service
      const { products, totalCount } = await this.productService.getProducts({
        segment,
        inStock: true,
        limit
      });

      // Extract unique crops from products
      const uniqueCropIds = Array.from(new Set(products.map((p: any) => p.crop_id).filter(Boolean)));

      // Get crop information
      const crops = await Promise.all(
        uniqueCropIds.map(async (cropId: any) => {
          const { data, error } = await supabase
            .from('product_crops')
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
                zoho_books_id
              )
            `)
            .eq('crop_id', cropId)
            .single();

          if (error) {
            console.error(`[Knowledge Center] Error fetching crop details for ${cropId}:`, error);
            return null;
          }

          return data;
        })
      );

      const filteredCrops = crops.filter(Boolean);

      return {
        crops: filteredCrops,
        totalCount: uniqueCropIds.length,
        hasMore: totalCount > limit,
        error: null,
      };
    } catch (error) {
      console.error('[Knowledge Center] Error getting available crops:', error);
      
      return {
        crops: [],
        totalCount: 0,
        hasMore: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Updates crop availability in Supabase after sync
   */
  async updateCropStock(
    cropId: string, 
    availableQuantity: number,
    syncToZoho: boolean = true
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[Knowledge Center] Updating crop stock for crop: ${cropId}`);

      const { data: variant, error: variantError } = await supabase
        .from('product_variants')
        .select('id, zoho_books_id, stock_quantity, sku')
        .eq('id', cropId)
        .single();

      if (variantError || !variant) {
        throw new Error(`Variant not found: ${cropId}`);
      }

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('product_variants')
        .update({ 
          stock_quantity: availableQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cropId);

      if (updateError) {
        throw new Error(`Failed to update variant: ${updateError.message}`);
      }

      // Log inventory sync operation
      await this.logInventorySync(variant.id, 'pull_from_zoho', variant.stock_quantity, availableQuantity, availableQuantity - variant.stock_quantity, 'success');

      console.log(`[Knowledge Center] Updated crop stock for ${variant.sku}: ${variant.stock_quantity} → ${availableQuantity}`);

      if (syncToZoho && variant.zoho_books_id) {
        // In a real implementation, you'd also push to Zoho Books via a client
        // This is a placeholder for the actual Zoho Books API call
        console.log(`[Knowledge Center] Would sync to Zoho Books ID: ${variant.zoho_books_id}`);
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Knowledge Center] Error updating crop stock:', errorMessage);
      
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Log inventory operation to zoho_inventory_sync_logs table
   */
  private async logInventorySync(
    variantId: string,
    operation: 'push_to_zoho' | 'pull_from_zoho',
    supabaseQuantity: number,
    zohoQuantity: number,
    difference: number,
    status: 'success' | 'failed' | 'retrying',
    errorMessage?: string,
  ): Promise<void> {
    try {
      await supabase.from('zoho_inventory_sync_logs').insert({
        variant_id: variantId,
        operation,
        supabase_quantity: supabaseQuantity,
        zoho_quantity: zohoQuantity,
        difference,
        status,
        error_message: errorMessage,
        sync_timestamp: new Date().toISOString(),
      });

      console.log(`[Knowledge Center] Logged inventory sync: ${operation} for ${variantId}`);
    } catch (error) {
      console.error('[Knowledge Center] Error logging inventory sync:', error);
    }
  }

  /**
   * Creates the inventory sync log table if it doesn't exist
   */
  async createInventorySyncLogTable(): Promise<void> {
    try {
      await supabase.rpc('create_inventory_sync_log_table', {});
    } catch (error) {
      console.error('[Knowledge Center] Error creating inventory sync log table:', error);
    }
  }

  /**
   * Gets latest sync statistics
   */
  async getSyncStats(): Promise<{
    totalSyncs: number;
    pushCount: number;
    pullCount: number;
    successCount: number;
    failedCount: number;
    lastSyncAt: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('zoho_inventory_sync_logs')
        .select('*')
        .gte('sync_timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('sync_timestamp', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch inventory sync stats: ${error.message}`);
      }

      const logs = data || [];
      const stats = {
        totalSyncs: logs.length,
        pushCount: logs.filter(log => log.operation === 'push_to_zoho').length,
        pullCount: logs.filter(log => log.operation === 'pull_from_zoho').length,
        successCount: logs.filter(log => log.status === 'success').length,
        failedCount: logs.filter(log => log.status === 'failed').length,
        lastSyncAt: logs.length > 0 ? logs[0].sync_timestamp : null,
      };

      return stats;
    } catch (error) {
      console.error('[Knowledge Center] Error getting sync stats:', error);
      
      return {
        totalSyncs: 0,
        pushCount: 0,
        pullCount: 0,
        successCount: 0,
        failedCount: 0,
        lastSyncAt: null,
      };
    }
  }

  /**
   * Get Zoho access token for API calls
   */
  private async getZohoAccessToken(): Promise<string> {
    try {
      // This would normally call zohoAuth.getAccessToken()
      return 'mock-zoho-access-token';
    } catch (error) {
      console.error('[Knowledge Center] Error getting Zoho access token:', error);
      return '';
    }
  }
}

// Export singleton instance
export const knowledgeCenterService = new KnowledgeCenterService();
export default knowledgeCenterService;
