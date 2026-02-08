// Additional performance optimizations for KN Biosciences
import { cacheManager } from '@/lib/cache-manager';
import { performanceMonitor } from '@/lib/performance-monitoring';
import { logger } from '@/lib/logger';

/**
 * Memoization utility for expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(fn: T, keyFn?: (...args: Parameters<T>) => string) {
  const cache = new Map<string, ReturnType<T>>();
  
  return function(...args: Parameters<T>): ReturnType<T> {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    const result = fn.apply(this, args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  };
}

/**
 * Debounce function to limit execution frequency
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitFor: number
): (this: ThisParameterType<T>, ...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), waitFor);
  };
}

/**
 * Throttle function to ensure execution at most once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (this: ThisParameterType<T>, ...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Lazy loader for heavy components
 */
export async function lazyLoadComponent<T>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const component = await importFn();
    const endTime = performance.now();
    
    await performanceMonitor.recordMetric({
      service_name: 'component_loader',
      endpoint: componentName,
      response_time: endTime - startTime,
      cache_hit: false
    });
    
    return component.default;
  } catch (error) {
    await performanceMonitor.recordMetric({
      service_name: 'component_loader',
      endpoint: componentName,
      response_time: performance.now() - startTime,
      error: true,
      error_message: (error as Error).message,
      status_code: 500
    });
    
    throw error;
  }
}

/**
 * Virtual scroll helper for large lists
 */
export class VirtualScrollHelper {
  private itemHeight: number;
  private containerHeight: number;
  private startIndex: number = 0;
  private endIndex: number = 0;

  constructor(itemHeight: number, containerHeight: number) {
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
  }

  calculateVisibleRange(scrollTop: number, totalItems: number): { start: number; end: number } {
    const itemsPerScreen = Math.ceil(this.containerHeight / this.itemHeight);
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + itemsPerScreen + 5, totalItems); // Buffer of 5 items

    return {
      start: Math.max(0, startIndex - 2), // Small buffer before
      end: endIndex
    };
  }

  getTotalHeight(totalItems: number): number {
    return totalItems * this.itemHeight;
  }
}

/**
 * Image preloader for better UX
 */
export class ImagePreloader {
  static async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(void 0);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    });

    await Promise.all(promises);
  }

  static async preloadImageSet(imageSets: { src: string; width: number; height: number }[]): Promise<void> {
    const urls = imageSets.map(set => set.src);
    await this.preloadImages(urls);
  }
}

/**
 * Resource preloader for critical assets
 */
export class ResourcePreloader {
  static async preloadCriticalAssets(): Promise<void> {
    const criticalResources = [
      '/fonts/main-font.woff2',
      '/images/logo.svg',
      '/api/products/categories',
      '/api/products/featured'
    ];

    const promises = criticalResources.map(resource => {
      if (resource.endsWith('.woff2') || resource.endsWith('.ttf')) {
        // Preload font
        return this.preloadFont(resource);
      } else if (resource.startsWith('/api/')) {
        // Preload API data
        return this.preloadApiData(resource);
      } else {
        // Preload image
        return fetch(resource, { method: 'HEAD' });
      }
    });

    await Promise.all(promises);
  }

  private static async preloadFont(fontUrl: string): Promise<void> {
    const fontFace = new FontFaceObserver(fontUrl.split('/').pop()?.split('.')[0] || 'font');
    return fontFace.load();
  }

  private static async preloadApiData(apiUrl: string): Promise<void> {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API preload failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.warn(`Failed to preload API data from ${apiUrl}:`, error);
    }
  }
}

/**
 * Efficient data structure for product catalog
 */
export class ProductCatalogCache {
  private products: Map<string, any> = new Map();
  private categories: Map<string, string[]> = new Map(); // category -> productIds
  private searchIndex: Map<string, string[]> = new Map(); // keyword -> productIds

  async initialize(products: any[]): Promise<void> {
    // Clear existing cache
    this.products.clear();
    this.categories.clear();
    this.searchIndex.clear();

    // Populate product cache
    for (const product of products) {
      this.products.set(product.id, product);
      
      // Index by category
      if (product.category_id) {
        const categoryProducts = this.categories.get(product.category_id) || [];
        categoryProducts.push(product.id);
        this.categories.set(product.category_id, categoryProducts);
      }
      
      // Index for search
      this.indexProductForSearch(product);
    }
  }

  private indexProductForSearch(product: any): void {
    const keywords = this.extractKeywords(product);
    for (const keyword of keywords) {
      const keywordProducts = this.searchIndex.get(keyword) || [];
      keywordProducts.push(product.id);
      this.searchIndex.set(keyword, keywordProducts);
    }
  }

  private extractKeywords(product: any): string[] {
    const keywords = new Set<string>();
    
    // Add name words
    if (product.name) {
      product.name.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 2) keywords.add(word);
      });
    }
    
    // Add description words
    if (product.description) {
      product.description.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 2) keywords.add(word);
      });
    }
    
    // Add category
    if (product.category_id) {
      keywords.add(product.category_id.toLowerCase());
    }
    
    // Add segment
    if (product.segment) {
      keywords.add(product.segment.toLowerCase());
    }
    
    return Array.from(keywords);
  }

  getProduct(productId: string): any | undefined {
    return this.products.get(productId);
  }

  getProductsByCategory(categoryId: string): any[] {
    const productIds = this.categories.get(categoryId) || [];
    return productIds.map(id => this.products.get(id)).filter(Boolean);
  }

  searchProducts(query: string): any[] {
    const queryWords = query.toLowerCase().split(/\s+/);
    const matchedProductIds = new Set<string>();
    
    for (const word of queryWords) {
      const wordMatches = this.searchIndex.get(word) || [];
      wordMatches.forEach(id => matchedProductIds.add(id));
    }
    
    return Array.from(matchedProductIds).map(id => this.products.get(id)).filter(Boolean);
  }

  getAllProducts(): any[] {
    return Array.from(this.products.values());
  }
}

