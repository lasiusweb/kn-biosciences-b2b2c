"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  ChevronUp,
  ArrowUpDown,
  Star,
  Package,
  Truck,
  Tag,
  Heart,
  RotateCcw,
} from "lucide-react";

interface FilterOption {
  id: string;
  label: string;
  count: number;
  type:
    | "category"
    | "brand"
    | "price_range"
    | "rating"
    | "organic"
    | "stock"
    | "tags";
}

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number;
  brand: string;
  category_name: string;
  average_rating: number;
  review_count: number;
  image_url: string;
  in_stock: boolean;
  is_organic: boolean;
  tags: string[];
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
  const [filters, setFilters] = useState(initialFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [rating, setRating] = useState(0);

  // Calculate filter counts (would come from API)
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
      },
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

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFilters((prev) => {
      const currentCategories = prev.categories || [];
      if (checked) {
        if (!currentCategories.includes(categoryId)) {
          return { ...prev, categories: [...currentCategories, categoryId] };
        }
      } else {
        return {
          ...prev,
          categories: currentCategories.filter((id) => id !== categoryId),
        };
      }
    });
  };

  const handleBrandChange = (brandId: string, checked: boolean) => {
    setFilters((prev) => {
      const currentBrands = prev.brands || [];
      if (checked) {
        if (!currentBrands.includes(brandId)) {
          return { ...prev, brands: [...currentBrands, brandId] };
        }
      } else {
        return {
          ...prev,
          brands: currentBrands.filter((id) => id !== brandId),
        };
      }
    });
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    setFilters((prev) => {
      const currentTags = prev.tags || [];
      if (checked) {
        if (!currentTags.includes(tag)) {
          return { ...prev, tags: [...currentTags, tag] };
        }
      } else {
        return { ...prev, tags: currentTags.filter((t) => t !== tag) };
      }
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setPriceRange({ min: 0, max: 10000 });
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
    (priceRange.min > 0 || priceRange.max < 10000 ? 1 : 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            disabled={activeFiltersCount === 0}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </CardTitle>
        <CardDescription>
          Refine your search with filters to find the perfect agricultural
          solution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Categories */}
          <div>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("categories")}
            >
              <h3 className="font-semibold">Categories</h3>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expandedSections.includes("categories") ? "rotate-180" : ""
                }`}
              />
            </div>

            {expandedSections.includes("categories") && (
              <div className="space-y-2 mt-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={
                        filters.categories?.includes(category.id) || false
                      }
                      onCheckedChange={(checked) =>
                        handleCategoryChange(category.id, checked)
                      }
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="flex-1 flex items-center justify-between cursor-pointer"
                    >
                      <span>{category.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {filterCounts.categories[category.id] || 0}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Brands */}
          <div>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("brands")}
            >
              <h3 className="font-semibold">Brands</h3>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expandedSections.includes("brands") ? "rotate-180" : ""
                }`}
              />
            </div>

            {expandedSections.includes("brands") && (
              <div className="space-y-2 mt-4 max-h-48 overflow-y-auto">
                {brands.map((brand) => (
                  <div key={brand.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={filters.brands?.includes(brand.id) || false}
                      onCheckedChange={(checked) =>
                        handleBrandChange(brand.id, checked)
                      }
                    />
                    <label
                      htmlFor={`brand-${brand.id}`}
                      className="flex-1 flex items-center justify-between cursor-pointer"
                    >
                      <span>{brand.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {filterCounts.brands[brand.id] || 0}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Range */}
          <div>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("price")}
            >
              <h3 className="font-semibold">Price Range</h3>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expandedSections.includes("price") ? "rotate-180" : ""
                }`}
              />
            </div>

            {expandedSections.includes("price") && (
              <div className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Minimum Price</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        ₹{priceRange.min}
                      </span>
                      <Slider
                        min={0}
                        max={5000}
                        step={100}
                        value={[priceRange.min]}
                        onValueChange={([value]) =>
                          setPriceRange((prev) => ({ ...prev, min: value[0] }))
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Maximum Price</label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        min={0}
                        max={5000}
                        step={100}
                        value={[priceRange.max]}
                        onValueChange={([value]) =>
                          setPriceRange((prev) => ({ ...prev, max: value[0] }))
                        }
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">
                        ₹{priceRange.max}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rating */}
          <div>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("rating")}
            >
              <h3 className="font-semibold">Rating</h3>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expandedSections.includes("rating") ? "rotate-180" : ""
                }`}
              />
            </div>

            {expandedSections.includes("rating") && (
              <div className="space-y-2 mt-4">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rating-${stars}`}
                      checked={rating === stars}
                      onCheckedChange={(checked) =>
                        setRating(checked ? stars : 0)
                      }
                    />
                    <label
                      htmlFor={`rating-${stars}`}
                      className="flex-1 flex items-center space-x-2 cursor-pointer"
                    >
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= stars
                                ? "fill-yellow-400"
                                : "fill-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm">
                        {stars}+ {stars > 1 ? " Stars" : " Star"}
                      </span>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {filterCounts.ratings[`${stars}`] || 0}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Special Filters */}
          <div>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("special")}
            >
              <h3 className="font-semibold">Special Filters</h3>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expandedSections.includes("special") ? "rotate-180" : ""
                }`}
              />
            </div>

            {expandedSections.includes("special") && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="organic-only"
                    checked={filters.organic_only || false}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({ ...prev, organic_only: checked }))
                    }
                  />
                  <label
                    htmlFor="organic-only"
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Package className="h-4 w-4" />
                    <span className="text-sm">Organic Products Only</span>
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="in-stock-only"
                    checked={filters.in_stock_only || false}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        in_stock_only: checked,
                      }))
                    }
                  />
                  <label
                    htmlFor="in-stock-only"
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Truck className="h-4 w-4" />
                    <span className="text-sm">In Stock Only</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Popular Tags */}
        {tags.length > 0 && (
          <div>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("tags")}
            >
              <h3 className="font-semibold">Popular Tags</h3>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expandedSections.includes("tags") ? "rotate-180" : ""
                }`}
              />
            </div>

            {expandedSections.includes("tags") && (
              <div className="space-y-2 mt-4">
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 12).map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-1">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={filters.tags?.includes(tag.id) || false}
                        onCheckedChange={(checked) =>
                          handleTagChange(tag.id, checked)
                        }
                      />
                      <label
                        htmlFor={`tag-${tag.id}`}
                        className="flex items-center space-x-1 cursor-pointer"
                      >
                        <Tag className="h-3 w-3" />
                        <span className="text-sm">{tag.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Apply Filters Button */}
        <div className="flex justify-center mt-6">
          <Button
            onClick={applyFilters}
            className="px-8"
            disabled={activeFiltersCount === 0 && !searchQuery}
          >
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SearchFilters;
