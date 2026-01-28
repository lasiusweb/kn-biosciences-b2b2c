import { HeroSection } from '@/components/home/hero-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { CategoryShowcase } from '@/components/home/category-showcase'
import { FarmingSolutions } from '@/components/home/farming-solutions'
import { Testimonials } from '@/components/home/testimonials'
import { NewsletterSection } from '@/components/home/newsletter-section'

export default function HomePage() {
  return (
    <div className="space-y-16">
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <FarmingSolutions />
      <Testimonials />
      <NewsletterSection />
    </div>
  )
}