"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  Clock,
  User,
  Calendar,
  AlertCircle,
  Shield
} from "lucide-react";
import { ProductReview, ReviewFilter, ReviewAggregates } from "@/types/reviews";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface ProductReviewsProps {
  productId: string;
  productSlug: string;
  className?: string;
}

export function ProductReviews({ productId, productSlug, className }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [aggregates, setAggregates] = useState<ReviewAggregates | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReviewFilter>({
    sort_by: 'newest',
    page: 1,
    limit: 10
  });
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [userReview, setUserReview] = useState({
    rating: 0,
    title: '',
    content: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchReviews();
  }, [filter]);

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.rating) params.set('rating', filter.rating.toString());
      if (filter.verified_purchase) params.set('verified', 'true');
      if (filter.sort_by) params.set('sort', filter.sort_by);
      params.set('page', filter.page.toString());
      params.set('limit', filter.limit.toString());

      const response = await fetch(`/api/products/${productSlug}/reviews?${params}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
        setAggregates(data.aggregates);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (rating: number) => {
    setUserReview(prev => ({ ...prev, rating }));
  };

  const handleSubmitReview = async () => {
    if (!user) {
      // Redirect to auth
      window.location.href = `/auth?redirect=/products/${productSlug}`;
      return;
    }

    if (userReview.rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (userReview.content.trim().length < 10) {
      alert('Review must be at least 10 characters');
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch(`/api/products/${productSlug}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userReview),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setShowWriteReview(false);
        setUserReview({ rating: 0, title: '', content: '' });
        fetchReviews(); // Refresh reviews
      } else {
        alert(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });

      if (response.ok) {
        // Update local state
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, helpful_count: review.helpful_count + 1 }
            : review
        ));
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md', interactive = false, onRating?: (rating: number) => void) => {
    const starSizes = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSizes[size],
              interactive && "cursor-pointer transition-colors",
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            )}
            onClick={interactive && onRating ? () => onRating(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!aggregates) return null;

    const total = aggregates.total_reviews;
    const percentages = {
      5: total > 0 ? (aggregates.rating_distribution[5] / total) * 100 : 0,
      4: total > 0 ? (aggregates.rating_distribution[4] / total) * 100 : 0,
      3: total > 0 ? (aggregates.rating_distribution[3] / total) * 100 : 0,
      2: total > 0 ? (aggregates.rating_distribution[2] / total) * 100 : 0,
      1: total > 0 ? (aggregates.rating_distribution[1] / total) * 100 : 0,
    };

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-16">
              <span className="text-sm font-medium">{rating}</span>
              {renderStars(rating, 'sm')}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentages[rating as keyof typeof percentages]}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 w-12 text-right">
              {aggregates.rating_distribution[rating as keyof typeof aggregates.rating_distribution]}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-earth-900 mb-2">Customer Reviews</h2>
          {aggregates && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {renderStars(Math.round(aggregates.average_rating), 'lg')}
                <span className="text-lg font-semibold text-earth-900">
                  {aggregates.average_rating.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-600">
                ({aggregates.total_reviews} reviews)
              </span>
              {aggregates.verified_purchase_reviews > 0 && (
                <Badge className="bg-green-100 text-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  {aggregates.verified_purchase_reviews} Verified
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <Button 
          onClick={() => setShowWriteReview(true)}
          className="bg-organic-500 hover:bg-organic-600"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Write Review
        </Button>
      </div>

      {/* Rating Overview */}
      {aggregates && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Average Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold text-earth-900 mb-2">
                  {aggregates.average_rating.toFixed(1)}
                </div>
                {renderStars(Math.round(aggregates.average_rating), 'lg')}
                <p className="text-gray-600 mt-2">
                  {aggregates.total_reviews} reviews
                </p>
                {aggregates.verified_purchase_reviews > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>{aggregates.verified_purchase_reviews} verified purchases</span>
                  </div>
                )}
              </div>

              {/* Rating Distribution */}
              <div>
                <h3 className="font-semibold text-earth-900 mb-4">Rating Distribution</h3>
                {renderRatingDistribution()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {showFilters && (
                <div className="flex items-center gap-3">
                  <Select
                    value={filter.rating?.toString() || ''}
                    onValueChange={(value) => setFilter(prev => ({ 
                      ...prev, 
                      rating: value ? parseInt(value) : undefined 
                    }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Stars" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filter.sort_by}
                    onValueChange={(value) => setFilter(prev => ({ ...prev, sort_by: value as any }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="rating_high">Highest Rating</SelectItem>
                      <SelectItem value="rating_low">Lowest Rating</SelectItem>
                      <SelectItem value="helpful">Most Helpful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600">
              {reviews.length} reviews
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto text-earth-300 mb-4" />
              <h3 className="text-lg font-medium text-earth-900 mb-2">No reviews yet</h3>
              <p className="text-earth-600 mb-4">Be the first to review this product!</p>
              <Button 
                onClick={() => setShowWriteReview(true)}
                className="bg-organic-500 hover:bg-organic-600"
              >
                Write First Review
              </Button>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 bg-organic-100">
                      <AvatarFallback className="text-organic-600">
                        {review.users?.first_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-earth-900">
                          {review.users?.first_name} {review.users?.last_name}
                        </h4>
                        {review.verified_purchase && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.rating, 'sm')}
                        <span className="text-sm text-gray-600">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.title && (
                        <h5 className="font-semibold text-earth-900 mb-2">{review.title}</h5>
                      )}
                      <p className="text-gray-700 leading-relaxed">{review.content}</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHelpful(review.id)}
                    className="flex items-center gap-1 text-gray-600 hover:text-organic-600"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Helpful ({review.helpful_count})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Write Review Modal */}
      {showWriteReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Rating *</Label>
                <div className="flex items-center gap-2 mt-2">
                  {renderStars(userReview.rating, 'lg', true, handleRatingChange)}
                  <span className="text-sm text-gray-600">
                    {userReview.rating > 0 ? `${userReview.rating} out of 5 stars` : 'Click to rate'}
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Summarize your experience"
                  value={userReview.title}
                  onChange={(e) => setUserReview(prev => ({ ...prev, title: e.target.value }))}
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="content">Review *</Label>
                <Textarea
                  id="content"
                  placeholder="Share your experience with this product..."
                  value={userReview.content}
                  onChange={(e) => setUserReview(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  maxLength={2000}
                />
                <div className="text-sm text-gray-500 mt-1">
                  {userReview.content.length}/2000 characters
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertCircle className="h-4 w-4" />
                <span>Reviews are moderated and may take up to 24 hours to appear.</span>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || userReview.rating === 0 || userReview.content.trim().length < 10}
                  className="bg-organic-500 hover:bg-organic-600"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowWriteReview(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}