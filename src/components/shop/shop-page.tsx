"use client";

import { useState, useEffect } from "react";
import { Product, ProductVariant, ProductCategory } from "@/types";
import { improvedSearchService } from "@/lib/improved-search-service";
import { ProductGrid } from "./product-grid";
import { AdvancedSearchFilters } from "@/components/ui/advanced-search-filters";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [facets, setFacets] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    segment: "",
    category: "",
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    inStock: false,
    brandName: "",
    gtin: "",
    countryOfOrigin: "",
    chemicalComposition: "",
    safetyWarnings: "",
    cbircCompliance: "",
    manufacturingLicense: "",
    marketBy: "",
    netContent: ""
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Perform initial search with no filters
        const results = await improvedSearchService.search("", {});
        setProducts(results.products);
        setVariants(results.variants);
        setFacets(results.facets);
      } catch (error) {
        console.error("Error fetching shop data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      try {
        setLoading(true);
        const results = await improvedSearchService.search(searchTerm, {
          segment: filters.segment || undefined,
          category: filters.category || undefined,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          inStock: filters.inStock || undefined,
          brandName: filters.brandName || undefined,
          gtin: filters.gtin || undefined,
          countryOfOrigin: filters.countryOfOrigin || undefined,
          chemicalComposition: filters.chemicalComposition || undefined,
          safetyWarnings: filters.safetyWarnings || undefined,
          cbircCompliance: filters.cbircCompliance || undefined,
          manufacturingLicense: filters.manufacturingLicense || undefined,
          marketBy: filters.marketBy || undefined,
          netContent: filters.netContent || undefined
        });
        
        setProducts(results.products);
        setVariants(results.variants);
        setFacets(results.facets);
      } catch (error) {
        console.error("Error performing search:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const segments = [
    "agriculture",
    "aquaculture",
    "poultry_healthcare",
    "animal_healthcare",
    "bioremediation",
    "seeds",
    "organic_farming",
    "farm_equipment",
    "testing_lab",
    "oilpalm",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-earth-900">Shop Products</h1>
            <p className="text-earth-600">
              Browse our complete range of agricultural solutions
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
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Product Grid */}
        <main className="flex-1">
          <div className="mb-6 flex justify-between items-center text-sm text-earth-600">
            <span>Showing {products.length} products</span>
          </div>

          <ProductGrid
            products={products}
            variants={variants}
            isLoading={loading}
          />
        </main>
      </div>
    </div>
  );
}
