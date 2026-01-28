'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Sprout, Fish, Heart, Bug, Leaf, Tractor } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function CategoryShowcase() {
  const showcaseRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.category-card', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: showcaseRef.current,
          start: 'top 80%',
        }
      })
    }, showcaseRef)

    return () => ctx.revert()
  }, [])

  const categories = [
    {
      name: 'Agriculture',
      description: 'Bio-fertilizers and growth promoters for optimal crop yield',
      icon: Sprout,
      href: '/shop/agriculture',
      color: 'bg-organic-500',
      bgColor: 'bg-organic-50',
      textColor: 'text-organic-600'
    },
    {
      name: 'Aquaculture',
      description: 'Pre-probiotics and water treatment solutions for fish farming',
      icon: Fish,
      href: '/shop/aquaculture',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: 'Poultry Healthcare',
      description: 'Natural supplements for healthy poultry production',
      icon: Heart,
      href: '/shop/poultry-healthcare',
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      name: 'Animal Healthcare',
      description: 'Organic solutions for livestock wellness',
      icon: Heart,
      href: '/shop/animal-healthcare',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      name: 'Bioremediation',
      description: 'Environmental solutions for soil and water restoration',
      icon: Bug,
      href: '/shop/bioremediation',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      name: 'Organic Farming',
      description: 'Complete range of certified organic farming inputs',
      icon: Leaf,
      href: '/shop/organic-farming',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    }
  ]

  return (
    <div ref={showcaseRef} className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-earth-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-earth-600 max-w-2xl mx-auto">
            Explore our comprehensive range of agricultural and aquaculture solutions 
            tailored for your specific farming needs.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <Card key={category.name} className="category-card group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 ${category.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-earth-900 mb-2">
                    {category.name}
                  </h3>
                  
                  <p className="text-earth-600 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  
                  <Button 
                    variant="ghost" 
                    className={`${category.textColor} hover:${category.bgColor} p-0 h-auto font-medium`}
                    asChild
                  >
                    <Link href={category.href}>
                      Explore Products
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Categories */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-wrap gap-3 justify-center">
            {[
              { name: 'Seeds', href: '/shop/seeds' },
              { name: 'Farm Equipment', href: '/shop/farm-equipment' },
              { name: 'Testing Lab', href: '/shop/testing-lab' },
              { name: 'Oilpalm', href: '/shop/oilpalm' }
            ].map((item) => (
              <Button
                key={item.name}
                variant="outline"
                className="border-organic-300 text-organic-600 hover:bg-organic-50"
                asChild
              >
                <Link href={item.href}>{item.name}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}