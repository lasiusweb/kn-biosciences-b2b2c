import { getProductsByCrop, getVariants } from "@/lib/product-service";
import { ProductGrid } from "@/components/shop/product-grid";

interface CropPageProps {
  params: {
    slug: string;
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
