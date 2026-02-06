// Product Review types
export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  order_item_id?: string; // Link to verified purchase
  rating: number; // 1-5 stars
  title?: string;
  content: string;
  helpful_count: number;
  verified_purchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewAggregates {
  product_id: string;
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verified_purchase_reviews: number;
  average_rating_verified: number;
  recent_reviews: ProductReview[];
}

export interface ReviewFilter {
  rating?: number;
  verified_purchase?: boolean;
  has_images?: boolean;
  sort_by?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
  page?: number;
  limit?: number;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  verified_purchase_percentage: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recent_reviews: ProductReview[];
}