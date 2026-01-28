// CDN Integration for Static Assets and Media
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cacheManager } from "@/lib/cache/advanced-cache";

interface CDNConfig {
  baseUrl: string;
  cdnUrl: string;
  enabled: boolean;
  edgeCacheTTL: number;
  compressionEnabled: boolean;
  optimization: {
    webp: boolean;
    avif: boolean;
    resize: boolean;
    quality: number;
  };
}

interface MediaUploadRequest {
  file: File | Buffer;
  path: string;
  contentType?: string;
  optimize?: boolean;
  metadata?: Record<string, any>;
}

interface MediaInfo {
  url: string;
  cdnUrl: string;
  originalName: string;
  size: number;
  contentType: string;
  width?: number;
  height?: number;
  optimized: boolean;
  metadata: Record<string, any>;
  lastModified: string;
  etag: string;
}

class CDNManager {
  private config: CDNConfig;
  private supportedFormats = ["jpg", "jpeg", "png", "gif", "webp", "avif"];
  private maxFileSize = 50 * 1024 * 1024; // 50MB

  constructor(config: CDNConfig) {
    this.config = config;
  }

  private generateOptimizedUrl(
    originalUrl: string,
    width?: number,
    height?: number,
    format?: string,
  ): string {
    if (!this.config.enabled) {
      return originalUrl;
    }

    const url = new URL(originalUrl, this.config.cdnUrl);
    const params = new URLSearchParams();

    if (width) params.set("w", width.toString());
    if (height) params.set("h", height.toString());
    if (format && this.supportedFormats.includes(format))
      params.set("f", format);
    if (this.config.optimization.webp) params.set("webp", "true");
    if (this.config.optimization.avif) params.set("avif", "true");
    if (this.config.optimization.quality)
      params.set("q", this.config.optimization.quality.toString());

    url.search = params.toString();
    return url.toString();
  }

  private getFileExtension(filename: string): string {
    return filename.split(".").pop()?.toLowerCase() || "";
  }

  private isOptimizable(filename: string): boolean {
    const extension = this.getFileExtension(filename);
    return this.supportedFormats.includes(extension);
  }

  private async uploadToSupabase(
    file: File | Buffer,
    path: string,
    contentType?: string,
  ): Promise<{ url: string; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from("media")
        .upload(path, file, {
          contentType,
          cacheControl: `public, max-age=${this.config.edgeCacheTTL}`,
          upsert: false,
        });

      if (error) {
        return { url: "", error: error.message };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(data.path);

      return { url: publicUrl };
    } catch (error) {
      return { url: "", error: (error as Error).message };
    }
  }

