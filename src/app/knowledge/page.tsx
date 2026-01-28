import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, TrendingUp, Users, Calendar, Search, Filter } from 'lucide-react'
import Link from 'next/link'

export default function KnowledgePage() {
  const categories = [
    { name: 'Organic Farming', count: 24, color: 'bg-organic-500' },
    { name: 'Aquaculture', count: 18, color: 'bg-blue-500' },
    { name: 'Poultry Care', count: 15, color: 'bg-red-500' },
    { name: 'Soil Health', count: 22, color: 'bg-earth-500' },
    { name: 'Pest Management', count: 19, color: 'bg-green-500' },
    { name: 'Sustainable Practices', count: 16, color: 'bg-purple-500' }
  ]

  const featuredArticles = [
    {
      title: 'The Complete Guide to Organic Fertilizers',
      excerpt: 'Learn everything about organic fertilizers, their benefits, and how to use them effectively for sustainable farming.',
      category: 'Organic Farming',
      readTime: '8 min',
      date: '2024-01-15',
      author: 'Dr. Rajesh Kumar',
      image: '/api/placeholder/400/250'
    },
    {
      title: 'Improving Water Quality in Fish Ponds',
      excerpt: 'Essential techniques for maintaining optimal water quality in aquaculture systems for better fish health.',
      category: 'Aquaculture',
      readTime: '6 min',
      date: '2024-01-12',
      author: 'Priya Sharma',
      image: '/api/placeholder/400/250'
    },
    {
      title: 'Natural Pest Control Methods for Modern Farming',
      excerpt: 'Discover effective natural pest control solutions that protect your crops without harmful chemicals.',
      category: 'Pest Management',
      readTime: '10 min',
      date: '2024-01-10',
      author: 'Mohammed Ali',
      image: '/api/placeholder/400/250'
    }
  ]

  const recentArticles = [
    {
      title: 'Understanding Soil pH and Its Impact on Crop Growth',
      category: 'Soil Health',
      date: '2024-01-08',
      readTime: '5 min'
    },
    {
      title: 'Best Practices for Poultry Feed Management',
      category: 'Poultry Care',
      date: '2024-01-06',
      readTime: '7 min'
    },
    {
      title: 'Sustainable Irrigation Techniques for Water Conservation',
      category: 'Sustainable Practices',
      date: '2024-01-04',
      readTime: '9 min'
    },
    {
      title: 'Bio-fertilizers vs Chemical Fertilizers: A Comparison',
      category: 'Organic Farming',
      date: '2024-01-02',
      readTime: '6 min'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-earth-900 mb-4">
          Knowledge Center
        </h1>
        <p className="text-lg text-earth-600 max-w-2xl mx-auto">
          Expert insights, guides, and best practices for sustainable agriculture and aquaculture
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-earth-400" />
          <input
            type="text"
            placeholder="Search articles, guides, and resources..."
            className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Categories */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-earth-900 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link key={category.name} href={`/knowledge/category/${category.name.toLowerCase().replace(' ', '-')}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-earth-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-earth-600">{category.count} articles</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Articles */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-earth-900">Featured Articles</h2>
          <Button variant="outline" asChild>
            <Link href="/knowledge/featured">View All</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {featuredArticles.map((article, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary">{article.category}</Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-earth-900 mb-2 line-clamp-2">
                  <Link href={`/knowledge/article/${index}`} className="hover:text-organic-600 transition-colors">
                    {article.title}
                  </Link>
                </h3>
                <p className="text-earth-600 mb-4 line-clamp-3">{article.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-earth-500">
                  <span>{article.author}</span>
                  <span>{article.readTime} read</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Articles</CardTitle>
              <CardDescription>Latest insights and farming guides</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentArticles.map((article, index) => (
                  <div key={index} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                    <div className="w-16 h-16 bg-organic-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-8 w-8 text-organic-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-earth-900 mb-1">
                        <Link href={`/knowledge/article/${index}`} className="hover:text-organic-600 transition-colors">
                          {article.title}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-earth-500">
                        <Badge variant="outline" className="text-xs">{article.category}</Badge>
                        <span>{article.date}</span>
                        <span>{article.readTime} read</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Guides */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Guides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  'Getting Started with Organic Farming',
                  'Product Application Guidelines',
                  'Seasonal Farming Calendar',
                  'Pest Identification Guide'
                ].map((guide, index) => (
                  <Link key={index} href="#" className="block p-3 bg-organic-50 rounded-lg hover:bg-organic-100 transition-colors">
                    <p className="font-medium text-earth-900 text-sm">{guide}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Newsletter Signup */}
          <Card>
            <CardHeader>
              <CardTitle>Stay Updated</CardTitle>
              <CardDescription>Get the latest farming insights delivered to your inbox</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500"
                />
                <Button className="w-full bg-organic-500 hover:bg-organic-600">
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Expert Help */}
          <Card>
            <CardHeader>
              <CardTitle>Need Expert Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-3">
                <Users className="h-12 w-12 text-organic-500 mx-auto" />
                <p className="text-sm text-earth-600">
                  Connect with our agricultural experts for personalized guidance
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/contact">Talk to Expert</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}