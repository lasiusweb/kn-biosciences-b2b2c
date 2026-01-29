import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Search parameters interface
interface SearchParams {
  q?: string;
  category?: string;
  subcategory?: string;
  min_price?: string;
  max_price?: string;
  in_stock?: string;
  organic?: string;
  rating?: string;
  sort_by?: string;
  page?: string;
  limit?: string;
  tags?: string[];
  brand?: string;
}

// Search filters interface
interface SearchFilters {
  categories: string[];
  priceRange: { min: number; max: number };
  inStockOnly: boolean;
  organicOnly: boolean;
  rating: number;
  tags: string[];
  brand?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams: urlSearchParams } = new URL(request.url);

    // Parse search parameters
    const searchParams: SearchParams = {
      q: urlSearchParams.get("q") || "",
      category: urlSearchParams.get("category") || "",
      subcategory: urlSearchParams.get("subcategory") || "",
      min_price: urlSearchParams.get("min_price") || "",
      max_price: urlSearchParams.get("max_price") || "",
      in_stock: urlSearchParams.get("in_stock") || "",
      organic: urlSearchParams.get("organic") || "",
      rating: urlSearchParams.get("rating") || "",
      sort_by: urlSearchParams.get("sort_by") || "relevance",
      page: urlSearchParams.get("page") || "1",
      limit: urlSearchParams.get("limit") || "20",
      tags: urlSearchParams.getAll("tags") || [],
      brand: urlSearchParams.get("brand") || "",
    };

    // Build search query
    const searchQuery = buildSearchQuery(searchParams);

    // Execute search with filters
    const {
      data: products,
      error,
      count,
    } = await executeSearch(searchQuery, searchParams);

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json(
        { error: "Search failed", details: error },
        { status: 500 },
      );
    }

    // Get search suggestions for similar queries
    const suggestions = await getSearchSuggestions(searchParams.q || "");

    // Get facet counts for filters
    const facets = await getSearchFacets(searchQuery);

    // Log search analytics
    await logSearchAnalytics(searchParams, products?.length || 0);

    return NextResponse.json({
      success: true,
      products: products || [],
      pagination: {
        page: parseInt(searchParams.page || "1"),
        limit: parseInt(searchParams.limit || "20"),
        total: count || 0,
        totalPages: Math.ceil(
          (count || 0) / parseInt(searchParams.limit || "20"),
        ),
        hasNext:
          parseInt(searchParams.page || "1") *
            parseInt(searchParams.limit || "20") <
          (count || 0),
      },
      filters: {
        applied: buildAppliedFilters(searchParams),
        available: facets,
      },
      suggestions,
      search_time: new Date().toISOString(),
      query: searchParams.q,
    });
  } catch (error) {
    console.error("Advanced search error:", error);
    return NextResponse.json(
      {
        error: "Search service unavailable",
        message: "Please try again later",
      },
      { status: 500 },
    );
  }
}

// POST for complex search with custom filters
export async function POST(request: NextRequest) {
  try {
    const searchRequest = await request.json();

    // Validate search request
    if (!searchRequest.query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 },
      );
    }

    // Build advanced search with filters
    const searchQuery = buildAdvancedSearchQuery(searchRequest);

    // Execute search
    const {
      data: products,
      error,
      count,
    } = await executeAdvancedSearch(searchQuery, searchRequest);

    if (error) {
      console.error("Advanced search error:", error);
      return NextResponse.json(
        { error: "Advanced search failed", details: error },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      products: products || [],
      pagination: searchRequest.pagination || {
        page: 1,
        limit: 20,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / 20),
      },
      filters: {
        applied: searchRequest.filters,
        available: await getSearchFacets(searchQuery),
      },
      recommendations: await getProductRecommendations(
        searchRequest.query,
        products,
      ),
      search_id: generateSearchId(),
    });
  } catch (error) {
    console.error("Advanced search POST error:", error);
    return NextResponse.json(
      { error: "Advanced search service unavailable" },
      { status: 500 },
    );
  }
}

// Search suggestions endpoint
export async function PUT(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] }, { status: 400 });
    }

    const suggestions = await getSearchSuggestions(query);

    return NextResponse.json({
      success: true,
      suggestions,
      query,
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json(
      { error: "Suggestions service unavailable" },
      { status: 500 },
    );
  }
}

