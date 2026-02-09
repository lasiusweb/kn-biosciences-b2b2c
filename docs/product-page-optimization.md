# Product Page UI/UX Analysis & Optimization Recommendations

## Current State Analysis

### Strengths
1. **Clean Layout**: Simple two-column layout with product images on left and details on right
2. **Clear Hierarchy**: Good visual hierarchy with proper typography sizing
3. **Essential Information**: Shows price, description, and key features
4. **Navigation**: Clear back-to-shop link
5. **Trust Indicators**: Free delivery and certified product badges

### Weaknesses
1. **Limited Product Information**: Missing detailed specifications, usage instructions, and application guidelines
2. **Basic Image Gallery**: No zoom functionality or detailed image viewing
3. **Simple Add-to-Cart**: No quantity selector or variant selection
4. **Missing Social Proof**: No reviews, ratings, or testimonials
5. **Limited Related Products**: No cross-sell or upsell suggestions
6. **Accessibility Issues**: Missing proper alt texts and ARIA attributes
7. **Performance**: No lazy loading for secondary images
8. **Mobile Experience**: Could be improved for mobile users in field conditions

## Optimization Recommendations

### 1. Enhanced Product Information Architecture

#### Current Issues:
- Product details are minimal
- No technical specifications
- Missing application guidelines
- No safety information

#### Recommendations:
```tsx
// Enhanced product page structure
<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
  {/* Enhanced Image Gallery */}
  <div className="space-y-4">
    <ProductImageGallery 
      images={mainVariant?.image_urls || []}
      productName={product.name}
      enableZoom={true}
      enableThumbnails={true}
    />
    
    {/* Product Video Section */}
    {product.video_url && (
      <ProductVideoPlayer url={product.video_url} />
    )}
  </div>

  {/* Enhanced Product Details */}
  <div className="space-y-8">
    {/* Basic Info */}
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-xs">
          {product.segment.replace("_", " ").toUpperCase()}
        </Badge>
        {product.is_certified && (
          <Badge className="bg-green-100 text-green-800 text-xs">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Certified
          </Badge>
        )}
      </div>
      
      <h1 className="text-4xl font-bold text-earth-900">{product.name}</h1>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <RatingDisplay rating={product.average_rating} />
          <span className="text-sm text-earth-600 ml-2">
            {product.review_count} reviews
          </span>
        </div>
        <span className="text-sm text-earth-500">
          SKU: {mainVariant?.sku}
        </span>
      </div>
    </div>

    {/* Pricing */}
    <div className="flex items-center gap-4">
      <span className="text-4xl font-bold text-earth-900">
        ₹{mainVariant?.price.toLocaleString()}
      </span>
      {mainVariant?.compare_price && mainVariant.compare_price > mainVariant.price && (
        <>
          <span className="text-xl text-earth-400 line-through">
            ₹{mainVariant.compare_price.toLocaleString()}
          </span>
          <Badge className="bg-red-100 text-red-800">
            {Math.round(((mainVariant.compare_price - mainVariant.price) / mainVariant.compare_price) * 100)}% OFF
          </Badge>
        </>
      )}
    </div>

    {/* Stock Status */}
    <div className="flex items-center gap-2">
      {mainVariant?.stock_quantity && mainVariant.stock_quantity > 0 ? (
        <div className="flex items-center text-green-600">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>In Stock ({mainVariant.stock_quantity} available)</span>
        </div>
      ) : (
        <div className="flex items-center text-red-600">
          <XCircle className="h-5 w-5 mr-2" />
          <span>Out of Stock</span>
        </div>
      )}
    </div>

    {/* Variant Selection */}
    {variants.length > 1 && (
      <ProductVariantSelector 
        variants={variants}
        onVariantChange={handleVariantChange}
        selectedVariant={selectedVariant}
      />
    )}

    {/* Quantity Selector */}
    <div className="flex items-center gap-4">
      <QuantitySelector 
        value={quantity}
        onChange={setQuantity}
        max={selectedVariant?.stock_quantity || 10}
      />
      <Button 
        className="flex-1 h-14 bg-organic-500 hover:bg-organic-600 text-lg"
        onClick={handleAddToCart}
        disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        Add to Cart
      </Button>
    </div>

    {/* Trust Badges */}
    <div className="grid grid-cols-2 gap-4 py-6 border-y border-earth-100">
      <div className="flex items-center gap-3 text-sm text-earth-700">
        <Truck className="h-5 w-5 text-organic-500" />
        <span>Free delivery on orders over ₹10,000</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-earth-700">
        <ShieldCheck className="h-5 w-5 text-organic-500" />
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

    {/* Application Instructions */}
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-earth-900">How to Use</h3>
      <div className="prose max-w-none">
        <div 
          className="text-earth-700"
          dangerouslySetInnerHTML={{ __html: product.application_guide || 'Detailed application instructions coming soon.' }}
        />
      </div>
    </div>

    {/* Technical Specifications */}
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-earth-900">Specifications</h3>
      <ProductSpecsTable specs={product.specifications} />
    </div>
  </div>
</div>

// Additional sections
<div className="mt-16 space-y-16">
  {/* Product Reviews */}
  <ProductReviewsSection productId={product.id} />
  
  {/* Related Products */}
  <RelatedProductsSection productId={product.id} segment={product.segment} />
  
  {/* FAQ Section */}
  <ProductFAQSection productId={product.id} />
</div>
```

