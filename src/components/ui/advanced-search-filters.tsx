'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  X, 
  Package, 
  Shield, 
  Factory, 
  Globe,
  FlaskConical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdvancedSearchFiltersProps {
  filters: {
    segment?: string;
    cropId?: string;
    problemId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    category?: string;
    brandName?: string;
    gtin?: string;
    countryOfOrigin?: string;
    chemicalComposition?: string;
    safetyWarnings?: string;
    cbircCompliance?: string;
    manufacturingLicense?: string;
    marketBy?: string;
    netContent?: string;
  };
  onFilterChange: (filters: any) => void;
  segments: { segment: string; count: number }[];
  categories: { category: string; count: number }[];
  brands: { brand: string; count: number }[];
  countriesOfOrigin: { country: string; count: number }[];
  certifications: { certification: string; count: number }[];
  manufacturers: { manufacturer: string; count: number }[];
}

export function AdvancedSearchFilters({
  filters,
  onFilterChange,
  segments,
  categories,
  brands,
  countriesOfOrigin,
  certifications,
  manufacturers
}: AdvancedSearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    onFilterChange({
      ...filters,
      [field]: checked
    });
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Advanced Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Filters */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Basic Filters
            </h4>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={filters.category || ""} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.category} value={cat.category}>
                      {cat.category} ({cat.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="segment">Segment</Label>
              <Select 
                value={filters.segment || ""} 
                onValueChange={(value) => handleInputChange('segment', value)}
              >
                <SelectTrigger id="segment">
                  <SelectValue placeholder="Select segment" />
                </SelectTrigger>
                <SelectContent>
                  {segments.map((seg) => (
                    <SelectItem key={seg.segment} value={seg.segment}>
                      {seg.segment} ({seg.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="inStock"
                checked={!!filters.inStock}
                onCheckedChange={(checked) => handleCheckboxChange('inStock', !!checked)}
              />
              <Label htmlFor="inStock">In Stock Only</Label>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <h4 className="font-medium">Price Range</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="minPrice">Min Price</Label>
                <Input
                  id="minPrice"
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleInputChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="₹0"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice">Max Price</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleInputChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="₹10000"
                />
              </div>
            </div>
          </div>

          {/* Brand & Identity Filters */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Factory className="h-4 w-4" />
              Brand & Identity
            </h4>
            
            <div>
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                value={filters.brandName || ''}
                onChange={(e) => handleInputChange('brandName', e.target.value)}
                placeholder="Enter brand name"
              />
            </div>

            <div>
              <Label htmlFor="marketBy">Marketed By</Label>
              <Input
                id="marketBy"
                value={filters.marketBy || ''}
                onChange={(e) => handleInputChange('marketBy', e.target.value)}
                placeholder="Enter manufacturer"
              />
            </div>
          </div>

          {/* Compliance & Safety Filters */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Compliance & Safety
            </h4>
            
            <div>
              <Label htmlFor="gtin">GTIN/EAN/UPC</Label>
              <Input
                id="gtin"
                value={filters.gtin || ''}
                onChange={(e) => handleInputChange('gtin', e.target.value)}
                placeholder="Enter GTIN code"
              />
            </div>

            <div>
              <Label htmlFor="cbircCompliance">CBIRC Compliance</Label>
              <Input
                id="cbircCompliance"
                value={filters.cbircCompliance || ''}
                onChange={(e) => handleInputChange('cbircCompliance', e.target.value)}
                placeholder="Enter compliance status"
              />
            </div>
          </div>

          {/* Origin & Composition Filters */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Origin & Specifications
            </h4>
            
            <div>
              <Label htmlFor="countryOfOrigin">Country of Origin</Label>
              <Input
                id="countryOfOrigin"
                value={filters.countryOfOrigin || ''}
                onChange={(e) => handleInputChange('countryOfOrigin', e.target.value)}
                placeholder="Enter country"
              />
            </div>

            <div>
              <Label htmlFor="netContent">Net Content</Label>
              <Input
                id="netContent"
                value={filters.netContent || ''}
                onChange={(e) => handleInputChange('netContent', e.target.value)}
                placeholder="Enter content (e.g., 500ml)"
              />
            </div>
          </div>

          {/* Chemical & Safety Filters */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Chemical & Safety
            </h4>
            
            <div>
              <Label htmlFor="chemicalComposition">Chemical Composition</Label>
              <Input
                id="chemicalComposition"
                value={filters.chemicalComposition || ''}
                onChange={(e) => handleInputChange('chemicalComposition', e.target.value)}
                placeholder="Enter composition keywords"
              />
            </div>

            <div>
              <Label htmlFor="safetyWarnings">Safety Warnings</Label>
              <Input
                id="safetyWarnings"
                value={filters.safetyWarnings || ''}
                onChange={(e) => handleInputChange('safetyWarnings', e.target.value)}
                placeholder="Enter warning keywords"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Clear All Filters
        </Button>
      </div>
    </div>
  );
}