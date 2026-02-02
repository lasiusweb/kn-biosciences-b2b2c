// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: "customer" | "b2b_client" | "vendor" | "admin" | "staff";
  company_name?: string;
  gst_number?: string;
  address?: Address;
  created_at: string;
  updated_at: string;
}

// Vendor types for multi-vendor marketplace
export interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  business_type: "individual" | "company" | "partnership";
  description?: string;
  logo_url?: string;
  banner_url?: string;
  website?: string;
  phone: string;
  email: string;
  address: Address;
  tax_id?: string;
  gst_number?: string;
  commission_rate: number; // Percentage taken by platform
  status: "pending" | "approved" | "rejected" | "suspended";
  approved_at?: string;
  rejection_reason?: string;
  rating_avg?: number;
  review_count?: number;
  total_sales?: number;
  is_featured: boolean;
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface VendorProduct {
  id: string;
  vendor_id: string;
  product_id: string;
  variant_id: string;
  price: number;
  compare_price?: number;
  cost_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  shipping_template_id?: string;
  handling_time: number; // in days
  is_active: boolean;
  sku_override?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorOrder {
  id: string;
  order_id: string;
  vendor_id: string;
  status:
    | "pending"
    | "accepted"
    | "processing"
    | "ready_to_ship"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  subtotal: number;
  commission_amount: number;
  vendor_amount: number;
  shipping_amount: number;
  tracking_number?: string;
  carrier?: string;
  shipped_at?: string;
  delivered_at?: string;
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorOrderItem {
  id: string;
  vendor_order_id: string;
  order_item_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  commission_rate: number;
  commission_amount: number;
  vendor_earnings: number;
}

export interface VendorPayout {
  id: string;
  vendor_id: string;
  period: string; // YYYY-MM format
  total_orders: number;
  total_sales: number;
  total_commission: number;
  total_payout: number;
  status: "pending" | "processing" | "paid" | "failed";
  payout_method: "bank_transfer" | "upi" | "cheque";
  payout_details?: string;
  processed_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorReview {
  id: string;
  vendor_id: string;
  order_id: string;
  user_id: string;
  rating: number; // 1-5 stars
  comment?: string;
  is_verified: boolean;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface ShippingTemplate {
  id: string;
  vendor_id: string;
  name: string;
  description?: string;
  shipping_rules: ShippingRule[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShippingRule {
  id: string;
  min_weight?: number;
  max_weight?: number;
  min_order_value?: number;
  max_order_value?: number;
  pin_codes?: string[];
  states?: string[];
  countries?: string[];
  shipping_cost: number;
  free_shipping_threshold?: number;
  estimated_delivery: number; // in days
}

export interface Address {
  id: string;
  user_id: string;
  type: "shipping" | "billing";
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

// Product types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: string;
  segment:
    | "agriculture"
    | "aquaculture"
    | "poultry_healthcare"
    | "animal_healthcare"
    | "bioremediation"
    | "seeds"
    | "organic_farming"
    | "farm_equipment"
    | "testing_lab"
    | "oilpalm";
  status: "active" | "inactive" | "draft";
  featured: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  weight: number;
  weight_unit: "g" | "kg" | "ml" | "l";
  packing_type: "box" | "drum" | "bag" | "bottle" | "pouch";
  form: "powder" | "liquid" | "granules" | "tablet" | "capsule";
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

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
}

// Batch tracking
export interface ProductBatch {
  id: string;
  variant_id: string;
  lot_number: string;
  manufacturing_date: string;
  expiry_date: string;
  quantity: number;
  remaining_quantity: number;
  status: "active" | "expired" | "recalled";
  created_at: string;
}

// Order types
export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method: "razorpay" | "payu" | "easebuzz" | "bank_transfer" | "cod";
  currency: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  shipping_address: Address;
  billing_address: Address;
  shipping_type?: LogisticsType;
  shipping_carrier?: string;
  user?: User;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  batch_id?: string;
}

// B2B specific types
export interface B2BQuote {
  id: string;
  user_id: string;
  status:
    | "draft"
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected"
    | "expired";
  valid_until: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface B2BQuoteItem {
  id: string;
  quote_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Cart types
export interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  status: "active" | "abandoned" | "converted";
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  added_at: string;
}

// Marketing types
export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed_amount";
  value: number;
  minimum_amount?: number;
  usage_limit?: number;
  used_count: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface Wishlist {
  id: string;
  user_id: string;
  variant_id: string;
  added_at: string;
}

// Content types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  author_id: string;
  category: string;
  tags: string[];
  status: "draft" | "published";
  published_at: string;
  created_at: string;
  updated_at: string;
}

// Integration types
export interface ZohoContact {
  id: string;
  contact_id: string;
  user_id: string;
  sync_status: "pending" | "synced" | "failed";
  last_sync_at: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  carrier: string;
  tracking_number: string;
  status:
    | "label_created"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "exception";
  shipped_at: string;
  estimated_delivery: string;
  delivered_at?: string;
}
// Logistics and Shipping types
export type LogisticsType = "COURIER" | "TRANSPORT";

export interface ShippingRate {
  type: LogisticsType;
  carrier_name: string;
  cost: number;
  handling_fee: number;
  estimated_delivery_days?: number;
  is_serviceable: boolean;
  description?: string;
}

export const TRANSPORT_CARRIERS = [
  "Navata",
  "Kranthi",
  "VRL Logistics",
  "TCI Freight",
  "TSRTC",
  "APSRTC",
] as const;

export type TransportCarrier = (typeof TRANSPORT_CARRIERS)[number];
