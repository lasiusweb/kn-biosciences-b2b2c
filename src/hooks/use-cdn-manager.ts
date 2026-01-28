"use client";

import { useState, useEffect, useCallback } from "react";
import {
  cdnManager,
  MediaInfo,
  MediaUploadRequest,
} from "@/lib/cdn/cdn-manager";

interface CDNMetrics {
  totalFiles: number;
  totalSize: number;
  optimizedFiles: number;
  cacheHitRate: number;
  uploadSpeed: number;
  errorRate: number;
  recentUploads: MediaInfo[];
}

export function useCDNManager() {
  const [metrics, setMetrics] = useState<CDNMetrics>({
    totalFiles: 0,
    totalSize: 0,
    optimizedFiles: 0,
    cacheHitRate: 0,
    uploadSpeed: 0,
    errorRate: 0,
    recentUploads: [],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMedia = useCallback(
    async (file: File, path: string = "uploads"): Promise<MediaInfo | null> => {
      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const request: MediaUploadRequest = {
          file,
          path,
          optimize: true,
          metadata: {
            uploadedAt: new Date().toISOString(),
            uploader: "web-client",
          },
        };

        const result = await cdnManager.uploadMedia(request);

        clearInterval(progressInterval);
        setUploadProgress(100);

        // Update metrics
        setMetrics((prev) => ({
          ...prev,
          totalFiles: prev.totalFiles + 1,
          totalSize: prev.totalSize + result.size,
          optimizedFiles: prev.optimizedFiles + (result.optimized ? 1 : 0),
          recentUploads: [result, ...prev.recentUploads.slice(0, 9)],
        }));

        return result;
      } catch (error) {
        console.error("Upload failed:", error);
        setMetrics((prev) => ({
          ...prev,
          errorRate: prev.errorRate + 1,
        }));
        return null;
      } finally {
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000);
      }
    },
    [],
  );

  const getOptimizedUrl = useCallback((url: string, options: any = {}) => {
    return cdnManager.getOptimizedUrl(url, options);
  }, []);

  const generateResponsiveSet = useCallback(
    (url: string, widths?: number[]) => {
      return cdnManager.generateResponsiveSet(url, widths);
    },
    [],
  );

  const deleteMedia = useCallback(async (path: string): Promise<boolean> => {
    try {
      const success = await cdnManager.deleteMedia(path);
      if (success) {
        setMetrics((prev) => ({
          ...prev,
          totalFiles: Math.max(0, prev.totalFiles - 1),
        }));
      }
      return success;
    } catch (error) {
      console.error("Delete failed:", error);
      return false;
    }
  }, []);

  const listMedia = useCallback(
    async (path: string = "", limit: number = 50, offset: number = 0) => {
      try {
        const result = await cdnManager.listMedia(path, limit, offset);

        // Update metrics based on the list
        const totalSize = result.items.reduce(
          (sum, item) => sum + item.size,
          0,
        );
        const optimizedCount = result.items.filter(
          (item) => item.optimized,
        ).length;

        setMetrics((prev) => ({
          ...prev,
          totalFiles: result.total,
          totalSize,
          optimizedFiles: optimizedCount,
        }));

        return result;
      } catch (error) {
        console.error("List failed:", error);
        return { items: [], total: 0 };
      }
    },
    [],
  );

  // Initialize metrics
  useEffect(() => {
    listMedia("", 50, 0);
  }, [listMedia]);

  return {
    metrics,
    isUploading,
    uploadProgress,
    uploadMedia,
    getOptimizedUrl,
    generateResponsiveSet,
    deleteMedia,
    listMedia,
  };
}
