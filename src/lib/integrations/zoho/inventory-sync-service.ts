/**
 * Zoho Inventory Sync Service
 * Handles bi-directional inventory synchronization between Supabase and Zoho Books
 */

import { supabase } from '@/lib/supabase';
import { zohoBooksClient } from './books';
import { zohoAuth } from './auth';

export interface InventoryItem {
  id: string;
  product_id: string;
  variant_id: string;
  sku: string;
  name: string;
  stock_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  cost_price: number;
  selling_price: number;
  weight: number;
  weight_unit: string;
  last_sync_at?: string;
}

export interface ZohoInventoryItem {
  item_id?: string;
  name: string;
  sku: string;
  rate: number;
  purchase_rate?: number;
  description?: string;
  opening_stock: number;
  stock_on_hand: number;
  available_stock: number;
  actual_available_stock: number;
  reorder_level?: number;
  vendor_id?: string;
  tax_id?: string;
  tax_percentage?: number;
  tax_exemption_id?: string;
  unit: string;
  custom_fields?: Array<{
    label: string;
    value: string;
  }>;
}

export interface InventorySyncLog {
  id: string;
  variant_id: string;
  operation: 'push_to_zoho' | 'pull_from_zoho';
  supabase_quantity: number;
  zoho_quantity: number;
  difference: number;
  status: 'pending' | 'success' | 'failed';
  error_message?: string;
  sync_timestamp: string;
}

/**
 * Service for handling bi-directional inventory synchronization
 */
export class ZohoInventorySyncService {
  private readonly syncBatchSize = 50;

