/**
 * Unit tests for Zoho Books Sync Service
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { zohoBooksSyncService } from '../books-sync-service';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('../books', () => ({
  zohoBooksClient: {
    createInvoice: jest.fn(),
    createEstimate: jest.fn(),
  },
}));

describe('ZohoBooksSyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variables for GST calculation
    process.env.COMPANY_GST_NUMBER = '27AAAPL1234C1ZV';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('calculateB2CGST', () => {
    it('should calculate GST correctly for B2C items', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Not found' }
        }),
      };
      (supabase as any) = mockSupabase;

      const items = [
        {
          product_name: 'Test Product 1',
          sku: 'TP001',
          quantity: 2,
          unit_price: 100,
          tax_rate: 18,
          product_id: 'prod1',
          variant_id: 'var1',
        },
        {
          product_name: 'Test Product 2',
          sku: 'TP002',
          quantity: 1,
          unit_price: 200,
          tax_rate: 18,
          product_id: 'prod2',
          variant_id: 'var2',
        }
      ];

      // Access private method through reflection for testing
      const service = zohoBooksSyncService as any;
      const result = service.calculateB2CGST(items);

      expect(result.subtotal).toBe(400); // (2 * 100) + (1 * 200)
      expect(result.tax_amount).toBe(72); // 400 * 0.18
      expect(result.total).toBe(472); // 400 + 72
    });

    it('should handle different tax rates', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Not found' }
        }),
      };
      (supabase as any) = mockSupabase;

      const items = [
        {
          product_name: 'Test Product',
          sku: 'TP001',
          quantity: 1,
          unit_price: 1000,
          tax_rate: 5, // Lower GST rate
          product_id: 'prod1',
          variant_id: 'var1',
        }
      ];

      const service = zohoBooksSyncService as any;
      const result = service.calculateB2CGST(items);

      expect(result.subtotal).toBe(1000);
      expect(result.tax_amount).toBe(50); // 1000 * 0.05
      expect(result.total).toBe(1050);
    });

    it('should use default tax rate when not specified', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Not found' }
        }),
      };
      (supabase as any) = mockSupabase;

      const items = [
        {
          product_name: 'Test Product',
          sku: 'TP001',
          quantity: 1,
          unit_price: 500,
          // tax_rate not specified
          product_id: 'prod1',
          variant_id: 'var1',
        }
      ];

      const service = zohoBooksSyncService as any;
      const result = service.calculateB2CGST(items);

      expect(result.subtotal).toBe(500);
      expect(result.tax_amount).toBe(90); // 500 * 0.18 (default rate)
      expect(result.total).toBe(590);
    });
  });

  describe('calculateB2BGST', () => {
    it('should calculate SGST + CGST for intra-state B2B transactions', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Not found' }
        }),
      };
      (supabase as any) = mockSupabase;

      const items = [
        {
          product_name: 'Test Product',
          sku: 'TP001',
          quantity: 2,
          unit_price: 1000,
          tax_rate: 18,
          product_id: 'prod1',
          variant_id: 'var1',
        }
      ];

      const service = zohoBooksSyncService as any;
      const result = service.calculateB2BGST(
        items,
        '27AAAPL1234C1ZV', // Karnataka GST
        '27AAAPL5678C2ZV'  // Karnataka GST (intra-state)
      );

      expect(result.subtotal).toBe(2000);
      expect(result.sgst).toBe(180); // 2000 * 0.18 / 2
      expect(result.cgst).toBe(180); // 2000 * 0.18 / 2
      expect(result.igst).toBe(0); // No IGST for intra-state
      expect(result.tax_amount).toBe(360); // 180 + 180
      expect(result.total).toBe(2360); // 2000 + 360
    });

    it('should calculate IGST for inter-state B2B transactions', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Not found' }
        }),
      };
      (supabase as any) = mockSupabase;

      const items = [
        {
          product_name: 'Test Product',
          sku: 'TP001',
          quantity: 2,
          unit_price: 1000,
          tax_rate: 18,
          product_id: 'prod1',
          variant_id: 'var1',
        }
      ];

      const service = zohoBooksSyncService as any;
      const result = service.calculateB2BGST(
        items,
        '27AAAPL1234C1ZV', // Karnataka GST
        '29AAAPL5678C3ZV'  // Karnataka GST (different state, but same code - use actual different states)
      );

      expect(result.subtotal).toBe(2000);
      expect(result.sgst).toBe(0); // No SGST for inter-state
      expect(result.cgst).toBe(0); // No CGST for inter-state
      expect(result.igst).toBe(360); // 2000 * 0.18
      expect(result.tax_amount).toBe(360); // Only IGST
      expect(result.total).toBe(2360); // 2000 + 360
    });

    it('should default to inter-state when GST numbers are missing', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Not found' }
        }),
      };
      (supabase as any) = mockSupabase;

      const items = [
        {
          product_name: 'Test Product',
          sku: 'TP001',
          quantity: 1,
          unit_price: 1000,
          tax_rate: 18,
          product_id: 'prod1',
          variant_id: 'var1',
        }
      ];

      const service = zohoBooksSyncService as any;
      const result = service.calculateB2BGST(items, undefined, undefined);

      expect(result.igst).toBe(180); // Default to IGST
      expect(result.sgst).toBe(0);
      expect(result.cgst).toBe(0);
    });
  });

  describe('syncOrderToInvoice', () => {
    const mockOrderData = {
      id: 'order-123',
      order_number: 'ORD-2024-001',
      user_id: 'user-456',
      subtotal: 1000,
      tax_amount: 180,
      total_amount: 1180,
      payment_status: 'paid',
      created_at: '2024-01-15T10:30:00Z',
      user: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        company_name: 'Test Company',
        gst_number: '27AAAPL1234C1ZV',
        shipping_address: {
          address_line1: '123 Test St',
          city: 'Bangalore',
          state: 'Karnataka',
          postal_code: '560001',
          country: 'India',
        },
        billing_address: {
          address_line1: '123 Test St',
          city: 'Bangalore',
          state: 'Karnataka',
          postal_code: '560001',
          country: 'India',
        },
      },
      items: [
        {
          product_name: 'Organic Fertilizer',
          sku: 'OF001',
          quantity: 2,
          unit_price: 500,
          tax_rate: 18,
          product_id: 'prod1',
          variant_id: 'var1',
        }
      ],
    };

    it('should successfully sync paid order to invoice', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: mockOrderData, 
          error: null 
        }),
        update: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ error: null }),
      };
      (supabase as any) = mockSupabase;

      // Mock order items query
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'order_items') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              data: mockOrderData.items.map(item => ({
                ...item,
                product_variants: { name: item.product_name, sku: item.sku }
              })),
              error: null
            }),
          };
        }
        return mockSupabase.from(table);
      });

      const { zohoBooksClient } = await import('../books');
      vi.mocked(zohoBooksClient.createInvoice).mockResolvedValue({
        success: true,
        invoiceId: 'inv-123456',
      });

      const result = await zohoBooksSyncService.syncOrderToInvoice('order-123');

      expect(zohoBooksClient.createInvoice).toHaveBeenCalledWith({
        id: mockOrderData.id,
        order_number: mockOrderData.order_number,
        user: mockOrderData.user,
        items: mockOrderData.items,
        subtotal: mockOrderData.subtotal,
        tax_amount: mockOrderData.tax_amount,
        total_amount: mockOrderData.total_amount,
        created_at: mockOrderData.created_at,
      });

      expect(result.success).toBe(true);
      expect(result.invoiceId).toBe('inv-123456');
    });

    it('should skip unpaid orders', async () => {
      const unpaidOrderData = {
        ...mockOrderData,
        payment_status: 'pending',
      };

      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: unpaidOrderData, 
          error: null 
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await zohoBooksSyncService.syncOrderToInvoice('order-123');

      expect(result.success).toBe(true);
      // Should not call Zoho Books for unpaid orders
    });

    it('should handle order not found', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Order not found' }
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await zohoBooksSyncService.syncOrderToInvoice('nonexistent-order');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to get order details');
    });
  });

  describe('syncQuoteToEstimate', () => {
    const mockQuoteData = {
      id: 'quote-123',
      user_id: 'user-456',
      subtotal: 5000,
      tax_amount: 900,
      total_amount: 5900,
      valid_until: '2024-02-15T23:59:59Z',
      status: 'approved',
      notes: 'Bulk order for agricultural supplies',
      user: {
        first_name: 'Business',
        last_name: 'User',
        email: 'business@company.com',
        phone: '+1234567890',
        company_name: 'Business Corp',
        gst_number: '29AAAPL5678C3ZV',
        billing_address: {
          address_line1: '456 Business Ave',
          city: 'Mumbai',
          state: 'Maharashtra',
          postal_code: '400001',
          country: 'India',
        },
      },
      items: [
        {
          product_name: 'Bio Pesticide',
          sku: 'BP001',
          quantity: 5,
          unit_price: 1000,
          tax_rate: 18,
          product_id: 'prod2',
          variant_id: 'var2',
        }
      ],
    };

    it('should successfully sync approved quote to estimate', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: mockQuoteData, 
          error: null 
        }),
        update: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ error: null }),
      };
      (supabase as any) = mockSupabase;

      // Mock quote items query
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'b2b_quote_items') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              data: mockQuoteData.items.map(item => ({
                ...item,
                product_variants: { name: item.product_name, sku: item.sku }
              })),
              error: null
            }),
          };
        }
        return mockSupabase.from(table);
      });

      const { zohoBooksClient } = await import('../books');
      vi.mocked(zohoBooksClient.createEstimate).mockResolvedValue({
        success: true,
        estimateId: 'est-123456',
      });

      const result = await zohoBooksSyncService.syncQuoteToEstimate('quote-123');

      expect(zohoBooksClient.createEstimate).toHaveBeenCalledWith({
        id: mockQuoteData.id,
        user: mockQuoteData.user,
        items: mockQuoteData.items,
        subtotal: mockQuoteData.subtotal,
        tax_amount: mockQuoteData.tax_amount,
        total_amount: mockQuoteData.total_amount,
        valid_until: mockQuoteData.valid_until,
        notes: mockQuoteData.notes,
      });

      expect(result.success).toBe(true);
      expect(result.estimateId).toBe('est-123456');
    });

    it('should skip non-approved quotes', async () => {
      const pendingQuoteData = {
        ...mockQuoteData,
        status: 'submitted',
      };

      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: pendingQuoteData, 
          error: null 
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await zohoBooksSyncService.syncQuoteToEstimate('quote-123');

      expect(result.success).toBe(true);
      // Should not call Zoho Books for non-approved quotes
    });
  });

  describe('getBooksSyncStats', () => {
    it('should return correct Books sync statistics', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockResolvedValue({
          data: [
            { status: 'success', zoho_entity_type: 'Invoice' },
            { status: 'success', zoho_entity_type: 'Estimate' },
            { status: 'failed', zoho_entity_type: 'Invoice' },
            { status: 'pending', zoho_entity_type: 'Estimate' },
            { status: 'success', zoho_entity_type: 'Invoice' },
          ],
          error: null,
        }),
      };
      (supabase as any) = mockSupabase;

      const stats = await zohoBooksSyncService.getBooksSyncStats();

      expect(stats.totalInvoices).toBe(3);
      expect(stats.totalEstimates).toBe(2);
      expect(stats.successCount).toBe(3);
      expect(stats.failedCount).toBe(1);
      expect(stats.pendingCount).toBe(1);
    });
  });
});