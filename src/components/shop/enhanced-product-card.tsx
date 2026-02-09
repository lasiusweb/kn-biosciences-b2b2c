// components/shop/enhanced-product-card.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Heart, Star, Shield, Truck, RotateCcw, Eye, Share2, Plus, Minus } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EnhancedProductCardProps {
  product: Product;
  variant: ProductVariant;
  onAddToCart?: (variantId: string, quantity: number) => void;
  onWishlistToggle?: (productId: string) => void;
  isInWishlist?: boolean;
  role?: 'customer' | 'dealer' | 'distributor' | 'admin';
  b2bPricing?: {
    dealer?: number;
    distributor?: number;
  };
  className?: string;
  showQuickView?: boolean;
  showWishlist?: boolean;
  showRatings?: boolean;
  showBadges?: boolean;
  showDescription?: boolean;
  showQuantitySelector?: boolean;
}

export function EnhancedProductCard({
  product,
  variant,
  onAddToCart,
  onWishlistToggle,
  isInWishlist = false,
  role = 'customer',
  b2bPricing,
  className,
  showQuickView = true,
  showWishlist = true,
  showRatings = true,
  showBadges = true,
  showDescription = false,
  showQuantitySelector = false
}: EnhancedProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist);

  // Determine display price based on role
  let displayPrice = variant.price;
  if (role === 'dealer' && b2bPricing?.dealer) {
    displayPrice = b2bPricing.dealer;
  } else if (role === 'distributor' && b2bPricing?.distributor) {
    displayPrice = b2bPricing.distributor;
  }

  const hasDiscount = variant.compare_price && variant.compare_price > displayPrice;
  const isOutOfStock = variant.stock_quantity <= 0;
  const isLowStock = variant.stock_quantity > 0 && variant.stock_quantity <= 10;
  const discountPercent = hasDiscount 
    ? Math.round(((variant.compare_price! - displayPrice) / variant.compare_price!) * 100) 
    : 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    
    setIsLoading(true);
    try {
      await onAddToCart?.(variant.id, quantity);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    onWishlistToggle?.(product.id);
  };

  // Format price with Indian Rupee symbol and proper formatting
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <motion.div
      className={cn("group relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "overflow-hidden border-earth-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col",
        isOutOfStock && "opacity-70",
        className
      )}>
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-earth-50">
          <Link href={`/product/${product.slug}`}>
            <Image
              src={variant.image_urls?.[0] || "/placeholder-product.jpg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={false}
            />
          </Link>
          
          {/* Badges */}
          {showBadges && (
            <div className="absolute top-2 left-2 space-y-2">
              {hasDiscount && (
                <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                  {discountPercent}% OFF
                </Badge>
              )}
              {product.featured && (
                <Badge className="bg-organic-500 text-white text-xs px-2 py-1">
                  Featured
                </Badge>
              )}
              {isLowStock && !isOutOfStock && (
                <Badge variant="destructive" className="text-xs px-2 py-1">
                  Low Stock
                </Badge>
              )}
              {product.segment && (
                <Badge variant="secondary" className="text-xs px-2 py-1 capitalize">
                  {product.segment.replace('_', ' ')}
                </Badge>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className={cn(
            "absolute top-2 right-2 flex flex-col gap-2 transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            {showWishlist && (
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                onClick={handleWishlistToggle}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart 
                  className={cn(
                    "h-4 w-4",
                    isWishlisted ? "fill-current text-red-500" : "text-earth-600"
                  )} 
                />
              </Button>
            )}
            
            {showQuickView && (
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                aria-label="Quick view"
              >
                <Eye className="h-4 w-4 text-earth-600" />
              </Button>
            )}
            
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
              aria-label="Share product"
            >
              <Share2 className="h-4 w-4 text-earth-600" />
            </Button>
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="text-white font-bold text-lg bg-red-500 px-4 py-2 rounded">
                OUT OF STOCK
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex-1">
            <div className="mb-2">
              <Link href={`/product/${product.slug}`}>
                <h3 className="font-semibold text-earth-900 line-clamp-2 group-hover:text-organic-600 transition-colors">
                  {product.name}
                </h3>
              </Link>
              {showDescription && product.description && (
                <p className="text-sm text-earth-600 mt-1 line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>

            {/* Ratings */}
            {showRatings && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "h-4 w-4",
                        i < Math.floor(product.average_rating || 0) 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-gray-300"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-xs text-earth-500 ml-1">
                  {product.average_rating?.toFixed(1) || '0.0'} 
                  <span className="ml-1">({product.review_count || 0})</span>
                </span>
              </div>
            )}

            {/* Pricing */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-bold text-organic-600">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-earth-400 line-through">
                  {formatPrice(variant.compare_price!)}
                </span>
              )}
            </div>

            {/* Variant Info */}
            <div className="flex flex-wrap gap-1 mb-3">
              {variant.weight && (
                <Badge variant="outline" className="text-xs">
                  {variant.weight} {variant.weight_unit}
                </Badge>
              )}
              {variant.packing_type && (
                <Badge variant="outline" className="text-xs">
                  {variant.packing_type}
                </Badge>
              )}
              {variant.form && (
                <Badge variant="outline" className="text-xs">
                  {variant.form}
                </Badge>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          {showQuantitySelector && (
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(q => Math.min(99, q + 1))}
                disabled={quantity >= 99}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="space-y-2">
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isLoading}
              className={cn(
                "w-full h-10 text-sm",
                isOutOfStock 
                  ? "bg-gray-300 cursor-not-allowed" 
                  : "bg-organic-500 hover:bg-organic-600"
              )}
            >
              {isLoading ? (
                <RotateCcw className="h-4 w-4 animate-spin" />
              ) : isOutOfStock ? (
                "Out of Stock"
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {showQuantitySelector ? "Add to Cart" : "Buy Now"}
                </>
              )}
            </Button>

            {/* Trust Indicators */}
            <div className="flex items-center justify-between text-xs text-earth-500">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <Truck className="h-3 w-3" />
                <span>Fast Delivery</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default EnhancedProductCard;