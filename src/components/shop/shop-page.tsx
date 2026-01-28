"use client";

import { useState, useEffect } from "react";
import { Product, ProductVariant, ProductCategory } from "@/types";
import { getProducts } from "@/lib/product-service";
import { ProductGrid } from "./product-grid";
import { ProductFilters } from "./product-filters";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(5000);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch products and variants
        const productsData = await getProducts();
        setProducts(productsData);
        
        // For now, we'll fetch variants from an API or extract from combined data
        // Assuming we have an API for variants or they come with products
        const variantsResponse = await fetch("/api/products/variants");
        if (variantsResponse.ok) {
          const variantsData = await variantsResponse.json();
          setVariants(variantsData);
        }

        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error("Error fetching shop data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSegmentChange = (segment: string) => {
    setSelectedSegments((prev) =>
      prev.includes(segment)
        ? prev.filter((s) => s !== segment)
        : [...prev, segment]
    );
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
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

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = selectedSegments.length === 0 || selectedSegments.includes(product.segment);
    const matchesCategory = selectedCategories.length === 0 || (product.category_id && selectedCategories.includes(product.category_id));
    
    const variant = variants.find(v => v.product_id === product.id);
    const matchesPrice = !variant || variant.price <= maxPrice;

    return matchesSearch && matchesSegment && matchesCategory && matchesPrice;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-earth-900 mb-2">Shop Products</h1>
        <p className="text-earth-600">
          Browse our complete range of agricultural solutions
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-earth-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-earth-100 focus:ring-organic-500"
            />
          </div>

          <ProductFilters
            segments={segments}
            categories={categories}
            selectedSegments={selectedSegments}
            selectedCategories={selectedCategories}
            onSegmentChange={handleSegmentChange}
            onCategoryChange={handleCategoryChange}
            onPriceChange={setMaxPrice}
            currentMaxPrice={maxPrice}
          />
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="mb-6 flex justify-between items-center text-sm text-earth-600">
            <span>Showing {filteredProducts.length} products</span>
          </div>

          <ProductGrid
            products={filteredProducts}
            variants={variants}
            isLoading={loading}
          />
        </main>
      </div>
    </div>
  );
}
