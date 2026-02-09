import { Star, ThumbsUp, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpfulCount: number;
  verifiedPurchase: boolean;
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export function ProductReviews({ reviews, averageRating, totalReviews, productId }: ProductReviewsProps) {
  const renderStars = (rating: number, size: 'small' | 'medium' = 'medium') => {
    const starSize = size === 'small' ? 'h-4 w-4' : 'h-5 w-5';
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${starSize} ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(r => r.rating === rating).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Customer Reviews
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {renderStars(Math.round(averageRating), 'small')}
              <span className="ml-2 font-bold text-lg">{averageRating.toFixed(1)}</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm text-gray-500">{totalReviews} reviews</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Rating Summary */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
              <div className="ml-2">
                {renderStars(Math.round(averageRating))}
                <p className="text-sm text-gray-500 mt-1">{totalReviews} reviews</p>
              </div>
            </div>

            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm w-10 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="md:col-span-2 space-y-6">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`/avatars/${review.userName.toLowerCase().replace(/\s+/g, '-')}.jpg`} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{review.userName}</h4>
                      {review.verifiedPurchase && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating, 'small')}
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <h5 className="font-medium mt-2">{review.title}</h5>
                    <p className="text-gray-600 mt-2 text-sm">{review.content}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <Button variant="ghost" size="sm" className="text-xs p-0 h-auto text-gray-500 hover:text-gray-700">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Helpful ({review.helpfulCount})
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs p-0 h-auto text-gray-500 hover:text-gray-700">
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full mt-4">
              Load More Reviews
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}