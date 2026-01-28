import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Product slug is required" },
        { status: 400 },
      );
    }

    // Get product with SEO data
    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories!inner(name, slug, meta_title, meta_description),
        product_variants!inner(id, sku, price, original_price, stock_quantity, weight, dimensions, images, specifications),
        brand!inner(name),
        reviews!inner(id, rating, comment, created_at),
        faq!inner(question, answer)
      `,
      )
      .eq("products.slug", slug)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Increment view count for analytics
    await incrementProductView(product.id);

    // Generate SEO metadata
    const seoData = generateProductSEO(product);

    return NextResponse.json({
      success: true,
      product,
      seo: seoData,
      related_products: [], // Would be populated by recommendation engine
    });
  } catch (error) {
    console.error("SEO product page error:", error);
    return NextResponse.json(
      { error: "Failed to load product" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { slug, analyticsData } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: "Product slug is required" },
        { status: 400 },
      );
    }

    // Log custom analytics event
    if (analyticsData) {
      await logCustomAnalytics(slug, analyticsData);
    }

    // Get product with full SEO data
    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories!inner(name, slug, meta_title, meta_description),
        product_variants!inner(id, sku, price, original_price, stock_quantity, weight, dimensions, images, specifications),
        brand!inner(name),
        reviews!inner(id, rating, comment, created_at, helpful_count),
        faq!inner(question, answer, helpful_count)
      `,
      )
      .eq("products.slug", slug)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get related products
    const relatedProducts = await getRelatedProducts(product);

    // Generate comprehensive SEO data
    const seoData = generateComprehensiveSEO(product, relatedProducts);

    return NextResponse.json({
      success: true,
      product,
      seo: seoData,
      related_products: relatedProducts,
    });
  } catch (error) {
    console.error("SEO product data error:", error);
    return NextResponse.json(
      { error: "Failed to load product data" },
      { status: 500 },
    );
  }
}

// Helper functions
async function incrementProductView(productId: string): Promise<void> {
  try {
    await supabase
      .from("products")
      .update({
        view_count: supabase.rpc("increment_view_count"),
        last_viewed_at: new Date().toISOString(),
      })
      .eq("id", productId);
  } catch (error) {
    console.error("Error incrementing product view:", error);
  }
}

function generateProductSEO(product: any): any {
  return {
    title: product.categories?.meta_title || `${product.name} - KN Biosciences`,
    description:
      product.categories?.meta_description ||
      `Buy ${product.name} online at KN Biosciences. ${product.is_organic ? "Organic" : "Premium"} ${product.product_type} with free shipping across India.`,
    keywords: generateKeywords(product),
    canonical: `https://knbiosciences.com/products/${product.slug}`,
    openGraph: {
      title: product.categories?.meta_title || product.name,
      description: product.categories?.meta_description || product.description,
      type: "product",
      url: `https://knbiosciences.com/products/${product.slug}`,
      images: product.product_variants?.[0]?.images?.[0]
        ? [product.product_variants[0].images[0]]
        : [],
      price: {
        amount: product.product_variants?.[0]?.price || 0,
        currency: "INR",
        availability:
          product.product_variants?.[0]?.stock_quantity > 0
            ? "in stock"
            : "out of stock",
      },
      brand: product.brand?.name || "KN Biosciences",
      category: product.categories?.name || "Agricultural Products",
    },
    twitter: {
      card: "summary_large_image",
      title: product.categories?.meta_title || product.name,
      description: product.categories?.meta_description || product.description,
      images: product.product_variants?.[0]?.images?.[0]
        ? [product.product_variants[0].images[0]]
        : [],
      price: {
        amount: product.product_variants?.[0]?.price || 0,
        currency: "INR",
      },
    },
    jsonLd: generateJSONLD(product),
    structured_data: generateStructuredData(product),
  };
}

function generateComprehensiveSEO(product: any, relatedProducts: any[]): any {
  return {
    ...generateProductSEO(product),
    related_products: relatedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.product_variants?.[0]?.price || 0,
      image_url: p.product_variants?.[0]?.images?.[0] || null,
      category: p.categories?.name || "",
    })),
    breadcrumbs: generateBreadcrumbs(product),
    faq_schema: generateFAQSchema(product),
    review_schema: generateReviewSchema(product),
  };
}

