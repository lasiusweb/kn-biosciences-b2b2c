'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Award, TrendingUp, Shield } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function FarmingSolutions() {
  const solutionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.solution-card', {
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: solutionsRef.current,
          start: 'top 80%',
        }
      })
    }, solutionsRef)

    return () => ctx.revert()
  }, [])

  const solutions = [
    {
      title: 'For Crop Champions',
      description: 'Advanced solutions for maximum yield and quality crops',
      icon: TrendingUp,
      href: '/farming/crop-champions',
      features: ['Bio-fertilizers', 'Growth promoters', 'Pest control'],
      color: 'bg-organic-500',
      bgColor: 'bg-organic-50'
    },
    {
      title: 'For Pond Champions',
      description: 'Complete aquaculture management for healthy fish production',
      icon: Shield,
      href: '/farming/pond-champions',
      features: ['Water treatment', 'Fish health', 'Probiotics'],
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'For Poultry Pros',
      description: 'Specialized products for optimal poultry health and growth',
      icon: Award,
      href: '/farming/poultry-pros',
      features: ['Nutrition supplements', 'Health boosters', 'Natural feed'],
      color: 'bg-red-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'For Organic Newbies',
      description: 'Easy-to-use organic solutions for sustainable farming beginners',
      icon: Users,
      href: '/farming/organic-newbies',
      features: ['Starter kits', 'Training guides', 'Expert support'],
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    }
  ]

  return (
    <div ref={solutionsRef} className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-earth-900 mb-4">
            Farming Solutions for Every Need
          </h2>
          <p className="text-lg text-earth-600 max-w-2xl mx-auto">
            Specialized product ranges designed for different farming segments 
            and experience levels.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {solutions.map((solution, index) => {
            const Icon = solution.icon
            return (
              <Card key={solution.title} className="solution-card group hover:shadow-xl transition-all duration-300 border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Icon Section */}
                    <div className={`${solution.bgColor} p-8 lg:p-12 flex items-center justify-center`}>
                      <div className={`w-20 h-20 ${solution.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1 p-8 lg:p-12">
                      <h3 className="text-2xl font-bold text-earth-900 mb-3">
                        {solution.title}
                      </h3>
                      
                      <p className="text-earth-600 mb-6">
                        {solution.description}
                      </p>
                      
                      {/* Features */}
                      <div className="space-y-2 mb-6">
                        {solution.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-organic-500 rounded-full"></div>
                            <span className="text-earth-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* CTA Button */}
                      <Button 
                        className="bg-organic-500 hover:bg-organic-600"
                        asChild
                      >
                        <Link href={solution.href}>
                          Explore Solutions
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Resources */}
        <div className="mt-16 text-center">
          <div className="bg-organic-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-earth-900 mb-4">
              Need Expert Guidance?
            </h3>
            <p className="text-earth-600 mb-6 max-w-2xl mx-auto">
              Our agricultural experts are here to help you choose the right products 
              for your specific farming requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-organic-500 hover:bg-organic-600" asChild>
                <Link href="/contact">Talk to Expert</Link>
              </Button>
              <Button variant="outline" className="border-organic-500 text-organic-600 hover:bg-organic-50" asChild>
                <Link href="/knowledge">Browse Resources</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}