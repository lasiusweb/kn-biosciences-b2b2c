"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCDNManager } from "@/hooks/use-cdn-manager";
import {
  Cloud,
  Upload,
  Download,
  Trash2,
  Image as ImageIcon,
  File,
  Zap,
  HardDrive,
  Activity,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

interface MediaItemProps {
  media: any;
  onDelete: (path: string) => void;
  onOptimize: (url: string) => void;
}

function MediaItem({ media, onDelete, onOptimize }: MediaItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(media.url);
    setIsDeleting(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith("image/")) {
      return <ImageIcon className="h-8 w-8 text-organic-600" />;
    }
    return <File className="h-8 w-8 text-gray-400" />;
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      {getFileIcon(media.contentType)}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{media.originalName}</p>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>{formatFileSize(media.size)}</span>
          {media.optimized && (
            <Badge variant="secondary" className="text-xs">
              Optimized
            </Badge>
          )}
          {media.width && media.height && (
            <span>
              {media.width}×{media.height}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-1">
        {media.contentType.startsWith("image/") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOptimize(media.url)}
          >
            <Zap className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
}

export function CDNDashboard() {
  const {
    metrics,
    isUploading,
    uploadProgress,
    uploadMedia,
    getOptimizedUrl,
    deleteMedia,
    listMedia,
  } = useCDNManager();
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [uploadPath, setUploadPath] = useState("uploads");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMediaList();
  }, []);

  const loadMediaList = async () => {
    const result = await listMedia("", 50, 0);
    setMediaList(result.items);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const result = await uploadMedia(file, uploadPath);

    if (result) {
      await loadMediaList();
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (url: string) => {
    const path = url.split("/").pop() || "";
    await deleteMedia(path);
    await loadMediaList();
  };

  const handleOptimize = (url: string) => {
    const optimizedUrl = getOptimizedUrl(url, {
      width: 800,
      quality: 80,
      format: "webp",
    });
    console.log("Optimized URL:", optimizedUrl);
    // In a real app, you might copy this to clipboard or show it in a modal
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const optimizationRate =
    metrics.totalFiles > 0
      ? Math.round((metrics.optimizedFiles / metrics.totalFiles) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Cloud className="h-6 w-6 text-organic-600" />
          <h2 className="text-2xl font-bold text-gray-900">CDN Management</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadMediaList}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4 text-organic-600" />
              <h3 className="text-sm font-medium text-gray-600">Total Files</h3>
            </div>
            <p className="text-2xl font-semibold mt-2">
              {metrics.totalFiles.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Stored files</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-600">
                Storage Used
              </h3>
            </div>
            <p className="text-2xl font-semibold mt-2">
              {formatFileSize(metrics.totalSize)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total storage</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <h3 className="text-sm font-medium text-gray-600">Optimized</h3>
            </div>
            <p className="text-2xl font-semibold mt-2">{optimizationRate}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.optimizedFiles} files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-medium text-gray-600">
                Cache Hit Rate
              </h3>
            </div>
            <p className="text-2xl font-semibold mt-2">
              {Math.round(metrics.cacheHitRate * 100)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Edge performance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-organic-600" />
              <span>Upload Files</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Upload path (e.g., uploads/images)"
                  value={uploadPath}
                  onChange={(e) => setUploadPath(e.target.value)}
                />
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-organic-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Drop files here or click to browse
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </>
                  )}
                </Button>
              </div>

              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-organic-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <div className="text-xs text-gray-500">
                <p>
                  Supported formats: Images (JPG, PNG, WebP, AVIF), Documents
                  (PDF, DOC, DOCX)
                </p>
                <p>Maximum file size: 50MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-organic-600" />
              <span>Recent Uploads</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {metrics.recentUploads.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent uploads
                </p>
              ) : (
                metrics.recentUploads.map((media, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      {media.contentType.startsWith("image/") ? (
                        <ImageIcon className="h-4 w-4 text-organic-600" />
                      ) : (
                        <File className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium truncate">
                        {media.originalName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {media.optimized && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Optimized
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Media Library */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5 text-organic-600" />
              <span>Media Library</span>
            </div>
            <Badge variant="outline">{mediaList.length} files</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {mediaList.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No files in the media library. Upload some files to get started.
              </p>
            ) : (
              mediaList.map((media, index) => (
                <MediaItem
                  key={index}
                  media={media}
                  onDelete={handleDelete}
                  onOptimize={handleOptimize}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
