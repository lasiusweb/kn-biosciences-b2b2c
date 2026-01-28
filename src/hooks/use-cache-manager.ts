"use client";

import { useState, useEffect, useCallback } from "react";

interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  hitRate: number;
  memoryUsage: number;
  totalKeys: number;
  enabled: boolean;
}

interface CacheItem {
  key: string;
  value: any;
  ttl: number;
  tags: string[];
  timestamp: number;
  size: number;
}

export function useCacheManager() {
  const [metrics, setMetrics] = useState<CacheMetrics>({
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    hitRate: 0,
    memoryUsage: 0,
    totalKeys: 0,
    enabled: true,
  });
  const [cacheItems, setCacheItems] = useState<CacheItem[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  // Simulate cache operations (in real app, these would call the backend)
  const get = useCallback(async (key: string): Promise<any> => {
    try {
      // Simulate cache hit/miss
      const isHit = Math.random() > 0.3;

      setMetrics((prev) => ({
        ...prev,
        hits: isHit ? prev.hits + 1 : prev.hits,
        misses: isHit ? prev.misses : prev.misses + 1,
        hitRate: isHit
          ? ((prev.hits + 1) / (prev.hits + prev.misses + 1)) * 100
          : (prev.hits / (prev.hits + prev.misses + 1)) * 100,
      }));

      if (isHit) {
        // Return mock data
        return { data: `cached_value_for_${key}`, timestamp: Date.now() };
      }

      return null;
    } catch (error) {
      setMetrics((prev) => ({ ...prev, errors: prev.errors + 1 }));
      return null;
    }
  }, []);

  const set = useCallback(
    async (
      key: string,
      value: any,
      ttl: number = 1800,
      tags: string[] = [],
    ): Promise<void> => {
      try {
        const item: CacheItem = {
          key,
          value,
          ttl,
          tags,
          timestamp: Date.now(),
          size: JSON.stringify(value).length,
        };

        setCacheItems((prev) => [item, ...prev.slice(0, 99)]); // Keep last 100 items
        setMetrics((prev) => ({
          ...prev,
          sets: prev.sets + 1,
          totalKeys: prev.totalKeys + 1,
          memoryUsage: prev.memoryUsage + item.size,
        }));
      } catch (error) {
        setMetrics((prev) => ({ ...prev, errors: prev.errors + 1 }));
      }
    },
    [],
  );

  const invalidate = useCallback(async (key: string): Promise<void> => {
    try {
      setCacheItems((prev) => prev.filter((item) => item.key !== key));
      setMetrics((prev) => ({
        ...prev,
        deletes: prev.deletes + 1,
        totalKeys: Math.max(0, prev.totalKeys - 1),
      }));
    } catch (error) {
      setMetrics((prev) => ({ ...prev, errors: prev.errors + 1 }));
    }
  }, []);

  const invalidateByTag = useCallback(async (tag: string): Promise<void> => {
    try {
      setCacheItems((prev) => prev.filter((item) => !item.tags.includes(tag)));
      setMetrics((prev) => ({
        ...prev,
        deletes: prev.deletes + 1,
        totalKeys: Math.max(0, prev.totalKeys - 1),
      }));
    } catch (error) {
      setMetrics((prev) => ({ ...prev, errors: prev.errors + 1 }));
    }
  }, []);

  const clear = useCallback(async (): Promise<void> => {
    try {
      setCacheItems([]);
      setMetrics((prev) => ({
        ...prev,
        deletes: prev.deletes + prev.totalKeys,
        totalKeys: 0,
        memoryUsage: 0,
        hits: 0,
        misses: 0,
        hitRate: 0,
      }));
    } catch (error) {
      setMetrics((prev) => ({ ...prev, errors: prev.errors + 1 }));
    }
  }, []);

  const warmUp = useCallback(
    async (
      items: Array<{ key: string; data: any; ttl?: number; tags?: string[] }>,
    ): Promise<void> => {
      try {
        const promises = items.map((item) =>
          set(item.key, item.data, item.ttl, item.tags),
        );
        await Promise.all(promises);
      } catch (error) {
        setMetrics((prev) => ({ ...prev, errors: prev.errors + 1 }));
      }
    },
    [set],
  );

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random cache activity
      if (Math.random() > 0.7) {
        const action = Math.random();
        if (action < 0.4) {
          // Simulate cache hit
          setMetrics((prev) => ({
            ...prev,
            hits: prev.hits + 1,
            hitRate: ((prev.hits + 1) / (prev.hits + prev.misses + 1)) * 100,
          }));
        } else if (action < 0.7) {
          // Simulate cache miss
          setMetrics((prev) => ({
            ...prev,
            misses: prev.misses + 1,
            hitRate: (prev.hits / (prev.hits + prev.misses + 1)) * 100,
          }));
        }
      }

      // Simulate memory usage fluctuation
      setMetrics((prev) => ({
        ...prev,
        memoryUsage: Math.max(
          0,
          prev.memoryUsage + (Math.random() - 0.5) * 1000,
        ),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Initialize with some mock data
  useEffect(() => {
    const mockItems: CacheItem[] = [
      {
        key: "user:123",
        value: { name: "John Doe", email: "john@example.com" },
        ttl: 1800,
        tags: ["user", "profile"],
        timestamp: Date.now() - 100000,
        size: 256,
      },
      {
        key: "product:456",
        value: { name: "Bio Fertilizer", price: 29.99 },
        ttl: 3600,
        tags: ["product", "catalog"],
        timestamp: Date.now() - 50000,
        size: 128,
      },
      {
        key: "cart:789",
        value: { items: [], total: 0 },
        ttl: 900,
        tags: ["cart", "session"],
        timestamp: Date.now() - 25000,
        size: 64,
      },
    ];

    setCacheItems(mockItems);
    setMetrics((prev) => ({
      ...prev,
      totalKeys: mockItems.length,
      memoryUsage: mockItems.reduce((sum, item) => sum + item.size, 0),
      hits: 150,
      misses: 50,
      hitRate: 75,
    }));
  }, []);

  return {
    metrics,
    cacheItems,
    isConnected,
    get,
    set,
    invalidate,
    invalidateByTag,
    clear,
    warmUp,
  };
}
