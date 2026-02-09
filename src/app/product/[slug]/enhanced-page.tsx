// app/product/[slug]/enhanced-page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  ShoppingCart, 
  Shield, 
  Truck, 
  Star, 
  Package, 
  Weight, 
  Droplets,
  Heart,
  Share2,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Leaf,
  Users,
  Award,
  Info,
  Eye,
  MessageCircle,
  Calendar,
  MapPin
} from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { getProductBySlug, getVariants } from '@/lib/product-service';
import { EnhancedProductCard } from '@/components/shop/enhanced-product-card';
import { AccessibilityUtils } from '@/lib/accessibility';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface EnhancedProductPageProps {
  product: Product;
  variants: ProductVariant[];
}

export default function EnhancedProductPage({ product, variants }: EnhancedProductPageProps) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Calculate discount percentage
  const hasDiscount = selectedVariant.compare_price && selectedVariant.compare_price > selectedVariant.price;
  const discountPercent = hasDiscount 
    ? Math.round(((selectedVariant.compare_price! - selectedVariant.price) / selectedVariant.compare_price!) * 100) 
    : 0;

  // Check stock status
  const isOutOfStock = selectedVariant.stock_quantity <= 0;
  const isLowStock = selectedVariant.stock_quantity > 0 && selectedVariant.stock_quantity <= 5;

  // Handle adding to cart
  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, this would call the cart API
      console.log(`Adding ${quantity} of ${selectedVariant.id} to cart`);
      
      // Show success message
      AccessibilityUtils.announce(`Added ${quantity} ${product.name} to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    AccessibilityUtils.announce(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  // Handle variant selection
  const handleVariantChange = (variantId: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  // Format price with Indian Rupee symbol and proper formatting
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get related products (in a real implementation, this would come from an API)
  useEffect(() => {
    // Simulate fetching related products
    const fetchRelatedProducts = async () => {
      // In a real implementation, this would fetch related products based on category, segment, or similar products
      // For now, we'll return an empty array or mock data
      setRelatedProducts([]);
    };
    
    fetchRelatedProducts();
  }, [product.id]);

  // Get product reviews (in a real implementation, this would come from an API)
  useEffect(() => {
    // Simulate fetching reviews
    const fetchReviews = async () => {
      // In a real implementation, this would fetch reviews for the product
      setReviews([]);
    };
    
    fetchReviews();
  }, [product.id]);

  return (
    <div className="min-h-screen bg-white">
      {/* Skip navigation link for accessibility */}
      <AccessibilityUtils.SkipNavLink targetId="main-content" />
      
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-earth-600 mb-6">
          <Link href="/" className="hover:text-organic-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-organic-600 transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/shop/segment/${product.segment}`} className="hover:text-organic-600 transition-colors">
            {product.segment.replace('_', ' ')}
          </Link>
          <span>/</span>
          <span className="text-earth-900">{product.name}</span>
        </nav>

        {/* Back to Shop Link */}
        <Link
          href="/shop"
          className="flex items-center text-earth-600 hover:text-organic-600 mb-6 transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Shop</span>
        </Link>

        {/* Product Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <Badge variant="outline" className="text-xs">
              {product.segment.replace('_', ' ').toUpperCase()}
            </Badge>
            {product.featured && (
              <Badge className="bg-organic-500 text-white text-xs">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-red-500 text-white text-xs">
                {discountPercent}% OFF
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-earth-900">{product.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-earth-50 border border-earth-100">
              <Image
                src={selectedVariant.image_urls?.[selectedImageIndex] || "/placeholder-product.jpg"}
                alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                fill
                className="object-cover"
                priority
              />
              
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <span className="text-white font-bold text-lg bg-red-500 px-4 py-2 rounded">
                    OUT OF STOCK
                  </span>
                </div>
              )}
              
              {isLowStock && !isOutOfStock && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">
                  Only {selectedVariant.stock_quantity} left!
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {selectedVariant.image_urls && selectedVariant.image_urls.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {selectedVariant.image_urls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                      index === selectedImageIndex 
                        ? "border-organic-500 ring-2 ring-organic-200" 
                        : "border-earth-200 hover:border-organic-300"
                    )}
                    aria-label={`View image ${index + 1}`}
                  >
                    <Image 
                      src={url} 
                      alt={`${product.name} - Image ${index + 1}`} 
                      fill 
                      className="object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleWishlistToggle}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart 
                  className={cn(
                    "h-4 w-4",
                    isWishlisted ? "fill-current text-red-500" : "text-earth-600"
                  )} 
                />
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label="Share product"
              >
                <Share2 className="h-4 w-4 text-earth-600" />
              </Button>
            </div>
          </div>

          {/* Product Information Section */}
          <div className="space-y-6">
            {/* Product Description */}
            <div>
              <p className="text-earth-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Variant Selection */}
            {variants.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Variant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {variants.map((variant) => (
                      <div
                        key={variant.id}
                        onClick={() => handleVariantChange(variant.id)}
                        className={cn(
                          "border rounded-lg p-4 cursor-pointer transition-all",
                          selectedVariant.id === variant.id
                            ? "border-organic-500 bg-organic-50"
                            : "border-earth-200 hover:border-organic-300"
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-earth-900">
                              {variant.weight} {variant.weight_unit}
                            </h4>
                            <p className="text-sm text-earth-600">
                              {variant.packing_type} • {variant.form}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-organic-600">
                              {formatPrice(variant.price)}
                            </div>
                            {variant.compare_price && variant.compare_price > variant.price && (
                              <div className="text-sm text-earth-400 line-through">
                                {formatPrice(variant.compare_price)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pricing */}
            <div className="space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-earth-900">
                  {formatPrice(selectedVariant.price)}
                </span>
                {selectedVariant.compare_price && selectedVariant.compare_price > selectedVariant.price && (
                  <>
                    <span className="text-xl text-earth-400 line-through">
                      {formatPrice(selectedVariant.compare_price)}
                    </span>
                    <Badge className="bg-red-500 text-white ml-2">
                      {discountPercent}% OFF
                    </Badge>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="font-medium">{product.average_rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-earth-500 ml-1">({product.review_count || 0} reviews)</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">In Stock</span>
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-sm">
              {isOutOfStock ? (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Currently out of stock</span>
                </div>
              ) : isLowStock ? (
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Only {selectedVariant.stock_quantity} left in stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>{selectedVariant.stock_quantity} available in stock</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="h-10 w-10 p-0 rounded-r-none"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(q => Math.min(99, q + 1))}
                  disabled={quantity >= 99 || isOutOfStock}
                  className="h-10 w-10 p-0 rounded-l-none"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isLoading}
                className="flex-1 h-12 bg-organic-500 hover:bg-organic-600 text-lg"
                aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
              >
                {isLoading ? (
                  <RotateCcw className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </>
                )}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-earth-100">
              <div className="flex items-center gap-3 text-sm text-earth-700">
                <Truck className="h-5 w-5 text-organic-500" />
                <span>Free delivery on orders over ₹10,000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-earth-700">
                <Shield className="h-5 w-5 text-organic-500" />
                <span>Certified Biological Product</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-earth-700">
                <Leaf className="h-5 w-5 text-organic-500" />
                <span>Eco-friendly & Sustainable</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-earth-700">
                <Clock className="h-5 w-5 text-organic-500" />
                <span>Dispatch in 24 hours</span>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-earth-600">SKU:</span>
                <span className="text-earth-900">{selectedVariant.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-earth-600">Weight:</span>
                <span className="text-earth-900">{selectedVariant.weight} {selectedVariant.weight_unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-earth-600">Packing:</span>
                <span className="text-earth-900">{selectedVariant.packing_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-earth-600">Form:</span>
                <span className="text-earth-900">{selectedVariant.form}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12" id="main-content">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="application">Application</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.review_count || 0})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description || 'Product description coming soon.' }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-earth-100">
                          <span className="text-earth-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className="text-earth-900 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-earth-600 italic">Specifications information not available for this product.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="application" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  {product.application_guide ? (
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: product.application_guide }}
                    />
                  ) : (
                    <p className="text-earth-600 italic">Application guide coming soon.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review, index) => (
                        <div key={index} className="border-b border-earth-100 pb-6 last:border-b-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={cn(
                                    "h-4 w-4",
                                    i < review.rating 
                                      ? "fill-yellow-400 text-yellow-400" 
                                      : "text-gray-300"
                                  )} 
                                />
                              ))}
                            </div>
                            <span className="font-medium text-earth-900">{review.title}</span>
                          </div>
                          <p className="text-earth-700 mb-2">{review.comment}</p>
                          <div className="flex justify-between text-sm text-earth-500">
                            <span>By {review.reviewer_name}</span>
                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 mx-auto text-earth-300 mb-4" />
                      <h3 className="text-lg font-medium text-earth-900 mb-2">No reviews yet</h3>
                      <p className="text-earth-600">Be the first to review this product.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-earth-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <EnhancedProductCard 
                  key={product.id} 
                  product={product} 
                  variant={variants.find(v => v.product_id === product.id) || variants[0]}
                  showQuickView={false}
                  showWishlist={true}
                  showRatings={true}
                  showBadges={true}
                  showDescription={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper component to handle data fetching
export async function EnhancedProductPageWrapper({ params }: { params: { slug: string } }) {
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
    <EnhancedProductPage 
      product={product} 
      variants={variants} 
    />
  );
}