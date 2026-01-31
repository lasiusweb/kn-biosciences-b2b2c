'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { Suspense } from 'react';

function CategoryNotFoundContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="mb-6 rounded-full bg-red-100 p-6">
        <span className="text-4xl">🌱</span>
      </div>
      
      <h1 className="text-4xl font-bold mb-4 text-primary">Category Not Found</h1>
      
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        We couldn't find the category <span className="font-semibold text-foreground">"{slug || 'unknown'}"</span>. 
        It may have been moved, renamed, or currently out of season.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <Link href="/shop">
          <Button variant="default" className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Shop
          </Button>
        </Link>
        <Link href="/">
           <Button variant="outline" className="w-full sm:w-auto">
             <Home className="mr-2 h-4 w-4" />
             Return Home
           </Button>
        </Link>
      </div>

      <div className="w-full max-w-4xl text-left">
        <h2 className="text-2xl font-semibold mb-6">You might be interested in...</h2>
        {/* Placeholder for Recommendations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
             {/* We will populate this later with real data */}
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="h-64 bg-muted rounded-lg animate-pulse flex items-center justify-center">
                 <span className="text-muted-foreground">Product Suggestion {i}</span>
               </div>
             ))}
        </div>
      </div>
    </div>
  );
}

export default function CategoryNotFound() {
  return (
    <Suspense fallback={<div className="container mx-auto p-16 text-center">Loading...</div>}>
      <CategoryNotFoundContent />
    </Suspense>
  );
}