### 2. Enhanced Image Gallery Component

```tsx
// components/product/product-image-gallery.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Zoom } from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  enableZoom?: boolean;
  enableThumbnails?: boolean;
}

export function ProductImageGallery({ 
  images, 
  productName, 
  enableZoom = true,
  enableThumbnails = true
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  if (images.length === 0) {
    return (
      <div className="relative aspect-square rounded-xl overflow-hidden bg-earth-50 border border-earth-100 flex items-center justify-center">
        <span className="text-earth-400">No images available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-earth-50 border border-earth-100">
        {enableZoom ? (
          <Zoom>
            <Image
              src={images[selectedImageIndex]}
              alt={`${productName} - Image ${selectedImageIndex + 1}`}
              fill
              className="object-cover cursor-zoom-in"
              priority
            />
          </Zoom>
        ) : (
          <Image
            src={images[selectedImageIndex]}
            alt={`${productName} - Image ${selectedImageIndex + 1}`}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Thumbnails */}
      {enableThumbnails && images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedImageIndex 
                  ? 'border-organic-500 ring-2 ring-organic-200' 
                  : 'border-earth-200 hover:border-organic-300'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image 
                src={image} 
                alt={`${productName} - Thumbnail ${index + 1}`} 
                fill 
                className="object-cover" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. Variant Selection Component

```tsx
// components/product/product-variant-selector.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ProductVariant } from '@/types';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  onVariantChange: (variant: ProductVariant) => void;
  selectedVariant: ProductVariant;
}

