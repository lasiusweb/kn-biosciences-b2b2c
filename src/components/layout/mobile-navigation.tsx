// components/layout/mobile-navigation.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  Search, 
  Home, 
  Info, 
  Phone, 
  ShoppingBag,
  ChevronRight,
  ChevronDown,
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
  Gift,
  MapPin,
  Phone as PhoneIcon,
  Mail
} from 'lucide-react';
import { useEnterpriseCart } from '@/hooks/use-enterprise-cart';

interface MobileNavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  subItems?: MobileNavItem[];
}

export function MobileNavigation() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [expandedSegments, setExpandedSegments] = useState<Record<string, boolean>>({});
  const { cart, toggleMiniCart } = useEnterpriseCart();

  const mainNavItems: MobileNavItem[] = [
    { name: 'Home', href: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'About Us', href: '/about', icon: <Info className="h-5 w-5" /> },
    { name: 'Knowledge Center', href: '/knowledge', icon: <BookOpen className="h-5 w-5" /> },
    { name: 'Contact', href: '/contact', icon: <PhoneIcon className="h-5 w-5" /> },
    { name: 'Shop', href: '/shop', icon: <ShoppingBag className="h-5 w-5" /> },
  ];

  const segmentItems: MobileNavItem[] = [
    { 
      name: 'Agriculture', 
      href: '/shop/agriculture', 
      icon: <Leaf className="h-5 w-5" />,
      subItems: [
        { name: 'Bio-fertilizers', href: '/shop/agriculture/bio-fertilizers' },
        { name: 'Bio-pesticides', href: '/shop/agriculture/bio-pesticides' },
        { name: 'Growth Promoters', href: '/shop/agriculture/growth-promoters' },
        { name: 'Soil Amendments', href: '/shop/agriculture/soil-amendments' },
      ]
    },
    { 
      name: 'Aquaculture', 
      href: '/shop/aquaculture', 
      icon: <Fish className="h-5 w-5" />,
      subItems: [
        { name: 'Pre-probiotics', href: '/shop/aquaculture/pre-probiotics' },
        { name: 'Water Treatment', href: '/shop/aquaculture/water-treatment' },
        { name: 'Growth Enhancers', href: '/shop/aquaculture/growth-enhancers' },
        { name: 'Disease Management', href: '/shop/aquaculture/disease-management' },
      ]
    },
    { 
      name: 'Poultry Healthcare', 
      href: '/shop/poultry-healthcare', 
      icon: <Egg className="h-5 w-5" />,
      subItems: [
        { name: 'Feed Supplements', href: '/shop/poultry-healthcare/feed-supplements' },
        { name: 'Immunity Boosters', href: '/shop/poultry-healthcare/immunity-boosters' },
        { name: 'Digestive Health', href: '/shop/poultry-healthcare/digestive-health' },
      ]
    },
    { 
      name: 'Animal Healthcare', 
      href: '/shop/animal-healthcare', 
      icon: <Cow className="h-5 w-5" />,
      subItems: [
        { name: 'Livestock Supplements', href: '/shop/animal-healthcare/livestock-supplements' },
        { name: 'Veterinary Products', href: '/shop/animal-healthcare/veterinary-products' },
        { name: 'Dairy Enhancers', href: '/shop/animal-healthcare/dairy-enhancers' },
      ]
    },
    { 
      name: 'Bioremediation', 
      href: '/shop/bioremediation', 
      icon: <Recycle className="h-5 w-5" />,
      subItems: [
        { name: 'Waste Treatment', href: '/shop/bioremediation/waste-treatment' },
        { name: 'Water Treatment', href: '/shop/bioremediation/water-treatment' },
        { name: 'Soil Remediation', href: '/shop/bioremediation/soil-remediation' },
      ]
    },
    { 
      name: 'Seeds', 
      href: '/shop/seeds', 
      icon: <Seed className="h-5 w-5" />,
      subItems: [
        { name: 'Vegetable Seeds', href: '/shop/seeds/vegetable' },
        { name: 'Grain Seeds', href: '/shop/seeds/grain' },
        { name: 'Flower Seeds', href: '/shop/seeds/flower' },
      ]
    },
    { 
      name: 'Organic Farming', 
      href: '/shop/organic-farming', 
      icon: <TreePine className="h-5 w-5" />,
      subItems: [
        { name: 'Organic Fertilizers', href: '/shop/organic-farming/fertilizers' },
        { name: 'Organic Pesticides', href: '/shop/organic-farming/pesticides' },
        { name: 'Certification Support', href: '/shop/organic-farming/certification' },
      ]
    },
    { 
      name: 'Farm Equipment', 
      href: '/shop/farm-equipment', 
      icon: <Tractor className="h-5 w-5" />,
      subItems: [
        { name: 'Irrigation', href: '/shop/farm-equipment/irrigation' },
        { name: 'Harvesting', href: '/shop/farm-equipment/harvesting' },
        { name: 'Processing', href: '/shop/farm-equipment/processing' },
      ]
    },
    { 
      name: 'Testing Lab', 
      href: '/shop/testing-lab', 
      icon: <Ruler className="h-5 w-5" />,
      subItems: [
        { name: 'Soil Testing', href: '/shop/testing-lab/soil' },
        { name: 'Water Testing', href: '/shop/testing-lab/water' },
        { name: 'Product Testing', href: '/shop/testing-lab/product' },
      ]
    },
    { 
      name: 'Oilpalm', 
      href: '/shop/oilpalm', 
      icon: <PalmTree className="h-5 w-5" />,
      subItems: [
        { name: 'Oilpalm Fertilizers', href: '/shop/oilpalm/fertilizers' },
        { name: 'Oilpalm Pesticides', href: '/shop/oilpalm/pesticides' },
        { name: 'Oilpalm Growth Regulators', href: '/shop/oilpalm/growth-regulators' },
      ]
    },
  ];

  const toggleSegment = (segmentName: string) => {
    setExpandedSegments(prev => ({
      ...prev,
      [segmentName]: !prev[segmentName]
    }));
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-sm p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSheetOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-4 space-y-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-organic-50 transition-colors"
                  onClick={closeSheet}
                >
                  <span className="text-organic-600">{item.icon}</span>
                  <span className="font-medium text-earth-900">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Shop by Segment */}
            <div className="mt-6 px-4">
              <h3 className="text-sm font-medium text-earth-500 uppercase tracking-wider px-3 mb-2">
                Shop by Segment
              </h3>
              <div className="space-y-1">
                {segmentItems.map((segment) => (
                  <div key={segment.name}>
                    <button
                      onClick={() => toggleSegment(segment.name)}
                      className="flex items-center justify-between w-full px-3 py-3 rounded-lg hover:bg-organic-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-organic-600">{segment.icon}</span>
                        <span className="font-medium text-earth-900">{segment.name}</span>
                      </div>
                      {expandedSegments[segment.name] ? 
                        <ChevronDown className="h-4 w-4 text-earth-500" /> : 
                        <ChevronRight className="h-4 w-4 text-earth-500" />
                      }
                    </button>
                    
                    <AnimatePresence>
                      {expandedSegments[segment.name] && segment.subItems && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-12 pr-4 space-y-1">
                            {segment.subItems.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className="block px-3 py-2 rounded-lg hover:bg-organic-50 text-sm text-earth-700 transition-colors"
                                onClick={closeSheet}
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Link href="/auth" className="flex items-center gap-2 text-earth-700 hover:text-organic-600">
                <User className="h-5 w-5" />
                <span>Account</span>
              </Link>
              <Link href="/search" className="flex items-center gap-2 text-earth-700 hover:text-organic-600">
                <Search className="h-5 w-5" />
                <span>Search</span>
              </Link>
            </div>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={toggleMiniCart}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart 
              {!cart.loading && cart.totalItems > 0 && (
                <span className="ml-2 bg-organic-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.totalItems}
                </span>
              )}
            </Button>
            
            <div className="pt-2">
              <Link href="/b2b" className="flex items-center gap-2 text-sm text-organic-600 hover:text-organic-700">
                <Building className="h-4 w-4" />
                <span>B2B Portal</span>
              </Link>
              <Link href="/track-order" className="flex items-center gap-2 text-sm text-organic-600 hover:text-organic-700 mt-2">
                <Truck className="h-4 w-4" />
                <span>Track Order</span>
              </Link>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}