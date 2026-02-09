import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CompareArrows, Close, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  features: string[];
  stockQuantity: number;
  lowStockThreshold: number;
}

interface ProductComparisonProps {
  products: Product[];
  onRemove: (productId: string) => void;
}

export function ProductComparison({ products, onRemove }: ProductComparisonProps) {
  const [open, setOpen] = useState(true);

  if (!open || products.length === 0) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-full max-w-4xl z-50 shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CompareArrows className="h-5 w-5" />
            Compare Products
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            <Close className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2 w-48">Product</th>
                {products.map((product) => (
                  <th key={product.id} className="text-center p-2 min-w-[180px]">
                    <div className="relative inline-block">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 p-1 h-6 w-6"
                        onClick={() => onRemove(product.id)}
                      >
                        <Close className="h-3 w-3" />
                      </Button>
                      <div className="flex flex-col items-center">
                        <div className="relative w-16 h-16 mb-2">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="font-medium text-sm text-center">{product.name}</div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 font-medium">Price</td>
                {products.map((product) => (
                  <td key={`price-${product.id}`} className="p-2 text-center">
                    <div>
                      <span className="font-bold text-organic-600">₹{product.price.toLocaleString()}</span>
                      {product.comparePrice && (
                        <div className="text-sm text-gray-500 line-through">
                          ₹{product.comparePrice.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="p-2 font-medium">Availability</td>
                {products.map((product) => (
                  <td key={`availability-${product.id}`} className="p-2 text-center">
                    {product.stockQuantity > product.lowStockThreshold ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        In Stock
                      </Badge>
                    ) : product.stockQuantity > 0 ? (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-medium">Features</td>
                {products.map((product) => (
                  <td key={`features-${product.id}`} className="p-2">
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {product.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button className="bg-organic-500 hover:bg-organic-600">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add All to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}