export function ProductVariantSelector({ 
  variants, 
  onVariantChange, 
  selectedVariant 
}: ProductVariantSelectorProps) {
  const [selectedSku, setSelectedSku] = useState(selectedVariant.sku);

  const handleVariantChange = (sku: string) => {
    const variant = variants.find(v => v.sku === sku);
    if (variant) {
      setSelectedSku(sku);
      onVariantChange(variant);
    }
  };

  // Group variants by attributes (weight, packing, form)
  const groupedVariants = variants.reduce((acc, variant) => {
    const key = `${variant.weight} ${variant.weight_unit} - ${variant.packing_type} - ${variant.form}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(variant);
    return acc;
  }, {} as Record<string, ProductVariant[]>);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-earth-900">Select Variant</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(groupedVariants).map(([groupKey, groupVariants]) => (
          <div key={groupKey} className="border rounded-lg p-4">
            <h4 className="font-medium text-earth-800 mb-2">{groupKey}</h4>
            <div className="flex flex-wrap gap-2">
              {groupVariants.map((variant) => (
                <Button
                  key={variant.id}
                  variant={selectedVariant.id === variant.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVariantChange(variant.sku)}
                  className="capitalize"
                >
                  {variant.sku}
                  {variant.price && (
                    <span className="ml-2 text-xs">
                      ₹{variant.price.toLocaleString()}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. Enhanced Product Specifications Component

```tsx
// components/product/product-specs-table.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ProductSpec {
  name: string;
  value: string;
  description?: string;
}

interface ProductSpecsTableProps {
  specs: ProductSpec[];
}

export function ProductSpecsTable({ specs }: ProductSpecsTableProps) {
  if (!specs || specs.length === 0) {
    return (
      <div className="text-earth-600 italic">
        Specifications information not available for this product.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/3">Specification</TableHead>
          <TableHead>Value</TableHead>
          <TableHead className="text-right">Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {specs.map((spec, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{spec.name}</TableCell>
            <TableCell>{spec.value}</TableCell>
            <TableCell className="text-right text-earth-600">
              {spec.description || '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### 5. Mobile-First Optimization

```tsx
// Mobile-optimized product page
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductImageGallery } from './product-image-gallery';
import { ProductVariantSelector } from './product-variant-selector';
import { ProductSpecsTable } from './product-specs-table';
import { ProductReviewsSection } from './product-reviews-section';
import { RelatedProductsSection } from './related-products-section';

export default function MobileOptimizedProductPage({ product, variants }: ProductPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <Link
        href="/shop"
        className="flex items-center text-earth-600 hover:text-organic-600 mb-4 md:mb-8 transition-colors group"
      >
        <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden md:inline">Back to Shop</span>
        <span className="md:hidden">Back</span>
      </Link>

      <div className="space-y-6">
        {/* Mobile: Sticky Add to Cart Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t py-3 px-4 z-10">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <span className="text-lg font-bold text-earth-900">
                ₹{selectedVariant?.price.toLocaleString()}
              </span>
            </div>
            <Button 
              className="h-12 bg-organic-500 hover:bg-organic-600"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Product Images - Full Width on Mobile */}
        <div className="md:hidden">
          <ProductImageGallery 
            images={selectedVariant?.image_urls || []}
            productName={product.name}
            enableZoom={true}
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6 pb-20 md:pb-0"> {/* Add padding to account for sticky bar on mobile */}
          <div className="hidden md:block">
            <ProductImageGallery 
              images={selectedVariant?.image_urls || []}
              productName={product.name}
              enableZoom={true}
            />
          </div>

          <div className="md:hidden">
            <h1 className="text-2xl font-bold text-earth-900">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <RatingDisplay rating={product.average_rating} />
              <span className="text-sm text-earth-600">
                {product.review_count} reviews
              </span>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="text-xs">
                {product.segment.replace("_", " ").toUpperCase()}
              </Badge>
              {product.is_certified && (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Certified
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold text-earth-900">{product.name}</h1>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-4">
            <span className="text-2xl md:text-4xl font-bold text-earth-900">
              ₹{selectedVariant?.price.toLocaleString()}
            </span>
            {selectedVariant?.compare_price && selectedVariant.compare_price > selectedVariant.price && (
              <>
                <span className="text-lg md:text-xl text-earth-400 line-through">
                  ₹{selectedVariant.compare_price.toLocaleString()}
                </span>
                <Badge className="bg-red-100 text-red-800">
                  {Math.round(((selectedVariant.compare_price - selectedVariant.price) / selectedVariant.compare_price) * 100)}% OFF
                </Badge>
              </>
            )}
          </div>

          {/* Variant Selection */}
          {variants.length > 1 && (
            <ProductVariantSelector 
              variants={variants}
              onVariantChange={setSelectedVariant}
              selectedVariant={selectedVariant}
            />
          )}

          {/* Quantity and Add to Cart - Hidden on mobile (shown in sticky bar) */}
          <div className="hidden md:flex items-center gap-4">
            <QuantitySelector 
              value={quantity}
              onChange={setQuantity}
              max={selectedVariant?.stock_quantity || 10}
            />
            <Button 
              className="flex-1 h-14 bg-organic-500 hover:bg-organic-600 text-lg"
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 md:py-6 border-y border-earth-100">
            <div className="flex items-center gap-3 text-sm text-earth-700">
              <Truck className="h-5 w-5 text-organic-500" />
              <span>Free delivery on orders over ₹10,000</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-earth-700">
              <ShieldCheck className="h-5 w-5 text-organic-500" />
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

          {/* Mobile: Collapsible Sections */}
          <Tabs defaultValue="description" className="md:hidden">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="description">Details</TabsTrigger>
              <TabsTrigger value="specs">Specs</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="space-y-4">
              <h3 className="text-lg font-semibold text-earth-900">Product Description</h3>
              <p className="text-earth-700 leading-relaxed">
                {product.description}
              </p>
            </TabsContent>
            <TabsContent value="specs" className="space-y-4">
              <h3 className="text-lg font-semibold text-earth-900">Specifications</h3>
              <ProductSpecsTable specs={product.specifications} />
            </TabsContent>
            <TabsContent value="usage" className="space-y-4">
              <h3 className="text-lg font-semibold text-earth-900">How to Use</h3>
              <div 
                className="text-earth-700"
                dangerouslySetInnerHTML={{ __html: product.application_guide || 'Detailed application instructions coming soon.' }}
              />
            </TabsContent>
            <TabsContent value="reviews" className="space-y-4">
              <ProductReviewsSection productId={product.id} />
            </TabsContent>
          </Tabs>

          {/* Desktop: All sections visible */}
          <div className="hidden md:block space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-earth-900 mb-4">Product Description</h3>
              <p className="text-earth-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-earth-900 mb-4">How to Use</h3>
              <div 
                className="text-earth-700"
                dangerouslySetInnerHTML={{ __html: product.application_guide || 'Detailed application instructions coming soon.' }}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-earth-900 mb-4">Specifications</h3>
              <ProductSpecsTable specs={product.specifications} />
            </div>

            <ProductReviewsSection productId={product.id} />
          </div>

          <RelatedProductsSection productId={product.id} segment={product.segment} />
        </div>
      </div>
    </div>
  );
}
```

### 6. Performance Optimizations

```tsx
// components/product/optimized-product-page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ProductImageGallery } from './product-image-gallery';
import { ProductVariantSelector } from './product-variant-selector';
import { QuantitySelector } from '@/components/ui/quantity-selector';
import { Skeleton } from '@/components/ui/skeleton';
import { useInView } from 'react-intersection-observer';

// Lazy-loaded sections
const ProductReviewsSection = dynamic(() => import('./product-reviews-section'), { ssr: false });
const RelatedProductsSection = dynamic(() => import('./related-products-section'), { ssr: false });

export default function OptimizedProductPage({ product, variants }: ProductPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Only load heavy components when they're in view
  const [shouldRenderReviews, setShouldRenderReviews] = useState(false);
  const [shouldRenderRelated, setShouldRenderRelated] = useState(false);

  useEffect(() => {
    if (inView) {
      setShouldRenderReviews(true);
      // Delay related products slightly to prioritize reviews
      setTimeout(() => setShouldRenderRelated(true), 300);
    }
  }, [inView]);

  if (!product) {
    return <ProductPageSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/shop"
        className="flex items-center text-earth-600 hover:text-organic-600 mb-8 transition-colors group"
      >
        <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductImageGallery 
          images={selectedVariant?.image_urls || []}
          productName={product.name}
          enableZoom={true}
        />

        <div className="space-y-6">
          {/* Product Info - Already loaded */}
          <div>
            <span className="text-xs font-bold text-organic-600 uppercase tracking-widest">
              {product.segment.replace("_", " ")}
            </span>
            <h1 className="text-4xl font-bold text-earth-900 mt-2">{product.name}</h1>
            <p className="text-earth-600 mt-4 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-earth-900">
              ₹{selectedVariant?.price.toLocaleString()}
            </span>
            {selectedVariant?.compare_price && (
              <span className="text-xl text-earth-400 line-through">
                ₹{mainVariant.compare_price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Variant Selection */}
          {variants.length > 1 && (
            <ProductVariantSelector 
              variants={variants}
              onVariantChange={setSelectedVariant}
              selectedVariant={selectedVariant}
            />
          )}

          {/* Quantity and Add to Cart */}
          <div className="flex items-center gap-4">
            <QuantitySelector 
              value={quantity}
              onChange={setQuantity}
              max={selectedVariant?.stock_quantity || 10}
            />
            <Button 
              className="flex-1 h-12 bg-organic-500 hover:bg-organic-600 text-lg"
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
          </div>

          {/* Trust Badges */}
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
        </div>
      </div>

      {/* Lazy-loaded sections */}
      <div ref={ref} className="mt-16 space-y-16">
        {shouldRenderReviews ? (
          <ProductReviewsSection productId={product.id} />
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {shouldRenderRelated ? (
          <RelatedProductsSection productId={product.id} segment={product.segment} />
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-96 w-full" />
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton for loading state
function ProductPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>

          <Skeleton className="h-10 w-full" />

          <div className="space-y-4 py-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 7. Accessibility Improvements

```tsx
// components/product/accessibility-enhanced-product.tsx
'use client';

import { useState, useEffect } from 'react';
import { ProductImageGallery } from './product-image-gallery';
import { ProductVariantSelector } from './product-variant-selector';
import { QuantitySelector } from '@/components/ui/quantity-selector';
import { useA11yAnnouncer } from '@/hooks/use-a11y-announcer';

export default function AccessibilityEnhancedProductPage({ product, variants }: ProductPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [addedToCart, setAddedToCart] = useState(false);
  const announce = useA11yAnnouncer();

  const handleAddToCart = async () => {
    // Add to cart logic here
    setAddedToCart(true);
    announce(`Added ${quantity} ${product.name} to cart`, 'polite');
    
    // Reset after 3 seconds
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    announce(`Selected variant: ${variant.sku}`, 'polite');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Skip link for screen readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>

      <Link
        href="/shop"
        className="flex items-center text-earth-600 hover:text-organic-600 mb-8 transition-colors group focus:outline-none focus:ring-2 focus:ring-organic-500 rounded p-2"
      >
        <ChevronLeft 
          className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" 
          aria-hidden="true"
        />
        <span>Back to Shop</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductImageGallery 
          images={selectedVariant?.image_urls || []}
          productName={product.name}
          enableZoom={true}
        />

        <div className="space-y-6" id="main-content">
          <div>
            <span 
              className="text-xs font-bold text-organic-600 uppercase tracking-widest"
              aria-label={`Product segment: ${product.segment.replace("_", " ")}`}
            >
              {product.segment.replace("_", " ")}
            </span>
            <h1 
              className="text-4xl font-bold text-earth-900 mt-2"
              id="product-title"
            >
              {product.name}
            </h1>
            <p 
              className="text-earth-600 mt-4 leading-relaxed"
              id="product-description"
            >
              {product.description}
            </p>
          </div>

          <div 
            className="flex items-center gap-4"
            aria-labelledby="pricing-info"
          >
            <span 
              id="pricing-info"
              className="text-3xl font-bold text-earth-900"
            >
              ₹{selectedVariant?.price.toLocaleString()}
            </span>
            {selectedVariant?.compare_price && (
              <span 
                className="text-xl text-earth-400 line-through"
                aria-label={`Compare at price: ₹${selectedVariant.compare_price.toLocaleString()}`}
              >
                ₹{selectedVariant.compare_price.toLocaleString()}
              </span>
            )}
          </div>

          {variants.length > 1 && (
            <ProductVariantSelector 
              variants={variants}
              onVariantChange={handleVariantChange}
              selectedVariant={selectedVariant}
            />
          )}

          <div className="flex items-center gap-4">
            <QuantitySelector 
              value={quantity}
              onChange={setQuantity}
              max={selectedVariant?.stock_quantity || 10}
              aria-label="Select quantity"
            />
            <Button 
              className="flex-1 h-12 bg-organic-500 hover:bg-organic-600 text-lg"
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
              aria-describedby={addedToCart ? "cart-added-message" : undefined}
            >
              <ShoppingCart className="h-5 w-5 mr-2" aria-hidden="true" />
              {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
            </Button>
          </div>

          {addedToCart && (
            <div 
              id="cart-added-message"
              className="sr-only"
              aria-live="polite"
            >
              {quantity} {product.name} added to cart
            </div>
          )}

          <div className="space-y-4 py-6 border-y border-earth-100">
            <div className="flex items-center gap-3 text-sm text-earth-700">
              <Truck className="h-5 w-5 text-organic-500" aria-hidden="true" />
              <span>Free delivery on orders over ₹10,000</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-earth-700">
              <ShieldCheck className="h-5 w-5 text-organic-500" aria-hidden="true" />
              <span>Certified Biological Product - Eco-friendly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}