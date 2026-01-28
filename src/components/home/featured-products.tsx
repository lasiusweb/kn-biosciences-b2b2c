'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Star, ShoppingCart, Heart } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function FeaturedProducts() {
  const productsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.product-card', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: productsRef.current,
          start: 'top 80%',
        }
      })
    }, productsRef)

    return () => ctx.revert()
  }, [])

  const featuredProducts = [
    {
      id: '1',
      name: 'BioNPK Plus - Organic Fertilizer',
      shortDescription: 'Advanced NPK formulation for balanced plant nutrition',
      price: 450,
      comparePrice: 550,
      image: '/api/placeholder/300/300',
      rating: 4.5,
      reviews: 128,
      badge: 'Best Seller',
      slug: 'bionpk-plus-organic-fertilizer'
    },
    {
      id: '2',
      name: 'AquaProbiotic Premium',
      shortDescription: 'Enhances water quality and fish health in aquaculture',
      price: 680,
      comparePrice: 850,
      image: '/api/placeholder/300/300',
      rating: 4.8,
      reviews: 89,
      badge: 'New',
      slug: 'aquaprobiotic-premium'
    },
    {
      id: '3',
      name: 'PoultryVital Plus',
      shortDescription: 'Natural growth promoter for healthy poultry development',
      price: 320,
      comparePrice: 400,
      image: '/api/placeholder/300/300',
      rating: 4.6,
      reviews: 156,
      badge: 'Popular',
      slug: 'poultryvital-plus'
    },
    {
      id: '4',
      name: 'SoilRevive Organic',
      shortDescription: 'Restores soil health and enhances microbial activity',
      price: 520,
      comparePrice: null,
      image: '/api/placeholder/300/300',
      rating: 4.7,
      reviews: 203,
      badge: 'Eco Choice',
      slug: 'soilrevive-organic'
    }
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div ref={productsRef} className="py-16 bg-organic-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-earth-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-earth-600 max-w-2xl">
              Our most popular and effective solutions for modern sustainable farming
            </p>
          </div>
          <Button className="mt-4 lg:mt-0 bg-organic-500 hover:bg-organic-600" asChild>
            <Link href="/shop">
              View All Products
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="product-card group hover:shadow-xl transition-all duration-300 border-0 shadow-sm overflow-hidden">
              <div className="relative">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-3 left-3 bg-organic-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {product.badge}
                    </div>
                  )}
                  
                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="bg-white/90 hover:bg-white shadow-lg"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-semibold text-earth-900 mb-2 line-clamp-2 hover:text-organic-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-sm text-earth-600 mb-3 line-clamp-2">
                  {product.shortDescription}
                </p>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-earth-500">
                    ({product.reviews})
                  </span>
                </div>
                
                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-earth-900">
                      ₹{product.price}
                    </span>
                    {product.comparePrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.comparePrice}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Add to Cart */}
                <Button className="w-full bg-organic-500 hover:bg-organic-600" size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}