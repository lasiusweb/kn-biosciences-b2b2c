import { getProductBySlug, getVariants } from "@/lib/product-service";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ShoppingCart, ShieldCheck, Truck } from "lucide-react";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = params;

  // Fetch product and variants in parallel
  const [product, allVariants] = await Promise.all([
    getProductBySlug(slug),
    getVariants()
  ]);

  if (!product) {
    notFound();
  }

  // Filter variants for this specific product
  const variants = allVariants.filter(v => v.product_id === product.id);
  const mainVariant = variants[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <Link 
        href="/shop" 
        className="flex items-center text-earth-600 hover:text-organic-600 mb-8 transition-colors group"
      >
        <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-earth-50 border border-earth-100">
            <Image
              src={mainVariant?.image_urls[0] || "/placeholder-product.jpg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Gallery placeholder */}
          <div className="grid grid-cols-4 gap-4">
            {mainVariant?.image_urls.slice(1, 5).map((url, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-earth-50 border border-earth-100">
                <Image src={url} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-organic-600 uppercase tracking-widest">
              {product.segment.replace("_", " ")}
            </span>
            <h1 className="text-4xl font-bold text-earth-900 mt-2">{product.name}</h1>
            <p className="text-earth-600 mt-4 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-earth-900">
              ₹{mainVariant?.price.toLocaleString()}
            </span>
            {mainVariant?.compare_price && (
              <span className="text-xl text-earth-400 line-through">
                ₹{mainVariant.compare_price.toLocaleString()}
              </span>
            )}
          </div>

          <div className="space-y-4 py-6 border-y border-earth-100">
            <div className="flex items-center gap-3 text-sm text-earth-700">
              <Truck className="h-5 w-5 text-organic-500" />
              <span>Free delivery on orders over ₹10,000</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-earth-700">
              <ShieldCheck className="h-5 w-5 text-organic-500" />
              <span>Certified Biological Product - Eco-friendly</span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button className="flex-1 h-12 bg-organic-500 hover:bg-organic-600 text-lg">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
