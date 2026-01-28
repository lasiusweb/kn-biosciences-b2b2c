// Performance Optimization and Code Splitting
import { NextResponse } from "next/server";
import { performanceMonitor } from "@/lib/performance/monitoring";
import { cacheManager } from "@/lib/cache/advanced-cache";

interface OptimizationConfig {
  enableCodeSplitting: boolean;
  enableCompresson: boolean;
  enableImageOptimization: boolean;
  enableFontOptimization: boolean;
  enablePrefetch: boolean;
  preloadCriticalPages: string[];
  enableServiceWorker: boolean;
  compressionLevel: "none" | "deflate" | "gzip" | "br" | "zstd";
  minify: boolean;
  assetPrefix: string;
  chunkSize: number;
  maxAge: number;
  enableSWCaching: boolean;
}

interface BundleAnalyzer {
  totalSize: number;
  compressedSize: number;
  savings: number;
  savingsPercentage: number;
  criticalPath: string;
  largestBundle: string;
  averageBundleSize: number;
  bundleCount: number;
}

interface ImageOptimization {
  src: string;
  webp: string | null;
  avif: string | null;
  width: number;
  height: number;
  quality: number;
  optimized: boolean;
  savings: number;
  sizeReduction: number;
}

class PerformanceOptimizer {
  private config: OptimizationConfig;
  private bundleCache = new Map<string, any>();

  constructor(config: OptimizationConfig) {
    this.config = config;
  }

  // Image optimization
  async optimizeImage(
    imageBuffer: ArrayBuffer,
    options: {
      quality?: number;
      width?: number;
      height?: number;
      format?: "webp" | "avif";
    } = {},
  ): Promise<ImageOptimization> {
    const originalSize = imageBuffer.byteLength;

    let optimizedImage: ArrayBuffer;
    try {
      // WebP optimization
      if (options.format === "webp" || options.format === "avif") {
        // Use Next.js built-in image optimization
        const response = await fetch(
          `https://res.cloudinary.com/v1_1/image/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.CLOUDINARY_API_KEY}`,
              "Content-Type": "application/octet-stream",
            },
            body: imageBuffer,
            upload_preset: "auto",
          },
        );

        if (response.ok) {
          const optimizedData = await response.arrayBuffer();
          optimizedImage = optimizedData.buffer;
        }
      }

      // Fallback to server-side WebP
      if (!optimizedImage || options.format !== "webp") {
        // Use Sharp for server-side optimization
        try {
          const sharp = require("sharp");
          const metadata = await sharp(imageBuffer).metadata();

          optimizedImage = await sharp(imageBuffer)
            .resize(
              options.width
                ? { width: options.width, height: options.height }
                : {},
            )
            .webp({ quality: options.quality || 80 })
            .toBuffer();
        } catch (error) {
          console.error("Image optimization failed:", error);
          optimizedImage = imageBuffer;
        }
      }

      const optimizedSize = optimizedImage.byteLength;
      const savings = originalSize - optimizedSize;
      const sizeReduction = (savings / originalSize) * 100;

