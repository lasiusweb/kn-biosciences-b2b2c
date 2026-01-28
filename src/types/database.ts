export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          role: "customer" | "b2b_client" | "admin" | "staff";
          company_name: string | null;
          gst_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          role?: "customer" | "b2b_client" | "admin" | "staff";
          company_name?: string | null;
          gst_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          role?: "customer" | "b2b_client" | "admin" | "staff";
          company_name?: string | null;
          gst_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          type: "shipping" | "billing";
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "shipping" | "billing";
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state: string;
          postal_code: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "shipping" | "billing";
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
        };
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          parent_id: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          short_description: string | null;
          category_id: string | null;
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
          meta_title: string | null;
          meta_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          short_description?: string | null;
          category_id?: string | null;
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
          status?: "active" | "inactive" | "draft";
          featured?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          short_description?: string | null;
          category_id?: string | null;
          segment?:
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
          status?: "active" | "inactive" | "draft";
          featured?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          sku: string;
          weight: number;
          weight_unit: "g" | "kg" | "ml" | "l";
          packing_type: "box" | "drum" | "bag" | "bottle" | "pouch";
          form: "powder" | "liquid" | "granules" | "tablet" | "capsule";
          price: number;
          compare_price: number | null;
          cost_price: number;
          stock_quantity: number;
          low_stock_threshold: number;
          track_inventory: boolean;
          image_urls: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          sku: string;
          weight: number;
          weight_unit: "g" | "kg" | "ml" | "l";
          packing_type: "box" | "drum" | "bag" | "bottle" | "pouch";
          form: "powder" | "liquid" | "granules" | "tablet" | "capsule";
          price: number;
          compare_price?: number | null;
          cost_price: number;
          stock_quantity?: number;
          low_stock_threshold?: number;
          track_inventory?: boolean;
          image_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          sku?: string;
          weight?: number;
          weight_unit?: "g" | "kg" | "ml" | "l";
          packing_type?: "box" | "drum" | "bag" | "bottle" | "pouch";
          form?: "powder" | "liquid" | "granules" | "tablet" | "capsule";
          price?: number;
          compare_price?: number | null;
          cost_price?: number;
          stock_quantity?: number;
          low_stock_threshold?: number;
          track_inventory?: boolean;
          image_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      product_batches: {
        Row: {
          id: string;
          variant_id: string;
          lot_number: string;
          manufacturing_date: string;
          expiry_date: string;
          quantity: number;
          remaining_quantity: number;
          status: "active" | "expired" | "recalled";
          created_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          lot_number: string;
          manufacturing_date: string;
          expiry_date: string;
          quantity: number;
          remaining_quantity?: number;
          status?: "active" | "expired" | "recalled";
          created_at?: string;
        };
        Update: {
          id?: string;
          variant_id?: string;
          lot_number?: string;
          manufacturing_date?: string;
          expiry_date?: string;
          quantity?: number;
          remaining_quantity?: number;
          status?: "active" | "expired" | "recalled";
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          status:
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled"
            | "refunded";
          payment_status: "pending" | "paid" | "failed" | "refunded";
          payment_method: string | null;
          currency: string;
          subtotal: number;
          tax_amount: number;
          shipping_amount: number;
          discount_amount: number;
          total_amount: number;
          shipping_address: Json;
          billing_address: Json;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id?: string | null;
          status?:
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled"
            | "refunded";
          payment_status?: "pending" | "paid" | "failed" | "refunded";
          payment_method?: string | null;
          currency?: string;
          subtotal: number;
          tax_amount?: number;
          shipping_amount?: number;
          discount_amount?: number;
          total_amount: number;
          shipping_address: Json;
          billing_address: Json;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          status?:
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled"
            | "refunded";
          payment_status?: "pending" | "paid" | "failed" | "refunded";
          payment_method?: string | null;
          currency?: string;
          subtotal?: number;
          tax_amount?: number;
          shipping_amount?: number;
          discount_amount?: number;
          total_amount?: number;
          shipping_address?: Json;
          billing_address?: Json;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      b2b_quotes: {
        Row: {
          id: string;
          user_id: string | null;
          status:
            | "draft"
            | "submitted"
            | "under_review"
            | "approved"
            | "rejected"
            | "expired";
          valid_until: string | null;
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          status?:
            | "draft"
            | "submitted"
            | "under_review"
            | "approved"
            | "rejected"
            | "expired";
          valid_until?: string | null;
          subtotal: number;
          tax_amount?: number;
          total_amount: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          status?:
            | "draft"
            | "submitted"
            | "under_review"
            | "approved"
            | "rejected"
            | "expired";
          valid_until?: string | null;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          variant_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          variant_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          variant_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      carts: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          status: "active" | "abandoned" | "converted";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          status?: "active" | "abandoned" | "converted";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          status?: "active" | "abandoned" | "converted";
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          variant_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          cart_id: string;
          variant_id: string;
          quantity: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          cart_id?: string;
          variant_id?: string;
          quantity?: number;
          created_at?: string;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          type: "percentage" | "fixed_amount";
          value: number;
          minimum_amount: number | null;
          usage_limit: number | null;
          usage_count: number;
          status: "active" | "inactive" | "expired";
          starts_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          type: "percentage" | "fixed_amount";
          value: number;
          minimum_amount?: number | null;
          usage_limit?: number | null;
          usage_count?: number;
          status?: "active" | "inactive" | "expired";
          starts_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          type?: "percentage" | "fixed_amount";
          value?: number;
          minimum_amount?: number | null;
          usage_limit?: number | null;
          usage_count?: number;
          status?: "active" | "inactive" | "expired";
          starts_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
