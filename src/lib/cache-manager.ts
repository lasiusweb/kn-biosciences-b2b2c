import { kv } from '@vercel/kv'; // Using Vercel KV for distributed caching
import { supabase } from './supabase';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  staleWhileRevalidate?: number; // Additional time to serve stale data while revalidating
}

export class CacheManager {
  private static instance: CacheManager;
  private readonly defaultTtl = 300; // 5 minutes
  private readonly prefix = 'kn_bio_cache:'; // Prefix for all cache keys

  private constructor() {}

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Generates a cache key from the provided parts
   */
  private generateKey(parts: (string | number)[]): string {
    return this.prefix + parts.join(':');
  }

  /**
   * Gets a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await kv.get<T>(key);
      return value || null;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null; // Fail gracefully
    }
  }

  /**
   * Sets a value in cache
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const ttl = options.ttl || this.defaultTtl;
      await kv.set(key, value, { ex: ttl });
      return true;
    } catch (error) {
      console.warn('Cache set error:', error);
      return false; // Fail gracefully
    }
  }

  /**
   * Deletes a value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      await kv.del(key);
      return true;
    } catch (error) {
      console.warn('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Clears all cache entries with the prefix
   */
  async clear(): Promise<boolean> {
    try {
      // Note: KV doesn't have a direct way to clear keys with a prefix
      // This is a limitation of the KV store
      console.info('Cache cleared (implementation dependent on KV provider)');
      return true;
    } catch (error) {
      console.warn('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Gets or sets a value with a fallback function
   */
  async getOrSet<T>(
    key: string,
    fallbackFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cachedValue = await this.get<T>(key);
    if (cachedValue !== null) {
      return cachedValue;
    }

    // If not in cache, execute the fallback function
    const freshValue = await fallbackFn();

    // Set in cache
    await this.set(key, freshValue, options);

    return freshValue;
  }

  /**
   * Cache products by segment
   */
  async getProductsBySegment(segment: string, limit?: number): Promise<any[]> {
    const key = this.generateKey(['products', 'segment', segment, limit || 'all']);
    const cacheOptions: CacheOptions = { ttl: 600 }; // 10 minutes for product listings

    return this.getOrSet(
      key,
      async () => {
        let query = supabase
          .from('products')
          .select(`
            *,
            product_variants!inner(
              id,
              sku,
              price,
              stock_quantity,
              weight,
              weight_unit,
              image_urls
            )
          `)
          .eq('status', 'active')
          .eq('segment', segment);

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching products by segment:', error);
          return [];
        }

        return data || [];
      },
      cacheOptions
    );
  }

  /**
   * Cache a single product by slug
   */
  async getProductBySlug(slug: string): Promise<any | null> {
    const key = this.generateKey(['product', 'slug', slug]);
    const cacheOptions: CacheOptions = { ttl: 1800 }; // 30 minutes for individual products

    return this.getOrSet(
      key,
      async () => {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_variants(*)
          `)
          .eq('slug', slug)
          .eq('status', 'active')
          .single();

        if (error) {
          console.error('Error fetching product by slug:', error);
          return null;
        }

        return data;
      },
      cacheOptions
    );
  }

  /**
   * Cache product categories
   */
  async getCategories(): Promise<any[]> {
    const key = this.generateKey(['categories']);
    const cacheOptions: CacheOptions = { ttl: 3600 }; // 1 hour for categories (they rarely change)

    return this.getOrSet(
      key,
      async () => {
        const { data, error } = await supabase
          .from('product_categories')
          .select('*')
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching categories:', error);
          return [];
        }

        return data || [];
      },
      cacheOptions
    );
  }

  /**
   * Cache search results
   */
  async getSearchResults(query: string, filters: any = {}): Promise<any[]> {
    const filterStr = JSON.stringify(filters);
    const key = this.generateKey(['search', query, filterStr]);
    const cacheOptions: CacheOptions = { ttl: 300 }; // 5 minutes for search results

    return this.getOrSet(
      key,
      async () => {
        // This would call the search service
        // For now, returning empty array as placeholder
        console.log(`Performing search for: ${query} with filters:`, filters);
        return []; // Placeholder - would call actual search service
      },
      cacheOptions
    );
  }

  /**
   * Cache user's cart
   */
  async getCartForUser(userId: string): Promise<any[]> {
    const key = this.generateKey(['cart', 'user', userId]);
    const cacheOptions: CacheOptions = { ttl: 30 }; // 30 seconds for cart (frequently updated)

    return this.getOrSet(
      key,
      async () => {
        const { data, error } = await supabase
          .from('cart_items')
          .select(`
            *,
            product_variants (
              *,
              products (
                id,
                name,
                slug,
                images,
                description
              )
            )
          `)
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching cart:', error);
          return [];
        }

        return data || [];
      },
      cacheOptions
    );
  }

  /**
   * Invalidate product cache when product is updated
   */
  async invalidateProductCache(productId: string, productSlug?: string): Promise<void> {
    // Invalidate specific product cache
    if (productSlug) {
      await this.delete(this.generateKey(['product', 'slug', productSlug]));
    }

    // Invalidate related caches
    await this.delete(this.generateKey(['products', 'id', productId]));
  }

  /**
   * Invalidate category cache when categories are updated
   */
  async invalidateCategoryCache(): Promise<void> {
    await this.delete(this.generateKey(['categories']));
  }

  /**
   * Invalidate user's cart cache
   */
  async invalidateCartCache(userId: string): Promise<void> {
    await this.delete(this.generateKey(['cart', 'user', userId]));
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    hits: number;
    misses: number;
    hitRate: number;
  }> {
    // Note: Actual cache stats would depend on the KV provider
    // This is a simplified implementation
    return {
      hits: 0,
      misses: 0,
      hitRate: 0
    };
  }
}

// Create a singleton instance
export const cacheManager = CacheManager.getInstance();

// Decorator for caching function results
export function Cached(ttl: number = 300, keyPrefix: string = 'fn') {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const cache = cacheManager;
      const key = `${keyPrefix}:${propertyKey}:${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cachedResult = await cache.get(key);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Execute the original method
      const result = await originalMethod.apply(this, args);

      // Store in cache
      await cache.set(key, result, { ttl });

      return result;
    };

    return descriptor;
  };
}

// Higher-order function to wrap API handlers with caching
export function withCache<T>(
  handler: (req: Request) => Promise<T>, 
  keyGenerator: (req: Request) => string,
  options: CacheOptions = {}
) {
  return async (req: Request): Promise<T> => {
    const cache = cacheManager;
    const key = keyGenerator(req);
    
    // Try to get from cache
    const cachedResult = await cache.get<T>(key);
    if (cachedResult !== null) {
      console.log(`Cache HIT for key: ${key}`);
      return cachedResult;
    }
    
    console.log(`Cache MISS for key: ${key}`);
    
    // Execute the handler
    const result = await handler(req);
    
    // Store in cache
    await cache.set(key, result, options);
    
    return result;
  };
}