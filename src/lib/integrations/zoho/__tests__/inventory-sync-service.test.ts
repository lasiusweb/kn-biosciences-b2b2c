/**
 * Unit tests for Zoho Inventory Sync Service
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { zohoInventorySyncService } from '../inventory-sync-service';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

jest.mock('../books', () => ({
  zohoBooksClient: {
    makeRequest: jest.fn(),
  },
}));

jest.mock('../auth', () => ({
  zohoAuth: {
    getAccessToken: jest.fn(),
  },
}));

describe('ZohoInventorySyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variables
    process.env.ZOHO_BOOKS_ORG_ID = '123456789';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getSupabaseInventory', () => {
    it('should return inventory items with product details', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' }
        }),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
      (supabase as any) = mockSupabase;

      const result = await zohoInventorySyncService.getSupabaseInventory();

      expect(mockSupabase.from).toHaveBeenCalledWith('product_variants');
      expect(mockSupabase.select).toHaveBeenCalledWith(`
          *,
          products:products(
            id,
            name,
            segment,
            status
          )
        `);
      expect(mockSupabase.eq).toHaveBeenCalledWith('products.status', 'active');
      expect(mockSupabase.order).toHaveBeenCalledWith('updated_at', { ascending: false });
      expect(result).toEqual([
        {
          id: 'variant-1',
          product_id: 'product-1',
          variant_id: 'variant-1',
          sku: 'SKU001',
          name: 'Test Product 1',
          stock_quantity: 100,
          reserved_quantity: 0,
          available_quantity: 100,
          cost_price: 50,
          selling_price: 100,
          weight: 1.5,
          weight_unit: 'kg',
          last_sync_at: null,
        }
      ]);
    });

    it('should handle database errors', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await zohoInventorySyncService.getSupabaseInventory();

      expect(result).toEqual([]);
    });
  });

  describe('getZohoInventory', () => {
    it('should return inventory items from Zoho Books API', async () => {
      const { zohoBooksClient } = await import('../books');
      vi.mocked(zohoBooksClient.makeRequest).mockResolvedValue({
        items: [
          {
            item_id: 'zoho-item-1',
            name: 'Test Product 1',
            sku: 'SKU001',
            rate: 100,
            stock_on_hand: 50,
            available_stock: 50,
          }
        ]
      });

      const result = await zohoInventorySyncService.getZohoInventory();

      expect(zohoBooksClient.makeRequest).toHaveBeenCalledWith(
        '/items?organization_id=123456789'
      );

      expect(result).toEqual([
        {
          item_id: 'zoho-item-1',
          name: 'Test Product 1',
          sku: 'SKU001',
          rate: 100,
          purchase_rate: undefined,
          description: undefined,
          opening_stock: 50,
          stock_on_hand: 50,
          available_stock: 50,
          actual_available_stock: 50,
          reorder_level: undefined,
          vendor_id: undefined,
          tax_id: undefined,
          tax_percentage: undefined,
          unit: 'units',
          custom_fields: undefined,
        }
      ]);
    });

    it('should handle API errors', async () => {
      const { zohoBooksClient } = await import('../books');
      vi.mocked(zohoBooksClient.makeRequest).mockRejectedValue(new Error('API Error'));

      const result = await zohoInventorySyncService.getZohoInventory();

      expect(result).toEqual([]);
    });
  });

  describe('pushInventoryToZoho', () => {
    const mockVariant = {
      id: 'variant-1',
      sku: 'SKU001',
      stock_quantity: 100,
      price: 100,
      cost_price: 50,
      weight: 1.5,
      weight_unit: 'kg',
    };

    it('should push new item to Zoho Books', async () => {
      const { supabase, zohoBooksClient } = await import('../books');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            ...mockVariant,
            products: {
              id: 'product-1',
              name: 'Test Product 1',
              segment: 'agriculture',
              status: 'active'
            }
          },
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
        from: jest.fn().mockImplementation((table) => {
          if (table === 'zoho_inventory_sync_logs') {
            return {
              insert: jest.fn().mockResolvedValue({ error: null }),
            };
          }
          return mockSupabase.from(table);
        }),
      };
      (supabase as any) = mockSupabase;

      vi.mocked(zohoBooksClient.makeRequest).mockResolvedValue({
        code: 0,
        item: {
          item_id: 'zoho-item-1',
          name: 'Test Product 1',
          sku: 'SKU001',
          rate: 100,
        }
      });

      const result = await zohoInventorySyncService.pushInventoryToZoho('variant-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('product_variants');
      expect(mockSupabase.select).toHaveBeenCalledWith(`
          *,
          products:products(
            id,
            name,
            segment,
            status
          )
        `);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'variant-1');
      expect(mockSupabase.single).toHaveBeenCalled();

      expect(zohoBooksClient.makeRequest).toHaveBeenCalledWith(
        '/items',
        {
          method: 'POST',
          body: JSON.stringify({
            JSONString: JSON.stringify({
              name: 'Test Product 1',
              sku: 'SKU001',
              rate: 100,
              purchase_rate: 50,
              description: 'Weight: 1.5kg',
              stock_on_hand: 100,
              available_stock: 100,
              actual_available_stock: 100,
              unit: 'kg',
              custom_fields: [
                { label: 'Product ID', value: 'product-1' },
                { label: 'Variant ID', value: 'variant-1' },
                { label: 'Segment', value: 'agriculture' },
                { label: 'Source', value: 'Supabase' }
              ]
            })
          }),
        }
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('zoho_inventory_sync_logs');
      expect(mockSupabase.update).toHaveBeenCalledWith({
        zoho_books_id: 'zoho-item-1',
        updated_at: expect.any(String)
      });

      expect(result.success).toBe(true);
    });

    it('should update existing item in Zoho Books', async () => {
      const { supabase, zohoBooksClient } = await import('../books');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            ...mockVariant,
            zoho_books_id: 'existing-zoho-id'
          },
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
        from: jest.fn().mockImplementation((table) => {
          if (table === 'zoho_inventory_sync_logs') {
            return {
              insert: jest.fn().mockResolvedValue({ error: null }),
            };
          }
          return mockSupabase.from(table);
        }),
      };
      (supabase as any) = mockSupabase;

      vi.mocked(zohoBooksClient.makeRequest).mockResolvedValue({
        code: 0,
        item: {
          item_id: 'existing-zoho-id',
          name: 'Updated Test Product 1',
          sku: 'SKU001',
          rate: 110, // Updated price
        }
      });

      const result = await zohoInventorySyncService.pushInventoryToZoho('variant-1');

      expect(zohoBooksClient.makeRequest).toHaveBeenCalledWith(
        '/items/existing-zoho-id',
        {
          method: 'PUT',
          body: JSON.stringify({
            JSONString: JSON.stringify({
              name: 'Test Product 1',
              sku: 'SKU001',
              rate: 110,
              // Other fields should remain the same
            })
          }),
        }
      );

      expect(result.success).toBe(true);
    });

    it('should skip inactive products', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            ...mockVariant,
            products: {
              id: 'product-1',
              name: 'Test Product 1',
              status: 'inactive'
            }
          },
          error: null,
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await zohoInventorySyncService.pushInventoryToZoho('variant-1');

      expect(result.success).toBe(true); // Should not error, just skip
    });

    it('should handle push errors', async () => {
      const { supabase, zohoBooksClient } = await import('../books');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            ...mockVariant,
            products: {
              id: 'product-1',
              name: 'Test Product 1',
              status: 'active'
            }
          },
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
        from: jest.fn().mockImplementation((table) => {
          if (table === 'zoho_inventory_sync_logs') {
            return {
              insert: jest.fn().mockResolvedValue({ error: null }),
            };
          }
          return mockSupabase.from(table);
        }),
      };
      (supabase as any) = mockSupabase;

      vi.mocked(zohoBooksClient.makeRequest).mockRejectedValue(new Error('Zoho API Error'));

      const result = await zohoInventorySyncService.pushInventoryToZoho('variant-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to push to Zoho');
    });
  });

  describe('pullInventoryFromZoho', () => {
    it('should pull inventory updates from Zoho Books', async () => {
      const { supabase, zohoBooksClient } = await import('../books');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            ...mockVariant,
            zoho_books_id: 'zoho-item-1'
          },
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
        from: jest.fn().mockImplementation((table) => {
          if (table === 'zoho_inventory_sync_logs') {
            return {
              insert: jest.fn().mockResolvedValue({ error: null }),
            };
          }
          return mockSupabase.from(table);
        }),
      };
      (supabase as any) = mockSupabase;

      vi.mocked(zohoBooksClient.makeRequest).mockResolvedValue({
        code: 0,
        item: {
          item_id: 'zoho-item-1',
          stock_on_hand: 75, // Updated in Zoho
        }
      });

      const result = await zohoInventorySyncService.pullInventoryFromZoho('variant-1');

      expect(zohoBooksClient.makeRequest).toHaveBeenCalledWith(
        '/items/zoho-item-1'
      );

      expect(mockSupabase.update).toHaveBeenCalledWith({
        stock_quantity: 75,
        updated_at: expect.any(String)
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('zoho_inventory_sync_logs');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        variant_id: 'variant-1',
        operation: 'pull_from_zoho',
        supabase_quantity: 0,
        zoho_quantity: 75,
        difference: 0,
        status: 'success',
        sync_timestamp: expect.any(String)
      });

      expect(result.success).toBe(true);
    });

    it('should skip items not synced to Zoho', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            ...mockVariant,
            zoho_books_id: null
          },
          error: null,
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await zohoInventorySyncService.pullInventoryFromZoho('variant-1');

      expect(result.success).toBe(true); // Should not error, just skip
    });
  });

  describe('batchPushToZoho', () => {
    it('should process batch of variants', async () => {
      const { supabase, zohoBooksClient } = await import('../books');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: [
            { id: 'variant-1', sku: 'SKU001', stock_quantity: 100 },
            { id: 'variant-2', sku: 'SKU002', stock_quantity: 50 }
          ],
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
        from: jest.fn().mockImplementation((table) => {
          if (table === 'zoho_inventory_sync_logs') {
            return {
              insert: jest.fn().mockResolvedValue({ error: null }),
            };
          }
          return mockSupabase.from(table);
        }),
      };
      (supabase as any) = mockSupabase;

      vi.mocked(zohoBooksClient.makeRequest).mockImplementation(() => {
        // First call succeeds, second fails
        return Promise.resolve({
          code: 0,
          item: { item_id: 'zoho-item-1' }
        }).then(() => Promise.reject(new Error('API Error')));
      });

      const result = await zohoInventorySyncService.batchPushToZoho();

      expect(mockSupabase.from).toHaveBeenCalledWith('product_variants');
      expect(mockSupabase.or).toHaveBeenCalledWith('zoho_books_id.is.null');

      expect(result.success).toBe(true);
      expect(result.processed).toBe(1); // Only first succeeded due to mock setup
      expect(result.errors).toBe(1);
    });
  });

  describe('getInventorySyncStats', () => {
    it('should return inventory sync statistics', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: [
            { operation: 'push_to_zoho', status: 'success' },
            { operation: 'pull_from_zoho', status: 'success' },
            { operation: 'push_to_zoho', status: 'failed' },
          ],
          error: null,
        }),
      };
      (supabase as any) = mockSupabase;

      const stats = await zohoInventorySyncService.getInventorySyncStats();

      expect(mockSupabase.from).toHaveBeenCalledWith('zoho_inventory_sync_logs');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.gte).toHaveBeenCalledWith(
        'sync_timestamp',
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      );

      expect(stats).toEqual({
        totalSyncs: 3,
        pushCount: 2,
        pullCount: 1,
        successCount: 2,
        failedCount: 1,
        lastSyncAt: expect.any(String),
      });
    });
  });
});