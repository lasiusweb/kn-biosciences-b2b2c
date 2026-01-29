'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Check, 
  Eye, 
  Heart, 
  ShoppingCart,
  Star,
  Package,
  X,
  Zap
} from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  original_price: number
  image_url: string
  brand: string
  category_name: string
  average_rating: number
  review_count: number
  specifications: Record<string, any>
  in_stock: boolean
  is_organic: boolean
  tags: string[]
  sku: string
  description: string
  short_description: string
}

interface ProductComparisonProps {
  productIds?: string[]
  products?: Product[]
  className?: string
}

export function ProductComparison({ productIds = [], products = [], className }: ProductComparisonProps) {
  const [comparisonData, setComparisonData] = useState({
    products: [] as Product[],
    comparisonId: '',
    createdAt: ''
  })
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(products)
  const [loading, setLoading] = useState(false)

  // Initialize comparison from URL params or props
  React.useEffect(() => {
    if (productIds.length > 0) {
      // Mock initialization
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
      }, 500)
    } else if (products.length > 0) {
      setSelectedProducts(products)
    }
  }, [productIds, products])

  const clearComparison = () => {
    setSelectedProducts([])
    setComparisonData({
      products: [],
      comparisonId: '',
      createdAt: ''
    })
  }

  const shareComparison = () => {
    const comparisonUrl = `${window.location.origin}/compare?comp=${comparisonData.comparisonId}`
    
    if (navigator.share) {
      navigator.share({
        title: 'Product Comparison - KN Biosciences',
        text: `I'm comparing these agricultural products: ${selectedProducts.map(p => p.name).join(', ')}`,
        url: comparisonUrl
      })
    } else {
      navigator.clipboard.writeText(comparisonUrl)
      alert('Comparison link copied to clipboard!')
    }
  }

  const getComparisonScore = (product: Product): number => {
    let score = 0
    
    // Price score (lower is better)
    const prices = selectedProducts.map(p => p.price)
    const avgPrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0
    if (product.price < avgPrice) score += 2
    else if (product.price === avgPrice) score += 1

    // Rating score
    score += (product.average_rating || 0) * 2

    // Stock availability
    if (product.in_stock) score += 1

    // Organic bonus
    if (product.is_organic) score += 1

    return Math.round(score * 10) / 10
  }

  const getWinner = (): Product | null => {
    if (selectedProducts.length < 2) return null
    
    const scores = selectedProducts.map(p => getComparisonScore(p))
    const maxScore = Math.max(...scores)
    const winnerIndex = scores.indexOf(maxScore)
    
    return winnerIndex >= 0 ? selectedProducts[winnerIndex] : null
  }

  const winner = getWinner()

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading comparison...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Comparison Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Product Comparison
              {selectedProducts.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedProducts.length} items
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearComparison}
                disabled={selectedProducts.length === 0}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareComparison}
                disabled={selectedProducts.length === 0}
              >
                <Zap className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Compare up to 4 agricultural products side by side to make informed decisions
          </CardDescription>
        </CardHeader>
      </Card>

      {selectedProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 opacity-20" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Comparing Products</h3>
              <p className="mb-6">Search for products and add them to comparison to see detailed analysis.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => window.location.href = '/shop'}
                  className="flex flex-col items-center p-6 h-auto"
                >
                  <ShoppingCart className="h-6 w-6 mb-2" />
                  <span>Browse Products</span>
                </Button>
                <Button
                  onClick={() => window.location.href = '/shop?category=fertilizers'}
                  variant="secondary"
                  className="flex flex-col items-center p-6 h-auto"
                >
                  <Package className="h-6 w-6 mb-2" />
                  <span>Fertilizers</span>
                </Button>
                <Button
                  onClick={() => window.location.href = '/shop?category=seeds'}
                  variant="outline"
                  className="flex flex-col items-center p-6 h-auto"
                >
                  <Package className="h-6 w-6 mb-2" />
                  <span>Seeds</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Comparison Winner Indicator */}
          {winner && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="text-center py-4">
                <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-green-800 font-semibold">Best Value: {winner.name}</h3>
                <p className="text-green-700 text-sm">Recommended choice based on price, quality, and ratings</p>
              </CardContent>
            </Card>
          )}

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Comparison Results</CardTitle>
              {comparisonData.createdAt && (
                <CardDescription>
                  Comparison ID: {comparisonData.comparisonId} • 
                  Created: {new Date(comparisonData.createdAt).toLocaleString()}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-3 text-left">Product</th>
                      <th className="p-3 text-center">Price</th>
                      <th className="p-3 text-center">Rating</th>
                      <th className="p-3 text-center">Stock</th>
                      <th className="p-3 text-center">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map((product) => {
                      const score = getComparisonScore(product)
                      const isWinner = winner?.id === product.id
                      
                      return (
                        <tr key={product.id} className={`border-b ${isWinner ? 'bg-green-50/50' : ''}`}>
                          <td className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0 relative">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-6 w-6 text-muted-foreground opacity-20" />
                                  </div>
                                )}
                                {product.is_organic && (
                                  <Badge className="absolute top-0 left-0 bg-green-500 text-white text-[8px] px-1 py-0 rounded-none rounded-br">
                                    Organic
                                  </Badge>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm mb-1 truncate">{product.name}</h4>
                                {product.brand && (
                                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="space-y-1">
                              {product.original_price > product.price && (
                                <span className="text-xs text-muted-foreground line-through block">₹{product.original_price}</span>
                              )}
                              <span className={`font-bold block ${isWinner ? 'text-green-600' : 'text-primary'}`}>
                                ₹{product.price}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i <= Math.floor(product.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-muted-foreground mt-1">
                                {product.average_rating?.toFixed(1) || 'N/A'} ({product.review_count || 0})
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {product.in_stock ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">
                                In Stock
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[10px]">
                                Out of Stock
                              </Badge>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`text-lg font-bold ${isWinner ? 'text-green-600' : 'text-muted-foreground'}`}>
                              {score}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Product Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedProducts.map(product => (
              <Card key={product.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground opacity-20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 truncate">{product.name}</h3>
                      {product.brand && (
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Specifications</h4>
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      <dl className="space-y-1.5">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between border-b border-muted pb-1">
                            <dt className="text-xs text-muted-foreground capitalize">
                              {key.replace(/_/g, ' ')}
                            </dt>
                            <dd className="text-xs font-medium">
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No specifications available</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-1">Description</h4>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {product.short_description || product.description || 'No description available'}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => console.log('Wishlist:', product.id)}
                      className="flex-1"
                    >
                      <Heart className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => console.log('Cart:', product.id)}
                      className="flex-1"
                      disabled={!product.in_stock}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ProductComparison