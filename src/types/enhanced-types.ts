// Enhanced Product Types
export interface EnhancedProduct extends Product {
  specifications?: ProductSpecifications;
  application_guides?: ProductApplicationGuide[];
  usage_videos?: ProductVideo[];
  related_products?: Product[];
  cross_sell_suggestions?: Product[];
  inventory_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  stock_quantity?: number;
  low_stock_threshold?: number;
  reviews?: ProductReview[];
  average_rating?: number;
  review_count?: number;
  is_wishlisted?: boolean;
  subscription_options?: SubscriptionOption[];
  variant_selection?: ProductVariantSelection;
}

export interface ProductSpecifications {
  weight: string;
  dimensions: string;
  form: string;
  packing_type: string;
  shelf_life: string;
  ingredients: string[];
  benefits: string[];
  application_guides: ApplicationGuide[];
}

export interface ApplicationGuide {
  crop: string;
  dosage: string;
  timing: string;
  method: string;
}

export interface ProductApplicationGuide {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
}

export interface ProductVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail_url: string;
  duration: string;
  created_at: string;
}

export interface ProductReview {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string;
  content: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  user: {
    name: string;
    avatar_url?: string;
  };
}

export interface SubscriptionOption {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  billing_cycle: 'weekly' | 'bi-weekly' | 'monthly' | 'bi-monthly' | 'quarterly';
  billing_interval: number;
  trial_period_days?: number;
}

export interface ProductVariantSelection {
  id: string;
  product_id: string;
  sku: string;
  weight: number;
  weight_unit: string;
  packing_type: string;
  form: string;
  price: number;
  compare_price?: number;
  cost_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

// Search and Filtering Types
export interface SearchFilters {
  segment?: string;
  cropId?: string;
  problemId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  category?: string;
  rating?: number;
  availability?: 'in_stock' | 'pre_order' | 'out_of_stock';
  brand?: string;
  form?: string;
  packingType?: string;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'price' | 'created_at' | 'featured' | 'popularity' | 'rating';
  sortOrder?: 'asc' | 'desc';
  includeVariants?: boolean;
}

export interface SearchResult {
  products: EnhancedProduct[];
  totalCount: number;
  hasMore: boolean;
  facets: SearchFacets;
}

export interface SearchFacets {
  segments: { segment: string; count: number }[];
  categories: { category: string; count: number }[];
  priceRanges: { range: string; count: number }[];
  crops: { crop: string; count: number }[];
  ratings: { rating: number; count: number }[];
  brands: { brand: string; count: number }[];
  forms: { form: string; count: number }[];
  packingTypes: { packing_type: string; count: number }[];
}

// User Account Types
export interface UserAccountDashboard {
  id: string;
  user_id: string;
  personal_info: PersonalInfo;
  order_history: OrderHistory;
  wish_list: WishListItem[];
  subscription_preferences: SubscriptionPreferences;
  loyalty_program: LoyaltyProgramInfo;
  security_settings: SecuritySettings;
  usage_history: UsageHistory;
  purchase_patterns: PurchasePatterns;
}

export interface PersonalInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name?: string;
  gst_number?: string;
  addresses: Address[];
}

export interface OrderHistory {
  orders: Order[];
  recent_orders: Order[];
  reorder_eligible_orders: Order[];
  total_orders: number;
  total_spent: number;
  last_order_date: string;
}

export interface WishListItem {
  id: string;
  user_id: string;
  variant_id: string;
  added_at: string;
  product: Product;
  variant: ProductVariant;
}

export interface SubscriptionPreferences {
  auto_renew: boolean;
  preferred_shipping_method: string;
  notification_preferences: NotificationPreferences;
  regular_orders: RegularOrder[];
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  order_updates: boolean;
  promotional: boolean;
}

export interface RegularOrder {
  id: string;
  name: string;
  items: OrderItem[];
  schedule: {
    frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'bi-monthly' | 'quarterly';
    interval: number;
    next_order_date: string;
  };
  status: 'active' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface LoyaltyProgramInfo {
  points_balance: number;
  tier: string;
  tier_progress: number;
  tier_benefits: string[];
  total_points_earned: number;
  total_points_redeemed: number;
  next_tier?: {
    name: string;
    points_needed: number;
    benefits: string[];
  };
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  login_alerts: boolean;
  password_reset_required: boolean;
  last_password_change: string | null;
  suspicious_activity_detected: boolean;
  trusted_devices: TrustedDevice[];
  login_history: LoginHistoryEntry[];
}

export interface TrustedDevice {
  id: string;
  device_name: string;
  browser: string;
  os: string;
  last_accessed: string;
  ip_address: string;
  is_trusted: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  location: string | null;
}

export interface UsageHistory {
  viewed_products: ViewedProduct[];
  cart_additions: CartAddition[];
  purchase_frequency: PurchaseFrequency[];
  seasonal_patterns: SeasonalPattern[];
  preferred_categories: PreferredCategory[];
  preferred_segments: PreferredSegment[];
}

export interface ViewedProduct {
  id: string;
  name: string;
  last_viewed: string;
  view_count: number;
}

export interface CartAddition {
  id: string;
  name: string;
  added_to_cart_count: number;
  last_added: string;
}

export interface PurchaseFrequency {
  product_id: string;
  product_name: string;
  total_purchases: number;
  total_quantity: number;
  total_spent: number;
  first_purchase: string;
  last_purchase: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'occasional';
  average_interval_days: number;
}

export interface SeasonalPattern {
  month: string;
  total_spent: number;
  order_count: number;
}

export interface PreferredCategory {
  category_id: string;
  category_name: string;
  purchase_count: number;
  total_spent: number;
}

export interface PreferredSegment {
  segment: string;
  purchase_count: number;
  total_spent: number;
}

export interface PurchasePatterns {
  most_frequent_products: Product[];
  seasonal_trends: SeasonalPattern[];
  preferred_categories: PreferredCategory[];
  preferred_segments: PreferredSegment[];
  average_order_value: number;
  purchase_frequency: string;
}

// Cart & Checkout Types
export interface EnhancedCart {
  id: string;
  user_id?: string;
  session_id?: string;
  items: EnhancedCartItem[];
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  status: 'active' | 'abandoned' | 'converted';
  created_at: string;
  updated_at: string;
  guest_checkout: boolean;
  express_checkout: boolean;
  saved_for_later: boolean;
}

export interface EnhancedCartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: Product;
  variant: ProductVariant;
  added_at: string;
}

