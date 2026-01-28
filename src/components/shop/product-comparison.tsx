'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowUpDown, 
  BarChart3, 
  Check, 
  Eye, 
  Heart, 
  ShoppingCart,
  Star,
  Package,
  Truck,
  Tag,
  X
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
    products: [],
    comparisonId: '',
    createdAt: ''
  })
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  // Initialize comparison from URL params or props
  React.useEffect(() => {
    if (productIds.length > 0) {
      initializeComparison(productIds)
    } else if (products.length > 0) {
      setSelectedProducts(products)
    }
  }, [productIds, products])

  const addProductToComparison = async (productId: string) => {
    if (selectedProducts.length >= 4) {
      alert('Maximum 4 products can be compared at once')
      return
    }

    try {
      const product = await fetchProductById(productId)
      if (product) {
        const updatedProducts = [...selectedProducts, product]
        setSelectedProducts(updatedProducts)
        setComparisonData(prev => ({
          ...prev,
          products: updatedProducts,
          comparisonId: `comp_${Date.now()}`,
          createdAt: new Date().toISOString()
        }))
      }
    } catch (error) {
      console.error('Error adding product to comparison:', error)
    }
  }

  const removeProductFromComparison = (productId: string) => {
    const updatedProducts = selectedProducts.filter(p => p.id !== productId)
    setSelectedProducts(updatedProducts)
    setComparisonData(prev => ({
      ...prev,
      products: updatedProducts,
      comparisonId: `comp_${Date.now()}`,
      createdAt: new Date().toISOString()
    }))
  }

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

  const getWinner = (): Product | null => {
    if (selectedProducts.length < 2) return null
    
    const scores = selectedProducts.map(p => getComparisonScore(p, 0))
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
    <div className="space-y-6">
      {/* Comparison Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Product Comparison
              {selectedProducts.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedProducts.length} items}
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
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded"></div>
              <h3 className="text-lg font-semibold mb-2">Start Comparing Products</h3>
              <p className="mb-6">Search for products and add them to comparison to see detailed analysis.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => window.location.href = '/shop'}
                  className="flex flex-col items-center p-6 bg-primary text-white hover:bg-primary/90"
                >
                  <ShoppingCart className="h-6 w-6 mb-2" />
                  <span>Browse Products</span>
                </Button>
                <Button
                  onClick={() => window.location.href = '/shop?category=fertilizers'}
                  className="flex flex-col items-center p-6 bg-secondary hover:bg-secondary/90"
                >
                  <Package className="h-6 w-6 mb-2" />
                  <span>Fertilizers</span>
                </Button>
                <Button
                  onClick={() => window.location.href = '/shop?category=seeds'}
                  className="flex flex-col items-center p-6 bg-accent hover:bg-accent/90"
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
                <p className="text-green-700">Recommended choice based on price, quality, and ratings</p>
              </CardContent>
            </Card>
          )}

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Comparison Results</CardTitle>
              <CardDescription>
                {comparisonData.createdAt && (
                  <span className="text-xs text-muted-foreground">
                    Comparison ID: {comparisonData.comparisonId} • 
                    Created: {new Date(comparisonData.createdAt).toLocaleString()}
                  </span>
                )}
              </CardDescription>
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
                    {selectedProducts.map((product, index) => {
                      const score = getComparisonScore(product, index)
                      const isWinner = winner?.id === product.id
                      
                      return (
                        <tr key={product.id} className={`border-b ${isWinner ? 'bg-green-50' : ''}`}>
                          <td className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-16 h-16 bg-muted rounded overflow-hidden">
                                {product.image_url && (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover rounded"
                                    loading="lazy"
                                  />
                                  {product.is_organic && (
                                    <Badge className="absolute top-1 left-1 bg-green-500 text-white text-xs">
                                      Organic
                                    </Badge>
                                  )}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div>
                                  <h4 className="font-semibold text-sm mb-1">{product.name}</h4>
                                  {product.brand && (
                                    <p className="text-xs text-muted-foreground mb-2">{product.brand}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                          <td className="p-4 text-center">
                            <div className="space-y-1">
                              <div>
                                {product.original_price > product.price && (
                                  <>
                                    <span className="text-gray-400 line-through">₹{product.original_price}</span>
                                    <br />
                                  </>
                                )}
                                <span className={`font-bold ${isWinner ? 'text-green-600' : 'text-primary'}`}>
                                  ₹{product.price}
                                </span>
                                {product.original_price > product.price && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    Save ₹{product.original_price - product.price}
                                  </Badge>
                                )}
                              </div>
                            </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center">
                              <div className="flex items-center space-x-2">
                                {[1, 2, 3, 4, 5].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i <= Math.floor(product.average_rating) ? 'fill-yellow-400' : 'fill-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground ml-2">
                                ({product.average_rating || 'N/A'}).toFixed(1)}
                              </span>
                              <div className="text-xs text-muted-foreground">
                                ({product.review_count || 0} reviews)
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center space-x-2">
                              {product.in_stock ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  <Check className="h-3 w-3 mr-1" />
                                  In Stock
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="bg-red-100 text-red-800">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Out of Stock
                                </Badge>
                              )}
                            </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center space-x-2">
                              <span className={`text-lg font-bold ${isWinner ? 'text-green-600' : 'text-gray-600'}`}>
                                {score}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Detailed specifications and features for each product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedProducts.map(product => (
                  <Card key={product.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-20 h-20 bg-muted rounded overflow-hidden">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                          {product.brand && (
                            <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Specifications</h4>
                        {product.specifications && Object.keys(product.specifications).length > 0 ? (
                          <dl className="space-y-2">
                            {Object.entries(product.specifications).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <dt className="font-medium text-sm text-muted-foreground capitalize">
                                  {key.replace(/_/g, ' ')}
                                </dt>
                                <dd className="text-sm">
                                  {Array.isArray(value) ? value.join(', ') : value}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        ) : (
                          <p className="text-sm text-muted-foreground">No specifications available</p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm">{product.description || 'No description available'}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {product.tags?.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          )) || (
                            <span className="text-xs text-muted-foreground">No tags</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addToWishlist(product.id)}
                          className="flex-1"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => addToCart(product.id)}
                          className="flex-1"
                          disabled={!product.in_stock}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Card>
          </Card>
        </>
      )}
    </div>
  )
}

// Helper functions
function addToWishlist(productId: string) {
  console.log('Added to wishlist:', productId)
}

function addToCart(productId: string) {
  console.log('Added to cart:', productId)
}

function getComparisonScore(product: Product, index: number): number {
  let score = 0
  
  // Price score (lower is better)
  const prices = selectedProducts.map(p => p.price)
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length)
  if (product.price < avgPrice) score += 2
  else if (product.price === avgPrice) score += 1

  // Rating score
  score += (product.average_rating || 0) * 2

  // Stock availability
  if (product.in_stock) score += 1

  // Organic bonus
  if (product.is_organic) score += 1

  return score
}

export default ProductComparison