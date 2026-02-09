// components/mobile/mobile-optimized-header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { 
  Menu, 
  ShoppingCart, 
  User, 
  Search, 
  X, 
  Home, 
  Info,
  Phone,
  ShoppingBag,
  Leaf,
  Fish,
  Egg,
  Cow,
  Recycle,
  Seed,
  TreePine,
  Tractor,
  Ruler,
  PalmTree,
  Building,
  Truck,
  Shield,
  Star,
  Heart,
  ChevronRight,
  MapPin,
  Mail,
  Package
} from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';

interface MobileNavSection {
  title: string;
  items: Array<{
    name: string;
    href: string;
    icon: React.ReactNode;
  }>;
}

export function MobileOptimizedHeader() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart, getCartCount } = useCart();
  
  const navSections: MobileNavSection[] = [
    {
      title: 'Main Navigation',
      items: [
        { name: 'Home', href: '/', icon: <Home className="h-5 w-5" /> },
        { name: 'About Us', href: '/about', icon: <Info className="h-5 w-5" /> },
        { name: 'Contact', href: '/contact', icon: <Phone className="h-5 w-5" /> },
        { name: 'Shop', href: '/shop', icon: <ShoppingBag className="h-5 w-5" /> },
      ]
    },
    {
      title: 'Shop by Segment',
      items: [
        { name: 'Agriculture', href: '/shop/segment/agriculture', icon: <Leaf className="h-5 w-5" /> },
        { name: 'Aquaculture', href: '/shop/segment/aquaculture', icon: <Fish className="h-5 w-5" /> },
        { name: 'Poultry Healthcare', href: '/shop/segment/poultry_healthcare', icon: <Egg className="h-5 w-5" /> },
        { name: 'Animal Healthcare', href: '/shop/segment/animal_healthcare', icon: <Cow className="h-5 w-5" /> },
        { name: 'Bioremediation', href: '/shop/segment/bioremediation', icon: <Recycle className="h-5 w-5" /> },
        { name: 'Seeds', href: '/shop/segment/seeds', icon: <Seed className="h-5 w-5" /> },
        { name: 'Organic Farming', href: '/shop/segment/organic_farming', icon: <TreePine className="h-5 w-5" /> },
        { name: 'Farm Equipment', href: '/shop/segment/farm_equipment', icon: <Tractor className="h-5 w-5" /> },
        { name: 'Testing Lab', href: '/shop/segment/testing_lab', icon: <Ruler className="h-5 w-5" /> },
        { name: 'Oilpalm', href: '/shop/segment/oilpalm', icon: <PalmTree className="h-5 w-5" /> },
      ]
    },
    {
      title: 'Account & Support',
      items: [
        { name: 'My Account', href: '/account', icon: <User className="h-5 w-5" /> },
        { name: 'My Orders', href: '/account/orders', icon: <Package className="h-5 w-5" /> },
        { name: 'Wishlist', href: '/account/wishlist', icon: <Heart className="h-5 w-5" /> },
        { name: 'Track Order', href: '/track-order', icon: <Truck className="h-5 w-5" /> },
        { name: 'Knowledge Center', href: '/knowledge', icon: <BookOpen className="h-5 w-5" /> },
      ]
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="lg:hidden bg-white border-b border-earth-200 sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-organic-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">KN</span>
          </div>
          <div>
            <span className="text-lg font-bold text-earth-800">KN Bio</span>
            <p className="text-xs text-organic-600 -mt-1">Agriculture Solutions</p>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="flex-1 mr-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-earth-400" />
                <Input
                  autoFocus
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </form>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="relative"
              >
                <Search className="h-5 w-5" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-organic-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/cart')}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {cart.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-organic-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.items.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </Button>

              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-sm p-0">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-organic-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">KN</span>
                        </div>
                        <span className="font-bold text-earth-900">KN Bio</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-4">
                      {navSections.map((section, index) => (
                        <div key={index} className="mb-6">
                          <h3 className="px-4 text-sm font-semibold text-earth-500 uppercase tracking-wider mb-3">
                            {section.title}
                          </h3>
                          <div className="space-y-1">
                            {section.items.map((item, itemIndex) => (
                              <Link
                                key={itemIndex}
                                href={item.href}
                                className="flex items-center px-4 py-3 text-earth-700 hover:bg-earth-50 hover:text-organic-600 transition-colors"
                                onClick={() => setIsSheetOpen(false)}
                              >
                                <span className="mr-3 text-organic-600">{item.icon}</span>
                                <span className="font-medium">{item.name}</span>
                                <ChevronRight className="ml-auto h-4 w-4 text-earth-400" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t p-4 space-y-3">
                      <Link href="/auth" className="flex items-center gap-3 p-3 rounded-lg hover:bg-earth-50 transition-colors">
                        <User className="h-5 w-5 text-organic-600" />
                        <span>Sign In / Register</span>
                      </Link>
                      <Link href="/b2b" className="flex items-center gap-3 p-3 rounded-lg hover:bg-earth-50 transition-colors">
                        <Building className="h-5 w-5 text-organic-600" />
                        <span>B2B Portal</span>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}

          {isSearchOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Search overlay when open */}
      {isSearchOpen && (
        <div className="absolute inset-0 bg-white z-40 flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-5 w-5 text-earth-500" />
              </button>
              <form onSubmit={handleSearch} className="px-10 w-full">
                <Input
                  autoFocus
                  placeholder="Search products, segments, or solutions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </form>
            </div>
          </div>
          
          {/* Search suggestions would go here */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-center py-12 text-earth-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Search for products, segments, or solutions</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Mobile-optimized product grid
export function MobileProductGrid({ 
  products, 
  variants,
  onAddToCart 
}: { 
  products: any[]; 
  variants: any[];
  onAddToCart: (variantId: string, quantity: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map((product) => {
        const variant = variants.find(v => v.product_id === product.id);
        
        if (!variant) return null;
        
        return (
          <div 
            key={product.id} 
            className="bg-white rounded-xl border border-earth-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <Link href={`/product/${product.slug}`}>
              <div className="aspect-square bg-earth-50 relative">
                <Image
                  src={variant.image_urls?.[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {product.featured && (
                  <Badge className="absolute top-2 left-2 bg-organic-500 text-white text-xs">
                    Featured
                  </Badge>
                )}
                {variant.compare_price && variant.compare_price > variant.price && (
                  <Badge variant="destructive" className="absolute top-2 right-2 text-xs">
                    {Math.round(((variant.compare_price - variant.price) / variant.compare_price) * 100)}% OFF
                  </Badge>
                )}
              </div>
            </Link>
            
            <div className="p-3">
              <Link href={`/product/${product.slug}`}>
                <h3 className="font-semibold text-sm text-earth-900 line-clamp-2 mb-1">
                  {product.name}
                </h3>
              </Link>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-organic-600">
                    ₹{variant.price.toLocaleString()}
                  </span>
                  {variant.compare_price && variant.compare_price > variant.price && (
                    <span className="text-xs text-earth-400 line-through ml-1">
                      ₹{variant.compare_price.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.preventDefault();
                    onAddToCart(variant.id, 1);
                  }}
                  aria-label={`Add ${product.name} to cart`}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "h-3 w-3",
                        i < Math.floor(product.average_rating || 0) 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-gray-300"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-xs text-earth-500 ml-1">
                  ({product.review_count || 0})
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Mobile-optimized cart drawer
export function MobileCartDrawer({ 
  isOpen, 
  onClose, 
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}) {
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.product_variants.price * item.quantity), 
    0
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="py-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-earth-300 mb-4" />
              <h3 className="text-lg font-medium text-earth-900 mb-2">Your cart is empty</h3>
              <p className="text-earth-600 mb-4">Looks like you haven't added any products yet.</p>
              <Button 
                onClick={() => {
                  onClose();
                  router.push('/shop');
                }}
                className="bg-organic-500 hover:bg-organic-600"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                  <img
                    src={item.product_variants.image_urls?.[0] || '/placeholder-product.jpg'}
                    alt={item.product_variants.products.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-earth-900 line-clamp-1">
                        {item.product_variants.products.name}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                        className="h-8 w-8 p-0 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-organic-600 font-medium">
                      ₹{(item.product_variants.price * item.quantity).toLocaleString()}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <span className="text-sm text-earth-600">
                        ₹{item.product_variants.price.toLocaleString()} × {item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-organic-600">₹{totalAmount.toLocaleString()}</span>
                </div>
                
                <Button 
                  onClick={onCheckout}
                  className="w-full bg-organic-500 hover:bg-organic-600 py-6 text-lg"
                >
                  Proceed to Checkout
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/shop')}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Mobile-optimized product detail page
export function MobileProductDetail({ 
  product, 
  variant,
  onAddToCart
}: {
  product: any;
  variant: any;
  onAddToCart: (variantId: string, quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div className="pb-20"> {/* Space for floating action button */}
      {/* Product Images Carousel */}
      <div className="relative aspect-square bg-earth-50">
        <Image
          src={variant.image_urls?.[selectedImageIndex] || '/placeholder-product.jpg'}
          alt={product.name}
          fill
          className="object-cover"
        />
        
        {variant.image_urls && variant.image_urls.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {variant.image_urls.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full",
                  index === selectedImageIndex ? "bg-white" : "bg-white/50"
                )}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-4">
        <div>
          <Badge variant="outline" className="text-xs">
            {product.segment.replace('_', ' ')}
          </Badge>
          <h1 className="text-2xl font-bold text-earth-900 mt-2">{product.name}</h1>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(product.average_rating || 0) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-gray-300"
                  )} 
                />
              ))}
            </div>
            <span className="text-sm text-earth-600">
              {product.average_rating?.toFixed(1)} ({product.review_count || 0} reviews)
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-organic-600">
            ₹{variant.price.toLocaleString()}
          </span>
          {variant.compare_price && variant.compare_price > variant.price && (
            <>
              <span className="text-lg text-earth-400 line-through">
                ₹{variant.compare_price.toLocaleString()}
              </span>
              <Badge variant="destructive">
                {Math.round(((variant.compare_price - variant.price) / variant.compare_price) * 100)}% OFF
              </Badge>
            </>
          )}
        </div>

        <p className="text-earth-700 leading-relaxed">
          {product.description}
        </p>

        {/* Variant Options */}
        {product.product_variants && product.product_variants.length > 1 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-earth-900">Select Variant</h3>
            <div className="flex flex-wrap gap-2">
              {product.product_variants.map((v: any) => (
                <Button
                  key={v.id}
                  variant={v.id === variant.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    // In a real implementation, this would update the selected variant
                  }}
                >
                  {v.weight} {v.weight_unit}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center border rounded-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="h-10 w-10 p-0 rounded-r-none"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(q => Math.min(99, q + 1))}
              className="h-10 w-10 p-0 rounded-l-none"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={() => onAddToCart(variant.id, quantity)}
            className="flex-1 ml-4 bg-organic-500 hover:bg-organic-600"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Truck className="h-4 w-4 text-organic-500" />
            <span>Free delivery over ₹10,000</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-organic-500" />
            <span>Certified Product</span>
          </div>
        </div>
      </div>

      {/* Floating Action Button for mobile */}
      <div className="fixed bottom-4 left-4 right-4">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="lg" 
            className="flex-1 flex items-center gap-2"
            onClick={() => router.push('/shop')}
          >
            <Home className="h-4 w-4" />
            Shop
          </Button>
          <Button 
            size="lg" 
            className="flex-1 bg-organic-500 hover:bg-organic-600 flex items-center gap-2"
            onClick={() => onAddToCart(variant.id, quantity)}
          >
            <ShoppingCart className="h-4 w-4" />
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}

// Mobile-optimized checkout flow
export function MobileCheckoutFlow({ 
  step,
  onBack,
  onNext,
  formData,
  setFormData
}: {
  step: 'address' | 'payment' | 'review' | 'confirmation';
  onBack: () => void;
  onNext: () => void;
  formData: any;
  setFormData: (data: any) => void;
}) {
  switch (step) {
    case 'address':
      return (
        <div className="p-4 space-y-6">
          <h2 className="text-xl font-bold text-earth-900">Delivery Address</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">Full Name</label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">Phone Number</label>
              <Input
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter your phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">Address</label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Enter your address"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-organic-500"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">City</label>
                <Input
                  value={formData.city || ''}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="City"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">PIN Code</label>
                <Input
                  value={formData.pincode || ''}
                  onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                  placeholder="500001"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button onClick={onNext} className="flex-1 bg-organic-500 hover:bg-organic-600">
              Continue
            </Button>
          </div>
        </div>
      );
    
    case 'payment':
      return (
        <div className="p-4 space-y-6">
          <h2 className="text-xl font-bold text-earth-900">Payment Method</h2>
          
          <div className="space-y-3">
            {['razorpay', 'payu', 'easebuzz', 'cod'].map((method) => (
              <div 
                key={method}
                className={cn(
                  "flex items-center justify-between p-4 border rounded-lg",
                  formData.paymentMethod === method 
                    ? "border-organic-500 bg-organic-50" 
                    : "border-earth-200"
                )}
                onClick={() => setFormData({...formData, paymentMethod: method})}
              >
                <span className="capitalize font-medium">{method.replace('_', ' ')}</span>
                <input
                  type="radio"
                  checked={formData.paymentMethod === method}
                  onChange={() => setFormData({...formData, paymentMethod: method})}
                  className="h-4 w-4 text-organic-500"
                />
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button onClick={onNext} className="flex-1 bg-organic-500 hover:bg-organic-600">
              Continue
            </Button>
          </div>
        </div>
      );
    
    case 'review':
      return (
        <div className="p-4 space-y-6">
          <h2 className="text-xl font-bold text-earth-900">Review Order</h2>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-earth-900 mb-2">Delivery Address</h3>
            <p className="text-earth-700">{formData.name}</p>
            <p className="text-earth-700">{formData.address}</p>
            <p className="text-earth-700">{formData.city}, {formData.pincode}</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-earth-900 mb-2">Payment Method</h3>
            <p className="text-earth-700 capitalize">{formData.paymentMethod?.replace('_', ' ')}</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-earth-900 mb-2">Order Summary</h3>
            {/* Order items would be listed here */}
            <div className="flex justify-between mt-2 pt-2 border-t">
              <span>Total</span>
              <span className="font-bold">₹{formData.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button onClick={onNext} className="flex-1 bg-organic-500 hover:bg-organic-600">
              Place Order
            </Button>
          </div>
        </div>
      );
    
    default:
      return null;
  }
}

export default MobileOptimizedHeader;