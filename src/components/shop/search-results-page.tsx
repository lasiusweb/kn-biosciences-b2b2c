'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, ProductVariant } from '@/types';
import { improvedSearchService, SearchFilters } from '@/lib/improved-search-service';
import { ProductGrid } from '@/components/shop/product-grid';
import { AdvancedSearchFilters } from '@/components/ui/advanced-search-filters';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

export function SearchResultsPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || searchParams.get('search') || '';

  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<{ products: Product[], variants: ProductVariant[] }>({ products: [], variants: [] });
  const [facets, setFacets] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Initialize filters from URL params
  useEffect(() => {
    const initialFilters: SearchFilters = {};
    
    if (searchParams.get('segment')) initialFilters.segment = searchParams.get('segment') || undefined;
    if (searchParams.get('category')) initialFilters.category = searchParams.get('category') || undefined;
    if (searchParams.get('minPrice')) initialFilters.minPrice = Number(searchParams.get('minPrice'));
    if (searchParams.get('maxPrice')) initialFilters.maxPrice = Number(searchParams.get('maxPrice'));
    if (searchParams.get('inStock')) initialFilters.inStock = searchParams.get('inStock') === 'true';
    if (searchParams.get('brandName')) initialFilters.brandName = searchParams.get('brandName') || undefined;
    if (searchParams.get('gtin')) initialFilters.gtin = searchParams.get('gtin') || undefined;
    if (searchParams.get('countryOfOrigin')) initialFilters.countryOfOrigin = searchParams.get('countryOfOrigin') || undefined;
    if (searchParams.get('chemicalComposition')) initialFilters.chemicalComposition = searchParams.get('chemicalComposition') || undefined;
    if (searchParams.get('safetyWarnings')) initialFilters.safetyWarnings = searchParams.get('safetyWarnings') || undefined;
    if (searchParams.get('cbircCompliance')) initialFilters.cbircCompliance = searchParams.get('cbircCompliance') || undefined;
    if (searchParams.get('manufacturingLicense')) initialFilters.manufacturingLicense = searchParams.get('manufacturingLicense') || undefined;
    if (searchParams.get('marketBy')) initialFilters.marketBy = searchParams.get('marketBy') || undefined;
    if (searchParams.get('netContent')) initialFilters.netContent = searchParams.get('netContent') || undefined;

    setFilters(initialFilters);
  }, [searchParams]);

  // Perform search when query or filters change
  useEffect(() => {
    const performSearch = async () => {
      try {
        setLoading(true);
        const searchResults = await improvedSearchService.search(query, filters);
        
        setResults({
          products: searchResults.products,
          variants: searchResults.variants
        });
        setFacets(searchResults.facets);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (query || Object.keys(filters).some(key => filters[key as keyof SearchFilters])) {
      performSearch();
    } else {
      setResults({ products: [], variants: [] });
      setLoading(false);
    }
  }, [query, filters]);

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-earth-900">Search Results</h1>
            <p className="text-earth-600 mt-2">
              {results.products.length} {results.products.length === 1 ? 'product' : 'products'} found 
              {query && ` for "${query}"`}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-earth-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border border-earth-200 rounded-lg focus:ring-2 focus:ring-organic-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className={`w-full lg:w-80 ${showAdvancedFilters ? 'block' : 'hidden lg:block'}`}>
          <AdvancedSearchFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            segments={facets.segments || []}
            categories={facets.categories || []}
            brands={facets.brands || []}
            countriesOfOrigin={facets.countriesOfOrigin || []}
            certifications={facets.certifications || []}
            manufacturers={facets.manufacturers || []}
          />
        </aside>

        {/* Results */}
        <main className="flex-1">
          <ProductGrid
            products={results.products}
            variants={results.variants}
            isLoading={loading}
          />
        </main>
      </div>
    </div>
  );
}