      return {
        src:
          "data:image/png;base64," +
          Buffer.from(imageBuffer).toString("base64"),
        webp:
          options.format === "webp" || options.format === "avif"
            ? `data:image/${options.format};base64,` +
              Buffer.from(optimizedImage).toString("base64")
            : null,
        avif:
          options.format === "avif"
            ? `data:image/avif;base64,` +
              Buffer.from(optimizedImage).toString("base64")
            : null,
        width: options.width || 0,
        height: options.height || 0,
        optimized: true,
        savings,
        sizeReduction,
      };
    } catch (error) {
      console.error("Image optimization error:", error);
      return {
        src: "",
        webp: null,
        avif: null,
        width: 0,
        height: 0,
        quality: 0,
        optimized: false,
        savings: 0,
        sizeReduction: 0,
      };
    }
  }

  // Bundle analysis
  async analyzeBundle(bundlePath: string): Promise<BundleAnalyzer> {
    try {
      const stats = await fetch(bundlePath);
      const bundleText = await stats.text();

      const match = bundleText.match(/"totalSize":\s*([\d,]+)/);
      const totalSize = match ? parseInt(match[1]) : 0;

      const compressedMatch = bundleText.match(/"compressedSize":\s*([\d,]+)/);
      const compressedSize = compressedMatch ? parseInt(compressedMatch[1]) : 0;

      const savings = totalSize - compressedSize;
      const savingsPercentage = totalSize > 0 ? (savings / totalSize) * 100 : 0;

      // Find critical path
      const criticalMatch = bundleText.match(/"criticalPath":"([^"]*)"/);
      const criticalPath = criticalMatch ? criticalMatch[1] : "/";

      // Find largest bundle
      const sizeMatch = bundleText.match(/"largestBundleSize":\s*([\d,]+)/);
      const largestBundle = sizeMatch ? sizeMatch[1] : "0";

      const allBundlesMatch =
        bundleText.match(/"bundleCount":\s*([\d,]+)/) || [];
      const bundleCount =
        allBundlesMatch.length > 0 ? parseInt(allBundlesMatch[1]) : 0;

      return {
        totalSize,
        compressedSize,
        savings,
        savingsPercentage,
        criticalPath,
        largestBundle,
        averageBundleSize: bundleCount > 0 ? totalSize / bundleCount : 0,
        bundleCount,
      };
    } catch (error) {
      console.error("Bundle analysis error:", error);
      return {
        totalSize: 0,
        compressedSize: 0,
        savings: 0,
        savingsPercentage: 0,
        criticalPath: "",
        largestBundle: "0",
        averageBundleSize: 0,
        bundleCount: 0,
      };
    }
  }

  // Preload critical pages
  async preloadCriticalPages(pages: string[]): Promise<void> {
    if (!this.config.enablePrefetch) return;

    try {
      const promises = pages.map(async (page) => {
        // Preload component data
        await fetch(page, {
          method: "HEAD",
          cache: "force-cache",
        });
      });

      await Promise.all(promises);
    } catch (error) {
      console.error("Critical pages preloading error:", error);
    }
  }

  // Cache frequently used assets
  async warmUpCache(): Promise<void> {
    const cacheData = [
      {
        key: "home-data",
        data: async () => {
          // Fetch homepage data
          const response = await fetch("/api/home");
          return response.json();
        },
        ttl: "daily",
        tags: ["home", "critical"],
      },
      {
        key: "featured-products",
        data: async () => {
          const response = await fetch("/api/products?featured=true&limit=12");
          return response.json();
        },
        ttl: "long",
        tags: ["products", "featured", "cache-warmup"],
      },
      {
        key: "categories",
        data: async () => {
          const response = await fetch("/api/categories");
          return response.json();
        },
        ttl: "long",
        tags: ["categories", "navigation"],
      },
    ];

    await cacheManager.warmUp(cacheData);
  }

  // Service Worker registration for background tasks
  async registerServiceWorker(): Promise<void> {
    if (!this.config.enableServiceWorker) return;

    try {
      if ("serviceWorker" in navigator && "workbox" in window) {
        const swUrl = "/sw.js";

        const swRegistration = await fetch(swUrl);
        const registration = await swRegistration.text();

        if (registration.includes("service-worker registered")) {
          console.log("Service worker registered successfully");
        }
      }
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  }

  async generateOptimizedAssetUrl(
    originalUrl: string,
    optimizations: {
      width?: number;
      height?: number;
      format?: "webp" | "avif" | "jpg";
      quality?: number;
    } = {},
  ): Promise<string> {
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || "";
    if (!cdnUrl) {
      return originalUrl;
    }

    const params = new URLSearchParams();
    if (optimizations.width) params.set("w", optimizations.width.toString());
    if (optimizations.height) params.set("h", optimizations.height.toString());
    if (optimizations.format) params.set("f", optimizations.format);
    if (optimizations.quality)
      params.set("q", optimizations.quality.toString());

    return `${cdnUrl}${originalUrl}?${params.toString()}`;
  }

  async optimizeHTML(html: string): Promise<string> {
    if (!this.config.enableCompresson) {
      return html;
    }

    // Remove unnecessary whitespace
    let optimized = html;
    try {
      optimized = html
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .replace(/>\s+/g, ">") // Replace greater-than and space
        .replace(/\n+/g, "\n") // Replace newline and space
        .replace(/\t+/g, "\t") // Replace tab and space
        .replace(/\r\n+/g, "\r\n") // Replace carriage return and newline
        .replace(/>+/g, ">") // Replace greater-than and space
        .trim();
    } catch (error) {
      console.error("HTML optimization error:", error);
      return html;
    }

    return optimized;
  }

  // Generate optimized manifest
  generateManifest(bundleName: string, files: string[]): string {
    const manifest = {
      name: bundleName,
      short_name: bundleName,
      display_name: bundleName,
      description: "Optimized bundle for KN Biosciences",
      start_url: `/static/_next/static/chunks/${bundleName}.js`,
      display_url: `/static/_next/static/chunks/${bundleName}.js`,
      files: files.map((file) => ({
        name: file,
        type: "static/js",
        size: 0, // Would calculate actual file size
      })),
    };

    return JSON.stringify(manifest, null, 2);
  }

  getOptimizationConfig(): OptimizationConfig {
    return this.config;
  }

  updateConfig(updates: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  createPreset(): "production" | "development" | "testing" {
    if (process.env.NODE_ENV === "production") {
      return "production";
    } else if (process.env.NODE_ENV === "test") {
      return "testing";
    }

    return "development";
  }
}

export const performanceOptimizer = new PerformanceOptimizer({
  enableCodeSplitting: process.env.ENABLE_CODE_SPLITTING !== "false",
  enableCompresson: process.env.ENABLE_COMPRESSION !== "false",
  enableImageOptimization: process.env.ENABLE_IMAGE_OPTIMIZATION !== "false",
  enableFontOptimization: process.env.ENABLE_FONT_OPTIMIZATION !== "false",
  enablePrefetch: process.env.ENABLE_PREFETCH === "true",
  preloadCriticalPages: process.env.CRITICAL_PAGES?.split(",") || [
    "/home",
    "/shop",
    "/products",
  ],
  enableServiceWorker: process.env.ENABLE_SERVICE_WORKER === "true",
  compressionLevel:
    (process.env.COMPRESSION_LEVEL as
      | "none"
      | "deflate"
      | "gzip"
      | "br"
      | "zstd") || "gzip",
  minify: process.env.MINIFY === "true",
  assetPrefix: "/static/_next/static",
  chunkSize: parseInt(process.env.CHUNK_SIZE || "200000"), // 20KB
  maxAge: parseInt(process.env.CACHE_MAX_AGE || "31536000000"), // 1 year
  enableSWCaching: process.env.ENABLE_SW_CACHING !== "false",
});

export default PerformanceOptimizer;
