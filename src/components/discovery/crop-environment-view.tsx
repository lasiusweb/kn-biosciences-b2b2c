'use client'

import React, { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  ShoppingCart, 
  BookOpen, 
  Calendar, 
  Star,
  TrendingUp,
  Filter,
  ChevronRight,
  Info,
  Droplet,
  Sun,
  Wind,
  Thermometer,
  Clock
} from 'lucide-react'
import { getProducts, getKnowledgeCenterArticles } from '@/lib/enhanced-product-service'

gsap.registerPlugin(ScrollTrigger)

interface CropCondition {
  id: string
  name: string
  icon: React.ReactNode
  value: string
  description: string
}

interface WeatherData {
  temperature: number
  humidity: number
  rainfall: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'hot'
  recommendation: string
}

interface CropEnvironmentProps {
  crop: string
  region?: string
  season?: string
  className?: string
}

export function CropEnvironmentView({ 
  crop, 
  region = 'north-india', 
  season = 'current',
  className 
}: CropEnvironmentProps) {
  const params = useParams()
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [solutions, setSolutions] = useState<any[]>([])
  const [articles, setArticles] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'popularity'>('popularity')
  const [loading, setLoading] = useState(true)
  const [weather, setWeather] = useState<WeatherData | null>(null)

  const categories = [
    { id: 'all', name: 'All Solutions', icon: <Filter className="w-4 h-4" /> },
    { id: 'protection', name: 'Crop Protection', icon: <Info className="w-4 h-4" /> },
    { id: 'nutrition', name: 'Plant Nutrition', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'growth', name: 'Growth Enhancement', icon: <Sun className="w-4 h-4" /> },
    { id: 'harvest', name: 'Harvest Solutions', icon: <Calendar className="w-4 h-4" /> }
  ]

  const conditions: CropCondition[] = [
    {
      id: 'weather',
      name: 'Current Weather',
      icon: <Sun className="w-5 h-5" />,
      value: 'Sunny, 28°C',
      description: 'Optimal conditions for fertilizer application'
    },
    {
      id: 'soil',
      name: 'Soil Moisture',
      icon: <Droplet className="w-5 h-5" />,
      value: '65%',
      description: 'Good moisture levels for root development'
    },
    {
      id: 'wind',
      name: 'Wind Conditions',
      icon: <Wind className="w-5 h-5" />,
      value: 'Light breeze',
      description: 'Suitable for spraying operations'
    },
    {
      id: 'temperature',
      name: 'Temperature',
      icon: <Thermometer className="w-5 h-5" />,
      value: '28°C',
      description: 'Ideal for nutrient uptake'
    }
  ]

  useEffect(() => {
    const loadCropData = async () => {
      try {
        setLoading(true)
        
        // Fetch real products for this crop
        const segment = params.segment as string;
        const result = await getProducts({ cropId: crop, segment });
        
        // Fetch real knowledge center articles for context
        const knowledgeArticles = await getKnowledgeCenterArticles(segment, 5);

        setSolutions(result.products || [])
        setArticles(knowledgeArticles || [])
        
        // Mock weather data
        setWeather({
          temperature: 28,
          humidity: 65,
          rainfall: 2,
          condition: 'sunny',
          recommendation: 'Excellent conditions for crop protection application'
        })
      } catch (error) {
        console.error('Error loading crop data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (crop) {
      loadCropData()
    }
  }, [crop, params.segment])

  useEffect(() => {
    if (!containerRef.current || loading) return

    // Environmental conditions animations
    gsap.fromTo('.condition-card',
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.condition-card',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    )

    // Solutions grid animations
    gsap.fromTo('.solution-card, .educational-card',
      { opacity: 0, scale: 0.9 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.5,
        stagger: 0.08,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.solution-card',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    )

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [loading, solutions, articles])

  // Interleave solutions and articles for the grid
  const mixedGridItems = React.useMemo(() => {
    const items = [...solutions].filter(s => 
      selectedCategory === 'all' ? true : s.category === selectedCategory
    ).sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.product_variants?.[0]?.price || 0) - (b.product_variants?.[0]?.price || 0)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        default:
          return 0
      }
    });

    if (articles.length === 0) return items.map(item => ({ ...item, gridType: 'product' }));

    // Insert an article every 3 products
    const result: any[] = [];
    items.forEach((item, index) => {
      result.push({ ...item, gridType: 'product' });
      if ((index + 1) % 3 === 0 && articles[Math.floor(index / 3)]) {
        result.push({ ...articles[Math.floor(index / 3)], gridType: 'article' });
      }
    });
    return result;
  }, [solutions, articles, selectedCategory, sortBy]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'protection': return 'bg-red-100 text-red-800'
      case 'nutrition': return 'bg-green-100 text-green-800'
      case 'growth': return 'bg-blue-100 text-blue-800'
      case 'harvest': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const cropDisplayName = crop.charAt(0).toUpperCase() + crop.slice(1)

  return (
    <div ref={containerRef} className={cn('min-h-screen bg-gradient-to-b from-green-50 to-white', className)}>
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-6 text-sm">
                <Link href="/segments" className="text-gray-500 hover:text-earth-900 transition-colors">
                  ← Back to Segments
                </Link>
                <span className="text-gray-300">/</span>
                <Link href={`/segments/${params.segment}`} className="text-gray-500 hover:text-earth-900 transition-colors">
                  {params.segment}
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-organic-600 font-medium">
                  {cropDisplayName}
                </span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {solutions.length} solutions found
              </div>
              <Button 
                onClick={() => router.push('/knowledge')}
                variant="outline" 
                size="sm"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Growing Guide
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Current Conditions */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              {conditions.map((condition) => (
                <div
                  key={condition.id}
                  className="condition-card bg-white rounded-xl shadow-md p-6 border border-gray-100"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-organic-100 text-organic-600 p-2 rounded-lg mr-3">
                      {condition.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-earth-900">{condition.name}</h4>
                      <p className="text-lg font-bold text-organic-600">{condition.value}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{condition.description}</p>
                </div>
              ))}
            </div>

            {/* Weather Alert */}
            {weather && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">Current Conditions</h4>
                    <p className="text-blue-800">{weather.recommendation}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-blue-700">
                    <div className="flex items-center">
                      <Thermometer className="w-4 h-4 mr-1" />
                      {weather.temperature}°C
                    </div>
                    <div className="flex items-center">
                      <Droplet className="w-4 h-4 mr-1" />
                      {weather.humidity}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 mb-8 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'flex items-center px-4 py-2 rounded-full border-2 transition-colors',
                    {
                      'bg-organic-500 text-white border-organic-500': selectedCategory === category.id,
                      'bg-white text-gray-700 border-gray-200 hover:border-organic-300': selectedCategory !== category.id
                    }
                  )}
                >
                  {category.icon}
                  <span className="ml-2">{category.name}</span>
                </button>
              ))}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                {['popularity', 'rating', 'price'].map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort as any)}
                    className={cn(
                      'px-3 py-1 text-sm rounded-md transition-colors',
                      {
                        'bg-organic-500 text-white': sortBy === sort,
                        'bg-gray-100 text-gray-700 hover:bg-gray-200': sortBy !== sort
                      }
                    )}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-xl h-80"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mixedGridItems.map((item, idx) => (
                  item.gridType === 'product' ? (
                    <div
                      key={`product-${item.id}-${idx}`}
                      className="solution-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                    >
                      {/* Product Image */}
                      <div className="aspect-video relative overflow-hidden">
                        <Image
                          src={item.image_urls?.[0] || '/images/products/placeholder.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            'text-xs px-2 py-1 rounded-full font-medium',
                            getCategoryColor(item.category || 'nutrition')
                          )}>
                            {item.category || 'Nutrition'}
                          </span>
                          <div className="flex items-center text-sm text-gray-500">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            {item.rating || 4.5}
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-earth-900 mb-2 group-hover:text-organic-600 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {item.short_description || item.description}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="text-2xl font-bold text-organic-600">
                            ₹{item.product_variants?.[0]?.price || 0}
                          </div>
                          <Link href={`/product/${item.slug}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Educational Card */
                    <div
                      key={`article-${item.id}-${idx}`}
                      className="educational-card bg-organic-500 rounded-xl shadow-lg overflow-hidden p-8 flex flex-col text-white group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-4 text-organic-100">
                        <BookOpen className="w-5 h-5" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Expert Guide</span>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-organic-50 transition-colors">
                        {item.title}
                      </h3>
                      
                      <p className="text-organic-100 text-sm mb-6 line-clamp-4 leading-relaxed">
                        {item.excerpt}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-organic-400">
                        <div className="flex items-center text-xs text-organic-100">
                          <Clock className="w-4 h-4 mr-1" />
                          {item.read_time} read
                        </div>
                        <Link href={`/knowledge/${item.slug}`} className="flex items-center text-sm font-bold group-hover:translate-x-1 transition-transform">
                          Read Guide
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Expert CTA */}
      <section className="py-16 bg-earth-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">
              Need Expert Advice for {cropDisplayName}?
            </h3>
            <p className="text-xl text-gray-300 mb-8">
              Connect with our agricultural specialists for personalized guidance on crop management, 
              pest control, and yield optimization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Schedule Consultation
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-earth-900">
                View Growing Guide
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CropEnvironmentView
