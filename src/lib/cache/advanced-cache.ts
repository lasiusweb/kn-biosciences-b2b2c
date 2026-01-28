// Advanced Caching with Redis Integration
import Redis from "ioredis";

interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  ttl: {
    short: number; // 5 minutes
    medium: number; // 30 minutes
    long: number; // 2 hours
    daily: number; // 24 hours
  };
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: number;
  tags: string[];
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
}

class AdvancedCacheManager {
  private redis: Redis | null = null;
  private config: CacheConfig;
  private stats: CacheStats;
  private localCache: Map<string, CacheItem<any>> = new Map();
  private enabled: boolean = true;

  constructor(config: CacheConfig) {
    this.config = config;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
    };

    try {
      this.redis = new Redis({
        host: config.host,
        port: config.port,
        password: config.password,
        db: config.db,
        keyPrefix: config.keyPrefix,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
      });

      this.redis.on("connect", () => {
        console.log("Redis connected successfully");
        this.enabled = true;
      });

      this.redis.on("error", (error: Error) => {
        console.error("Redis connection error:", error);
        this.enabled = false;
      });

      this.redis.on("close", () => {
        console.log("Redis connection closed");
        this.enabled = false;
      });
    } catch (error) {
      console.error("Failed to initialize Redis:", error);
      this.enabled = false;
    }
  }

  private generateKey(key: string, tags: string[] = []): string {
    const version = Date.now().toString(36);
    const tagHash = tags.length > 0 ? this.hashTags(tags) : "";
    return `${key}:${version}${tagHash}`;
  }

  private hashTags(tags: string[]): string {
    return tags.sort().join(":").hashCode().toString(36);
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl * 1000;
  }

  private async getFromRedis<T>(key: string): Promise<T | null> {
    if (!this.enabled || !this.redis) return null;

    try {
      const serialized = await this.redis.get(key);
      if (!serialized) return null;

      const item: CacheItem<T> = JSON.parse(serialized);
      if (this.isExpired(item)) {
        await this.redis.del(key);
        return null;
      }

      return item.data;
    } catch (error) {
      this.stats.errors++;
      console.error("Redis get error:", error);
      return null;
    }
  }

  private async setToRedis<T>(
    key: string,
    data: T,
    ttl: number,
    tags: string[] = [],
  ): Promise<void> {
    if (!this.enabled || !this.redis) return;

    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        version: 1,
        tags,
      };

      const serialized = JSON.stringify(item);
      await this.redis.setex(key, ttl, serialized);
      this.stats.sets++;

      // Add tags to tag index for invalidation
      if (tags.length > 0) {
        await this.addTagsToIndex(key, tags);
      }
    } catch (error) {
      this.stats.errors++;
      console.error("Redis set error:", error);
    }
  }

  private async addTagsToIndex(key: string, tags: string[]): Promise<void> {
    if (!this.enabled || !this.redis) return;

    for (const tag of tags) {
      await this.redis.sadd(`tag:${tag}`, key);
      await this.redis.expire(`tag:${tag}`, this.config.ttl.daily);
    }
  }

  private async invalidateByTags(tags: string[]): Promise<void> {
    if (!this.enabled || !this.redis) return;

    for (const tag of tags) {
      const keys = await this.redis.smembers(`tag:${tag}`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      await this.redis.del(`tag:${tag}`);
    }
  }

  async get<T>(
    key: string,
    fallback?: () => Promise<T>,
    ttl: "short" | "medium" | "long" | "daily" = "medium",
    tags: string[] = [],
  ): Promise<T | null> {
    // Check local cache first
    const localItem = this.localCache.get(key);
    if (localItem && !this.isExpired(localItem)) {
      this.stats.hits++;
      return localItem.data;
    }

    // Check Redis cache
    const redisData = await this.getFromRedis<T>(key);
    if (redisData) {
      this.stats.hits++;
      // Update local cache
      this.localCache.set(key, {
        data: redisData,
        timestamp: Date.now(),
        ttl: this.config.ttl[ttl],
        version: 1,
        tags,
      });
      return redisData;
    }

    this.stats.misses++;

    // Use fallback if provided
    if (fallback) {
      try {
        const data = await fallback();
        await this.set(key, data, ttl, tags);
        return data;
      } catch (error) {
        console.error("Cache fallback error:", error);
        this.stats.errors++;
      }
    }

    return null;
  }

  async set<T>(
    key: string,
    data: T,
    ttl: "short" | "medium" | "long" | "daily" = "medium",
    tags: string[] = [],
  ): Promise<void> {
    const cacheTtl = this.config.ttl[ttl];

    // Update local cache
    this.localCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: cacheTtl,
      version: 1,
      tags,
    });

    // Update Redis cache
    const cacheKey = this.generateKey(key, tags);
    await this.setToRedis(cacheKey, data, cacheTtl, tags);
  }

  async invalidate(key: string): Promise<void> {
    // Remove from local cache
    this.localCache.delete(key);
    this.stats.deletes++;

    // Remove from Redis (all versions)
    if (!this.enabled || !this.redis) return;

    try {
      const pattern = `${key}:*`;
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.stats.errors++;
      console.error("Redis invalidate error:", error);
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    await this.invalidateByTags([tag]);
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    // Clear local cache items with matching tags
    for (const [key, item] of Array.from(this.localCache.entries())) {
      if (item.tags.some((tag) => tags.includes(tag))) {
        this.localCache.delete(key);
      }
    }

    // Clear Redis cache
    await this.invalidateByTags(tags);
  }

  async warmUp<T>(
    items: Array<{
      key: string;
      data: T | Promise<T>;
      ttl?: "short" | "medium" | "long" | "daily";
      tags?: string[];
    }>,
  ): Promise<void> {
    const promises = items.map(async (item) => {
      try {
        const data = item.data instanceof Promise ? await item.data : item.data;
        await this.set(item.key, data, item.ttl || "medium", item.tags || []);
      } catch (error) {
        console.error(`Cache warm-up error for key ${item.key}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  async getStats(): Promise<CacheStats & { memoryUsage: any; info: any }> {
    const redisStats =
      this.enabled && this.redis
        ? {
            memoryUsage: await this.redis.memory("usage"),
            info: await this.redis.info(),
          }
        : { memoryUsage: null, info: null };

    return {
      ...this.stats,
      ...redisStats,
    };
  }

  async clear(): Promise<void> {
    // Clear local cache
    this.localCache.clear();

    // Clear Redis cache
    if (!this.enabled || !this.redis) return;

    try {
      await this.redis.flushdb();
    } catch (error) {
      this.stats.errors++;
      console.error("Redis clear error:", error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  // Static utility methods
  static createDefaultConfig(): CacheConfig {
    return {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || "0"),
      keyPrefix: process.env.REDIS_KEY_PREFIX || "knbiosciences:",
      ttl: {
        short: 300, // 5 minutes
        medium: 1800, // 30 minutes
        long: 7200, // 2 hours
        daily: 86400, // 24 hours
      },
    };
  }
}

// Extend String prototype for hash function
declare global {
  interface String {
    hashCode(): number;
  }
}

String.prototype.hashCode = function (): number {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

export const cacheManager = new AdvancedCacheManager(
  AdvancedCacheManager.createDefaultConfig(),
);

export default AdvancedCacheManager;