  /**
   * Get inventory items from Supabase with product details
   */
  private async getSupabaseInventory(limit?: number): Promise<InventoryItem[]> {
    try {
      const query = supabase
        .from('product_variants')
        .select(`
          *,
          products:products(
            id,
            name,
            segment,
            status
          )
        `)
        .eq('products.status', 'active')
        .order('updated_at', { ascending: false });

      if (limit) {
        query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch Supabase inventory: ${error.message}`);
      }

      return (data || []).map(variant => ({
        id: variant.id,
        product_id: variant.product_id,
        variant_id: variant.id,
        sku: variant.sku,
        name: variant.products?.name || 'Unknown Product',
        stock_quantity: variant.stock_quantity,
        reserved_quantity: 0, // Would need order calculations for this
        available_quantity: variant.stock_quantity,
        cost_price: variant.cost_price,
        selling_price: variant.price,
        weight: variant.weight,
        weight_unit: variant.weight_unit,
        last_sync_at: variant.updated_at,
      }));

    } catch (error) {
      console.error('[Zoho Inventory] Error getting Supabase inventory:', error);
      return [];
    }
  }

  /**
   * Get inventory items from Zoho Books
   */
  private async getZohoInventory(limit?: number): Promise<ZohoInventoryItem[]> {
    try {
      const response = await zohoBooksClient.makeRequest('/items?organization_id=' + process.env.ZOHO_BOOKS_ORG_ID);
      
      if (limit) {
        // For Zoho API, we'd need to handle pagination
        // This is a simplified version - in production, handle pagination properly
      }

      const items = response.items || [];
      
      return items.map((item: any) => ({
        item_id: item.item_id,
        name: item.name,
        sku: item.sku,
        rate: item.rate,
        purchase_rate: item.purchase_rate,
        description: item.description,
        opening_stock: item.opening_stock,
        stock_on_hand: item.stock_on_hand,
        available_stock: item.available_stock,
        actual_available_stock: item.actual_available_stock,
        reorder_level: item.reorder_level,
        vendor_id: item.vendor_id,
        tax_id: item.tax_id,
        tax_percentage: item.tax_percentage,
        unit: item.unit,
        custom_fields: item.custom_fields,
      }));

    } catch (error) {
      console.error('[Zoho Inventory] Error getting Zoho inventory:', error);
      return [];
    }
  }

  /**
   * Push inventory updates from Supabase to Zoho Books
   */
  async pushInventoryToZoho(variantId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[Zoho Inventory] Pushing variant to Zoho: ${variantId}`);

      // Get variant details from Supabase
      const { data: variant, error } = await supabase
        .from('product_variants')
        .select(`
          *,
          products:products(
            id,
            name,
            segment,
            status
          )
        `)
        .eq('id', variantId)
        .single();

      if (error || !variant) {
        throw new Error(`Failed to fetch variant: ${error?.message || 'Unknown error'}`);
      }

      if (variant.products?.status !== 'active') {
        console.log(`[Zoho Inventory] Skipping inactive product: ${variant.product_id}`);
        return { success: true }; // Not an error, just skip
      }

      // Check if item exists in Zoho Books
      const zohoInventory = await this.getZohoInventory();
      const existingZohoItem = zohoInventory.find(item => item.sku === variant.sku);

      const zohoItemData: ZohoInventoryItem = {
        name: variant.products?.name || 'Unknown Product',
        sku: variant.sku,
        rate: variant.price,
        purchase_rate: variant.cost_price,
        description: `Weight: ${variant.weight} ${variant.weight_unit}`,
        stock_on_hand: variant.stock_quantity,
        available_stock: variant.stock_quantity,
        actual_available_stock: variant.stock_quantity,
        unit: this.mapWeightUnitToZohoUnit(variant.weight_unit),
        custom_fields: [
          {
            label: 'Product ID',
            value: variant.product_id
          },
          {
            label: 'Variant ID', 
            value: variant.id
          },
          {
            label: 'Segment',
            value: variant.products?.segment || 'unknown'
          },
          {
            label: 'Source',
            value: 'Supabase'
          }
        ]
      };

      let result;
      if (existingZohoItem) {
        // Update existing item
        console.log(`[Zoho Inventory] Updating existing item: ${existingZohoItem.item_id}`);
        result = await zohoBooksClient.makeRequest(`/items/${existingZohoItem.item_id}`, {
          method: 'PUT',
          body: JSON.stringify({
            JSONString: JSON.stringify(zohoItemData)
          }),
        });
      } else {
        // Create new item
        console.log(`[Zoho Inventory] Creating new item: ${variant.sku}`);
        result = await zohoBooksClient.makeRequest('/items', {
          method: 'POST',
          body: JSON.stringify({
            JSONString: JSON.stringify([zohoItemData])
          }),
        });
      }

      if (result.code === 0) {
        const updatedItem = result.item || result.items?.[0];
        
        // Update variant with Zoho Books ID
        await supabase
          .from('product_variants')
          .update({ 
            zoho_books_id: updatedItem.item_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', variantId);

        // Log successful sync
        await this.logInventorySync({
          variant_id: variantId,
          operation: 'push_to_zoho',
          supabase_quantity: variant.stock_quantity,
          zoho_quantity: updatedItem.stock_on_hand || variant.stock_quantity,
          difference: 0,
          status: 'success'
        });

        console.log(`[Zoho Inventory] Successfully pushed to Zoho: ${variant.sku} -> ID: ${updatedItem.item_id}`);
        return { success: true };
      } else {
        throw new Error(result.message || 'Failed to update Zoho inventory');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho Inventory] Failed to push to Zoho:', errorMessage);
      
      // Log failed sync
      await this.logInventorySync({
        variant_id: variantId,
        operation: 'push_to_zoho',
        supabase_quantity: 0,
        zoho_quantity: 0,
        difference: 0,
        status: 'failed',
        error_message: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Pull inventory updates from Zoho Books to Supabase
   */
  async pullInventoryFromZoho(variantId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[Zoho Inventory] Pulling variant from Zoho: ${variantId}`);

      // Get variant from Supabase to find the corresponding Zoho item
      const { data: variant, error } = await supabase
        .from('product_variants')
        .select('id, sku, zoho_books_id')
        .eq('id', variantId)
        .single();

      if (error || !variant) {
        throw new Error(`Failed to fetch variant: ${error?.message || 'Unknown error'}`);
      }

      if (!variant.zoho_books_id) {
        console.log(`[Zoho Inventory] Variant not synced to Zoho yet: ${variantId}`);
        return { success: true }; // Not an error, just skip
      }

      // Get specific item from Zoho Books
      const result = await zohoBooksClient.makeRequest(`/items/${variant.zoho_books_id}`);

      if (result.code === 0 && result.item) {
        const zohoItem = result.item;
        
        // Update stock quantity in Supabase
        await supabase
          .from('product_variants')
          .update({ 
            stock_quantity: zohoItem.stock_on_hand,
            updated_at: new Date().toISOString()
          })
          .eq('id', variantId);

        // Log successful sync
        await this.logInventorySync({
          variant_id: variantId,
          operation: 'pull_from_zoho',
          supabase_quantity: 0, // We don't know the previous value
          zoho_quantity: zohoItem.stock_on_hand,
          difference: 0,
          status: 'success'
        });

        console.log(`[Zoho Inventory] Successfully pulled from Zoho: ${variant.sku} -> Stock: ${zohoItem.stock_on_hand}`);
        return { success: true };
      } else {
        throw new Error(result.message || 'Failed to fetch Zoho inventory');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho Inventory] Failed to pull from Zoho:', errorMessage);
      
      // Log failed sync
      await this.logInventorySync({
        variant_id: variantId,
        operation: 'pull_from_zoho',
        supabase_quantity: 0,
        zoho_quantity: 0,
        difference: 0,
        status: 'failed',
        error_message: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Batch push inventory updates
   */
  async batchPushToZoho(): Promise<{ success: boolean; processed: number; errors: number }> {
    try {
      console.log('[Zoho Inventory] Starting batch push to Zoho...');

      // Get variants that need syncing (recently updated or not synced)
      const { data: variants, error } = await supabase
        .from('product_variants')
        .select(`
          id,
          sku,
          stock_quantity,
          price,
          cost_price,
          weight,
          weight_unit,
          updated_at,
          zoho_books_id,
          products:products(
            id,
            name,
            segment,
            status
          )
        `)
        .eq('products.status', 'active')
        .or(
          'zoho_books_id.is.null',
          'updated_at.gt.zoho_books_sync', // Assuming we add a sync timestamp field
        )
        .limit(this.syncBatchSize);

      if (error) {
        throw new Error(`Failed to fetch variants for batch push: ${error.message}`);
      }

      if (!variants || variants.length === 0) {
        console.log('[Zoho Inventory] No variants to push');
        return { success: true, processed: 0, errors: 0 };
      }

      let processed = 0;
      let errors = 0;

      for (const variant of variants) {
        const result = await this.pushInventoryToZoho(variant.id);
        if (result.success) {
          processed++;
        } else {
          errors++;
        }
      }

      console.log(`[Zoho Inventory] Batch push completed: ${processed} processed, ${errors} errors`);

      return { success: true, processed, errors };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho Inventory] Error in batch push to Zoho:', errorMessage);
      return { success: false, processed: 0, errors: 1 };
    }
  }

  /**
   * Map weight units from Supabase to Zoho Books format
   */
  private mapWeightUnitToZohoUnit(supabaseUnit: string): string {
    const unitMap: { [key: string]: string } = {
      'g': 'grams',
      'kg': 'kilograms',
      'ml': 'milliliters', 
      'l': 'liters',
    };

    return unitMap[supabaseUnit] || 'units';
  }

  /**
   * Log inventory synchronization operations
   */
  private async logInventorySync(syncData: Partial<InventorySyncLog>): Promise<void> {
    try {
      await supabase.from('zoho_inventory_sync_logs').insert({
        ...syncData,
        sync_timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[Zoho Inventory] Failed to log inventory sync:', error);
    }
  }

  /**
   * Get inventory sync statistics
   */
  async getInventorySyncStats(): Promise<{
    totalSyncs: number;
    pushCount: number;
    pullCount: number;
    successCount: number;
    failedCount: number;
    lastSyncAt: string | null;
  }> {
    try {
      const { data: logs, error } = await supabase
        .from('zoho_inventory_sync_logs')
        .select('*')
        .gte('sync_timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('sync_timestamp', { ascending: false })
        .limit(1);

      if (error) {
        throw new Error(`Failed to fetch inventory sync stats: ${error.message}`);
      }

      const allLogs = logs || [];
      const stats = {
        totalSyncs: allLogs.length,
        pushCount: allLogs.filter(log => log.operation === 'push_to_zoho').length,
        pullCount: allLogs.filter(log => log.operation === 'pull_from_zoho').length,
        successCount: allLogs.filter(log => log.status === 'success').length,
        failedCount: allLogs.filter(log => log.status === 'failed').length,
        lastSyncAt: allLogs.length > 0 ? allLogs[0].sync_timestamp : null,
      };

      return stats;

    } catch (error) {
      console.error('[Zoho Inventory] Error getting inventory sync stats:', error);
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
   * Create inventory sync log table (call this during setup)
   */
  async createInventorySyncLogTable(): Promise<void> {
    try {
      const { error } = await supabase.rpc('create_inventory_sync_log_table', {});
      if (error) {
        console.error('[Zoho Inventory] Failed to create inventory sync log table:', error);
      }
    } catch (error) {
      console.error('[Zoho Inventory] Error creating inventory sync log table:', error);
    }
  }
}

// Export singleton instance
export const zohoInventorySyncService = new ZohoInventorySyncService();
export default zohoInventorySyncService;