/**
 * Knowledge Center Integration Service
 * Handles integration between Zoho Books and Knowledge Center content
 */

import { supabase } from '@/lib/supabase';

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
  crop_stage: string;
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

  /**
   * Creates an article in Knowledge Center
   */
  async createArticle(article: {
    try {
      console.log(`[Knowledge Center] Creating article: ${article.title}`);

      // Get current user for author assignment
      const { data: authorData, error } = await supabase.auth.getUser();
      if (error || !authorData) {
        throw new Error(`Failed to get user: ${error.message}`);
      }

      const articleData = {
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        featured_image: article.featured_image,
        category_id: article.category_id,
        author_id: authorData.id,
        published_at: new Date().toISOString(),
        status: 'draft',
        created_at: new Date().toISOString(),
      };

      const response = await fetch(`${this.baseUrl}/cms/${article.category}/articles`, {
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
  }> {
    try {
      console.log(`[Knowledge Center] Fetching latest articles for segment: ${segment || 'all'}`);

      const url = `${this.baseUrl}/cms/${segment ? segment : 'articles'}?include=related_content&sort=-published_at&limit=${limit}`;

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
        hasMore: result.hasMore,
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
  }> {
    try {
      console.log(`[Knowledge Center] Fetching articles for category: ${categoryId}`);

      const url = `${this.baseUrl}/cms/categories/${categoryId}/articles`;

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
        hasMore: result.hasMore,
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
    crops: CropKnowledge[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      console.log(`[Knowledge Center] Fetching available crops for segment: ${segment || 'all'}`);

      // Get products from enhanced service
      const { products, totalCount } = await this.productService.getProducts({
        segment,
        inStock: true
      });

      // Extract unique crops from products
      const uniqueCrops = Array.from(new Map(
        products.map(p => `${p.crop_id}-${p.sku}`)
      );

      const availableCrops = uniqueCrops.filter(crop => crop.stock_quantity > 0);

      // Get crop information
      const cropPromises = await Promise.all(
        availableCrops.map(async (crop) => {
          const { data, error } = await supabase
            .from('product_crops')
            .select(`
              *,
              product_crops!inner(
                id,
                crop_id,
                crop_name,
                sku,
                image_urls,
                zoho_books_id
              )
            `)
            .eq('crop_id', crop.crop_id)
            .single();

          if (error) {
            console.error('[Knowledge Center] Error fetching crop details:', error);
            return {
              crops: [],
              totalCount: 0,
              hasMore: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }

          const cropData = data?.[0];

          if (!cropData) {
            return {
              id: crop.crop_id,
              crop_name: crop.crop_name,
              sku: crop.sku,
              image_urls: crop.image_urls,
              zoho_books_id: crop.zoho_books_id,
              stock_quantity: crop.stock_quantity,
              cost_price: crop.cost_price,
              weight: crop.weight,
              weight_unit: crop.weight_unit,
              available_quantity: crop.stock_quantity,
              product_variants: [],
              crop_id: crop.product_id,
              product_variants!inner(
                id,
                id: product_variants.id,
                sku: product_variants.sku,
                name: product_variants.name,
                price: product_variants.price,
                stock_quantity: product_variants.stock_quantity,
                weight: product_variants.weight,
                weight_unit: product_variants.weight_unit,
                image_urls: product_variants.image_urls,
                zoho_books_id: product_variants.zoho_books_id,
              cost_price: product_variants.cost_price,
              selling_price: product_variants.price,
                available_quantity: product_variants.stock_quantity,
                unit: product_variants.weight_unit,
              last_sync_at: product_variants.updated_at,
              created_at: product_variants.created_at,
              status: product_variants.status,
          }
            }),
            error: null,
          };

          return cropData;
        });

        const result = await Promise.all(availableCrops);

        return {
          crops: result,
          totalCount: uniqueCrops.length,
          hasMore: result.hasMore,
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

      const variant = await supabase
        .from('product_variants')
        .select('zoho_books_id, stock_quantity')
        .eq('id', cropId)
        .single();

      if (!variant) {
        throw new Error(`Variant not found: ${cropId}`);
      }

      const { error } = await supabase
        .from('zoho_inventory_sync_logs')
        .select('*')
        .eq('variant_id', cropId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch variant: ${error.message}`);
      }

      // Update in Supabase
      const { error } = await supabase
        .from('product_variants')
        .update({ 
          stock_quantity: availableQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cropId);

      if (error) {
        throw new Error(`Failed to update variant: ${error.message}`);
      }

      // Log inventory sync operation
      await this.logInventorySync(variantId, 'pull_from_zoho', availableQuantity, variant.stock_quantity, availableQuantity, 0);

      console.log(`[Knowledge Center] Updated crop stock: ${availableQuantity} → ${availableQuantity} (logged to Zoho)`);

      if (syncToZoho) {
        // In a real implementation, you'd also push to Zoho Books
        const zohoResult = await zohoBooksClient.makeRequest('/items/' + variant.zoho_books_id, {
          method: 'PUT',
          body: JSON.stringify({
            stock_on_hand: availableQuantity,
            available_stock: availableQuantity,
            actual_available_stock: availableQuantity,
          }),
          });
        
        if (zohoResult.code === 0 && zohoResult.item) {
          // Update in Supabase
          const { error } = await supabase
            .from('product_variants')
            .update({ 
              stock_quantity: availableQuantity,
              zoho_books_id: 'updated-zoho-id',
              updated_at: new Date().toISOString(),
            })
            .eq('id', variantId);

          console.log(`[Knowledge Center] Synced crop stock to Zoho Books: ${variant.sku}`);
          return { success: true };
        } else {
          const errorMessage = zohoResult.message || 'Unknown Zoho Books error';
          console.error('[Knowledge Center] Failed to sync crop to Zoho Books:', errorMessage);
          
          return { success: false, error: errorMessage };
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Knowledge Center] Error updating crop stock:', errorMessage);
      
      return { success: false, error: errorMessage };
    }
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
        variant_id,
        operation,
        supabase_quantity,
        zoho_quantity,
        zoho_quantity,
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
        .gte('sync_timestamp', new Date(Date.now() - 24 * 60 * 1000).toISOString())
        .order('sync_timestamp', { ascending: false })
        .limit(1);

      if (error) {
        throw new Error(`Failed to fetch inventory sync stats: ${error.message}`);
      }

      const logs = data || [];
      const stats = {
        totalSyncs: logs.length || 0,
        pushCount: logs.filter(log => log.operation === 'push_to_zoho').length,
        pullCount: logs.filter(log => log.operation === 'pull_from_zoho').length,
        successCount: logs.filter(log => log.status === 'success').length,
        failedCount: logs.filter(log => log.status === 'failed').length,
        lastSyncAt: logs.length > 0 ? logs[0].sync_timestamp : null,
      };

      return {
        totalSyncs,
        pushCount,
        pullCount,
        successCount,
        failedCount,
        lastSyncAt,
      };
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
}

/**
 * Get Zoho access token for API calls
 */
  private async getZohoAccessToken(): Promise<string> {
  try {
      console.log('[Knowledge Center] Getting Zoho access token...');

      // For now, return a mock token
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