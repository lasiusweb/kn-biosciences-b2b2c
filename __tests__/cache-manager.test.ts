// Comprehensive test suite for the cache manager
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { cacheManager } from '@/lib/cache-manager';

// Mock the KV store
vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  }
}));

const { kv } = await import('@vercel/kv');

describe('CacheManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get and set', () => {
    it('should retrieve value from cache if exists', async () => {
      const mockValue = { id: 1, name: 'Test' };
      (kv.get as MockedFunction<any>).mockResolvedValue(mockValue);

      const result = await cacheManager.get('test-key');
      
      expect(result).toEqual(mockValue);
      expect(kv.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null if value does not exist in cache', async () => {
      (kv.get as MockedFunction<any>).mockResolvedValue(null);

      const result = await cacheManager.get('non-existent-key');
      
      expect(result).toBeNull();
    });

    it('should set value in cache with TTL', async () => {
      (kv.set as MockedFunction<any>).mockResolvedValue(undefined);

      const result = await cacheManager.set('test-key', { id: 1 }, { ttl: 600 });
      
      expect(result).toBe(true);
      expect(kv.set).toHaveBeenCalledWith('test-key', { id: 1 }, { ex: 600 });
    });

    it('should handle cache set failure gracefully', async () => {
      (kv.set as MockedFunction<any>).mockRejectedValue(new Error('KV error'));

      const result = await cacheManager.set('test-key', { id: 1 });
      
      expect(result).toBe(false);
    });
  });

  describe('getOrSet', () => {
    it('should return cached value if exists', async () => {
      const cachedValue = { id: 1, name: 'Cached' };
      (kv.get as MockedFunction<any>).mockResolvedValue(cachedValue);

      const fallbackFn = vi.fn().mockResolvedValue({ id: 2, name: 'Fresh' });
      
      const result = await cacheManager.getOrSet('test-key', fallbackFn);
      
      expect(result).toEqual(cachedValue);
      expect(fallbackFn).not.toHaveBeenCalled();
    });

    it('should call fallback function and cache result if not in cache', async () => {
      (kv.get as MockedFunction<any>).mockResolvedValue(null);
      (kv.set as MockedFunction<any>).mockResolvedValue(undefined);

      const fallbackValue = { id: 1, name: 'Fresh' };
      const fallbackFn = vi.fn().mockResolvedValue(fallbackValue);
      
      const result = await cacheManager.getOrSet('test-key', fallbackFn, { ttl: 300 });
      
      expect(result).toEqual(fallbackValue);
      expect(fallbackFn).toHaveBeenCalled();
      expect(kv.set).toHaveBeenCalledWith('test-key', fallbackValue, { ex: 300 });
    });
  });

  describe('specific cache methods', () => {
    it('should cache products by segment', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', product_variants: [] },
        { id: '2', name: 'Product 2', product_variants: [] }
      ];
      
      (kv.get as MockedFunction<any>).mockResolvedValue(null); // Not in cache initially
      (kv.set as MockedFunction<any>).mockResolvedValue(undefined);
      
      // Mock the supabase call
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };
      vi.doMock('@/lib/supabase', () => ({
        supabase: mockSupabase
      }));
      
      mockSupabase.select.mockResolvedValueOnce({ data: mockProducts, error: null });
      
      const result = await cacheManager.getProductsBySegment('agriculture', 10);
      
      expect(result).toEqual(mockProducts);
    });
  });
});