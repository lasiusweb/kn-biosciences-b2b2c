'use client'

import { Star, Quote } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function Testimonials() {
  const testimonialsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.testimonial-card', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: testimonialsRef.current,
          start: 'top 80%',
        }
      })
    }, testimonialsRef)

    return () => ctx.revert()
  }, [])

  const testimonials = [
    {
      name: 'Ramesh Kumar',
      role: 'Organic Farmer',
      location: 'Punjab',
      content: 'KN Biosciences transformed my farming practice. Their bio-fertilizers increased my yield by 40% while maintaining soil health. Highly recommended!',
      rating: 5,
      avatar: '/api/placeholder/60/60'
    },
    {
      name: 'Priya Sharma',
      role: 'Aquaculture Business Owner',
      location: 'Kerala',
      content: 'The aquaculture products from KN Biosciences are exceptional. Water quality improved significantly, and fish mortality reduced by 60%. Great products!',
      rating: 5,
      avatar: '/api/placeholder/60/60'
    },
    {
      name: 'Mohammed Ali',
      role: 'Poultry Farm Manager',
      location: 'Hyderabad',
      content: 'We\'ve been using PoultryVital Plus for 6 months now. The results are amazing - healthier birds, better growth rates, and all-natural ingredients.',
      rating: 5,
      avatar: '/api/placeholder/60/60'
    }
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: rating }, (_, i) => (
      <Star
        key={i}
        className="h-5 w-5 text-yellow-400 fill-current"
      />
    ))
  }

  return (
    <div ref={testimonialsRef} className="py-16 bg-earth-900 text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            What Farmers Say About Us
          </h2>
          <p className="text-lg text-earth-200 max-w-2xl mx-auto">
            Real stories from real farmers who have transformed their agriculture 
            with our sustainable solutions.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 h-full">
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-organic-400 mb-4" />
                
                {/* Content */}
                <p className="text-earth-100 mb-6 leading-relaxed">
                  {testimonial.content}
                </p>
                
                {/* Rating */}
                <div className="flex items-center mb-6">
                  {renderStars(testimonial.rating)}
                </div>
                
                {/* Author */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-organic-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-earth-300 text-sm">
                      {testimonial.role}
                    </div>
                    <div className="text-earth-400 text-sm">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-organic-400">4.9/5</div>
            <div className="text-earth-300">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-organic-400">2000+</div>
            <div className="text-earth-300">Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-organic-400">98%</div>
            <div className="text-earth-300">Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-organic-400">85%</div>
            <div className="text-earth-300">Repeat Customers</div>
          </div>
        </div>
      </div>
    </div>
  )
}