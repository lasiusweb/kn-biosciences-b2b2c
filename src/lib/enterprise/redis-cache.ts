import Redis from 'ioredis';

interface CacheConfig {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
}

interface CacheEntry<T = any> {
  value: T;
  expiry: number;
  createdAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  memory: NodeJS.MemoryUsage;
}

export class EnterpriseCache {
  private static instance: EnterpriseCache;
  private redis: Redis;
  private fallback: Map<string, CacheEntry>;
  private isConnected: boolean = false;
  private stats: CacheStats;
  private defaultTTL: number = 3600; // 1 hour in seconds

  private constructor(config?: CacheConfig) {
    this.fallback = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      memory: process.memoryUsage()
    };

    try {
      this.redis = new Redis({
        host: config?.host || process.env.REDIS_HOST || 'localhost',
        port: config?.port || parseInt(process.env.REDIS_PORT || '6379'),
        password: config?.password || process.env.REDIS_PASSWORD,
        db: config?.db || parseInt(process.env.REDIS_DB || '0'),
        retryDelayOnFailover: config?.retryDelayOnFailover || 100,
        maxRetriesPerRequest: config?.maxRetriesPerRequest || 3,
        lazyConnect: config?.lazyConnect || true,
        // Connection options
        connectTimeout: 10000,
        commandTimeout: 5000,
        // Health check
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        lazyConnect: true,
      });

      this.redis.on('connect', () => {
        this.isConnected = true;
        console.log('✅ Redis connected successfully');
      });

      this.redis.on('error', (err) => {
        this.isConnected = false;
        this.stats.errors++;
        console.error('❌ Redis error:', err);
      });

      this.redis.on('close', () => {
        this.isConnected = false;
        console.log('🔌 Redis connection closed');
      });

      this.redis.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error);
      this.isConnected = false;
    }
  }

  static getInstance(config?: CacheConfig): EnterpriseCache {
    if (!EnterpriseCache.instance) {
      EnterpriseCache.instance = new EnterpriseCache(config);
    }
    return EnterpriseCache.instance;
  }

  // Cache operations
  async get<T = any>(key: string): Promise<T | null> {
    try {
      if (this.isConnected) {
        const value = await this.redis.get(key);
        if (value !== null) {
          this.stats.hits++;
          return JSON.parse(value);
        }
      }

      // Fallback to memory cache
      const fallbackEntry = this.fallback.get(key);
      if (fallbackEntry && Date.now() < fallbackEntry.expiry) {
        this.stats.hits++;
        return fallbackEntry.value;
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T = any>(key: string, value: T, ttl: number = this.defaultTTL): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value);
      const expiry = Date.now() + (ttl * 1000);

      if (this.isConnected) {
        await this.redis.setex(key, ttl, serializedValue);
      }

      // Always update fallback cache
      this.fallback.set(key, { value: serializedValue, expiry, createdAt: Date.now() });
      
      // Clean up old entries from fallback
      this.cleanupFallback();
      
      this.stats.sets++;
      return true;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (this.isConnected) {
        await this.redis.del(key);
      }
      
      // Remove from fallback
      this.fallback.delete(key);
      
      this.stats.deletes++;
      return true;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (this.isConnected) {
        const result = await this.redis.exists(key);
        return result === 1;
      }

      // Check fallback
      const entry = this.fallback.get(key);
      return entry ? Date.now() < entry.expiry : false;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      if (this.isConnected) {
        const result = await this.redis.incrby(key, amount);
        return result;
      }
      
      // Fallback implementation
      const entry = this.fallback.get(key);
      if (entry && Date.now() < entry.expiry) {
        const current = parseInt(JSON.parse(entry.value)) || 0;
        const newValue = current + amount;
        await this.set(key, newValue);
        return newValue;
      }
      
      // Create new entry
      await this.set(key, amount);
      return amount;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  // Batch operations
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (this.isConnected) {
        const values = await this.redis.mget(...keys);
        return values.map(value => value ? JSON.parse(value) : null);
      }

      // Fallback implementation
      return Promise.all(keys.map(key => this.get<T>(key)));
    } catch (error) {
      this.stats.errors++;
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  async mset<T = any>(entries: Record<string, T>, ttl: number = this.defaultTTL): Promise<boolean> {
    try {
      if (this.isConnected) {
        const pipeline = this.redis.pipeline();
        
        for (const [key, value] of Object.entries(entries)) {
          pipeline.setex(key, ttl, JSON.stringify(value));
        }
        
        await pipeline.exec();
      }

      // Update fallback
      for (const [key, value] of Object.entries(entries)) {
        await this.set(key, value, ttl);
      }
      
      return true;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache mset error:', error);
      return false;
    }
  }

  // Pattern-based operations
  async keys(pattern: string): Promise<string[]> {
    try {
      if (this.isConnected) {
        const keys = await this.redis.keys(pattern);
        return keys;
      }

      // Fallback - return keys from fallback
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return Array.from(this.fallback.keys()).filter(key => regex.test(key));
    } catch (error) {
      this.stats.errors++;
      console.error('Cache keys error:', error);
      return [];
    }
  }

  async clear(pattern: string = '*'): Promise<boolean> {
    try {
      if (this.isConnected) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }

      // Clear from fallback
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      for (const key of this.fallback.keys()) {
        if (regex.test(key)) {
          this.fallback.delete(key);
        }
      }

      return true;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache clear error:', error);
      return false;
    }
  }

  // TTL operations
  async ttl(key: string): Promise<number> {
    try {
      if (this.isConnected) {
        return await this.redis.ttl(key);
      }

      // Fallback TTL
      const entry = this.fallback.get(key);
      if (entry) {
        return Math.max(0, Math.ceil((entry.expiry - Date.now()) / 1000));
      }
      
      return -1;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache ttl error:', error);
      return -1;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      if (this.isConnected) {
        const result = await this.redis.expire(key, ttl);
        return result === 1;
      }

      // Update fallback expiry
      const entry = this.fallback.get(key);
      if (entry) {
        entry.expiry = Date.now() + (ttl * 1000);
      }
      
      return true;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache expire error:', error);
      return false;
    }
  }

  // Cache utilities
  getStats(): CacheStats {
    return { ...this.stats };
  }

  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      memory: process.memoryUsage()
    };
  }

  async isConnected(): Promise<boolean> {
    try {
      if (this.isConnected) {
        await this.redis.ping();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  disconnect(): void {
    if (this.redis) {
      this.redis.disconnect();
      this.isConnected = false;
    }
  }

  // Private methods
  private cleanupFallback(): void {
    const now = Date.now();
    for (const [key, entry] of this.fallback.entries()) {
      if (now >= entry.expiry) {
        this.fallback.delete(key);
      }
    }
    
    // Limit fallback cache size
    if (this.fallback.size > 1000) {
      const entries = Array.from(this.fallback.entries());
      entries.sort((a, b) => a[1].createdAt - b[1].createdAt);
      
      // Keep only the most recent 1000 entries
      const toKeep = entries.slice(-1000);
      this.fallback.clear();
      for (const [key, entry] of toKeep) {
        this.fallback.set(key, entry);
      }
    }
  }

  // Cache helpers for common patterns
  async cacheProduct(productId: string, product: any, ttl: number = this.defaultTTL): Promise<void> {
    const key = `product:${productId}`;
    await this.set(key, product, ttl);
  }

  async getProduct(productId: string): Promise<any | null> {
    const key = `product:${productId}`;
    return this.get(key);
  }

  async cacheCategoryProducts(categoryId: string, products: any[], ttl: number = this.defaultTTL): Promise<void> {
    const key = `category:${categoryId}:products`;
    await this.set(key, products, ttl);
  }

  async getCategoryProducts(categoryId: string): Promise<any[] | null> {
    const key = `category:${categoryId}:products`;
    return this.get(key);
  }

  async cacheUserSession(userId: string, session: any, ttl: number = 1800): Promise<void> {
    const key = `session:${userId}`;
    await this.set(key, session, ttl);
  }

  async getUserSession(userId: string): Promise<any | null> {
    const key = `session:${userId}`;
    return this.get(key);
  }

  async cacheSearchResults(query: string, results: any[], ttl: number = 900): Promise<void> {
    const key = `search:${query}`;
    await this.set(key, results, ttl);
  }

  async getSearchResults(query: string): Promise<any[] | null> {
    const key = `search:${query}`;
    return this.get(key);
  }

  async cacheRecommendations(userId: string, recommendations: any[], ttl: number = 3600): Promise<void> {
    const key = `recommendations:${userId}`;
    await this.set(key, recommendations, ttl);
  }

  async getRecommendations(userId: string): Promise<any[] | null> {
    const key = `recommendations:${userId}`;
    return this.get(key);
  }
}

// Export singleton instance with default configuration
export const cache = EnterpriseCache.getInstance({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
});

// Export cache helper functions
export default cache;