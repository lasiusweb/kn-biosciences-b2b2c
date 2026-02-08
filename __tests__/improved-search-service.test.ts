// Comprehensive test suite for the improved search service
import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { improvedSearchService } from '@/lib/improved-search-service';
import { supabase } from '@/lib/supabase';

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
  }
}));

describe('ImprovedSearchService', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    };
    
    (supabase.from as MockedFunction<any>).mockImplementation(() => mockSupabase);
  });

  describe('search', () => {
    it('should return empty results when no query is provided', async () => {
      const result = await improvedSearchService.search('', {}, {});
      
      expect(result.products).toEqual([]);
      expect(result.variants).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('should validate and sanitize search query', async () => {
      const maliciousQuery = "<script>alert('xss')</script> test";
      const result = await improvedSearchService.search(maliciousQuery, {}, {});
      
      expect(result).toBeDefined();
      // The query should be sanitized internally
    });

    it('should apply filters correctly', async () => {
      const mockData = [{
        id: '1',
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test Description',
        short_description: 'Short desc',
        category_id: 'cat1',
        segment: 'agriculture',
        status: 'active',
        featured: false,
        meta_title: 'Test Title',
        meta_description: 'Test Desc',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        featured_image: null,
        product_variants: [{
          id: 'v1',
          product_id: '1',
          sku: 'TEST001',
          weight: 1,
          weight_unit: 'kg',
          packing_type: 'bag',
          form: 'powder',
          price: 100,
          compare_price: 120,
          cost_price: 80,
          stock_quantity: 10,
          low_stock_threshold: 5,
          track_inventory: true,
          image_urls: [],
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        }]
      }];
      
      mockSupabase.select.mockResolvedValueOnce({ data: mockData, error: null, count: 1 });
      
      const result = await improvedSearchService.search('test', { 
        segment: 'agriculture',
        category: 'cat1'
      }, { limit: 10 });
      
      expect(mockSupabase.eq).toHaveBeenCalledWith('segment', 'agriculture');
      expect(mockSupabase.eq).toHaveBeenCalledWith('category_id', 'cat1');
      expect(result.totalCount).toBe(1);
      expect(result.products).toHaveLength(1);
    });

    it('should handle errors gracefully', async () => {
      mockSupabase.select.mockResolvedValueOnce({ data: null, error: { message: 'Database error' }, count: 0 });
      
      await expect(improvedSearchService.search('test'))
        .rejects.toThrow('Search service temporarily unavailable');
    });
  });

  describe('getSuggestions', () => {
    it('should return empty array for short queries', async () => {
      const result = await improvedSearchService.getSuggestions('a');
      
      expect(result).toEqual([]);
    });

    it('should return suggestions for valid queries', async () => {
      const mockData = [
        { name: 'Bio Fertilizer' },
        { name: 'Bio Pesticide' }
      ];
      
      mockSupabase.select.mockResolvedValueOnce({ data: mockData, error: null });
      
      const result = await improvedSearchService.getSuggestions('bio');
      
      expect(result).toEqual(['Bio Fertilizer', 'Bio Pesticide']);
    });
  });
});