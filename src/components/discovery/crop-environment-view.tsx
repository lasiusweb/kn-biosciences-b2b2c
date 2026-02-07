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
  MapPin, 
  Star,
  TrendingUp,
  Filter,
  ChevronRight,
  Info,
  Droplet,
  Sun,
  Wind,
  Thermometer
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface CropSolution {
  id: string
  name: string
  description: string
  category: 'protection' | 'nutrition' | 'growth' | 'harvest'
  price: number
  image_url: string
  rating: number
  reviews: number
  features: string[]
  application_method: string
  coverage: string
  organic: boolean
  in_stock: boolean
  best_selling: boolean
}

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
  const [solutions, setSolutions] = useState<CropSolution[]>([])
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
        
        // Mock data for crop solutions
        const mockSolutions: CropSolution[] = [
          {
            id: '1',
            name: `${crop.charAt(0).toUpperCase() + crop.slice(1)} Protection Pro`,
            description: `Advanced formulation for comprehensive ${crop} disease and pest management`,
            category: 'protection',
            price: 450,
            image_url: '/images/products/crop-protection.jpg',
            rating: 4.5,
            reviews: 234,
            features: [
              'Broad-spectrum protection',
              'Weather resistant',
              'Eco-friendly formulation',
              'Long-lasting effect'
            ],
            application_method: 'Foliar spray',
            coverage: '1 acre per litre',
            organic: true,
            in_stock: true,
            best_selling: true
          },
          {
            id: '2',
            name: `${crop.charAt(0).toUpperCase() + crop.slice(1)} Growth Enhancer`,
            description: `Bio-stimulant for improved ${crop} growth and yield`,
            category: 'growth',
            price: 320,
            image_url: '/images/products/growth-enhancer.jpg',
            rating: 4.2,
            reviews: 156,
            features: [
              'Natural growth hormones',
              'Improved root development',
              'Enhanced photosynthesis',
              'Stress resistance'
            ],
            application_method: 'Soil drench',
            coverage: '2 acres per litre',
            organic: true,
            in_stock: true,
            best_selling: false
          },
          {
            id: '3',
            name: 'Balanced NPK Fertilizer',
            description: `Optimized nutrient blend for ${crop} cultivation`,
            category: 'nutrition',
            price: 280,
            image_url: '/images/products/npk-fertilizer.jpg',
            rating: 4.7,
            reviews: 89,
            features: [
              'Balanced NPK ratio',
              'Slow-release formula',
              'Micronutrient enriched',
              'pH balanced'
            ],
            application_method: 'Broadcast',
            coverage: '1 acre per 50kg',
            organic: false,
            in_stock: true,
            best_selling: false
          },
          {
            id: '4',
            name: `${crop.charAt(0).toUpperCase() + crop.slice(1)} Harvest Aid`,
            description: `Pre-harvest treatment for improved ${crop} quality and shelf life`,
            category: 'harvest',
            price: 380,
            image_url: '/images/products/harvest-aid.jpg',
            rating: 4.3,
            reviews: 67,
            features: [
              'Improved fruit set',
              'Enhanced quality',
              'Extended shelf life',
              'Reduced post-harvest loss'
            ],
            application_method: 'Foliar spray',
            coverage: '1 acre per litre',
            organic: true,
            in_stock: false,
            best_selling: false
          },
          {
            id: '5',
            name: 'Soil Conditioner',
            description: `Organic soil conditioner for optimal ${crop} growth`,
            category: 'nutrition',
            price: 220,
            image_url: '/images/products/soil-conditioner.jpg',
            rating: 4.1,
            reviews: 45,
            features: [
              'Improves soil structure',
              'Enhances water retention',
              'Promotes beneficial microbes',
              'pH balancing'
            ],
            application_method: 'Soil application',
            coverage: '1 acre per 25kg',
            organic: true,
            in_stock: true,
            best_selling: false
          }
        ]

        setSolutions(mockSolutions)
        
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
  }, [crop])

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
    gsap.fromTo('.solution-card',
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
  }, [loading, solutions])

  const filteredSolutions = solutions.filter(solution => 
    selectedCategory === 'all' ? true : solution.category === selectedCategory
  ).sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price
      case 'rating':
        return b.rating - a.rating
      case 'popularity':
        return (b.reviews + (b.best_selling ? 1000 : 0)) - (a.reviews + (a.best_selling ? 1000 : 0))
      default:
        return 0
    }
  })

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
              {conditions.map((condition, index) => (
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

            {/* Solutions Grid */}
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
                {filteredSolutions.map((solution) => (
                  <div
                    key={solution.id}
                    className="solution-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  >
                    {/* Best Seller Badge */}
                    {solution.best_selling && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-organic-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          Best Seller
                        </div>
                      </div>
                    )}

                    {/* Stock Status */}
                    {!solution.in_stock && (
                      <div className="absolute top-4 left-4 z-10">
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Out of Stock
                        </div>
                      </div>
                    )}

                    {/* Product Image */}
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={solution.image_url}
                        alt={solution.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {solution.organic && (
                        <div className="absolute bottom-4 left-4">
                          <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                            Organic
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                          'text-xs px-2 py-1 rounded-full font-medium',
                          getCategoryColor(solution.category)
                        )}>
                          {solution.category}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          {solution.rating}
                          <span className="ml-2">({solution.reviews})</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-earth-900 mb-2 group-hover:text-organic-600 transition-colors">
                        {solution.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {solution.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-1 mb-4">
                        {solution.features.slice(0, 2).map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            {feature}
                          </div>
                        ))}
                      </div>

                      {/* Application Info */}
                      <div className="text-xs text-gray-500 space-y-1 mb-4">
                        <div>
                          <strong>Application:</strong> {solution.application_method}
                        </div>
                        <div>
                          <strong>Coverage:</strong> {solution.coverage}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-organic-600">
                          ₹{solution.price}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button 
                            size="sm"
                            disabled={!solution.in_stock}
                            className={cn(
                              'bg-organic-500 hover:bg-organic-600',
                              !solution.in_stock && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {solution.in_stock ? 'Add to Cart' : 'Notify Me'}
                          </Button>
                        </div>
                      </div>
                    </div>
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