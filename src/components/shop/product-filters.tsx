"use client";

import { ProductCategory } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  segments: string[];
  categories: ProductCategory[];
  selectedSegments: string[];
  selectedCategories: string[];
  onSegmentChange: (segment: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onPriceChange: (maxPrice: number) => void;
  maxPrice?: number;
  currentMaxPrice?: number;
  className?: string;
}

export function ProductFilters({
  segments,
  categories,
  selectedSegments,
  selectedCategories,
  onSegmentChange,
  onCategoryChange,
  onPriceChange,
  maxPrice = 5000,
  currentMaxPrice,
  className,
}: ProductFiltersProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Segments */}
      <Card className="border-earth-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-earth-900">Segments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {segments.map((segment) => (
            <div key={segment} className="flex items-center space-x-2">
              <Checkbox
                id={`segment-${segment}`}
                checked={selectedSegments.includes(segment)}
                onCheckedChange={() => onSegmentChange(segment)}
              />
              <Label
                htmlFor={`segment-${segment}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
              >
                {segment.replace("_", " ")}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="border-earth-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-earth-900">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => onCategoryChange(category.id)}
              />
              <Label
                htmlFor={`category-${category.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card className="border-earth-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-earth-900">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between text-sm text-earth-600">
            <span>₹0</span>
            <span>₹{(currentMaxPrice || maxPrice).toLocaleString()}</span>
          </div>
          <Slider
            defaultValue={[currentMaxPrice || maxPrice]}
            max={maxPrice}
            step={50}
            onValueChange={(value) => onPriceChange(value[0])}
            className="cursor-pointer"
          />
        </CardContent>
      </Card>
    </div>
  );
}
