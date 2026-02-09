import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: 'bestseller' | 'new' | 'sale';
  segment: string;
}

interface RelatedProductsProps {
  products: Product[];
  title?: string;
}

export function RelatedProducts({ products, title = 'Related Products' }: RelatedProductsProps) {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-earth-900 mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id}>
            <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 relative">
                <div className="aspect-square relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <Badge 
                      className={`absolute top-2 left-2 capitalize ${
                        product.badge === 'bestseller' ? 'bg-red-500' : 
                        product.badge === 'new' ? 'bg-blue-500' : 
                        'bg-yellow-500'
                      }`}
                    >
                      {product.badge}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({product.reviewCount})</span>
                </div>
                <h3 className="font-semibold text-earth-900 line-clamp-2 h-12">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-organic-600">₹{product.price.toLocaleString()}</span>
                  {product.comparePrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{product.comparePrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full bg-organic-500 hover:bg-organic-600">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}