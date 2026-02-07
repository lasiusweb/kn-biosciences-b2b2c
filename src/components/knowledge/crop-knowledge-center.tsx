'use client'

import React, { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, BookOpen, Video, ChevronRight, Play } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface KnowledgeArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image?: string
  published_at: string
  updated_at?: string
  category: string
  tags: string[]
  read_time: string
  video_url?: string
  author?: {
    name: string
    avatar?: string
  }
  related_products?: Array<{
    id: string
    name: string
    price: number
    image_url?: string
  }>
}

interface CropKnowledgeCenterProps {
  crop: string
  segment: string
  className?: string
}

export function CropKnowledgeCenter({ crop, segment, className }: CropKnowledgeCenterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [featuredArticle, setFeaturedArticle] = useState<KnowledgeArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  useEffect(() => {
    const loadKnowledgeContent = async () => {
      try {
        setLoading(true)
        
        // Mock data for development
        const mockArticles: KnowledgeArticle[] = [
          {
            id: '1',
            title: `Complete ${crop.charAt(0).toUpperCase() + crop.slice(1)} Cultivation Guide`,
            slug: `${crop}-cultivation-guide`,
            excerpt: `Comprehensive guide for ${crop} cultivation from seed selection to harvest. Learn best practices, timing, and techniques for maximum yield.`,
            content: `Detailed content about ${crop} cultivation...`,
            featured_image: '/images/knowledge/crop-guide.jpg',
            published_at: '2024-01-15',
            category: 'cultivation',
            tags: [crop, 'cultivation', 'best-practices'],
            read_time: '15 min',
            author: {
              name: 'Dr. Agricultural Expert',
              avatar: '/images/authors/ag-expert.jpg'
            },
            related_products: [
              { id: '1', name: 'Organic Fertilizer', price: 450, image_url: '/images/products/fertilizer.jpg' },
              { id: '2', name: 'Crop Protection Spray', price: 320, image_url: '/images/products/spray.jpg' }
            ]
          },
          {
            id: '2',
            title: `Pest Management for ${crop.charAt(0).toUpperCase() + crop.slice(1)}`,
            slug: `${crop}-pest-management`,
            excerpt: `Identify and manage common pests affecting ${crop} crops. Integrated pest management strategies for sustainable farming.`,
            content: `Pest management content...`,
            featured_image: '/images/knowledge/pest-management.jpg',
            published_at: '2024-01-10',
            category: 'pest-management',
            tags: [crop, 'pests', 'organic'],
            read_time: '12 min',
            video_url: 'https://example.com/pest-video'
          },
          {
            id: '3',
            title: `${crop.charAt(0).toUpperCase() + crop.slice(1)} Disease Prevention`,
            slug: `${crop}-disease-prevention`,
            excerpt: `Prevent and treat common diseases in ${crop} crops. Early detection methods and organic treatment options.`,
            content: `Disease prevention content...`,
            published_at: '2024-01-05',
            category: 'disease-control',
            tags: [crop, 'diseases', 'prevention'],
            read_time: '10 min'
          },
          {
            id: '4',
            title: 'Soil Preparation for Optimal Crop Growth',
            slug: 'soil-preparation',
            excerpt: 'Learn how to prepare soil for maximum crop yield. Soil testing, amendment recommendations, and preparation techniques.',
            content: 'Soil preparation content...',
            published_at: '2024-01-20',
            category: 'soil',
            tags: ['soil', 'preparation', 'fertilizer'],
            read_time: '8 min'
          },
          {
            id: '5',
            title: `Irrigation Best Practices for ${crop.charAt(0).toUpperCase() + crop.slice(1)}`,
            slug: `${crop}-irrigation`,
            excerpt: 'Optimal irrigation schedules and techniques for healthy crop growth. Water conservation and efficiency tips.',
            content: 'Irrigation content...',
            published_at: '2024-01-18',
            category: 'irrigation',
            tags: [crop, 'irrigation', 'water-management'],
            read_time: '6 min'
          }
        ]

        setArticles(mockArticles)
        setFeaturedArticle(mockArticles[0])
      } catch (error) {
        console.error('Error loading knowledge content:', error)
      } finally {
        setLoading(false)
      }
    }

    if (crop) {
      loadKnowledgeContent()
    }
  }, [crop])

  useEffect(() => {
    if (!containerRef.current || loading) return

    // Animate knowledge cards on scroll
    const cards = containerRef.current.querySelectorAll('.knowledge-card')
    
    cards.forEach((card, index) => {
      gsap.fromTo(card,
        { 
          opacity: 0, 
          y: 50,
          scale: 0.95
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: index * 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    })

    // Animate featured article
    if (featuredArticle) {
      gsap.fromTo('.featured-article',
        { opacity: 0, scale: 0.9 },
        { 
          opacity: 1, 
          scale: 1,
          duration: 0.8,
          ease: 'power3.out'
        }
      )
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [loading, featuredArticle])

  const categories = [
    { id: 'all', name: 'All Articles', count: articles.length },
    { id: 'cultivation', name: 'Cultivation', count: articles.filter(a => a.category === 'cultivation').length },
    { id: 'pest-management', name: 'Pest Management', count: articles.filter(a => a.category === 'pest-management').length },
    { id: 'disease-control', name: 'Disease Control', count: articles.filter(a => a.category === 'disease-control').length },
    { id: 'soil', name: 'Soil & Nutrition', count: articles.filter(a => a.category === 'soil').length },
    { id: 'irrigation', name: 'Irrigation', count: articles.filter(a => a.category === 'irrigation').length }
  ]

  const filteredArticles = activeCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === activeCategory)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-organic-500"></div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('min-h-screen bg-gradient-to-b from-green-50 to-white', className)}>
      {/* Header */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-earth-900 mb-4">
            Knowledge Center: {crop.charAt(0).toUpperCase() + crop.slice(1)}
          </h1>
          <p className="text-xl text-earth-700 max-w-3xl mx-auto">
            Expert guides, tutorials, and best practices for successful {crop} cultivation
          </p>
        </div>

        {/* Featured Article */}
        {featuredArticle && (
          <div className="featured-article bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="relative h-64 lg:h-auto">
                <Image
                  src={featuredArticle.featured_image || '/images/knowledge/default.jpg'}
                  alt={featuredArticle.title}
                  fill
                  className="object-cover"
                />
                {featuredArticle.video_url && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                      <Play className="w-6 h-6 mr-2" />
                      Watch Video
                    </Button>
                  </div>
                )}
              </div>
              <div className="p-8 lg:p-12">
                <div className="flex items-center mb-4">
                  <span className="bg-organic-100 text-organic-800 text-sm font-medium px-3 py-1 rounded-full">
                    Featured
                  </span>
                  <span className="ml-auto text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {featuredArticle.read_time}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-earth-900 mb-4">
                  {featuredArticle.title}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    {featuredArticle.author?.avatar && (
                      <Image
                        src={featuredArticle.author.avatar}
                        alt={featuredArticle.author.name}
                        width={40}
                        height={40}
                        className="rounded-full mr-3"
                      />
                    )}
                    <div>
                      <div className="font-medium text-earth-900">
                        {featuredArticle.author?.name || 'Expert Author'}
                      </div>
                      <div className="text-sm text-gray-500">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(featuredArticle.published_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Link href={`/knowledge/${featuredArticle.slug}`}>
                    <Button className="bg-organic-500 hover:bg-organic-600">
                      Read Full Article
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* Related Products */}
                {featuredArticle.related_products && featuredArticle.related_products.length > 0 && (
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-earth-900 mb-3">Recommended Products</h4>
                    <div className="space-y-3">
                      {featuredArticle.related_products.slice(0, 2).map(product => (
                        <div key={product.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <Image
                              src={product.image_url || '/images/products/default.jpg'}
                              alt={product.name}
                              width={50}
                              height={50}
                              className="rounded-lg mr-3"
                            />
                            <span className="font-medium text-earth-900">{product.name}</span>
                          </div>
                          <div className="text-organic-600 font-semibold">₹{product.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                activeCategory === category.id ? "bg-organic-500 hover:bg-organic-600" : ""
              )}
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredArticles.slice(1).map((article, index) => (
            <div
              key={article.id}
              className="knowledge-card bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Article Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={article.featured_image || '/images/knowledge/default.jpg'}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {article.video_url && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-red-500 text-white p-2 rounded-full">
                      <Video className="w-4 h-4" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <span className="bg-white bg-opacity-90 text-xs font-medium px-2 py-1 rounded">
                    {article.category.replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {article.read_time}
                  </span>
                  <span className="text-sm text-gray-500 ml-auto flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(article.published_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-earth-900 mb-3 group-hover:text-organic-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <Link href={`/knowledge/${article.slug}`}>
                  <Button variant="outline" className="w-full group-hover:bg-organic-500 group-hover:text-white transition-colors">
                    Read Article
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-organic-500 rounded-2xl p-8 text-center text-white">
          <BookOpen className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">
            Need More Specific Guidance?
          </h3>
          <p className="text-organic-100 mb-6 max-w-2xl mx-auto">
            Connect with our agricultural experts for personalized advice on your {crop} cultivation challenges.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Contact Expert
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-organic-500">
              Browse All Articles
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CropKnowledgeCenter