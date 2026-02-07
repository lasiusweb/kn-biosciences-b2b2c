'use client'

import React, { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Lightbulb, Droplet, Bug, Leaf, Sun, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CropTip {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: 'watering' | 'pest-control' | 'fertilizing' | 'harvesting' | 'general'
  priority: 'high' | 'medium' | 'low'
  season: 'summer' | 'winter' | 'monsoon' | 'all'
  applicable_stage: string
  action_items: string[]
  warning?: string
}

interface QuickCropTipsProps {
  crop: string
  className?: string
}

export function QuickCropTips({ crop, className }: QuickCropTipsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tips, setTips] = useState<CropTip[]>([])
  const [expandedTip, setExpandedTip] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCropTips = async () => {
      try {
        // Mock data for specific crops
        const mockTips: CropTip[] = [
          {
            id: '1',
            title: 'Optimal Watering Schedule',
            description: `${crop.charAt(0).toUpperCase() + crop.slice(1)} requires consistent moisture during flowering stage. Water deeply 2-3 times per week depending on soil conditions.`,
            icon: <Droplet className="w-6 h-6" />,
            category: 'watering',
            priority: 'high',
            season: 'all',
            applicable_stage: 'Flowering',
            action_items: [
              'Check soil moisture 2-3 inches deep',
              'Water early morning to reduce evaporation',
              'Use drip irrigation for efficiency',
              'Avoid waterlogging'
            ],
            warning: 'Overwatering can lead to root rot and reduced yield'
          },
          {
            id: '2',
            title: 'Pest Monitoring Guidelines',
            description: 'Regular monitoring helps identify pest issues early. Look for signs of common pests affecting your crops.',
            icon: <Bug className="w-6 h-6" />,
            category: 'pest-control',
            priority: 'high',
            season: 'monsoon',
            applicable_stage: 'Vegetative',
            action_items: [
              'Inspect plants weekly for pest damage',
              'Use pheromone traps for monitoring',
              'Maintain field hygiene',
              'Apply organic pesticides when necessary'
            ]
          },
          {
            id: '3',
            title: 'Nutrient Management',
            description: 'Balanced fertilization based on soil test results ensures optimal growth and yield.',
            icon: <Leaf className="w-6 h-6" />,
            category: 'fertilizing',
            priority: 'medium',
            season: 'all',
            applicable_stage: 'Pre-planting',
            action_items: [
              'Conduct soil testing before planting',
              'Apply basal dose of fertilizers',
              'Top-dress during critical growth stages',
              'Monitor plant nutrient status'
            ]
          },
          {
            id: '4',
            title: 'Harvest Timing Indicators',
            description: 'Harvest at the right time ensures maximum yield and quality. Look for these key indicators.',
            icon: <Sun className="w-6 h-6" />,
            category: 'harvesting',
            priority: 'medium',
            season: 'all',
            applicable_stage: 'Maturity',
            action_items: [
              'Check moisture content of grains',
              'Observe color changes in crops',
              'Monitor weather conditions',
              'Prepare harvesting equipment in advance'
            ]
          },
          {
            id: '5',
            title: 'General Best Practices',
            description: 'Essential practices for successful crop management throughout the growing season.',
            icon: <Lightbulb className="w-6 h-6" />,
            category: 'general',
            priority: 'low',
            season: 'all',
            applicable_stage: 'All Stages',
            action_items: [
              'Maintain proper crop rotation',
              'Keep detailed farm records',
              'Stay updated with weather forecasts',
              'Connect with local agricultural extension'
            ]
          }
        ]

        setTips(mockTips)
      } catch (error) {
        console.error('Error loading crop tips:', error)
      } finally {
        setLoading(false)
      }
    }

    if (crop) {
      loadCropTips()
    }
  }, [crop])

  useEffect(() => {
    if (!containerRef.current || loading) return

    // Animate tips appearance
    const tipCards = containerRef.current.querySelectorAll('.tip-card')
    
    gsap.fromTo(tipCards,
      { 
        opacity: 0, 
        x: -30,
        scale: 0.95
      },
      { 
        opacity: 1, 
        x: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
      }
    )
  }, [loading, tips])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'watering':
        return <Droplet className="w-5 h-5" />
      case 'pest-control':
        return <Bug className="w-5 h-5" />
      case 'fertilizing':
        return <Leaf className="w-5 h-5" />
      case 'harvesting':
        return <Sun className="w-5 h-5" />
      default:
        return <Lightbulb className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-earth-900 flex items-center">
          <Lightbulb className="w-6 h-6 mr-2 text-organic-500" />
          Quick Crop Tips for {crop.charAt(0).toUpperCase() + crop.slice(1)}
        </h3>
        <span className="text-sm text-gray-500">
          {tips.length} recommendations available
        </span>
      </div>

      <div className="space-y-4">
        {tips.map((tip) => (
          <div
            key={tip.id}
            className="tip-card bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center flex-1">
                  <div className="bg-organic-100 text-organic-600 p-2 rounded-lg mr-3">
                    {tip.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-earth-900">{tip.title}</h4>
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full border',
                        getPriorityColor(tip.priority)
                      )}>
                        {tip.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{tip.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
                  className="ml-2"
                >
                  {expandedTip === tip.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span className="flex items-center">
                  {getCategoryIcon(tip.category)}
                  <span className="ml-1 capitalize">{tip.category.replace('-', ' ')}</span>
                </span>
                <span>Stage: {tip.applicable_stage}</span>
                <span>Season: {tip.season}</span>
              </div>

              {/* Expanded Content */}
              {expandedTip === tip.id && (
                <div className="border-t pt-4 mt-4">
                  <div className="mb-4">
                    <h5 className="font-medium text-earth-900 mb-2">Action Items:</h5>
                    <ul className="space-y-1">
                      {tip.action_items.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-organic-500 mr-2">•</span>
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {tip.warning && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <span className="text-yellow-600 mr-2">⚠️</span>
                        <p className="text-sm text-yellow-800">
                          <strong>Warning:</strong> {tip.warning}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-organic-50 rounded-lg p-4 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium text-earth-900 mb-1">Need personalized advice?</h5>
            <p className="text-sm text-gray-600">
              Connect with our agricultural experts for crop-specific guidance
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              View Full Guide
            </Button>
            <Button size="sm" className="bg-organic-500 hover:bg-organic-600">
              Get Expert Help
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickCropTips