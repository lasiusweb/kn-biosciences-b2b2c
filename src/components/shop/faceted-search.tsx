import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Filter, ChevronDown, X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FacetOption {
  id: string;
  label: string;
  count: number;
  selected: boolean;
}

interface Facet {
  id: string;
  label: string;
  type: 'checkbox' | 'range' | 'rating';
  options?: FacetOption[];
  min?: number;
  max?: number;
  value?: [number, number];
  step?: number;
}

interface FacetedSearchProps {
  facets: Facet[];
  onFacetChange: (facetId: string, value: any) => void;
  onClearAll: () => void;
  className?: string;
}

export function FacetedSearch({ facets, onFacetChange, onClearAll, className }: FacetedSearchProps) {
  const [openFacets, setOpenFacets] = useState<Record<string, boolean>>({});
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  // Initialize open facets state
  useEffect(() => {
    const initialOpenState: Record<string, boolean> = {};
    facets.forEach(facet => {
      initialOpenState[facet.id] = true; // Open all by default
    });
    setOpenFacets(initialOpenState);
  }, [facets]);

  const toggleFacet = (facetId: string) => {
    setOpenFacets(prev => ({
      ...prev,
      [facetId]: !prev[facetId]
    }));
  };

  const handleCheckboxChange = (facetId: string, optionId: string, checked: boolean) => {
    const facet = facets.find(f => f.id === facetId);
    if (!facet) return;

    const updatedOptions = facet.options?.map(option => 
      option.id === optionId ? { ...option, selected: checked } : option
    ) || [];

    // Update active filters
    const currentSelections = activeFilters[facetId] || [];
    let newSelections: string[];

    if (checked) {
      newSelections = [...currentSelections, optionId];
    } else {
      newSelections = currentSelections.filter(id => id !== optionId);
    }

    setActiveFilters(prev => ({
      ...prev,
      [facetId]: newSelections
    }));

    onFacetChange(facetId, newSelections);
  };

  const handleRangeChange = (facetId: string, value: [number, number]) => {
    setActiveFilters(prev => ({
      ...prev,
      [facetId]: value
    }));

    onFacetChange(facetId, value);
  };

  const handleRatingChange = (facetId: string, rating: number) => {
    setActiveFilters(prev => ({
      ...prev,
      [facetId]: rating
    }));

    onFacetChange(facetId, rating);
  };

  const removeFilter = (facetId: string, value: string | number) => {
    const facet = facets.find(f => f.id === facetId);
    if (!facet) return;

    if (facet.type === 'checkbox') {
      // For checkbox facets, remove the specific option
      const currentSelections = activeFilters[facetId] || [];
      const newSelections = currentSelections.filter((id: string) => id !== value);
      
      setActiveFilters(prev => ({
        ...prev,
        [facetId]: newSelections
      }));

      onFacetChange(facetId, newSelections);
    } else if (facet.type === 'range') {
      // For range facets, reset to default range
      const defaultRange: [number, number] = [facet.min || 0, facet.max || 100];
      
      setActiveFilters(prev => ({
        ...prev,
        [facetId]: defaultRange
      }));

      onFacetChange(facetId, defaultRange);
    } else if (facet.type === 'rating') {
      // For rating facets, reset to 0
      setActiveFilters(prev => ({
        ...prev,
        [facetId]: 0
      }));

      onFacetChange(facetId, 0);
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onClearAll();
  };

  // Count total active filters
  const totalActiveFilters = Object.values(activeFilters).reduce((count, filter) => {
    if (Array.isArray(filter)) {
      return count + filter.length;
    } else if (typeof filter === 'number' && filter > 0) {
      return count + 1;
    } else if (filter && Array.isArray(filter) && filter.length > 0) {
      return count + filter.length;
    }
    return count;
  }, 0);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </h3>
        {totalActiveFilters > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
            <X className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {totalActiveFilters > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([facetId, filterValues]) => {
            const facet = facets.find(f => f.id === facetId);
            if (!facet) return null;

            if (Array.isArray(filterValues)) {
              return filterValues.map(value => {
                const option = facet.options?.find(opt => opt.id === value);
                return (
                  <Badge key={`${facetId}-${value}`} variant="secondary" className="rounded-full">
                    {option?.label || value}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => removeFilter(facetId, value)} 
                    />
                  </Badge>
                );
              });
            } else if (typeof filterValues === 'number' && filterValues > 0) {
              if (facet.type === 'rating') {
                return (
                  <Badge key={facetId} variant="secondary" className="rounded-full">
                    {facet.label}: {filterValues}+ Stars
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => removeFilter(facetId, filterValues)} 
                    />
                  </Badge>
                );
              }
            } else if (Array.isArray(filterValues) && filterValues.length === 2) {
              return (
                <Badge key={facetId} variant="secondary" className="rounded-full">
                  {facet.label}: ₹{filterValues[0]} - ₹{filterValues[1]}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => removeFilter(facetId, filterValues)} 
                  />
                </Badge>
              );
            }
            return null;
          })}
        </div>
      )}

      {/* Facet List */}
      <div className="space-y-4">
        {facets.map((facet) => (
          <Collapsible 
            key={facet.id} 
            open={openFacets[facet.id]} 
            onOpenChange={() => toggleFacet(facet.id)}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-gray-100 transition-colors">
              <span className="font-medium">{facet.label}</span>
              <ChevronDown 
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  openFacets[facet.id] ? "rotate-180" : "rotate-0"
                )} 
              />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-3 mt-2 pl-2">
              {facet.type === 'checkbox' && (
                <div className="space-y-2">
                  {facet.options?.map((option) => (
                    <div key={option.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${facet.id}-${option.id}`}
                          checked={option.selected}
                          onCheckedChange={(checked) => 
                            handleCheckboxChange(facet.id, option.id, Boolean(checked))
                          }
                        />
                        <Label 
                          htmlFor={`${facet.id}-${option.id}`} 
                          className="text-sm cursor-pointer flex justify-between flex-1"
                        >
                          <span>{option.label}</span>
                          <span className="text-xs text-gray-500 ml-2">({option.count})</span>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {facet.type === 'range' && (
                <div className="space-y-4 p-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{facet.value?.[0] || facet.min || 0}</span>
                    <span>₹{facet.value?.[1] || facet.max || 1000}</span>
                  </div>
                  <Slider
                    min={facet.min || 0}
                    max={facet.max || 1000}
                    step={facet.step || 10}
                    value={facet.value || [facet.min || 0, facet.max || 1000]}
                    onValueChange={(value) => handleRangeChange(facet.id, value as [number, number])}
                  />
                </div>
              )}

              {facet.type === 'rating' && (
                <div className="space-y-2 p-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div 
                      key={rating} 
                      className={cn(
                        "flex items-center justify-between p-2 rounded cursor-pointer",
                        activeFilters[facet.id] === rating 
                          ? "bg-organic-100 border border-organic-300" 
                          : "hover:bg-gray-100"
                      )}
                      onClick={() => handleRatingChange(facet.id, rating)}
                    >
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < rating 
                                ? "text-yellow-400 fill-current" 
                                : "text-gray-300"
                            )}
                          />
                        ))}
                        <span className="ml-2 text-sm">& Up</span>
                      </div>
                      <span className="text-xs text-gray-500">({rating * 10}+)</span>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}