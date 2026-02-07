import Link from 'next/link'
import { Button } from '@/components/ui/button'

const segments = [
  {
    name: 'cereals',
    title: 'Cereal Crops',
    description: 'Comprehensive solutions for wheat, rice, maize, and other cereal crops',
    icon: '🌾'
  },
  {
    name: 'fruits',
    title: 'Fruit Crops',
    description: 'Specialized treatments for mango, citrus, banana, and other fruit varieties',
    icon: '🍎'
  },
  {
    name: 'vegetables',
    title: 'Vegetable Crops',
    description: 'Organic and conventional solutions for vegetable farming',
    icon: '🥬'
  },
  {
    name: 'pulses',
    title: 'Pulses & Legumes',
    description: 'Nutrition-focused solutions for pulses and legume crops',
    icon: '🫘'
  },
  {
    name: 'spices',
    title: 'Spice Crops',
    description: 'Premium treatments for spice cultivation and quality enhancement',
    icon: '🌶️'
  },
  {
    name: 'plantation',
    title: 'Plantation Crops',
    description: 'Long-term crop management solutions for tea, coffee, and plantation farming',
    icon: '☕'
  }
]

export default function SegmentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-organic-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-earth-900 mb-6">
            Shop by Crop Segment
          </h1>
          <p className="text-xl text-earth-700 max-w-3xl mx-auto leading-relaxed mb-8">
            Discover specialized agricultural solutions tailored to your specific crop requirements. 
            From cereals to spices, we provide comprehensive protection and nutrition for every farming need.
          </p>
        </div>

        {/* Segments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {segments.map((segment) => (
            <div
              key={segment.name}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden group"
            >
              <div className="p-8 text-center">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {segment.icon}
                </div>
                <h3 className="text-2xl font-bold text-earth-900 mb-3">
                  {segment.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {segment.description}
                </p>
                <Link href={`/segments/${segment.name}`}>
                  <Button className="w-full bg-organic-500 hover:bg-organic-600 text-white">
                    Explore {segment.title}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl font-bold text-organic-600 mb-2">500+</div>
            <div className="text-gray-700">Specialized Products</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
            <div className="text-gray-700">Crop Varieties</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-700">Expert Support</div>
          </div>
        </div>
      </section>
    </div>
  )
}