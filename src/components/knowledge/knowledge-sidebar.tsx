'use client'

import React, { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { BookOpen, TrendingUp, Calendar, Video, ExternalLink, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface RecommendedReading {
  id: string
  title: string
  description: string
  url: string
  category: string
  type: 'guide' | 'tutorial' | 'case_study' | 'video'
  video_url?: string
  read_time?: string
  published_at?: string
  thumbnail?: string
}

interface UpcomingCrop {
  id: string
  name: string
  harvest_time?: string
  application_method: string
  disease_solutions: string
  region: string
  crop_stage: string
  image_url?: string
}

interface CropTip {
  title: string
  description: string
  url: string
  video_url?: string
  crop_stage: string
  application_rate: string
  priority: 'high' | 'medium' | 'low'
}

interface KnowledgeSidebarProps {
  crop: string
  segment: string
  className?: string
}

export function KnowledgeSidebar({ crop, segment, className }: KnowledgeSidebarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [recommendedReading, setRecommendedReading] = useState<RecommendedReading[]>([])
  const [upcomingCrops, setUpcomingCrops] = useState<UpcomingCrop[]>([])
  const [cropTips, setCropTips] = useState<CropTip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadKnowledgeData = async () => {
      try {
        setLoading(true)

        // Mock data for development
        const mockReading: RecommendedReading[] = [
          {
            id: '1',
            title: `${crop.charAt(0).toUpperCase() + crop.slice(1)} Cultivation Best Practices`,
            description: 'Learn proven techniques for maximizing yield and quality in your crops.',
            url: `/knowledge/${crop}-best-practices`,
            category: 'Cultivation',
            type: 'guide',
            read_time: '15 min',
            published_at: '2024-01-15',
            thumbnail: '/images/knowledge/cultivation-guide.jpg'
          },
          {
            id: '2',
            title: `Organic Pest Management for ${crop.charAt(0).toUpperCase() + crop.slice(1)}`,
            description: 'Sustainable pest control methods that protect your crops and the environment.',
            url: `/knowledge/${crop}-organic-pest-control`,
            category: 'Pest Management',
            type: 'video',
            video_url: 'https://example.com/pest-video',
            read_time: '12 min',
            thumbnail: '/images/knowledge/pest-management.jpg'
          },
          {
            id: '3',
            title: 'Soil Health Management',
            description: 'Understanding and improving soil fertility for optimal crop growth.',
            url: '/knowledge/soil-health',
            category: 'Soil Science',
            type: 'tutorial',
            read_time: '20 min',
            thumbnail: '/images/knowledge/soil-health.jpg'
          }
        ]

        const mockUpcomingCrops: UpcomingCrop[] = [
          {
            id: '1',
            name: 'Summer Wheat',
            harvest_time: 'March-April',
            application_method: 'Foliar Spray',
            disease_solutions: 'Rust Protection',
            region: 'North India',
            crop_stage: 'Flowering',
            image_url: '/images/crops/wheat.jpg'
          },
          {
            id: '2',
            name: 'Kharif Rice',
            harvest_time: 'October-November',
            application_method: 'Seed Treatment',
            disease_solutions: 'Blast Control',
            region: 'East India',
            crop_stage: 'Nursery',
            image_url: '/images/crops/rice.jpg'
          }
        ]

        const mockCropTips: CropTip[] = [
          {
            title: 'Optimal Fertilizer Timing',
            description: 'Apply nitrogen fertilizers during active tillering stage for best results.',
            url: `/tips/fertilizer-timing-${crop}`,
            crop_stage: 'Tillering',
            application_rate: '120-150 kg/ha',
            priority: 'high'
          },
          {
            title: 'Irrigation Schedule',
            description: 'Maintain consistent soil moisture during critical growth stages.',
            url: `/tips/irrigation-${crop}`,
            crop_stage: 'Flowering',
            application_rate: '25-30 mm/week',
            priority: 'medium'
          }
        ]

        setRecommendedReading(mockReading)
        setUpcomingCrops(mockUpcomingCrops)
        setCropTips(mockCropTips)
      } catch (error) {
        console.error('Error loading knowledge data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (crop) {
      loadKnowledgeData()
    }
  }, [crop])

  useEffect(() => {
    if (!containerRef.current || loading) return

    // Animate sidebar items
    const items = containerRef.current.querySelectorAll('.sidebar-item')
    
    gsap.fromTo(items,
      { 
        opacity: 0, 
        x: -20,
        scale: 0.95
      },
      { 
        opacity: 1, 
        x: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out'
      }
    )
  }, [loading])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 rounded-lg h-16"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('space-y-6', className)}>
      {/* Recommended Reading */}
      {recommendedReading.length > 0 && (
        <div className="sidebar-item bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-earth-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-organic-500" />
            Recommended Reading
          </h3>
          <div className="space-y-4">
            {recommendedReading.slice(0, 3).map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <Link href={item.url}>
                  <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    {item.thumbnail && (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-earth-900 mb-1 group-hover:text-organic-600 transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            {getTypeIcon(item.type)}
                            <span className="ml-1 capitalize">{item.type}</span>
                          </span>
                          {item.read_time && (
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {item.read_time}
                            </span>
                          )}
                        </div>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <Link href={`/knowledge?crop=${crop}&segment=${segment}`}>
            <Button variant="outline" size="sm" className="w-full mt-4">
              View All Articles
            </Button>
          </Link>
        </div>
      )}

      {/* Upcoming Crops */}
      {upcomingCrops.length > 0 && (
        <div className="sidebar-item bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-earth-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-organic-500" />
            Upcoming Crops
          </h3>
          <div className="space-y-4">
            {upcomingCrops.slice(0, 3).map((crop) => (
              <div key={crop.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-earth-900">{crop.name}</h4>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {crop.crop_stage}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Harvest:</span>
                    <span className="font-medium">{crop.harvest_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Region:</span>
                    <span className="font-medium">{crop.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span className="font-medium">{crop.application_method}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Tips */}
      {cropTips.length > 0 && (
        <div className="sidebar-item bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-earth-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-organic-500" />
            Quick Tips
          </h3>
          <div className="space-y-4">
            {cropTips.slice(0, 3).map((tip, index) => (
              <div key={index} className="group cursor-pointer">
                <Link href={tip.url}>
                  <div className="p-3 bg-organic-50 rounded-lg hover:bg-organic-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-earth-900 group-hover:text-organic-600 transition-colors line-clamp-1">
                        {tip.title}
                      </h4>
                      <span className={cn(
                        'text-xs px-2 py-1 rounded',
                        getPriorityColor(tip.priority)
                      )}>
                        {tip.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{tip.description}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Stage: {tip.crop_stage}</div>
                      <div>Rate: {tip.application_rate}</div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-organic-500 to-green-600 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-3">Need Expert Advice?</h3>
        <p className="text-sm text-organic-100 mb-4">
          Get personalized guidance for your {crop} cultivation from our agricultural experts.
        </p>
        <div className="space-y-2">
          <Button variant="secondary" size="sm" className="w-full">
            Chat with Expert
          </Button>
          <Button variant="outline" size="sm" className="w-full text-white border-white hover:bg-white hover:text-organic-500">
            Schedule Consultation
          </Button>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeSidebar