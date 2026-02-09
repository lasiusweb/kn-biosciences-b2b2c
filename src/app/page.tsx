import { HeroSection } from '@/components/home/hero-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { CategoryShowcase } from '@/components/home/category-showcase'
import { FarmingSolutions } from '@/components/home/farming-solutions'
import { EnhancedTestimonials } from '@/components/home/enhanced-testimonials'
import { NewsletterSection } from '@/components/home/newsletter-section'
import { TrustIndicators } from '@/components/home/trust-indicators'
import { KnowledgeCenterPreview } from '@/components/home/knowledge-center-preview'
import { Button } from '@/components/ui/button'
import { ArrowRight, Leaf, Users, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function HomePage() {
  return (
    <div className="space-y-16">
      <HeroSection />

      {/* Trust Indicators Section */}
      <TrustIndicators />

      {/* Quick Access Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-earth-900 mb-4">
              Quick Access to Agricultural Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started with personalized recommendations or explore our comprehensive range of crop solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link href="/discover">
              <Button size="lg" className="bg-organic-500 hover:bg-organic-600 text-white h-24 flex flex-col items-center justify-center group">
                <Leaf className="w-12 h-12 mb-4 text-white" />
                <span className="text-xl font-semibold">Discovery Assistant</span>
                <span className="text-sm text-white/90 mt-2">Personalized crop & product recommendations</span>
                <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/segments">
              <Button size="lg" variant="outline" className="h-24 flex flex-col items-center justify-center group border-2 border-organic-500 hover:border-organic-600 text-organic-600 hover:bg-organic-50">
                <Users className="w-12 h-12 mb-4 text-organic-600" />
                <span className="text-xl font-semibold">Browse Segments</span>
                <span className="text-sm text-organic-600 mt-2">Explore by crop category</span>
                <ArrowRight className="w-6 h-6 text-organic-600 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/knowledge">
              <Button size="lg" variant="outline" className="h-24 flex flex-col items-center justify-center group border-2 border-green-600 hover:border-green-700 text-green-600 hover:bg-green-50">
                <CheckCircle className="w-12 h-12 mb-4 text-green-600" />
                <span className="text-xl font-semibold">Knowledge Center</span>
                <span className="text-sm text-green-600 mt-2">Expert guides & farming resources</span>
                <ArrowRight className="w-6 h-6 text-green-600 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <CategoryShowcase />
      <FeaturedProducts />
      <FarmingSolutions />
      <EnhancedTestimonials />
      <KnowledgeCenterPreview />
      <NewsletterSection />
    </div>
  )
}