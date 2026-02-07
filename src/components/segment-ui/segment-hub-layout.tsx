'use client'

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { EnhancedProductService } from '@/lib/enhanced-product-service'
import CropKnowledgeCenter from '@/components/knowledge/crop-knowledge-center'
import QuickCropTips from '@/components/knowledge/quick-crop-tips'
import KnowledgeSidebar from '@/components/knowledge/knowledge-sidebar'

gsap.registerPlugin(ScrollTrigger)

interface CropDiscoveryCard {
  id: string
  title: string
  description: string
  image_url: string
  crop_type: string
  featured: boolean
  products_count: number
  quick_stats: {
    min_price: number
    max_price: number
    avg_yield: string
  }
  segment_url: string
  educational_articles: Array<{
    id: string
    title: string
    excerpt: string
    published_at: string
  }>
  is_interactive: boolean
}

interface ContextualSidebar {
  recommended_reading: Array<{
    id: string
    title: string
    description: string
    url: string
    category: string
    type: 'guide' | 'tutorial' | 'case_study'
    video_url?: string
    read_time?: string
  }>
  upcoming_crops: Array<{
    id: string
    name: string
    harvest_time?: string
    application_method: string
    disease_solutions: string
    region: string
    crop_stage: string
  }>
  crop_tips: Array<{
    title: string
    description: string
    url: string
    video_url?: string
    crop_stage: string
    application_rate: string
  }>
}

interface SegmentHubProps {
  segment: string
  className?: string
}

export function SegmentHubLayout({ segment, className }: SegmentHubProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [cropCards, setCropCards] = useState<CropDiscoveryCard[]>([])
  const [sidebar, setSidebar] = useState<ContextualSidebar | null>(null)
  const [loading, setLoading] = useState(true)
  const [segmentData, setSegmentData] = useState<any>(null)

  useEffect(() => {
    const loadSegmentData = async () => {
      try {
        setLoading(true)
        const productService = new EnhancedProductService()
        const segmentData = await productService.getProductsBySegment(segment)
        
        setSegmentData(segmentData)
        setCropCards(segmentData.featured_crops || [])
        setSidebar(segmentData.contextual_sidebar || null)
      } catch (error) {
        console.error('Error loading segment data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (segment) {
      loadSegmentData()
    }
  }, [segment])

  useEffect(() => {
    if (!heroRef.current || loading) return

    // Hero section animations
    const heroTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      }
    })

    heroTimeline
      .fromTo('.hero-title', 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )
      .fromTo('.hero-description', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.4'
      )
      .fromTo('.hero-stats', 
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' },
        '-=0.2'
      )

    // Crop cards animations with IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target as HTMLElement
            const index = parseInt(card.dataset.index || '0')
            
            gsap.fromTo(card,
              { 
                opacity: 0, 
                y: 60,
                scale: 0.9
              },
              { 
                opacity: 1, 
                y: 0,
                scale: 1,
                duration: 0.6,
                ease: 'power2.out',
                delay: index * 0.1,
                onComplete: () => {
                  card.classList.add('interactive')
                }
              }
            )
            
            observer.unobserve(card)
          }
        })
      },
      { threshold: 0.1 }
    )

    const cards = document.querySelectorAll('.crop-card')
    cards.forEach(card => observer.observe(card))

    // Sidebar animations
    if (sidebarRef.current) {
      gsap.fromTo('.sidebar-item',
        { opacity: 0, x: -30 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sidebarRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          }
        }
      )
    }

    return () => {
      observer.disconnect()
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [loading, cropCards])

  const handleCropClick = (card: CropDiscoveryCard) => {
    console.log(`[Segment Hub] Crop clicked: ${card.title} (${card.crop_type})`)
    // Navigation will be handled in Phase 3
  }

  const scrollToCrops = () => {
    const cropsSection = document.getElementById('crops-section')
    if (cropsSection) {
      cropsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-organic-500"></div>
      </div>
    )
  }

  return (
    <div ref={heroRef} className={cn('min-h-screen bg-gradient-to-b from-organic-50 to-white', className)}>
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="hero-title text-4xl md:text-6xl font-bold text-earth-900 mb-6">
            {segmentData?.title || `${segment.charAt(0).toUpperCase() + segment.slice(1)} Solutions`}
          </h1>
          <p className="hero-description text-lg md:text-xl text-earth-700 max-w-3xl mx-auto leading-relaxed mb-8">
            {segmentData?.description || `Premium agricultural solutions tailored for ${segment} crops`}
          </p>
          
          {/* Stats */}
          <div className="hero-stats grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-organic-600">
                {segmentData?.stats?.total_products || cropCards.length}
              </div>
              <div className="text-gray-600">Total Products</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-green-600">
                {segmentData?.stats?.total_crops || cropCards.length}
              </div>
              <div className="text-gray-600">Supported Crops</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-blue-600">
                {segmentData?.stats?.featured_crops || 0}
              </div>
              <div className="text-gray-600">Featured Solutions</div>
            </div>
          </div>

          <Button 
            onClick={scrollToCrops}
            size="lg"
            className="bg-organic-500 hover:bg-organic-600 text-white px-8 py-3 rounded-lg font-medium"
          >
            Explore Solutions
          </Button>
        </div>
      </section>

      {/* Featured Crops Section */}
      <section id="crops-section" ref={cardsRef} className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <h2 className="text-3xl font-bold text-earth-900">
              Featured Crop Solutions
            </h2>
            
            {/* Downloadable Catalogues */}
            <div className="flex items-center gap-4 bg-organic-50 p-4 rounded-xl border border-organic-100">
              <div className="bg-organic-500 p-2 rounded-lg text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-earth-900">Segment Catalogue</p>
                <Link 
                  href={`/catalogues/${segment}-catalogue.pdf`}
                  className="text-xs text-organic-600 hover:underline font-medium flex items-center gap-1"
                >
                  Download PDF (12MB)
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cropCards.map((card, index) => (
              <div
                key={card.id}
                data-index={index}
                className="crop-card bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                onClick={() => handleCropClick(card)}
              >
                {/* Image */}
                <div className="relative h-48 w-full">
                  <Image
                    src={card.image_url || '/images/placeholder-crop.jpg'}
                    alt={card.title}
                    fill
                    className="object-cover"
                  />
                  {card.featured && (
                    <div className="absolute top-4 right-4 bg-organic-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-earth-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {card.description}
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="text-sm text-gray-500 mb-4">
                    <div className="flex justify-between mb-1">
                      <span>Products:</span>
                      <span className="font-medium">{card.products_count}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Price Range:</span>
                      <span className="font-medium">
                        ₹{card.quick_stats.min_price} - ₹{card.quick_stats.max_price}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Yield:</span>
                      <span className="font-medium">{card.quick_stats.avg_yield}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/segments/${segment}/${card.crop_type}`}>
                      <Button variant="outline" className="flex-1">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/segments/${segment}/discover`}>
                      <Button className="flex-1 bg-organic-500 hover:bg-organic-600 text-white">
                        Get Personalized Advice
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Center Integration */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Knowledge Content */}
            <div className="lg:col-span-2">
              <CropKnowledgeCenter crop={cropCards[0]?.crop_type || 'general'} segment={segment} />
            </div>
            
            {/* Knowledge Sidebar */}
            <div className="lg:col-span-1">
              <KnowledgeSidebar crop={cropCards[0]?.crop_type || 'general'} segment={segment} />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tips Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <QuickCropTips crop={cropCards[0]?.crop_type || 'general'} />
        </div>
      </section>
    </div>
  )
}

export default SegmentHubLayout