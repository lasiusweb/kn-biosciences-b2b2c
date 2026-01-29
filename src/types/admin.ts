import { Database } from './database.ts';
import { Order, ProductBatch, ProductVariant, Product } from './index.ts';

export type TableName = keyof Database['public']['Tables'];

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
