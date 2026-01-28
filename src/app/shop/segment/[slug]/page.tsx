import { getProductsBySegment, getVariants } from "@/lib/product-service";
import { ProductGrid } from "@/components/shop/product-grid";

interface SegmentPageProps {
  params: {
    slug: string;
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