/**
 * Batch processor for database operations
 */
export class BatchProcessor<T> {
  private items: T[] = [];
  private batchSize: number;
  private processFn: (batch: T[]) => Promise<void>;

  constructor(batchSize: number, processFn: (batch: T[]) => Promise<void>) {
    this.batchSize = batchSize;
    this.processFn = processFn;
  }

  async addItem(item: T): Promise<void> {
    this.items.push(item);
    
    if (this.items.length >= this.batchSize) {
      await this.processBatch();
    }
  }

  async addItems(items: T[]): Promise<void> {
    this.items.push(...items);
    
    while (this.items.length >= this.batchSize) {
      await this.processBatch();
    }
  }

  async processBatch(): Promise<void> {
    if (this.items.length === 0) return;
    
    const batch = this.items.splice(0, this.batchSize);
    await this.processFn(batch);
  }

  async flush(): Promise<void> {
    await this.processBatch(); // Process remaining items
  }
}

/**
 * Connection pool manager for database connections
 */
export class ConnectionPool {
  private availableConnections: any[] = [];
  private usedConnections: any[] = [];
  private maxConnections: number;
  private createConnection: () => Promise<any>;

  constructor(maxConnections: number, createConnection: () => Promise<any>) {
    this.maxConnections = maxConnections;
    this.createConnection = createConnection;
  }

  async acquire(): Promise<any> {
    if (this.availableConnections.length > 0) {
      const conn = this.availableConnections.pop();
      this.usedConnections.push(conn);
      return conn;
    }

    if (this.usedConnections.length < this.maxConnections) {
      const conn = await this.createConnection();
      this.usedConnections.push(conn);
      return conn;
    }

    // Wait for a connection to become available
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.availableConnections.length > 0) {
          clearInterval(interval);
          const conn = this.availableConnections.pop();
          this.usedConnections.push(conn);
          resolve(conn);
        }
      }, 100);
    });
  }

  release(connection: any): void {
    const index = this.usedConnections.indexOf(connection);
    if (index !== -1) {
      this.usedConnections.splice(index, 1);
      this.availableConnections.push(connection);
    }
  }

  async closeAll(): Promise<void> {
    const allConnections = [...this.availableConnections, ...this.usedConnections];
    this.availableConnections = [];
    this.usedConnections = [];

    await Promise.all(allConnections.map(conn => {
      if (conn.close) {
        return conn.close();
      }
      return Promise.resolve();
    }));
  }
}

/**
 * Prefetcher for related resources
 */
export class ResourcePrefetcher {
  private static prefetchCache = new Map<string, any>();
  private static ongoingFetches = new Map<string, Promise<any>>();

  static async prefetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    // Check if already cached
    if (this.prefetchCache.has(key)) {
      return this.prefetchCache.get(key);
    }

    // Check if fetch is already in progress
    if (this.ongoingFetches.has(key)) {
      return this.ongoingFetches.get(key);
    }

    // Start the fetch
    const fetchPromise = fetchFn()
      .then(result => {
        this.prefetchCache.set(key, result);
        this.ongoingFetches.delete(key);
        return result;
      })
      .catch(error => {
        this.ongoingFetches.delete(key);
        throw error;
      });

    this.ongoingFetches.set(key, fetchPromise);
    return fetchPromise;
  }

  static getFromCache<T>(key: string): T | undefined {
    return this.prefetchCache.get(key);
  }

  static clearCache(): void {
    this.prefetchCache.clear();
    // Don't clear ongoing fetches as they might still resolve
  }
}

/**
 * Compression utilities for data transfer
 */
export class DataCompression {
  // Simple compression by removing unnecessary fields
  static compressProductData(products: any[], fieldsToKeep: string[] = ['id', 'name', 'price', 'image_urls']): any[] {
    return products.map(product => {
      const compressed: any = {};
      for (const field of fieldsToKeep) {
        if (product[field] !== undefined) {
          compressed[field] = product[field];
        }
      }
      return compressed;
    });
  }

  // Placeholder for actual compression algorithm
  static async compressData(data: any): Promise<string> {
    // In a real implementation, use a compression algorithm like LZ-string
    return JSON.stringify(data);
  }

  static async decompressData(compressedData: string): Promise<any> {
    // In a real implementation, use a decompression algorithm
    return JSON.parse(compressedData);
  }
}

/**
 * Lazy initialization wrapper
 */
export class LazyInitializer<T> {
  private instance: T | null = null;
  private initializer: () => T | Promise<T>;
  private initialized: boolean = false;

  constructor(initializer: () => T | Promise<T>) {
    this.initializer = initializer;
  }

  async get(): Promise<T> {
    if (!this.initialized) {
      this.instance = await this.initializer();
      this.initialized = true;
    }
    return this.instance as T;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  reset(): void {
    this.instance = null;
    this.initialized = false;
  }
}

// Export all performance utilities
export const PerfUtils = {
  memoize,
  debounce,
  throttle,
  lazyLoadComponent,
  VirtualScrollHelper,
  ImagePreloader,
  ResourcePreloader,
  ProductCatalogCache,
  BatchProcessor,
  ConnectionPool,
  ResourcePrefetcher,
  DataCompression,
  LazyInitializer
};

export default PerfUtils;