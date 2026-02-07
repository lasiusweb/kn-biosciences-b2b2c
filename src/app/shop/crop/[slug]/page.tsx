import { getProductsByCrop, getVariants } from "@/lib/product-service";
import { ProductGrid } from "@/components/shop/product-grid";
import type { Metadata } from 'next';

interface CropPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CropPageProps): Promise<Metadata> {
  const { slug } = params;
  const products = await getProductsByCrop(slug);

  const formattedSlug = slug.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  if (!products || products.length === 0) {
    return {
      title: `Shop Products - KN Biosciences`,
      description: `Explore the wide range of agricultural and aquaculture products by KN Biosciences.`,
      openGraph: {
        title: `Shop Products - KN Biosciences`,
        description: `Explore the wide range of agricultural and aquaculture products by KN Biosciences.`,
        url: `/shop`,
      },
    };
  }

  const firstProduct = products[0];
  const title = firstProduct.meta_title || `${formattedSlug} Solutions - KN Biosciences`;
  const description = firstProduct.meta_description || `Explore our comprehensive range of products for ${formattedSlug}.`;
  const imageUrl = firstProduct.image_urls?.[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/shop/crop/${slug}`,
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

export default async function CropPage({ params }: CropPageProps) {
  const { slug } = params;
  
  // Fetch products and variants in parallel
  const [products, variants] = await Promise.all([
    getProductsByCrop(slug),
    getVariants()
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-earth-900 mb-2 capitalize">
          Solutions for {slug.replace("-", " ")}
        </h1>
        <p className="text-earth-600">
          Optimized biological treatments and boosters for your {slug.replace("-", " ")} crops.
        </p>
      </header>

      <ProductGrid products={products} variants={variants} />
    </div>
  );
}
