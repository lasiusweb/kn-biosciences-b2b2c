import { Database } from './database';
import { Order, ProductBatch, ProductVariant, Product, BlogPost } from './index';

export type TableName = keyof Database['public']['Tables'];

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: "customer" | "b2b_client" | "vendor" | "admin" | "staff";
  status: "active" | "suspended" | "pending";
  company_name?: string;
  created_at: string;
  last_sign_in_at?: string;
  totalOrders?: number;
  totalQuotes?: number;
  totalSpent?: number;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminAnalytics {
  revenue: {
    period: string;
    amount: number;
  }[];
  topProducts: {
    id: string;
    name: string;
    salesCount: number;
    revenue: number;
  }[];
  customerDistribution: {
    type: 'B2B' | 'B2C';
    count: number;
  }[];
  stockTurnover: {
    productId: string;
    productName: string;
    rate: number;
  }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  batch: string;
  expiry: string;
}

export interface ContentPage {
  slug: string;
  title: string;
  content: string;
  metadata: SEOMetadata;
  last_updated: string;
}

export interface BulkImportResult {
  success: boolean;
  importedCount: number;
  errors: {
    row: number;
    message: string;
  }[];
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export interface CouponConfig {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
}
