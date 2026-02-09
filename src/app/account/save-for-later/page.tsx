'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, ShoppingCart, RotateCcw } from 'lucide-react';
import { useSaveForLater } from '@/hooks/use-save-for-later';
import Image from 'next/image';
import Link from 'next/link';

export default function SavedItemsPage() {
  const { savedItems, loading, error, removeSavedItem, moveToCart } = useSaveForLater();
  const [movingItems, setMovingItems] = useState<Set<string>>(new Set());

  const handleMoveToCart = async (itemId: string) => {
    setMovingItems(prev => new Set(prev).add(itemId));
    
    try {
      const result = await moveToCart(itemId);
      if (!result.success) {
        console.error('Error moving item to cart:', result.error);
      }
    } finally {
      setMovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-organic-200 border-t-organic-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-16">
            <div className="text-red-500 mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-earth-900 mb-4">Error Loading Saved Items</h2>
            <p className="text-earth-600 mb-8">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-organic-500 hover:bg-organic-600 px-8"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (savedItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-16">
            <div className="mx-auto bg-organic-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-organic-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-earth-900 mb-4">No Saved Items</h2>
            <p className="text-earth-600 mb-8">You haven't saved any items for later yet.</p>
            <Button
              asChild
              className="bg-organic-500 hover:bg-organic-600 px-8"
            >
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-earth-900 mb-2">Saved for Later</h1>
        <p className="text-earth-600">
          {savedItems.length} item{savedItems.length !== 1 ? 's' : ''} saved for future purchase
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedItems.map((item) => {
          const variant = item.product_variant;
          const isMoving = movingItems.has(item.id);
          
          return (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={variant.image_urls?.[0] || '/placeholder-product.jpg'}
                  alt={variant.sku}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{variant.sku}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {variant.weight} {variant.weight_unit}
                  </Badge>
                  <Badge variant="outline">
                    {variant.packing_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-organic-600">
                    ₹{variant.price.toLocaleString()}
                  </span>
                  {variant.compare_price && variant.compare_price > variant.price && (
                    <Badge className="bg-red-100 text-red-700">
                      {Math.round(((variant.compare_price - variant.price) / variant.compare_price) * 100)}% OFF
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeSavedItem(item.id)}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
                <Button
                  size="sm"
                  className="bg-organic-500 hover:bg-organic-600 flex-1"
                  onClick={() => handleMoveToCart(item.id)}
                  disabled={isMoving}
                >
                  {isMoving ? (
                    <RotateCcw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}