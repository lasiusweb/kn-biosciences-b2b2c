'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Home, ShoppingBag } from 'lucide-react';
import gsap from 'gsap';

export default function NotFound() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
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

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5DC] text-[#795548] p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
         <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
           <path d="M0 100 C 20 0 50 0 100 100" stroke="currentColor" fill="none" strokeWidth="0.5"/>
         </svg>
      </div>

      <div className="z-10 text-center max-w-2xl">
        <h1 ref={titleRef} className="text-9xl font-bold mb-2 text-[#8BC34A]">404</h1>
        <h2 className="anim-item text-3xl font-semibold mb-6">Page Not Found</h2>
        <p className="anim-item text-lg mb-8 max-w-md mx-auto">
          Oops! The page you are looking for seems to have withered away or been moved to a new field.
        </p>

        <div className="anim-item flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
           <div className="relative w-full max-w-xs">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
             <Input 
               placeholder="Search products..." 
               className="pl-10 bg-white border-[#795548]/20"
               data-testid="search-input"
             />
           </div>
        </div>

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
