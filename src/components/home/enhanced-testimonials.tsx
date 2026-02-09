'use client'

import { useState, useEffect, useRef } from 'react';
import { Star, Quote, Users, Leaf, Award, TrendingUp } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  content: string;
  rating: number;
  avatar: string;
  segment: 'agriculture' | 'aquaculture' | 'poultry' | 'animal' | 'consultant';
  beforeAfter: {
    before: string;
    after: string;
    improvement: string;
  };
  productUsed: string;
}

export function EnhancedTestimonials() {
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'agriculture' | 'aquaculture' | 'poultry' | 'animal' | 'consultant'>('all');

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
      });
    }, testimonialsRef);

    return () => ctx.revert();
  }, []);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Ramesh Kumar',
      role: 'Organic Farmer',
      location: 'Punjab',
      content: 'KN Biosciences transformed my farming practice. Their bio-fertilizers increased my yield by 40% while maintaining soil health. Highly recommended!',
      rating: 5,
      avatar: '/api/placeholder/60/60',
      segment: 'agriculture',
      beforeAfter: {
        before: 'Yield: 25 quintals/hectare',
        after: 'Yield: 35 quintals/hectare',
        improvement: '+40%'
      },
      productUsed: 'BioGrow Pro'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      role: 'Aquaculture Business Owner',
      location: 'Kerala',
      content: 'The aquaculture products from KN Biosciences are exceptional. Water quality improved significantly, and fish mortality reduced by 60%. Great products!',
      rating: 5,
      avatar: '/api/placeholder/60/60',
      segment: 'aquaculture',
      beforeAfter: {
        before: 'Mortality: 15%',
        after: 'Mortality: 6%',
        improvement: '-60%'
      },
      productUsed: 'AquaVital Plus'
    },
    {
      id: 3,
      name: 'Mohammed Ali',
      role: 'Poultry Farm Manager',
      location: 'Hyderabad',
      content: 'We\'ve been using PoultryVital Plus for 6 months now. The results are amazing - healthier birds, better growth rates, and all-natural ingredients.',
      rating: 5,
      avatar: '/api/placeholder/60/60',
      segment: 'poultry',
      beforeAfter: {
        before: 'Growth: 1.8kg/bird',
        after: 'Growth: 2.4kg/bird',
        improvement: '+33%'
      },
      productUsed: 'PoultryVital Plus'
    },
    {
      id: 4,
      name: 'Sunita Devi',
      role: 'Smallholder Farmer',
      location: 'Bihar',
      content: 'As a small farmer, I was skeptical about new products. But KN Biosciences\' bio-fertilizers gave me better results than chemical fertilizers at a lower cost.',
      rating: 5,
      avatar: '/api/placeholder/60/60',
      segment: 'agriculture',
      beforeAfter: {
        before: 'Cost: ₹12,000/acre',
        after: 'Cost: ₹8,000/acre',
        improvement: '33% savings'
      },
      productUsed: 'BioSoil Enhancer'
    },
    {
      id: 5,
      name: 'Dr. Rajesh Patel',
      role: 'Agricultural Consultant',
      location: 'Gujarat',
      content: 'I recommend KN Biosciences to all my clients. Their products consistently deliver results and improve soil health over time. Excellent ROI for farmers.',
      rating: 5,
      avatar: '/api/placeholder/60/60',
      segment: 'consultant',
      beforeAfter: {
        before: 'Soil pH: 7.8',
        after: 'Soil pH: 6.8',
        improvement: 'Optimized pH'
      },
      productUsed: 'SoilRevive Mix'
    },
    {
      id: 6,
      name: 'Anil Singh',
      role: 'Dairy Farm Owner',
      location: 'Rajasthan',
      content: 'The animal healthcare products from KN Biosciences have improved our livestock health significantly. Reduced veterinary costs and better milk production.',
      rating: 5,
      avatar: '/api/placeholder/60/60',
      segment: 'animal',
      beforeAfter: {
        before: 'Milk: 8L/day/cow',
        after: 'Milk: 12L/day/cow',
        improvement: '+50%'
      },
      productUsed: 'LivestockBoost'
    }
  ];

  const filteredTestimonials = activeTab === 'all'
    ? testimonials
    : testimonials.filter(t => t.segment === activeTab);

  const renderStars = (rating: number) => {
    return Array.from({ length: rating }, (_, i) => (
      <Star
        key={i}
        className="h-5 w-5 text-yellow-400 fill-current"
      />
    ));
  };

  const tabStats = {
    all: testimonials.length,
    agriculture: testimonials.filter(t => t.segment === 'agriculture').length,
    aquaculture: testimonials.filter(t => t.segment === 'aquaculture').length,
    poultry: testimonials.filter(t => t.segment === 'poultry').length,
    animal: testimonials.filter(t => t.segment === 'animal').length,
    consultant: testimonials.filter(t => t.segment === 'consultant').length
  };

  return (
    <div ref={testimonialsRef} className="py-16 bg-earth-900 text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Success Stories from Our Community
          </h2>
          <p className="text-lg text-earth-200 max-w-2xl mx-auto">
            Real stories from real farmers who have transformed their agriculture
            with our sustainable solutions.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full bg-earth-800 p-1">
            {[
              { id: 'all', label: 'All Stories', icon: <Users className="w-4 h-4 mr-2" /> },
              { id: 'agriculture', label: 'Agriculture', icon: <Leaf className="w-4 h-4 mr-2" /> },
              { id: 'aquaculture', label: 'Aquaculture', icon: <Award className="w-4 h-4 mr-2" /> },
              { id: 'poultry', label: 'Poultry', icon: <TrendingUp className="w-4 h-4 mr-2" /> },
              { id: 'animal', label: 'Animal Health', icon: <Award className="w-4 h-4 mr-2" /> },
              { id: 'consultant', label: 'Consultants', icon: <TrendingUp className="w-4 h-4 mr-2" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 flex items-center ${
                  activeTab === tab.id
                    ? 'bg-organic-500 text-white'
                    : 'text-earth-300 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label} ({tabStats[tab.id as keyof typeof tabStats]})
              </button>
            ))}
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {filteredTestimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="testimonial-card bg-white/10 backdrop-blur-sm rounded-2xl p-8 h-full flex flex-col"
            >
              {/* Quote Icon */}
              <Quote className="h-8 w-8 text-organic-400 mb-4" />

              {/* Content */}
              <p className="text-earth-100 mb-6 leading-relaxed flex-grow">
                {testimonial.content}
              </p>

              {/* Product Used */}
              <div className="mb-4">
                <div className="text-sm text-organic-300 mb-1">Product Used:</div>
                <div className="text-sm font-medium text-white">{testimonial.productUsed}</div>
              </div>

              {/* Before/After Stats */}
              <div className="grid grid-cols-3 gap-2 mb-6 text-sm">
                <div className="bg-earth-700/50 p-2 rounded text-center">
                  <div className="text-earth-300">Before</div>
                  <div className="text-white font-medium">{testimonial.beforeAfter.before}</div>
                </div>
                <div className="bg-organic-500/20 p-2 rounded text-center">
                  <div className="text-organic-300">After</div>
                  <div className="text-white font-medium">{testimonial.beforeAfter.after}</div>
                </div>
                <div className="bg-green-500/20 p-2 rounded text-center">
                  <div className="text-green-300">Improvement</div>
                  <div className="text-white font-medium">{testimonial.beforeAfter.improvement}</div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-6">
                {renderStars(testimonial.rating)}
              </div>

              {/* Author */}
              <div className="flex items-center space-x-4 mt-auto">
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

        {/* CTA */}
        <div className="text-center mt-12">
          <Button size="lg" className="bg-organic-500 hover:bg-organic-600 text-white">
            Share Your Success Story
          </Button>
        </div>
      </div>
    </div>
  );
}