function generateKeywords(product: any): string[] {
  const keywords: string[] = [];

  // Product name variations
  keywords.push(product.name.toLowerCase());
  if (product.name.includes(" ")) {
    keywords.push(product.name.split(" ")[0]);
  }

  // Category keywords
  if (product.categories?.name) {
    keywords.push(product.categories.name.toLowerCase());
    keywords.push(`${product.categories.name} online`);
    keywords.push(`${product.categories.name} price`);
  }

  // Brand keywords
  if (product.brand?.name) {
    keywords.push(product.brand.name.toLowerCase());
    keywords.push(`${product.brand.name} ${product.product_type}`);
  }

  // Product type keywords
  keywords.push(product.product_type);
  keywords.push(
    `${product.product_type} for ${product.categories?.name || "agriculture"}`,
  );

  // Features keywords
  if (product.is_organic) {
    keywords.push("organic");
    keywords.push("natural");
    keywords.push("pesticide-free");
    keywords.push("eco-friendly");
  }

  // Location keywords
  keywords.push("India", "Indian", "buy online India");
  if (product.product_variants?.[0]?.specifications) {
    keywords.push(`best ${product.product_type} ${new Date().getFullYear()}`);
  }

  return [...new Set(keywords)]; // Remove duplicates
}

function generateJSONLD(product: any): object {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.product_variants?.[0]?.images?.[0] || "",
    brand: product.brand?.name || "KN Biosciences",
    category: product.categories?.name || "",
    offers: {
      "@type": "Offer",
      price: product.product_variants?.[0]?.price || 0,
      priceCurrency: "INR",
      availability:
        product.product_variants?.[0]?.stock_quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "KN Biosciences",
        url: "https://knbiosciences.com",
        logo: "https://knbiosciences.com/logo.png",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.average_rating || 0,
      reviewCount: product.review_count || 0,
      bestRating: 5,
      worstRating: 1,
    },
    additionalProperty: product.product_variants?.[0]?.specifications
      ? Object.keys(product.product_variants[0].specifications).map((key) => ({
          "@type": "PropertyValue",
          name: key,
          value: product.product_variants[0].specifications[key],
        }))
      : [],
  };
}

function generateStructuredData(product: any): object {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    productID: product.id,
    name: product.name,
    description: product.description,
    brand: product.brand?.name,
    category: product.categories?.name,
    is_organic: product.is_organic,
    product_type: product.product_type,
    price: product.product_variants?.[0]?.price,
    currency: "INR",
    availability:
      product.product_variants?.[0]?.stock_quantity > 0
        ? "InStock"
        : "OutOfStock",
    average_rating: product.average_rating,
    review_count: product.review_count,
    shipping_cost: "Free shipping on orders above ₹500",
    delivery_time: "2-5 business days",
    warranty: "Manufacturing warranty included",
    specifications: product.product_variants?.[0]?.specifications || {},
  };
}

function generateBreadcrumbs(
  product: any,
): Array<{ name: string; url: string }> {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
  ];

  if (product.categories?.name) {
    breadcrumbs.push({
      name: product.categories.name,
      url: `/shop?category=${product.categories.slug}`,
    });
  }

  breadcrumbs.push({
    name: product.name,
    url: `/products/${product.slug}`,
  });

  return breadcrumbs;
}

function generateFAQSchema(
  product: any,
): Array<{ question: string; answer: string }> {
  // This would come from the product's FAQ data
  return [];
}

function generateReviewSchema(product: any): object {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Product",
      name: product.name,
      brand: product.brand?.name,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: product.average_rating || 0,
    },
    author: {
      "@type": "Organization",
      name: "Verified Customers",
    },
    publisher: {
      "@type": "Organization",
      name: "KN Biosciences",
    },
    reviewBody: product.description,
  };
}

async function getRelatedProducts(product: any): Promise<any[]> {
  try {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .order("view_count", { ascending: false })
      .limit(8);

    return data || [];
  } catch (error) {
    console.error("Error getting related products:", error);
    return [];
  }
}

async function logCustomAnalytics(
  slug: string,
  analyticsData: any,
): Promise<void> {
  try {
    await supabase.from("product_analytics").insert({
      product_slug: slug,
      event_type: analyticsData.event_type,
      data: analyticsData.data,
      user_id: analyticsData.user_id,
      session_id: analyticsData.session_id,
      timestamp: new Date().toISOString(),
      metadata: analyticsData.metadata || {},
    });
  } catch (error) {
    console.error("Error logging custom analytics:", error);
  }
}
