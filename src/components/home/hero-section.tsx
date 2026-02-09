'use client'

import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, CheckCircle, Leaf, Sprout, Users, TrendingUp, User, Building2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

interface SegmentHighlight {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  stats: {
    products: number
    solutions: number
    popularity: string
  }
  featured: boolean
  ctaText: string
  ctaLink: string
  gradient: string
}

interface HeroSectionProps {
  className?: string
}

export function HeroSection({ className }: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const [activeSegment, setActiveSegment] = useState<string>('cereals')
  const [activeUserType, setActiveUserType] = useState<'b2c' | 'b2b'>('b2c')

  const segments: SegmentHighlight[] = [
    {
      id: 'cereals',
      name: 'Cereal Crops',
      description: 'Complete solutions for wheat, rice, maize, and other cereal crops with advanced protection and nutrition',
      icon: <Leaf className="w-8 h-8" />,
      stats: {
        products: 156,
        solutions: 45,
        popularity: 'Most Popular'
      },
      featured: true,
      ctaText: 'Explore Cereal Solutions',
      ctaLink: '/segments/cereals',
      gradient: 'from-amber-400 to-orange-500'
    },
    {
      id: 'fruits',
      name: 'Fruit Crops',
      description: 'Specialized treatments for mango, citrus, banana and other fruit varieties for enhanced quality and yield',
      icon: <Sprout className="w-8 h-8" />,
      stats: {
        products: 203,
        solutions: 62,
        popularity: 'High Demand'
      },
      featured: true,
      ctaText: 'Discover Fruit Solutions',
      ctaLink: '/segments/fruits',
      gradient: 'from-pink-400 to-red-500'
    },
    {
      id: 'vegetables',
      name: 'Vegetable Crops',
      description: 'Premium solutions for vegetable farming with organic and conventional options for maximum yield',
      icon: <TrendingUp className="w-8 h-8" />,
      stats: {
        products: 187,
        solutions: 54,
        popularity: 'Growing Fast'
      },
      featured: false,
      ctaText: 'Browse Vegetable Products',
      ctaLink: '/segments/vegetables',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      id: 'pulses',
      name: 'Pulses & Legumes',
      description: 'Nutrition-focused solutions for pulses, legumes, and oilseeds with enhanced protein content',
      icon: <CheckCircle className="w-8 h-8" />,
      stats: {
        products: 98,
        solutions: 32,
        popularity: 'Sustainable Choice'
      },
      featured: false,
      ctaText: 'View Pulse Solutions',
      ctaLink: '/segments/pulses',
      gradient: 'from-yellow-400 to-amber-500'
    },
    {
      id: 'spices',
      name: 'Spice Crops',
      description: 'Premium treatments for spice cultivation and post-harvest processing to enhance flavor and shelf life',
      icon: <Users className="w-8 h-8" />,
      stats: {
        products: 76,
        solutions: 28,
        popularity: 'Premium Market'
      },
      featured: false,
      ctaText: 'Explore Spice Products',
      ctaLink: '/segments/spices',
      gradient: 'from-purple-400 to-indigo-500'
    },
    {
      id: 'plantation',
      name: 'Plantation Crops',
      description: 'Long-term crop management solutions for tea, coffee, coconut, and other plantation crops',
      icon: <Leaf className="w-8 h-8" />,
      stats: {
        products: 89,
        solutions: 41,
        popularity: 'Commercial Grade'
      },
      featured: false,
      ctaText: 'View Plantation Products',
      ctaLink: '/segments/plantation',
      gradient: 'from-blue-400 to-cyan-500'
    }
  ]

  useEffect(() => {
    if (!heroRef.current) return

    // Hero content animations
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out'
      })

      gsap.from('.hero-subtitle', {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.2,
        ease: 'power3.out'
      })

      gsap.from('.hero-user-type-selector', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.3,
        ease: 'power3.out'
      })

      gsap.from('.hero-segments', {
        opacity: 0,
        y: 40,
        duration: 1,
        delay: 0.4,
        ease: 'power3.out'
      })

      gsap.from('.hero-cta', {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 0.6,
        ease: 'power3.out'
      })

      gsap.from('.hero-stats', {
        opacity: 0,
        scale: 0.9,
        duration: 1,
        delay: 0.8,
        ease: 'back.out(1.7)'
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const handleSegmentHover = (segmentId: string) => {
    setActiveSegment(segmentId)

    // Update active segment preview
    gsap.to('.segment-preview', {
      opacity: 0.7,
      duration: 0.3,
      ease: 'power2.out'
    })

    setTimeout(() => {
      gsap.to('.segment-preview', {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
    }, 300)
  }

  const handleSegmentLeave = () => {
    gsap.to('.segment-preview', {
      opacity: 1,
      duration: 0.2,
      ease: 'power2.out'
    })
  }

  const featuredSegment = segments.find(s => s.featured)

  return (
    <section ref={heroRef} className={cn('hero-gradient relative overflow-hidden min-h-screen', className)}>
      {/* Background with animated gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-organic-600 via-green-700 to-emerald-800 opacity-90"></div>

        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-organic-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-green-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 left-30 w-40 h-40 bg-emerald-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-yellow-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-full bg-white/90 backdrop-blur-sm p-1">
              {segments.map((segment, index) => (
                <button
                  key={segment.id}
                  onMouseEnter={() => handleSegmentHover(segment.id)}
                  onMouseLeave={handleSegmentLeave}
                  className={cn(
                    'px-6 py-3 text-sm font-medium rounded-full transition-all duration-300',
                    {
                      'bg-organic-500 text-white': activeSegment === segment.id || segment.featured,
                      'bg-transparent text-gray-700 hover:text-organic-600': activeSegment !== segment.id && !segment.featured,
                      'bg-gradient-to-r from-organic-500 to-organic-600 text-white shadow-lg': segment.featured
                    }
                  )}
                >
                  {segment.icon}
                  <span className="ml-2">{segment.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Type Selector */}
          <div className="hero-user-type-selector flex justify-center mb-8">
            <div className="inline-flex rounded-full bg-white/90 backdrop-blur-sm p-1">
              <button
                onClick={() => setActiveUserType('b2c')}
                className={cn(
                  'px-6 py-3 text-sm font-medium rounded-full transition-all duration-300 flex items-center',
                  {
                    'bg-organic-500 text-white': activeUserType === 'b2c',
                    'bg-transparent text-gray-700 hover:text-organic-600': activeUserType !== 'b2c',
                  }
                )}
              >
                <User className="w-4 h-4 mr-2" />
                Individual Farmer
              </button>
              <button
                onClick={() => setActiveUserType('b2b')}
                className={cn(
                  'px-6 py-3 text-sm font-medium rounded-full transition-all duration-300 flex items-center',
                  {
                    'bg-organic-500 text-white': activeUserType === 'b2b',
                    'bg-transparent text-gray-700 hover:text-organic-600': activeUserType !== 'b2b',
                  }
                )}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Business Distributor
              </button>
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center space-y-8">
            <div className="hero-title text-5xl md:text-7xl font-bold text-white mb-4">
              {activeUserType === 'b2c' ? (
                <>
                  <span className="block mb-2">Premium Agricultural Solutions</span>
                  <span className="text-3xl md:text-4xl text-organic-200">For Individual Farmers</span>
                </>
              ) : (
                <>
                  <span className="block mb-2">Wholesale Agricultural Solutions</span>
                  <span className="text-3xl md:text-4xl text-organic-200">For Business Distributors</span>
                </>
              )}
            </div>

            <p className="hero-subtitle text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
              {activeUserType === 'b2c'
                ? 'Access premium bio-fertilizers, pre-probiotics, and sustainable farming solutions tailored for individual farmers.'
                : 'Access wholesale pricing, bulk ordering, and business-grade agricultural solutions for your distribution network.'}
            </p>

            {/* Featured Segment CTA */}
            <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-organic-600 hover:bg-gray-50 font-semibold"
              >
                <Link href={featuredSegment?.ctaLink || '#'} className="flex items-center">
                  {activeUserType === 'b2c'
                    ? 'Shop Individual Products'
                    : 'Explore Wholesale Options'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                className="border-2 border-white/30 text-white hover:bg-white hover:bg-organic-600 font-semibold"
              >
                <Link href={activeUserType === 'b2c' ? '/discover' : '/b2b'} className="flex items-center">
                  <Play className="mr-2 h-5 w-5" />
                  {activeUserType === 'b2c' ? 'Get Personalized Advice' : 'Request Business Quote'}
                </Link>
              </Button>
            </div>
          </div>

          {/* Segments Grid */}
          <div className="hero-segments grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
            {segments.map((segment) => (
              <div
                key={segment.id}
                onMouseEnter={() => handleSegmentHover(segment.id)}
                onMouseLeave={handleSegmentLeave}
                className={cn(
                  'segment-preview bg-white/95 backdrop-blur-sm rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2',
                  {
                    'border-organic-500 shadow-2xl': segment.featured,
                    'border-white/30 hover:border-organic-300': !segment.featured
                  }
                )}
              >
                <div className="flex items-center mb-6">
                  <div className={cn(
                    'p-4 rounded-2xl',
                    {
                      'bg-organic-500 text-white': segment.id === activeSegment,
                      'bg-gray-100 text-gray-700': segment.id !== activeSegment
                    }
                  )}>
                    {segment.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-earth-900 mb-2">
                      {segment.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {segment.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-organic-600">
                            {segment.stats.products}
                          </span>
                          <span className="ml-2 text-gray-600">Products</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-green-600">
                            {segment.stats.solutions}
                          </span>
                          <span className="ml-2 text-gray-600">Solutions</span>
                        </div>
                      </div>
                      <div className="text-xs bg-organic-100 text-organic-800 px-2 py-1 rounded-full">
                        {segment.stats.popularity}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Stats */}
          <div className="hero-stats grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="text-white">
              <div className="text-5xl font-bold text-white mb-2">50K+</div>
              <div className="text-white/90">Happy Farmers</div>
            </div>
            <div className="text-white">
              <div className="text-5xl font-bold text-white mb-2">500+</div>
              <div className="text-white/90">Premium Products</div>
            </div>
            <div className="text-white">
              <div className="text-5xl font-bold text-white mb-2">100%</div>
              <div className="text-white/90">Organic Certified</div>
            </div>
            <div className="text-white lg:col-span-2">
              <div className="text-5xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/90">Expert Support</div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex justify-center space-x-6">
            <Link
              href="/knowledge"
              className="text-white/90 hover:text-white transition-colors"
            >
              <span className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Knowledge Center
              </span>
            </Link>
            <Link
              href="/segments"
              className="text-white/90 hover:text-white transition-colors"
            >
              <span className="flex items-center">
                <Leaf className="w-5 h-5 mr-2" />
                All Segments
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection