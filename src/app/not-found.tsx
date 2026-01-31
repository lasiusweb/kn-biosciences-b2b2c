'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Home, ShoppingBag, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { searchProducts } from '@/lib/search-service';
import { Product } from '@/types';

export default function NotFound() {
  const pathname = usePathname();
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // GSAP Animation
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "bounce.out"
      });
      
      gsap.from(".anim-item", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        delay: 0.5,
        clearProps: "all"
      });
    }, containerRef);

    // Fuzzy Search Logic
    const performFuzzySearch = async () => {
      // Extract potential keyword from path
      // e.g. /shop/organic-fertilizer -> organic fertilizer
      const segments = pathname?.split('/').filter(Boolean) || [];
      const lastSegment = segments[segments.length - 1];
      
      if (lastSegment) {
        const query = lastSegment.replace(/-/g, ' ');
        setIsLoading(true);
        try {
          const results = await searchProducts(query);
          setSearchResults(results);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    performFuzzySearch();

    return () => ctx.revert();
  }, [pathname]);

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5DC] text-[#795548] p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
         <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
           <path d="M0 100 C 20 0 50 0 100 100" stroke="currentColor" fill="none" strokeWidth="0.5"/>
         </svg>
      </div>

      <div className="z-10 text-center max-w-4xl w-full">
        <h1 ref={titleRef} className="text-9xl font-bold mb-2 text-[#8BC34A]">404</h1>
        <h2 className="anim-item text-3xl font-semibold mb-6">Page Not Found</h2>
        <p className="anim-item text-lg mb-8 max-w-md mx-auto">
          Oops! The page you are looking for seems to have withered away or been moved to a new field.
        </p>

        <div className="anim-item flex flex-col items-center justify-center gap-4 mb-12">
           <div className="relative w-full max-w-xs">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
             <Input 
               placeholder="Search products..." 
               className="pl-10 bg-white border-[#795548]/20"
               data-testid="search-input"
             />
           </div>
        </div>

        {/* Search Results / Suggestions */}
        {(isLoading || searchResults.length > 0) && (
            <div className="anim-item mb-12">
                <h3 className="text-xl font-semibold mb-4">
                    {isLoading ? 'Searching fields...' : 'Did you mean...?'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {isLoading ? (
                        <div className="col-span-full flex justify-center">
                            <Loader2 className="animate-spin h-8 w-8 text-[#8BC34A]" />
                        </div>
                    ) : (
                        searchResults.map(product => (
                            <Link key={product.id} href={`/product/${product.slug}`} className="block p-4 bg-white rounded shadow hover:shadow-md transition-shadow">
                                <div className="font-medium truncate">{product.name}</div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        )}

        <div className="anim-item flex flex-wrap justify-center gap-4">
          <Link href="/">
            <Button size="lg" className="bg-[#8BC34A] hover:bg-[#7CB342] text-white">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" size="lg" className="border-[#795548] text-[#795548] hover:bg-[#795548] hover:text-white">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}