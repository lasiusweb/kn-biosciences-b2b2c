import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
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
  MapPin,
  Play,
  FileText,
  Plus,
  Minus
} from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { getProductBySlug, getVariants } from '@/lib/product-service';
import { AccessibilityUtils } from '@/lib/accessibility';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { ProductSpecs } from '@/components/shop/product-specs';
import { ProductReviews } from '@/components/shop/product-reviews';
import { RelatedProducts } from '@/components/shop/related-products';
import { InventoryStatus } from '@/components/shop/inventory-status';
import { VariantSelector } from '@/components/shop/variant-selector';
import { ProductComparison } from '@/components/shop/product-comparison';
import { ProductSafetyInfo } from '@/components/shop/product-safety-info';
import { ProductComplianceInfo } from '@/components/shop/product-compliance-info';
import { ProductIdentityInfo } from '@/components/shop/product-identity-info';
import { ProductDocuments } from '@/components/shop/product-documents';
import { ExtendedProductSpecs } from '@/components/shop/extended-product-specs';

interface EnhancedProductPageProps {
  product: Product;
  variants: ProductVariant[];
}

export default function EnhancedProductPage({ product, variants }: EnhancedProductPageProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [comparisonProducts, setComparisonProducts] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

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

  // Add to comparison
  const addToComparison = () => {
    if (comparisonProducts.some(p => p.id === product.id)) return;
    
    const productForComparison = {
      id: product.id,
      name: product.name,
      price: selectedVariant.price,
      comparePrice: selectedVariant.comparePrice,
      image: selectedVariant.image_urls[0] || '/placeholder-product.jpg',
      rating: product.average_rating || 0,
      reviewCount: product.review_count || 0,
      features: [
        `Weight: ${selectedVariant.weight} ${selectedVariant.weight_unit}`,
        `Packing: ${selectedVariant.packing_type}`,
        `Form: ${selectedVariant.form}`
      ],
      stockQuantity: selectedVariant.stock_quantity,
      lowStockThreshold: selectedVariant.low_stock_threshold
    };
    
    setComparisonProducts([...comparisonProducts, productForComparison]);
    setShowComparison(true);
  };

  // Remove from comparison
  const removeFromComparison = (productId: string) => {
    setComparisonProducts(comparisonProducts.filter(p => p.id !== productId));
    if (comparisonProducts.length <= 1) {
      setShowComparison(false);
    }
  };

  // Get related products (in a real implementation, this would come from an API)
  useEffect(() => {
    // Simulate fetching related products
    const fetchRelatedProducts = async () => {
      // In a real implementation, this would fetch related products based on category, segment, or similar products
      // For now, we'll return mock data
      setRelatedProducts([
        {
          id: 'rel-1',
          name: 'BioGrow Pro Fertilizer',
          price: 1299,
          comparePrice: 1499,
          rating: 4.5,
          reviewCount: 124,
          image: '/images/products/bio-grow-pro.jpg',
          badge: 'bestseller',
          segment: 'agriculture'
        },
        {
          id: 'rel-2',
          name: 'SoilRevive Organic Mix',
          price: 899,
          comparePrice: 999,
          rating: 4.7,
          reviewCount: 89,
          image: '/images/products/soil-revive.jpg',
          badge: 'new',
          segment: 'agriculture'
        },
        {
          id: 'rel-3',
          name: 'AquaVital Plus',
          price: 1599,
          comparePrice: 1799,
          rating: 4.3,
          reviewCount: 67,
          image: '/images/products/aqua-vital.jpg',
          badge: 'sale',
          segment: 'aquaculture'
        },
        {
          id: 'rel-4',
          name: 'PestGuard Natural',
          price: 749,
          comparePrice: 849,
          rating: 4.2,
          reviewCount: 102,
          image: '/images/products/pest-guard.jpg',
          segment: 'agriculture'
        }
      ]);
    };

    fetchRelatedProducts();
  }, [product.id]);

  // Get product reviews (in a real implementation, this would come from an API)
  useEffect(() => {
    // Simulate fetching reviews
    const fetchReviews = async () => {
      // In a real implementation, this would fetch reviews for the product
      setReviews([
        {
          id: 'rev-1',
          userName: 'Ramesh Kumar',
          rating: 5,
          title: 'Excellent results with BioGrow Pro!',
          content: 'I have been using BioGrow Pro for my wheat crop for the past season. The results are remarkable - my yield increased by 30% compared to last year. The soil health has also improved significantly.',
          date: '2024-01-15',
          helpfulCount: 12,
          verifiedPurchase: true
        },
        {
          id: 'rev-2',
          userName: 'Priya Sharma',
          rating: 4,
          title: 'Good product with visible effects',
          content: 'Noticed a difference in my plants within 2 weeks of application. Growth is more robust and the leaves are greener. Will definitely repurchase.',
          date: '2024-01-10',
          helpfulCount: 8,
          verifiedPurchase: true
        },
        {
          id: 'rev-3',
          userName: 'Suresh Patel',
          rating: 5,
          title: 'Best organic fertilizer I have used',
          content: 'As an organic farmer, I am very particular about the products I use. BioGrow Pro meets all my expectations. It enhances soil fertility without any harmful chemicals.',
          date: '2024-01-05',
          helpfulCount: 15,
          verifiedPurchase: true
        }
      ]);
    };

    fetchReviews();
  }, [product.id]);

  // Mock product specifications
  const productSpecs = {
    weight: `${selectedVariant.weight} ${selectedVariant.weight_unit}`,
    dimensions: '12 x 8 x 6 inches',
    form: selectedVariant.form,
    packingType: selectedVariant.packing_type,
    shelfLife: '24 months from manufacturing date',
    netWeight: selectedVariant.net_weight ? `${selectedVariant.net_weight} ${selectedVariant.weight_unit}` : undefined,
    grossWeight: selectedVariant.gross_weight ? `${selectedVariant.gross_weight} ${selectedVariant.weight_unit}` : undefined,
    netContent: selectedVariant.net_content || product.net_content,
    ingredients: ['Organic matter', 'Beneficial microorganisms', 'Humic acid', 'Vermicompost'],
    benefits: [
      'Improves soil fertility and structure',
      'Enhances nutrient uptake by plants',
      'Promotes beneficial microbial activity',
      'Reduces dependency on chemical fertilizers',
      'Safe for environment and humans'
    ],
    applicationGuides: [
      {
        crop: 'Wheat',
        dosage: '25-30 kg/hectare',
        timing: 'During sowing and tillering stage',
        method: 'Mix evenly in top 15 cm of soil'
      },
      {
        crop: 'Rice',
        dosage: '30-35 kg/hectare',
        timing: 'Before transplanting',
        method: 'Apply to nursery beds and main field'
      },
      {
        crop: 'Vegetables',
        dosage: '20-25 kg/hectare',
        timing: 'During land preparation',
        method: 'Broadcast and incorporate in soil'
      }
    ]
  };

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
              
              {/* Video indicator */}
              <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
                <Play className="h-3 w-3 mr-1" />
                Video Guide
              </div>
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
              <Button
                variant="outline"
                size="sm"
                onClick={addToComparison}
                aria-label="Add to comparison"
              >
                <FileText className="h-4 w-4 text-earth-600" />
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
              <VariantSelector
                variants={variants}
                selectedVariantId={selectedVariant.id}
                onSelect={handleVariantChange}
              />
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
                <InventoryStatus 
                  stockQuantity={selectedVariant.stock_quantity} 
                  lowStockThreshold={selectedVariant.low_stock_threshold}
                />
              </div>
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
          {/* Safety Information */}
          <ProductSafetyInfo product={product} />
          
          {/* Compliance Information */}
          <ProductComplianceInfo product={product} />
          
          {/* Identity Information */}
          <ProductIdentityInfo product={product} />
          
          {/* Documents */}
          <ProductDocuments product={product} />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="application">Application</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
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
              <ExtendedProductSpecs
                productId={product.id}
                specs={productSpecs}
                variants={variants}
              />
            </TabsContent>

            <TabsContent value="application" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-bold mb-4">How to Use {product.name}</h3>
                    <p className="mb-4">Follow these steps for optimal results with {product.name}:</p>
                    
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Prepare the soil by loosening it to a depth of 15-20 cm</li>
                      <li>Mix {product.name} evenly with the top layer of soil</li>
                      <li>Water the area thoroughly after application</li>
                      <li>Repeat application as per the recommended schedule</li>
                      <li>Monitor plant growth and adjust frequency if needed</li>
                    </ol>
                    
                    <div className="mt-6 p-4 bg-organic-50 rounded-lg">
                      <h4 className="font-bold text-organic-700 mb-2">Pro Tips:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Best applied during early morning or late evening</li>
                        <li>Store in a cool, dry place away from direct sunlight</li>
                        <li>Keep away from children and pets</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Video Guides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative cursor-pointer" onClick={() => setVideoModalOpen(true)}>
                      <Image 
                        src="/images/products/application-video-thumb.jpg" 
                        alt="Application Guide Video" 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-16 w-16 text-white bg-black/50 rounded-full p-3" />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
                        5 min 30 sec
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium">Recommended Videos</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <div className="relative w-16 h-16 bg-gray-200 rounded">
                            <Image 
                              src="/images/products/video-thumb-1.jpg" 
                              alt="Video thumbnail" 
                              fill 
                              className="object-cover rounded"
                            />
                          </div>
                          <div>
                            <h5 className="font-medium">How to Apply BioFertilizers</h5>
                            <p className="text-sm text-gray-500">4 min 15 sec</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <div className="relative w-16 h-16 bg-gray-200 rounded">
                            <Image 
                              src="/images/products/video-thumb-2.jpg" 
                              alt="Video thumbnail" 
                              fill 
                              className="object-cover rounded"
                            />
                          </div>
                          <div>
                            <h5 className="font-medium">Benefits of Organic Farming</h5>
                            <p className="text-sm text-gray-500">7 min 20 sec</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <ProductReviews 
                productId={product.id}
                reviews={reviews}
                averageRating={product.average_rating || 4.2}
                totalReviews={product.review_count || 124}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <RelatedProducts products={relatedProducts} />

        {/* Product Comparison Panel */}
        {showComparison && (
          <ProductComparison 
            products={comparisonProducts} 
            onRemove={removeFromComparison} 
          />
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