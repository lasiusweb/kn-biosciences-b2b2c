"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCacheManager } from "@/hooks/use-cache-manager";
import {
  Database,
  Zap,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Activity,
  HardDrive,
  CheckCircle,
  XCircle,
  Timer,
  Tag,
} from "lucide-react";

function CacheItemCard({
  item,
  onInvalidate,
}: {
  item: any;
  onInvalidate: (key: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onInvalidate(item.key);
    setIsDeleting(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTTLColor = (ttl: number) => {
    if (ttl < 300) return "text-red-600"; // < 5 minutes
    if (ttl < 1800) return "text-yellow-600"; // < 30 minutes
    return "text-green-600"; // > 30 minutes
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium truncate">{item.key}</h4>
          {item.tags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {item.tags.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
          <span>{formatBytes(item.size)}</span>
          <span className={getTTLColor(item.ttl)}>
            <Timer className="h-3 w-3 inline mr-1" />
            {item.ttl}s
          </span>
          <span>{formatTime(item.timestamp)}</span>
        </div>
        {item.tags.length > 0 && (
          <div className="flex items-center space-x-1 mt-1">
            {item.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
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
  );
}

export function CacheDashboard() {
  const {
    metrics,
    cacheItems,
    isConnected,
    get,
    set,
    invalidate,
    invalidateByTag,
    clear,
    warmUp,
  } = useCacheManager();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newTTL, setNewTTL] = useState("1800");
  const [newTags, setNewTags] = useState("");

  // Extract all unique tags
  const allTags = Array.from(new Set(cacheItems.flatMap((item) => item.tags)));

  // Filter cache items
  const filteredItems = cacheItems.filter((item) => {
    const matchesSearch = item.key
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || item.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleAddItem = async () => {
    if (!newKey.trim() || !newValue.trim()) return;

    const tags = newTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    await set(newKey, JSON.parse(newValue), parseInt(newTTL), tags);

    // Reset form
    setNewKey("");
    setNewValue("");
    setNewTTL("1800");
    setNewTags("");
  };

  const handleInvalidateByTag = async (tag: string) => {
    await invalidateByTag(tag);
  };

  const handleWarmUp = async () => {
    const warmUpItems = [
      {
        key: "homepage",
        data: { title: "KN Biosciences", content: "Welcome..." },
        ttl: 3600,
        tags: ["page", "homepage"],
      },
      {
        key: "products:featured",
        data: [],
        ttl: 1800,
        tags: ["products", "featured"],
      },
      {
        key: "user:session:123",
        data: { id: 123, name: "Test User" },
        ttl: 900,
        tags: ["user", "session"],
      },
    ];
    await warmUp(warmUpItems);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (connected: boolean) => {
    return connected ? "text-green-600" : "text-red-600";
  };

  const getStatusIcon = (connected: boolean) => {
    return connected ? CheckCircle : XCircle;
  };

  const StatusIcon = getStatusIcon(isConnected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="h-6 w-6 text-organic-600" />
          <h2 className="text-2xl font-bold text-gray-900">Cache Management</h2>
          <div className="flex items-center space-x-2">
            <StatusIcon className={`h-5 w-5 ${getStatusColor(isConnected)}`} />
            <Badge className={getStatusColor(isConnected)}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleWarmUp}>
            <Zap className="h-4 w-4 mr-2" />
            Warm Up
          </Button>
          <Button variant="outline" size="sm" onClick={clear}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-organic-600" />
              <h3 className="text-sm font-medium text-gray-600">Total Keys</h3>
            </div>
            <p className="text-2xl font-semibold mt-2">
              {metrics.totalKeys.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Cached items</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-medium text-gray-600">Hit Rate</h3>
            </div>
            <p className="text-2xl font-semibold mt-2">
              {metrics.hitRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.hits} hits, {metrics.misses} misses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-600">
                Memory Usage
              </h3>
            </div>
            <p className="text-2xl font-semibold mt-2">
              {formatBytes(metrics.memoryUsage)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Used memory</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-yellow-500" />
              <h3 className="text-sm font-medium text-gray-600">Operations</h3>
            </div>
            <p className="text-2xl font-semibold mt-2">{metrics.sets}</p>
            <p className="text-xs text-gray-500 mt-1">Set operations</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Item */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-organic-600" />
              <span>Add Cache Item</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
              <Input
                placeholder="Value (JSON)"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
              <Input
                placeholder="TTL (seconds)"
                type="number"
                value={newTTL}
                onChange={(e) => setNewTTL(e.target.value)}
              />
              <Input
                placeholder="Tags (comma-separated)"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
              />
              <Button onClick={handleAddItem} className="w-full">
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cache Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-organic-600" />
                <span>Cache Items</span>
                <Badge variant="outline">{filteredItems.length}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search keys..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No cache items found
                </p>
              ) : (
                filteredItems.map((item, index) => (
                  <CacheItemCard
                    key={`${item.key}-${index}`}
                    item={item}
                    onInvalidate={invalidate}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tag Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="h-5 w-5 text-organic-600" />
            <span>Tag Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <div
                key={tag}
                className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2"
              >
                <Badge variant="outline">{tag}</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInvalidateByTag(tag)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {allTags.length === 0 && (
              <p className="text-sm text-gray-500">No tags found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
