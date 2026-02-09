import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Star, Filter, X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedFilterOptions {
  priceRange: [number, number];
  minRating: number;
  inStockOnly: boolean;
  freeShipping: boolean;
  discountRange: [number, number];
  categories: string[];
  brands: string[];
}

interface AdvancedFilterProps {
  initialFilters?: Partial<AdvancedFilterOptions>;
  onFiltersChange: (filters: Partial<AdvancedFilterOptions>) => void;
  availableCategories?: { id: string; name: string; count: number }[];
  availableBrands?: { id: string; name: string; count: number }[];
  className?: string;
}

export function AdvancedFilter({ 
  initialFilters = {}, 
  onFiltersChange, 
  availableCategories = [],
  availableBrands = [],
  className 
}: AdvancedFilterProps) {
  const [filters, setFilters] = useState<Partial<AdvancedFilterOptions>>({
    priceRange: initialFilters.priceRange || [0, 10000],
    minRating: initialFilters.minRating || 0,
    inStockOnly: initialFilters.inStockOnly || false,
    freeShipping: initialFilters.freeShipping || false,
    discountRange: initialFilters.discountRange || [0, 100],
    categories: initialFilters.categories || [],
    brands: initialFilters.brands || [],
    ...initialFilters
  });

  const [activeTab, setActiveTab] = useState<'price' | 'rating' | 'availability' | 'categories' | 'brands'>('price');

  const handlePriceChange = (value: number[]) => {
    const newPriceRange: [number, number] = [value[0], value[1]];
    setFilters(prev => ({ ...prev, priceRange: newPriceRange }));
    onFiltersChange({ ...filters, priceRange: newPriceRange });
  };

  const handleDiscountChange = (value: number[]) => {
    const newDiscountRange: [number, number] = [value[0], value[1]];
    setFilters(prev => ({ ...prev, discountRange: newDiscountRange }));
    onFiltersChange({ ...filters, discountRange: newDiscountRange });
  };

  const handleRatingChange = (rating: number) => {
    setFilters(prev => ({ ...prev, minRating: rating }));
    onFiltersChange({ ...filters, minRating: rating });
  };

  const handleToggle = (field: keyof AdvancedFilterOptions) => {
    const newValue = !filters[field];
    setFilters(prev => ({ ...prev, [field]: newValue }));
    onFiltersChange({ ...filters, [field]: newValue });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId];
    
    setFilters(prev => ({ ...prev, categories: newCategories }));
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleBrandToggle = (brandId: string) => {
    const currentBrands = filters.brands || [];
    const newBrands = currentBrands.includes(brandId)
      ? currentBrands.filter(id => id !== brandId)
      : [...currentBrands, brandId];
    
    setFilters(prev => ({ ...prev, brands: newBrands }));
    onFiltersChange({ ...filters, brands: newBrands });
  };

  const clearFilters = () => {
    const clearedFilters: Partial<AdvancedFilterOptions> = {
      priceRange: [0, 10000],
      minRating: 0,
      inStockOnly: false,
      freeShipping: false,
      discountRange: [0, 100],
      categories: [],
      brands: []
    };
    
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = 
    filters.priceRange?.[0] !== 0 || 
    filters.priceRange?.[1] !== 10000 || 
    filters.minRating !== 0 || 
    filters.inStockOnly || 
    filters.freeShipping || 
    filters.discountRange?.[0] !== 0 || 
    filters.discountRange?.[1] !== 100 || 
    (filters.categories && filters.categories.length > 0) || 
    (filters.brands && filters.brands.length > 0);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Advanced Filters
        </h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
            <X className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Price Range Filter */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <h4 className="font-medium">Price Range</h4>
            <span className="text-sm text-organic-600">
              ₹{filters.priceRange?.[0] || 0} - ₹{filters.priceRange?.[1] || 10000}
            </span>
          </div>
          <Slider
            min={0}
            max={10000}
            step={100}
            value={filters.priceRange || [0, 10000]}
            onValueChange={handlePriceChange}
          />
        </div>

        {/* Discount Range Filter */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <h4 className="font-medium">Discount Range</h4>
            <span className="text-sm text-organic-600">
              {filters.discountRange?.[0] || 0}% - {filters.discountRange?.[1] || 100}%
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            step={5}
            value={filters.discountRange || [0, 100]}
            onValueChange={handleDiscountChange}
          />
        </div>

        {/* Rating Filter */}
        <div className="space-y-4">
          <h4 className="font-medium">Minimum Rating</h4>
          <div className="flex flex-wrap gap-2">
            {[0, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={filters.minRating === rating ? "default" : "outline"}
                size="sm"
                className={filters.minRating === rating ? "bg-organic-500 hover:bg-organic-600" : ""}
                onClick={() => handleRatingChange(rating)}
              >
                {rating === 0 ? 'Any' : (
                  <>
                    {rating}
                    <Star className="h-3 w-3 ml-1 fill-current" />
                    <span className="ml-1">& Up</span>
                  </>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Availability & Shipping */}
        <div className="space-y-4">
          <h4 className="font-medium">Availability & Shipping</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="in-stock" className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id="in-stock"
                  checked={!!filters.inStockOnly}
                  onCheckedChange={() => handleToggle('inStockOnly')}
                />
                <span>In Stock Only</span>
              </Label>
              {filters.inStockOnly && (
                <Badge variant="secondary" className="text-xs">Recommended</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="free-shipping" className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id="free-shipping"
                  checked={!!filters.freeShipping}
                  onCheckedChange={() => handleToggle('freeShipping')}
                />
                <span>Free Shipping</span>
              </Label>
              {filters.freeShipping && (
                <Badge variant="secondary" className="text-xs">Save Money</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Categories Filter */}
        <div className="space-y-4">
          <h4 className="font-medium">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category) => (
              <Badge
                key={category.id}
                variant={(filters.categories || []).includes(category.id) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  (filters.categories || []).includes(category.id) 
                    ? "bg-organic-500 hover:bg-organic-600" 
                    : "hover:bg-gray-100"
                )}
                onClick={() => handleCategoryToggle(category.id)}
              >
                {category.name}
                <span className="ml-1 text-xs">({category.count})</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Brands Filter */}
        <div className="space-y-4">
          <h4 className="font-medium">Brands</h4>
          <div className="flex flex-wrap gap-2">
            {availableBrands.map((brand) => (
              <Badge
                key={brand.id}
                variant={(filters.brands || []).includes(brand.id) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  (filters.brands || []).includes(brand.id) 
                    ? "bg-organic-500 hover:bg-organic-600" 
                    : "hover:bg-gray-100"
                )}
                onClick={() => handleBrandToggle(brand.id)}
              >
                {brand.name}
                <span className="ml-1 text-xs">({brand.count})</span>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}