  private async getImageDimensions(
    file: File,
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`,
      };
    }

    const extension = this.getFileExtension(file.name);
    if (!extension) {
      return { valid: false, error: "File must have an extension" };
    }

    return { valid: true };
  }

  async uploadMedia(request: MediaUploadRequest): Promise<MediaInfo> {
    const file = request.file as File;
    const validation = this.validateFile(file);

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = this.getFileExtension(file.name);
    const filename = `${randomString}_${timestamp}.${fileExtension}`;
    const path = `${request.path}/${filename}`;

    // Upload to Supabase Storage
    const uploadResult = await this.uploadToSupabase(
      file,
      path,
      request.contentType,
    );

    if (uploadResult.error) {
      throw new Error(`Upload failed: ${uploadResult.error}`);
    }

    // Get image dimensions if it's an image
    let width: number | undefined;
    let height: number | undefined;
    if (file.type.startsWith("image/")) {
      try {
        const dimensions = await this.getImageDimensions(file);
        width = dimensions.width;
        height = dimensions.height;
      } catch (error) {
        console.warn("Failed to get image dimensions:", error);
      }
    }

    // Generate CDN URLs
    const optimized =
      this.isOptimizable(file.name) && (request.optimize || false);
    const cdnUrl = this.generateOptimizedUrl(uploadResult.url, width, height);

    const mediaInfo: MediaInfo = {
      url: uploadResult.url,
      cdnUrl,
      originalName: file.name,
      size: file.size,
      contentType:
        file.type || request.contentType || "application/octet-stream",
      width,
      height,
      optimized,
      metadata: request.metadata || {},
      lastModified: new Date().toISOString(),
      etag: `${filename}-${file.size}`,
    };

    // Cache media info
    await cacheManager.set(`media:${path}`, mediaInfo, "long", [
      "media",
      "upload",
    ]);

    return mediaInfo;
  }

  async getMediaInfo(path: string): Promise<MediaInfo | null> {
    // Try cache first
    const cached = await cacheManager.get<MediaInfo>(`media:${path}`);
    if (cached) {
      return cached;
    }

    try {
      const { data } = supabase.storage.from("media").getPublicUrl(path);

      if (!data.publicUrl) {
        return null;
      }

      // Get file metadata
      const { data: metadata } = await supabase.storage
        .from("media")
        .list(path, { limit: 1 });

      const mediaInfo: MediaInfo = {
        url: data.publicUrl,
        cdnUrl: this.generateOptimizedUrl(data.publicUrl),
        originalName: metadata?.[0]?.name || path,
        size: metadata?.[0]?.metadata?.size || 0,
        contentType:
          metadata?.[0]?.metadata?.contenttype || "application/octet-stream",
        width: metadata?.[0]?.metadata?.width,
        height: metadata?.[0]?.metadata?.height,
        optimized: this.isOptimizable(metadata?.[0]?.name || path),
        metadata: metadata?.[0]?.metadata || {},
        lastModified: metadata?.[0]?.created_at || new Date().toISOString(),
        etag: `${path}-${metadata?.[0]?.metadata?.size || 0}`,
      };

      // Cache the result
      await cacheManager.set(`media:${path}`, mediaInfo, "long", [
        "media",
        "info",
      ]);

      return mediaInfo;
    } catch (error) {
      console.error("Error getting media info:", error);
      return null;
    }
  }

  async deleteMedia(path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from("media").remove([path]);

      if (error) {
        console.error("Error deleting media:", error);
        return false;
      }

      // Clear cache
      await cacheManager.invalidate(`media:${path}`);
      await cacheManager.invalidateByTag("media");

      return true;
    } catch (error) {
      console.error("Error deleting media:", error);
      return false;
    }
  }

  async listMedia(
    path: string = "",
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ items: MediaInfo[]; total: number }> {
    try {
      const { data, error } = await supabase.storage.from("media").list(path, {
        limit,
        offset,
        sortBy: { column: "created_at", order: "desc" },
      });

      if (error) {
        throw new Error(`Failed to list media: ${error.message}`);
      }

      const items: MediaInfo[] = [];
      for (const item of data) {
        const mediaInfo = await this.getMediaInfo(`${path}/${item.name}`);
        if (mediaInfo) {
          items.push(mediaInfo);
        }
      }

      // Get total count
      const { data: allData } = await supabase.storage.from("media").list(path);

      return {
        items,
        total: allData?.length || 0,
      };
    } catch (error) {
      console.error("Error listing media:", error);
      return { items: [], total: 0 };
    }
  }

  generateResponsiveSet(
    originalUrl: string,
    widths: number[] = [320, 768, 1024, 1920],
  ): Record<string, string> {
    const responsiveSet: Record<string, string> = {};

    for (const width of widths) {
      responsiveSet[`${width}w`] = this.generateOptimizedUrl(
        originalUrl,
        width,
        undefined,
        "webp",
      );
    }

    return responsiveSet;
  }

  getOptimizedUrl(
    originalUrl: string,
    options: {
      width?: number;
      height?: number;
      format?: "webp" | "avif" | "jpg" | "png";
      quality?: number;
    } = {},
  ): string {
    return this.generateOptimizedUrl(
      originalUrl,
      options.width,
      options.height,
      options.format,
    );
  }

  static createDefaultConfig(): CDNConfig {
    return {
      baseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      cdnUrl: process.env.NEXT_PUBLIC_CDN_URL || "",
      enabled: process.env.CDN_ENABLED === "true",
      edgeCacheTTL: parseInt(process.env.CDN_CACHE_TTL || "86400"), // 24 hours
      compressionEnabled: process.env.CDN_COMPRESSION_ENABLED !== "false",
      optimization: {
        webp: process.env.CDN_WEBP_ENABLED !== "false",
        avif: process.env.CDN_AVIF_ENABLED === "true",
        resize: process.env.CDN_RESIZE_ENABLED !== "false",
        quality: parseInt(process.env.CDN_QUALITY || "80"),
      },
    };
  }
}

export { CDNManager, type CDNConfig, type MediaUploadRequest, type MediaInfo };
export const cdnManager = new CDNManager(CDNManager.createDefaultConfig());

export default CDNManager;