// Helper functions
function buildSearchQuery(params: SearchParams): any {
  let query = supabase.from("products").select(`
      *,
      product_variants!inner(
        id,
        sku,
        price,
        original_price,
        stock_quantity,
        weight,
        dimensions
      ),
      categories!inner(
        id,
        name,
        slug
      )
    `);

  // Apply text search
  if (params.q) {
    query = query
      .textSearch("name", params.q)
      .textSearch("description", params.q, { config: "websearch_to_tsvector" })
      .textSearch("short_description", params.q)
      .textSearch("product_variants.sku", params.q);
  }

  // Apply category filter
  if (params.category) {
    query = query.eq("categories.slug", params.category);
  }

  // Apply subcategory filter
  if (params.subcategory) {
    query = query.eq("subcategory", params.subcategory);
  }

  // Apply price range filter
  if (params.min_price) {
    query = query.gte("product_variants.price", parseFloat(params.min_price));
  }

  if (params.max_price) {
    query = query.lte("product_variants.price", parseFloat(params.max_price));
  }

  // Apply stock filter
  if (params.in_stock === "true") {
    query = query.gt("product_variants.stock_quantity", 0);
  }

  // Apply organic filter
  if (params.organic === "true") {
    query = query.eq("is_organic", true);
  }

  // Apply rating filter
  if (params.rating) {
    query = query.gte("average_rating", parseFloat(params.rating));
  }

  // Apply brand filter
  if (params.brand) {
    query = query.eq("brand", params.brand);
  }

  // Apply tags filter
  if (params.tags && params.tags.length > 0) {
    query = query.contains("tags", params.tags);
  }

  // Apply sorting
  switch (params.sort_by) {
    case "price_low":
      query = query.order("product_variants.price", { ascending: true });
      break;
    case "price_high":
      query = query.order("product_variants.price", { ascending: false });
      break;
    case "rating":
      query = query.order("average_rating", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    case "popularity":
      query = query.order("view_count", { ascending: false });
      break;
    default: // relevance (default)
      if (params.q) {
        query = query.order("relevance", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }
  }

  return query;
}

function buildAdvancedSearchQuery(searchRequest: any): any {
  let query: any = supabase.from("products").select("*");

  // Handle complex filter combinations
  if (searchRequest.filters) {
    const { filters } = searchRequest.filters;

    // Custom filters array
    if (Array.isArray(filters) && filters.length > 0) {
      filters.forEach((filter: any) => {
        switch (filter.type) {
          case "category":
            query = query.in("category_id", filter.values);
            break;
          case "price_range":
            query = query
              .gte("price", filter.values.min)
              .lte("price", filter.values.max);
            break;
          case "attributes":
            query = query.contains("attributes", filter.values);
            break;
          case "custom":
            // Handle custom filter logic
            if (filter.field && filter.operator && filter.value) {
              const { field, operator, value } = filter;
              if (operator === "equals") query = query.eq(field, value);
              if (operator === "contains") query = query.ilike(field, `%${value}%`);
              if (operator === "greater_than") query = query.gt(field, value);
              if (operator === "less_than") query = query.lt(field, value);
            }
            break;
        }
      });
    }
  }

  // Apply text search with boost
  if (searchRequest.query) {
    query = query.textSearch("name", searchRequest.query, {
      config: "websearch_to_tsvector",
      type: "plain",
    });
  }

  return query;
}

async function executeSearch(
  query: any,
  params: SearchParams,
): Promise<{
  data: any[];
  error: any;
  count: number;
}> {
  try {
    // Get total count for pagination
    const { count, error: countError } = await query;

    if (countError) {
      return { data: [], error: countError, count: 0 };
    }

    // Apply pagination
    const page = parseInt(params.page || "1");
    const limit = parseInt(params.limit || "20");
    const offset = (page - 1) * limit;

    const { data, error } = await query.range(offset, offset + limit - 1);

    return { data, error, count: count || 0 };
  } catch (error) {
    return { data: [], error, count: 0 };
  }
}

async function executeAdvancedSearch(
  query: any,
  searchRequest: any,
): Promise<{
  data: any[];
  error: any;
  count: number;
}> {
  try {
    // Similar to executeSearch but for advanced queries
    const { count, error: countError } = await query;

    if (countError) {
      return { data: [], error: countError, count: 0 };
    }

    const page = searchRequest.pagination?.page || 1;
    const limit = searchRequest.pagination?.limit || 20;
    const offset = (page - 1) * limit;

    const { data, error } = await query.range(offset, limit);

    return { data, error, count: count || 0 };
  } catch (error) {
    return { data: [], error, count: 0 };
  }
}

async function getSearchSuggestions(query: string): Promise<string[]> {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    // Get suggestions from previous searches and product names
    const { data } = await supabase
      .from("products")
      .select("name, search_count")
      .ilike("name", `%${query}%`)
      .order("search_count", { ascending: false })
      .limit(10);

    return data?.map((item) => item.name) || [];
  } catch (error) {
    console.error("Suggestions error:", error);
    return [];
  }
}

async function getSearchFacets(query: any): Promise<any> {
  try {
    // Get category counts
    const { data: categories } = await supabase
      .from("products")
      .select("categories!inner(name, slug)")
      .not("categories.slug", "is", null);

    // Get price ranges
    const { data: priceStats } = await supabase
      .from("product_variants")
      .select("price")
      .gt("stock_quantity", 0);

    // Get brands
    const { data: brands } = await supabase
      .from("products")
      .select("brand")
      .not("brand", "is", null);

    return {
      categories:
        categories?.map((cat: any) => ({
          name: cat.categories.name,
          slug: cat.categories.slug,
          count: 0, // Would need aggregation query
        })) || [],
      price_ranges: calculatePriceRanges(priceStats?.map((p) => p.price) || []),
      brands: brands?.map((brand) => brand.brand).filter(Boolean) || [],
      ratings: [
        { min: 4, max: 5, label: "4+ Stars", count: 0 },
        { min: 3, max: 4, label: "3+ Stars", count: 0 },
        { min: 2, max: 3, label: "2+ Stars", count: 0 },
        { min: 1, max: 2, label: "1+ Stars", count: 0 },
      ],
      organic: [
        { value: true, label: "Organic Only", count: 0 },
        { value: false, label: "All Products", count: 0 },
      ],
      in_stock: [
        { value: true, label: "In Stock", count: 0 },
        { value: false, label: "Include Out of Stock", count: 0 },
      ],
    };
  } catch (error) {
    console.error("Facets error:", error);
    return {};
  }
}

function calculatePriceRanges(prices: number[]): any[] {
  if (prices.length === 0) return [];

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;

  return [
    {
      min: minPrice,
      max: minPrice + range * 0.25,
      label: `₹${minPrice} - ₹${Math.round(minPrice + range * 0.25)}`,
    },
    {
      min: minPrice + range * 0.25,
      max: minPrice + range * 0.5,
      label: `₹${Math.round(minPrice + range * 0.25)} - ₹${Math.round(minPrice + range * 0.5)}`,
    },
    {
      min: minPrice + range * 0.5,
      max: minPrice + range * 0.75,
      label: `₹${Math.round(minPrice + range * 0.5)} - ₹${Math.round(minPrice + range * 0.75)}`,
    },
    {
      min: minPrice + range * 0.75,
      max: maxPrice,
      label: `₹${Math.round(minPrice + range * 0.75)}+`,
    },
  ];
}

function buildAppliedFilters(params: SearchParams): any {
  const filters: any = {};

  if (params.category) filters.category = params.category;
  if (params.subcategory) filters.subcategory = params.subcategory;
  if (params.min_price || params.max_price) {
    filters.price_range = {
      min: params.min_price ? parseFloat(params.min_price) : null,
      max: params.max_price ? parseFloat(params.max_price) : null,
    };
  }
  if (params.in_stock === "true") filters.in_stock_only = true;
  if (params.organic === "true") filters.organic_only = true;
  if (params.rating) filters.min_rating = parseFloat(params.rating);
  if (params.tags && params.tags.length > 0) filters.tags = params.tags;
  if (params.brand) filters.brand = params.brand;

  return filters;
}

async function logSearchAnalytics(
  params: SearchParams,
  resultCount: number,
): Promise<void> {
  try {
    // Log search query for analytics and improvements
    await supabase.from("search_analytics").insert({
      query: params.q,
      filters: buildAppliedFilters(params),
      result_count: resultCount,
      user_agent: "API", // Would come from request headers
      ip_address: "127.0.0.1", // Would come from request
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analytics logging error:", error);
  }
}

async function getProductRecommendations(
  query: string,
  products: any[],
): Promise<any[]> {
  try {
    // Simple recommendation based on search and results
    // In a real implementation, this could use ML/AI
    if (!query || products.length === 0) {
      return [];
    }

    // Get related products based on category or tags
    const categories = products.map((p) => p.category_id).filter(Boolean);
    const tags = products.flatMap((p) => p.tags || []);

    if (categories.length > 0) {
      const { data: related } = await supabase
        .from("products")
        .select("*")
        .in("category_id", categories.slice(0, 3)) // Limit to 3 categories
        .neq("id", products[0].id) // Exclude current product
        .limit(8);

      return related || [];
    }

    return [];
  } catch (error) {
    console.error("Recommendations error:", error);
    return [];
  }
}

function generateSearchId(): string {
  return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
