'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Play, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
      
      gsap.from('.hero-cta', {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 0.4,
        ease: 'power3.out'
      })
      
      gsap.from('.hero-features', {
        opacity: 0,
        x: -30,
        duration: 1,
        delay: 0.6,
        stagger: 0.2,
        ease: 'power3.out'
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const features = [
    '100% Organic Products',
    'ISO Certified Manufacturing',
    'Expert Agricultural Support',
    'Sustainable Farming Solutions'
  ]

  return (
    <div ref={heroRef} className="hero-gradient relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-organic-200 to-earth-200"></div>
      </div>

      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="hero-title text-4xl lg:text-6xl font-bold text-earth-900 leading-tight">
                Transform Your Farm with
                <span className="text-organic-600"> Sustainable</span> Solutions
              </h1>
              
              <p className="hero-subtitle text-lg lg:text-xl text-earth-700 leading-relaxed">
                Discover premium bio-fertilizers, pre-probiotics, and organic farming solutions 
                that boost productivity while preserving nature's balance.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="hero-cta flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-organic-500 hover:bg-organic-600 text-white">
                <Link href="/shop">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="border-organic-500 text-organic-600 hover:bg-organic-50">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Features */}
            <div className="hero-features grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-organic-500 flex-shrink-0" />
                  <span className="text-earth-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Visual */}
          <div className="relative">
            <div className="relative z-10">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
                <div className="aspect-video bg-organic-100 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-organic-500 rounded-full flex items-center justify-center mx-auto">
                      <Play className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-earth-900">
                      See How Our Products Work
                    </h3>
                    <p className="text-earth-600">
                      2-minute introduction to sustainable farming
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-organic-300 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-earth-300 rounded-full opacity-20 blur-xl"></div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16 pt-16 border-t border-organic-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-organic-600">50K+</div>
            <div className="text-earth-600 font-medium">Happy Farmers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-organic-600">200+</div>
            <div className="text-earth-600 font-medium">Products</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-organic-600">15+</div>
            <div className="text-earth-600 font-medium">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-organic-600">100%</div>
            <div className="text-earth-600 font-medium">Organic Certified</div>
          </div>
        </div>
      </div>
    </div>
  )
}