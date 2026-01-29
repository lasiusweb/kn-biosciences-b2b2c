"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Filter,
  Search,
  X,
  ChevronDown,
  Star,
  Package,
  Truck,
  RotateCcw,
} from "lucide-react";

interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface SearchFiltersProps {
  onFiltersChange: (filters: any) => void;
  onSearch: (query: string) => void;
  initialFilters?: any;
  categories?: FilterOption[];
  brands?: FilterOption[];
  tags?: FilterOption[];
  className?: string;
}

export function SearchFilters({
  onFiltersChange,
  onSearch,
  initialFilters = {},
  categories = [],
  brands = [],
  tags = [],
  className,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<any>(initialFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>(["categories", "price"]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [rating, setRating] = useState(0);

  const filterCounts = useMemo(
    () => ({
      categories: categories.reduce(
        (acc, cat) => {
          acc[cat.id] = cat.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      brands: brands.reduce(
        (acc, brand) => {
          acc[brand.id] = brand.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      ratings: {
        "5": 45,
        "4": 123,
        "3": 234,
        "2": 189,
        "1": 267,
      } as Record<string, number>,
    }),
    [categories, brands],
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  const handleCategoryChange = (categoryId: string, checked: boolean | string) => {
    setFilters((prev: any) => {
      const currentCategories = prev.categories || [];
      if (checked === true) {
        return { ...prev, categories: [...currentCategories, categoryId] };
      } else {
        return {
          ...prev,
          categories: currentCategories.filter((id: string) => id !== categoryId),
        };
      }
    });
  };

  const handleBrandChange = (brandId: string, checked: boolean | string) => {
    setFilters((prev: any) => {
      const currentBrands = prev.brands || [];
      if (checked === true) {
        return { ...prev, brands: [...currentBrands, brandId] };
      } else {
        return {
          ...prev,
          brands: currentBrands.filter((id: string) => id !== brandId),
        };
      }
    });
  };

  const handleTagChange = (tagId: string, checked: boolean | string) => {
    setFilters((prev: any) => {
      const currentTags = prev.tags || [];
      if (checked === true) {
        return { ...prev, tags: [...currentTags, tagId] };
      } else {
        return {
          ...prev,
          tags: currentTags.filter((id: string) => id !== tagId),
        };
      }
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setPriceRange({ min: 0, max: 5000 });
    setRating(0);
    setSearchQuery("");
  };

  const applyFilters = () => {
    onFiltersChange({
      ...filters,
      priceRange,
      rating,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const selectedCategoriesCount = (filters.categories || []).length;
  const selectedBrandsCount = (filters.brands || []).length;
  const selectedTagsCount = (filters.tags || []).length;
  const activeFiltersCount =
    selectedCategoriesCount +
    selectedBrandsCount +
    selectedTagsCount +
    (rating > 0 ? 1 : 0) +
    (priceRange.min > 0 || priceRange.max < 5000 ? 1 : 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* Categories Section */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("categories")}
            className="flex items-center justify-between w-full font-medium text-sm"
          >
            Categories
            <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.includes("categories") ? "rotate-180" : ""}`} />
          </button>
          {expandedSections.includes("categories") && (
            <div className="space-y-2 pl-1">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${cat.id}`}
                    checked={filters.categories?.includes(cat.id)}
                    onCheckedChange={(checked) => handleCategoryChange(cat.id, checked)}
                  />
                  <label htmlFor={`cat-${cat.id}`} className="flex-1 text-sm cursor-pointer flex justify-between">
                    {cat.label}
                    <span className="text-muted-foreground text-xs">{filterCounts.categories[cat.id] || 0}</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Section */}
        <div className="space-y-3 border-t pt-4">
          <button
            onClick={() => toggleSection("price")}
            className="flex items-center justify-between w-full font-medium text-sm"
          >
            Price Range
            <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.includes("price") ? "rotate-180" : ""}`} />
          </button>
          {expandedSections.includes("price") && (
            <div className="space-y-4 px-1 pt-2">
              <Slider
                min={0}
                max={5000}
                step={100}
                value={[priceRange.min, priceRange.max]}
                onValueChange={([min, max]) => setPriceRange({ min, max })}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>₹{priceRange.min}</span>
                <span>₹{priceRange.max}</span>
              </div>
            </div>
          )}
        </div>

        {/* Rating Section */}
        <div className="space-y-3 border-t pt-4">
          <button
            onClick={() => toggleSection("rating")}
            className="flex items-center justify-between w-full font-medium text-sm"
          >
            Customer Rating
            <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.includes("rating") ? "rotate-180" : ""}`} />
          </button>
          {expandedSections.includes("rating") && (
            <div className="space-y-2 pl-1">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rat-${stars}`}
                    checked={rating === stars}
                    onCheckedChange={(checked) => setRating(checked === true ? stars : 0)}
                  />
                  <label htmlFor={`rat-${stars}`} className="flex-1 flex items-center text-sm cursor-pointer">
                    <div className="flex items-center mr-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-auto">{filterCounts.ratings[String(stars)] || 0}</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4">
          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SearchFilters;