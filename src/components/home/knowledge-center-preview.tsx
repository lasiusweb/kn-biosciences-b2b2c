'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Search, BookOpen, TrendingUp, Video, FileText, Calendar, Clock, Users, Leaf } from 'lucide-react'
import Link from 'next/link'

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  author: string;
  publishedAt: string;
  image: string;
  trending?: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  count: number;
}

export function KnowledgeCenterPreview() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      const mockCategories: Category[] = [
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
          icon: <BookOpen className="w-8 h-8" />,
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
          description: 'Real-world success stories and applications',
          icon: <FileText className="w-8 h-8" />,
          color: 'bg-indigo-100 text-indigo-600',
          count: 15
        }
      ];

      const mockArticles: Article[] = [
        {
          id: '1',
          title: 'Complete Wheat Cultivation Guide for Maximum Yield',
          excerpt: 'Learn proven techniques for wheat farming that can increase your yield by up to 30%',
          category: 'cultivation',
          readTime: '15 min',
          author: 'Dr. Agricultural Expert',
          publishedAt: '2024-01-15',
          image: '/images/knowledge/wheat-guide.jpg',
          trending: true
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
      ];

      setCategories(mockCategories);
      setArticles(mockArticles);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-earth-900 mb-4">Knowledge Center Preview</h2>
            <p className="text-lg text-gray-600">Stay updated with the latest agricultural insights and best practices</p>
          </div>
          
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-earth-900 mb-4">Knowledge Center Preview</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest agricultural insights, best practices, and expert guidance
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for articles, guides, or topics..."
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/knowledge/category/${category.id}`}
              className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${category.color}`}>
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-earth-900 mb-1 group-hover:text-organic-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {category.description}
                  </p>
                  <div className="text-xs text-gray-500">
                    {category.count} articles
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Articles */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-earth-900">Featured Articles</h3>
            <Link href="/knowledge">
              <Button variant="outline" className="border-organic-500 text-organic-600 hover:bg-organic-50">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article key={article.id} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  {article.trending && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-organic-100 text-organic-800 text-xs font-medium px-2 py-1 rounded-full">
                      {article.category.replace('-', ' ')}
                    </span>
                    <div className="ml-auto flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.readTime}
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-earth-900 mb-2 group-hover:text-organic-600 transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{article.author}</span>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/knowledge">
            <Button size="lg" className="bg-organic-500 hover:bg-organic-600 text-white">
              Explore Full Knowledge Center
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}