"use client";

import Image from "next/image";
import Link from "next/link";
import { Product, ProductVariant } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  variant: ProductVariant;
  onAddToCart?: (variantId: string) => void;
  role?: "customer" | "dealer" | "distributor" | "admin" | "staff";
  b2bPricing?: {
    dealer?: number;
    distributor?: number;
  };
  className?: string;
}

export function ProductCard({
  product,
  variant,
  onAddToCart,
  role = "customer",
  b2bPricing,
  className,
}: ProductCardProps) {
  // Determine display price based on role
  let displayPrice = variant.price;
  if (role === "dealer" && b2bPricing?.dealer) {
    displayPrice = b2bPricing.dealer;
  } else if (role === "distributor" && b2bPricing?.distributor) {
    displayPrice = b2bPricing.distributor;
  }

  const hasDiscount = variant.compare_price && variant.compare_price > displayPrice;

  return (
    <Card className={cn("group overflow-hidden border-earth-100 hover:shadow-lg transition-all duration-300", className)}>
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-earth-50">
          <Image
            src={variant.image_urls[0] || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
              SAVE {Math.round(((variant.compare_price! - displayPrice) / variant.compare_price!) * 100)}%
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="mb-1 text-xs font-medium text-earth-500 uppercase tracking-wider">
          {product.segment.replace("_", " ")}
        </div>
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold text-earth-900 group-hover:text-organic-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-earth-600 line-clamp-2 mt-1 min-h-[2.5rem]">
          {product.short_description}
        </p>
        
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-lg font-bold text-earth-900">
            ₹{displayPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-sm text-earth-400 line-through">
              ₹{variant.compare_price!.toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={(e) => {
            e.preventDefault();
            onAddToCart?.(variant.id);
          }}
          className="w-full bg-organic-500 hover:bg-organic-600 text-white gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Add to Cart"
        >
          <ShoppingCart className="h-4 w-4" />
          Quick Add
        </Button>
      </CardFooter>
    </Card>
  );
}
