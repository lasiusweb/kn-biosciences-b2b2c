"use client";

import { Product, ProductVariant } from "@/types";
import { ProductCard } from "./product-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  variants: ProductVariant[];
  isLoading?: boolean;
  onAddToCart?: (variantId: string) => void;
  role?: "customer" | "dealer" | "distributor" | "admin" | "staff";
  className?: string;
}

export function ProductGrid({
  products,
  variants,
  isLoading,
  onAddToCart,
  role,
  className,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 w-full">
        <LoadingSpinner size="lg" data-testid="loading-spinner" />
        <p className="mt-4 text-earth-600 animate-pulse">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-earth-100 rounded-lg w-full">
        <h3 className="text-xl font-semibold text-earth-900">No products found</h3>
        <p className="text-earth-600 mt-2">
          Try adjusting your filters or search criteria.
        </p>
      </div>
    );
  }

  // Create a map for quick variant lookup
  const variantMap = new Map(variants.map(v => [v.product_id, v]));

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        className
      )}
    >
      {products.map((product) => {
        const variant = variantMap.get(product.id);
        if (!variant) return null;

        return (
          <ProductCard
            key={product.id}
            product={product}
            variant={variant}
            onAddToCart={onAddToCart}
            role={role}
          />
        );
      })}
    </div>
  );
}
