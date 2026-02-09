import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, BookOpen, Filter, TrendingUp, Video, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Agricultural Knowledge Center | KN Biosciences',
  description: 'Expert guides, tutorials, and best practices for successful agriculture. Crop-specific advice, pest management, soil science, and sustainable farming techniques.',
  openGraph: {
    title: 'Agricultural Knowledge Center | KN Biosciences',
    description: 'Expert agricultural guidance for successful farming',
    type: 'website',
  },
}

export default function KnowledgeCenterPage() {
  const categories = [
    {
      id: 'cultivation',
      name: 'Cultivation Guides',
      description: 'Comprehensive guides for crop cultivation from seed to harvest',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'bg-green-100 text-green-600',
      count: 45
    },
    {
      id: 'pest-management',
      name: 'Pest Management',
      description: 'Integrated pest management strategies and organic solutions',
      icon: <Filter className="w-8 h-8" />,
      color: 'bg-red-100 text-red-600',
      count: 32
    },
    {
      id: 'soil-science',
      name: 'Soil & Nutrition',
      description: 'Soil health, fertility management, and plant nutrition',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'bg-yellow-100 text-yellow-600',
      count: 28
    },
    {
      id: 'irrigation',
      name: 'Irrigation & Water',
      description: 'Water management, irrigation techniques, and conservation',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'bg-blue-100 text-blue-600',
      count: 18
    },
    {
      id: 'videos',
      name: 'Video Tutorials',
      description: 'Step-by-step video guides for agricultural practices',
      icon: <Video className="w-8 h-8" />,
      color: 'bg-purple-100 text-purple-600',
      count: 24
    },
    {
      id: 'case-studies',
      name: 'Case Studies',
      description: 'Success stories and real-world farming examples',
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-indigo-100 text-indigo-600',
      count: 15
    }
  ]

  const featuredArticles = [
    {
      id: '1',
      title: 'Complete Wheat Cultivation Guide for Maximum Yield',
      excerpt: 'Learn proven techniques for wheat farming that can increase your yield by up to 30%',
      category: 'cultivation',
      readTime: '15 min',
      author: 'Dr. Agricultural Expert',
      publishedAt: '2024-01-15',
      image: '/images/knowledge/wheat-guide.jpg'
    },
    {
      id: '2',
      title: 'Organic Pest Management: Sustainable Solutions for Modern Farming',
      excerpt: 'Discover eco-friendly pest control methods that protect your crops and the environment',
      category: 'pest-management',
      readTime: '12 min',
      author: 'Sustainable Farming Team',
      publishedAt: '2024-01-12',
      image: '/images/knowledge/organic-pest.jpg'
    },
    {
      id: '3',
      title: 'Soil Health Management: Building Fertile Ground for Success',
      excerpt: 'Essential techniques for improving soil fertility and long-term agricultural sustainability',
      category: 'soil-science',
      readTime: '20 min',
      author: 'Soil Science Experts',
      publishedAt: '2024-01-10',
      image: '/images/knowledge/soil-health.jpg'
    }
  ]

  const popularCrops = [
    { name: 'Wheat', count: 23, segment: 'cereals' },
    { name: 'Rice', count: 19, segment: 'cereals' },
    { name: 'Mango', count: 17, segment: 'fruits' },
    { name: 'Cotton', count: 15, segment: 'fiber' },
    { name: 'Sugarcane', count: 14, segment: 'cash-crops' },
    { name: 'Tomato', count: 13, segment: 'vegetables' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-earth-900 mb-6">
            Agricultural Knowledge Center
          </h1>
          <p className="text-xl text-earth-700 max-w-3xl mx-auto leading-relaxed mb-8">
            Expert guides, tutorials, and best practices for successful agriculture. 
            Crop-specific advice, pest management, soil science, and sustainable farming techniques.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for articles, guides, or topics..."
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-organic-500 hover:bg-organic-600">
              Browse All Articles
            </Button>
            <Button size="lg" variant="outline">
              Video Tutorials
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-earth-900 mb-12">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/knowledge/category/${category.id}`}
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${category.color}`}>
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-earth-900 mb-2 group-hover:text-organic-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {category.count} articles
                    </span>
                    <span className="text-organic-600 font-medium group-hover:text-organic-700">
                      Explore →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Articles */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-earth-900">
              Featured Articles
            </h2>
            <Link href="/knowledge/all">
              <Button variant="outline">
                View All Articles
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArticles.map((article) => (
              <article key={article.id} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-organic-100 text-organic-800 text-sm font-medium px-3 py-1 rounded-full">
                      {article.category.replace('-', ' ')}
                    </span>
                    <span className="ml-auto text-sm text-gray-500">
                      {article.readTime} read
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-earth-900 mb-3 group-hover:text-organic-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{article.author}</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Crops Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-earth-900 mb-6">
              Popular Crops
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Get crop-specific guidance and best practices for the most commonly grown crops in India.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {popularCrops.map((crop) => (
                <Link
                  key={crop.name}
                  href={`/knowledge/crop/${crop.name.toLowerCase()}`}
                  className="group flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-organic-300 hover:shadow-md transition-all duration-300"
                >
                  <div>
                    <h4 className="font-semibold text-earth-900 group-hover:text-organic-600 transition-colors">
                      {crop.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {crop.count} articles available
                    </p>
                  </div>
                  <div className="text-organic-600 group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-organic-500 to-green-600 rounded-2xl p-8 text-white">
            <BookOpen className="w-16 h-16 mb-6" />
            <h3 className="text-2xl font-bold mb-4">
              Need Personalized Guidance?
            </h3>
            <p className="text-organic-100 mb-6 leading-relaxed">
              Connect with our agricultural experts for personalized advice on your specific farming challenges. 
              Get one-on-one consultations tailored to your crops, soil conditions, and farming goals.
            </p>
            <div className="space-y-3">
              <Button size="lg" variant="secondary" className="w-full">
                Schedule Consultation
              </Button>
              <Button size="lg" variant="outline" className="w-full text-white border-white hover:bg-white hover:text-organic-500">
                Chat with Expert
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-earth-900 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated with Latest Agricultural Insights
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for expert farming tips, new article alerts, and exclusive agricultural insights.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500"
            />
            <Button size="lg" className="bg-organic-500 hover:bg-organic-600">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}