export interface CheckoutProcess {
  step: 'cart' | 'shipping' | 'payment' | 'review' | 'confirmation';
  shipping_address: Address;
  billing_address: Address;
  shipping_method: ShippingMethod;
  payment_method: PaymentMethod;
  order_summary: OrderSummary;
  progress: number;
  guest_checkout: boolean;
  express_checkout: boolean;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimated_delivery_days: number;
  is_selected: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  processor: string;
  is_selected: boolean;
  is_default: boolean;
}

export interface OrderSummary {
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  items_count: number;
  savings?: number;
}

// Admin Dashboard Types
export interface AdminDashboardData {
  sales_overview: SalesOverview;
  inventory_status: InventoryStatus;
  customer_insights: CustomerInsights;
  product_performance: ProductPerformance;
  marketing_metrics: MarketingMetrics;
  system_health: SystemHealth;
}

export interface SalesOverview {
  total_sales: number;
  sales_growth: number;
  average_order_value: number;
  conversion_rate: number;
  orders_today: number;
  revenue_today: number;
}

export interface InventoryStatus {
  low_stock_items: number;
  out_of_stock_items: number;
  total_products: number;
  inventory_value: number;
  top_selling_products: Product[];
}

export interface CustomerInsights {
  total_customers: number;
  new_customers_today: number;
  repeat_customers: number;
  customer_growth_rate: number;
  top_customer_segments: CustomerSegment[];
  customer_retention_rate: number;
}

export interface ProductPerformance {
  top_selling_products: Product[];
  best_rated_products: Product[];
  worst_rated_products: Product[];
  products_needing_attention: Product[];
  seasonal_trends: SeasonalTrend[];
}

export interface MarketingMetrics {
  total_visitors: number;
  unique_visitors: number;
  bounce_rate: number;
  average_session_duration: number;
  top_search_terms: string[];
  conversion_by_source: ConversionBySource[];
}

export interface SystemHealth {
  uptime: number;
  response_time: number;
  error_rate: number;
  database_connections: number;
  cache_hit_rate: number;
  server_load: number;
}

// Knowledge Center Types
export interface KnowledgeCenterArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id: string;
  tags: string[];
  author_id: string;
  featured_image: string;
  published_at: string;
  updated_at: string;
  status: 'draft' | 'published' | 'archived';
  read_time: number;
  view_count: number;
  likes_count: number;
  shares_count: number;
  is_featured: boolean;
  related_articles: KnowledgeCenterArticle[];
}

export interface KnowledgeCenterCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  article_count: number;
  is_active: boolean;
  sort_order: number;
}

export interface KnowledgeCenterResource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide' | 'tool' | 'calculator';
  url: string;
  thumbnail_url?: string;
  duration?: string;
  category_id: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Loyalty Program Types
export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  points_per_rupee: number;
  points_expiry_days: number;
  minimum_points_to_redeem: number;
  redemption_value_per_point: number;
  bonus_point_events: BonusPointEvent[];
  created_at: string;
  updated_at: string;
}

export interface BonusPointEvent {
  id: string;
  name: string;
  description: string;
  points: number;
  conditions: Record<string, any>;
  is_active: boolean;
}

export interface UserLoyaltyProfile {
  id: string;
  user_id: string;
  program_id: string;
  points_balance: number;
  tier: string;
  tier_points: number;
  total_points_earned: number;
  total_points_redeemed: number;
  last_activity_date: string;
  enrolled_at: string;
  next_tier_progress?: {
    tier: string;
    points_needed: number;
    progress_percentage: number;
  };
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  program_id: string;
  transaction_type: 'earn' | 'redeem' | 'bonus' | 'expiry';
  points: number;
  balance_after: number;
  reference_id?: string;
  description: string;
  created_at: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  image?: string;
  category: string;
  is_active: boolean;
  available_quantity?: number;
  start_date?: string;
  end_date?: string;
}