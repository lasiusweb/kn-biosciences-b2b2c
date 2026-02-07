/**
 * Unit tests for Enhanced Product Service
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { 
  getProducts, 
  getProductsBySegment, 
  getProductsByCrop, 
  getProductsByProblem,
  getProductBySlug,
  getSegments, 
  getCropsBySegment,
  getProblems,
  getKnowledgeCenterArticles,
  searchProducts,
  getProducts as getProductsOriginal
} from '../enhanced-product-service';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue({}),
    and: jest.fn().mockReturnThis(),
    head: jest.fn().mockResolvedValue({}),
  },
}));

describe('Enhanced Product Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getProducts', () => {
    it('should return all active products', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Test Product 1',
          segment: 'agriculture',
          status: 'active',
          featured: false,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'product-2',
          name: 'Test Product 2',
          segment: 'aquaculture',
          status: 'active',
          featured: true,
          created_at: '2024-01-02T00:00:00Z',
        },
      ];

      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProducts,
          error: null,
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await getProductsOriginal();

      expect(mockSupabase.from).toHaveBeenCalledWith('products');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'active');
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockProducts);

      expect(result.totalCount).toBe(mockProducts.length);
      expect(result.hasMore).toBe(false);
    });

    it('should handle database errors', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };
      (supabase as any) = mockSupabase;

      await expect(getProductsOriginal()).rejects.toThrow('Failed to fetch products');
    });
  });

  describe('getProductsBySegment', () => {
    it('should fetch products with segment-specific data', async () => {
      const mockProductsWithVariants = [
        {
          id: 'product-1',
          name: 'Agriculture Product',
          segment: 'agriculture',
          status: 'active',
          featured: false,
          created_at: '2024-01-01T00:00:00Z',
          product_variants: [
            {
              id: 'variant-1',
              sku: 'AGR001',
              price: 100,
              stock_quantity: 50,
              weight: 1,
              weight_unit: 'kg',
              image_urls: ['image1.jpg'],
              zoho_books_id: 'zoho-item-1',
            }
          ],
          problem_solutions: [
            {
              id: 'solution-1',
              title: 'Agriculture Pest Control',
              slug: 'agriculture-pest-control',
              segment: 'agriculture',
              featured: true,
              published_at: '2024-01-01T00:00:00Z',
            }
          ]
        }
      ];

      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProductsWithVariants,
          error: null,
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await getProductsBySegment('agriculture');

      expect(mockSupabase.from).toHaveBeenCalledWith('products');
      expect(mockSupabase.select).toContain('product_variants');
      expect(mockSupabase.eq).toHaveBeenCalledWith('segment', 'agriculture');
      expect(result).toHaveLength(1);
      expect(result[0].product_variants).toHaveLength(1);
      expect(result[0].problem_solutions).toHaveLength(1);
    });

    it('should handle segment not found', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: [],
          error: { message: 'Not found' },
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await getProductsBySegment('nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('getProductsByCrop', () => {
    it('should fetch products by crop', async () => {
      const mockCrops = [
        { id: 'crop-1', crop_name: 'Wheat', crop_id: 'WHEAT001', description: 'High yield variety' },
        { id: 'crop-2', crop_name: 'Rice', crop_id: 'RICE001', description: 'Basmati variety' }
      ];

      const mockProducts = [
        {
          id: 'product-1',
          name: 'Wheat Fertilizer',
          segment: 'agriculture',
          status: 'active',
          product_crops: [
            { id: 'product-crop-1', product_id: 'product-1', crop_id: 'crop-1' }
          ],
          problem_solutions: []
        }
      ];

      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProducts,
          error: null,
        }),
      };
      (supabase as any) = mockSupabase;

      const mockCropsQuery = {
        innerJoin: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      (mockCropsQuery as any) = mockCropsQuery;

      (supabase as any) = mockSupabase;

      vi.mocked(mockCropsQuery.innerJoin).mockReturnValue(mockProducts);

      const result = await getProductsByCrop('WHEAT001');

      expect(mockSupabase.from).toHaveBeenCalledWith('products');
      expect(mockSupabase.innerJoin).toHaveBeenCalledWith('product_crops', 'product_variants', 'product_crops.product_id', 'products.id');
      expect(mockSupabase.eq).toHaveBeenCalledWith('product_crops.crop_id', 'WHEAT001');
      expect(result).toHaveLength(1);
      expect(result[0].product_crops).toHaveLength(1);
      expect(result[0].product_crops[0].crop_name).toBe('Wheat');
    });
  });

  describe('getSegments', () => {
    it('should return segments with product counts', async () => {
      const mockProducts = [
        { id: 'product-1', segment: 'agriculture', status: 'active' },
        { id: 'product-2', segment: 'agriculture', status: 'active' },
        { id: 'product-3', segment: 'aquaculture', status: 'active' },
        { id: 'product-4', segment: 'agriculture', status: 'inactive' },
      ];

      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: ['agriculture', 'aquaculture'],
          error: null,
        }),
      };
      (supabase as any) = mockSupabase;

      const mockCount = jest.fn()
        .mockResolvedValueOnce({ count: 2 }) // agriculture
        .mockResolvedValueOnce({ count: 2 }) // aquaculture
        .mockResolvedValueOnce({ count: 1 }); // inactive product excluded

      vi.mocked(mockCount).mockReturnValue(1); // For aquaculture

      const result = await getSegments();

      expect(mockSupabase.from).toHaveBeenCalledWith('products');
      expect(result).toHaveLength(2);
      expect(result[0].segment).toBe('agriculture');
      expect(result[0].count).toBe(2);
      expect(result[1].segment).toBe('aquaculture');
      expect(result[1].count).toBe(1);
    });
  });

  describe('getKnowledgeCenterArticles', () => {
    it('should fetch latest articles for segment', async () => {
      const mockArticles = [
        {
          id: 'article-1',
          title: 'Wheat Growing Guide',
          slug: 'wheat-growing-guide',
          segment: 'agriculture',
          excerpt: 'Learn about wheat cultivation',
          published_at: '2024-01-01T00:00:00Z',
        }
      ];

      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArticles,
          error: null,
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await getKnowledgeCenterArticles('agriculture');

      expect(mockSupabase.from).toHaveBeenCalledWith('problem_solutions');
      expect(mockSupabase.select).toContain('published_at');
      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'active');
      expect(mockSupabase.limit).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(1);
    });

    it('should limit results when specified', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await getKnowledgeCenterArticles('aquaculture', 3);

      expect(mockSupabase.limit).toHaveBeenCalledWith(3);
      expect(result).toHaveLength(0);
    });
  });

  describe('searchProducts', () => {
    it('should search across name, short description, and SKU', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Search Result 1',
          short_description: 'First product',
          sku: 'SEARCH001',
          product_variants: [{ sku: 'SEARCH001' }],
          segment: 'agriculture',
        },
        {
          id: 'product-2',
          name: 'Search Result 2',
          short_description: 'Second product',
          sku: 'SEARCH002',
          product_variants: [{ sku: 'SEARCH002' }],
          segment: 'agriculture',
        },
      ];

      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProducts,
          error: null,
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await searchProducts('search query');

      expect(mockSupabase.or).toHaveBeenCalledTimes(3); // For each OR condition
      expect(mockSupabase.from).toHaveBeenCalledWith('products');
      expect(result.products).toEqual(mockProducts);
    });

    it('should apply multiple filters', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        contains: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await searchProducts('query', {
        segment: 'agriculture',
        minPrice: 50,
        maxPrice: 200,
        inStock: true
      });

      expect(mockSupabase.eq).toHaveBeenCalledWith('segment', 'agriculture');
      expect(mockSupabase.gt).toHaveBeenCalledWith('product_variants.price', 50);
      expect(mockSupabase.gt).toHaveBeenCalledWith('product_variants.stock_quantity', 0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('getProducts (with parameters)', () => {
    it('should apply all filters correctly', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
        contains: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await getProducts({
        segment: 'agriculture',
        cropId: 'WHEAT001',
        featured: true,
        minPrice: 100,
        maxPrice: 500,
        limit: 10,
        offset: 5,
        sortBy: 'price',
        sortOrder: 'desc'
      });

      expect(mockSupabase.eq).toHaveBeenCalledWith('segment', 'agriculture');
      expect(mockSupabase.eq).toHaveBeenCalledWith('product_crops.crop_id', 'WHEAT001');
      expect(mockSupabase.eq).toHaveBeenCalledWith('featured', true);
      expect(mockSupabase.gt).toHaveBeenCalledWith('product_variants.price', 100);
      expect(mockSupabase.gt).toHaveBeenCalledWith('product_variants.price', 500);
      expect(mockSupabase.limit).toHaveBeenCalledWith(10);
      expect(mockSupabase.range).toHaveBeenCalledWith(5, 10);
      expect(mockSupabase.order).toHaveBeenCalledWith('price', { ascending: false });
      expect(result.products).toEqual([]);
    });

    it('should calculate total count correctly', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        count: jest.fn().mockResolvedValue(15),
        single: jest.fn().mockResolvedValue({
          data: Array(15).fill().map((_, i) => ({ id: `product-${i}` })),
          error: null,
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await getProducts({ limit: 5 });

      expect(mockSupabase.count).toHaveBeenCalledWith(15);
      expect(result.totalCount).toBe(15);
      expect(result.hasMore).toBe(true); // 5 < 15, so has more = true
    });
  });
});