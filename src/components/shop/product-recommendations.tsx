"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  Star,
  Package,
  Heart,
  ShoppingCart,
  ExternalLink,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  image_url: string;
  average_rating: number;
  review_count: number;
  category_name: string;
  brand: string;
  in_stock: boolean;
  is_organic: boolean;
  tags?: string[];
}

interface Recommendation {
  productId: string;
  score: number;
  reason: string;
  type:
    | "similar"
    | "complementary"
    | "trending"
    | "personalized"
    | "cross_sell"
    | "up_sell";
  confidence: number;
}

interface ProductRecommendationsProps {
  currentProductId?: string;
  userId?: string;
  category?: string;
  maxRecommendations?: number;
  showTypes?: boolean;
}

export function ProductRecommendations({
  currentProductId,
  userId,
  category,
  maxRecommendations = 6,
  showTypes = true,
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecommendations();
  }, [currentProductId, userId, category]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError("");

      const context = {
        userId,
        currentProductId,
        category,
        limit: maxRecommendations,
      };

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.recommendations || []);
        setProducts(data.products || []);
      } else {
        setError(data.error || "Failed to load recommendations");
      }
    } catch (err) {
      setError("Error loading recommendations");
      console.error("Recommendations error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "similar":
        return <Package className="h-4 w-4" />;
      case "complementary":
        return <Sparkles className="h-4 w-4" />;
      case "trending":
        return <TrendingUp className="h-4 w-4" />;
      case "personalized":
        return <Users className="h-4 w-4" />;
      case "cross_sell":
        return <ShoppingCart className="h-4 w-4" />;
      case "up_sell":
        return <Star className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getRecommendationBadgeColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800";
    if (confidence >= 0.7) return "bg-blue-100 text-blue-800";
    if (confidence >= 0.5) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  const formatReason = (reason: string) => {
    return reason.charAt(0).toUpperCase() + reason.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading personalized recommendations...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="mb-6">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Alert className="mb-6">
        <AlertDescription>
          No recommendations available. Continue browsing to get personalized
          suggestions.
        </AlertDescription>
      </Alert>
    );
  }

  // Group recommendations by type
  const groupedRecommendations = recommendations.reduce(
    (groups, rec) => {
      const type = rec.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(rec);
      return groups;
    },
    {} as Record<string, Recommendation[]>,
  );

  const getProductById = (productId: string): Product | undefined => {
    return products.find((p) => p.id === productId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>
            AI-powered suggestions based on your preferences and browsing
            behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showTypes && (
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(groupedRecommendations).map(([type, recs]) => (
                <Badge
                  key={type}
                  variant="outline"
                  className="flex items-center gap-1 cursor-pointer hover:bg-accent"
                >
                  {getRecommendationIcon(type)}
                  <span className="ml-1">{formatReason(type)}</span>
                  <span className="ml-2 text-xs">({recs.length})</span>
                </Badge>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations
              .slice(0, maxRecommendations)
              .map((recommendation, index) => {
                const product = getProductById(recommendation.productId);

                if (!product) return null;

                return (
                  <Card
                    key={recommendation.productId}
                    className="overflow-hidden group hover:shadow-lg transition-shadow"
                  >
                    <div className="relative">
                      {/* Recommendation badge */}
                      <div className="absolute top-2 right-2 z-10">
                        <Badge
                          className={getRecommendationBadgeColor(
                            recommendation.confidence,
                          )}
                        >
                          <div className="flex items-center gap-1">
                            {getRecommendationIcon(recommendation.type)}
                            <span className="text-xs ml-1">
                              {Math.round(recommendation.confidence * 100)}%
                              match
                            </span>
                          </div>
                        </Badge>
                      </div>

                      {/* Product image */}
                      <div className="aspect-square bg-gray-100 relative">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}

                        {/* Organic badge */}
                        {product.is_organic && (
                          <Badge
                            className="absolute top-2 left-2 bg-green-500 text-white"
                            variant="secondary"
                          >
                            Organic
                          </Badge>
                        )}
                      </div>

                      {/* Product details */}
                      <div className="p-4">
                        <div className="mb-2">
                          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary">
                            {product.name}
                          </h3>
                          {product.brand && (
                            <p className="text-xs text-muted-foreground">
                              {product.brand}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1 mb-3">
                          {/* Rating */}
                          {product.average_rating > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < Math.floor(product.average_rating)
                                        ? "fill-yellow-400"
                                        : "fill-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground ml-1">
                                {product.average_rating.toFixed(1)} (
                                {product.review_count})
                              </span>
                            </div>
                          )}

                          {/* Price */}
                          <div className="flex items-center justify-between">
                            <div>
                              {product.original_price > product.price && (
                                <span className="text-xs text-muted-foreground line-through">
                                  ₹{product.original_price}
                                </span>
                              )}
                              <span className="font-bold text-primary">
                                ₹{product.price}
                              </span>
                            </div>
                            {product.in_stock ? (
                              <Badge variant="outline" className="text-xs">
                                In Stock
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Recommendation reason */}
                        <div className="bg-muted/50 rounded p-2 mb-3">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Why this?</span>{" "}
                            {recommendation.reason}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() =>
                              addToWishlist(recommendation.productId)
                            }
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => addToCart(recommendation.productId)}
                            disabled={!product.in_stock}
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Add to Cart
                          </Button>
                        </div>

                        {/* Category and tags */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{product.category_name}</span>
                          {product.tags && product.tags.length > 0 && (
                            <div className="flex gap-1">
                              {product.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* View all recommendations */}
      {recommendations.length > maxRecommendations && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() =>
              (window.location.href = `/search?q=&category=${category || ""}&sort=relevance`)
            }
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View All Recommendations
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper functions
function addToWishlist(productId: string) {
  // Implement wishlist functionality
  console.log("Added to wishlist:", productId);
}

function addToCart(productId: string) {
  // Implement add to cart functionality
  console.log("Added to cart:", productId);
}

export default ProductRecommendations;
