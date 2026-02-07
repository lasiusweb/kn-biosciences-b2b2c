import { getProductsBySegment, getVariants } from "@/lib/product-service";
import { ProductGrid } from "@/components/shop/product-grid";
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface SegmentPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: SegmentPageProps): Promise<Metadata> {
  const { slug } = params;
  const products = await getProductsBySegment(slug);

  const formattedSlug = slug.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  if (!products || products.length === 0) {
    // Fallback to a more generic shop metadata if no products are found for the segment
    return {
      title: `Shop Products - KN Biosciences`,
      description: `Explore the wide range of agricultural and aquaculture products by KN Biosciences.`,
      openGraph: {
        title: `Shop Products - KN Biosciences`,
        description: `Explore the wide range of agricultural and aquaculture products by KN Biosciences.`,
        url: `/shop`,
      },
      twitter: {
        title: `Shop Products - KN Biosciences`,
        description: `Explore the wide range of agricultural and aquaculture products by KN Biosciences.`,
      },
    };
  }

  // Use metadata from the first product in the segment
  const firstProduct = products[0];
  const title = firstProduct.meta_title || `${formattedSlug} Solutions - KN Biosciences`;
  const description = firstProduct.meta_description || `Explore our comprehensive range of ${formattedSlug} products and solutions.`;
  const imageUrl = firstProduct.image_urls?.[0]; // Assuming image_urls exist on product

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/shop/segment/${slug}`,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    twitter: {
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
      card: 'summary_large_image',
    },
  };
}

export default async function SegmentPage({ params }: SegmentPageProps) {
  const { slug } = params;
  
  // Fetch products and variants in parallel
  const [products, variants] = await Promise.all([
    getProductsBySegment(slug),
    getVariants()
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-earth-900 mb-2 capitalize">
          {slug.replace("_", " ")} Solutions
        </h1>
        <p className="text-earth-600">
          Explore our specialized biological solutions for {slug.replace("_", " ")}.
        </p>
      </header>

      <ProductGrid products={products} variants={variants} />
    </div>
  );
}

