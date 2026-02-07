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
          role: "customer" | "b2b_client" | "admin" | "staff" | "sales_manager";
          company_name: string | null;
          gst_number: string | null;
          zoho_crm_id: string | null;
          zoho_books_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          role?: "customer" | "b2b_client" | "admin" | "staff" | "sales_manager";
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
          role?: "customer" | "b2b_client" | "admin" | "staff" | "sales_manager";
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
          zoho_crm_id: string | null;
          zoho_books_id: string | null;
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
          payment_link_url: string | null;
          shipping_type: "COURIER" | "TRANSPORT" | null;
          shipping_carrier: string | null;
          notes: string | null;
          zoho_crm_id: string | null;
          zoho_books_id: string | null;
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
          payment_link_url?: string | null;
          shipping_type?: "COURIER" | "TRANSPORT" | null;
          shipping_carrier?: string | null;
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
          payment_link_url?: string | null;
          shipping_type?: "COURIER" | "TRANSPORT" | null;
          shipping_carrier?: string | null;
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
          linked_order_id: string | null;
          notes: string | null;
          zoho_crm_id: string | null;
          zoho_books_id: string | null;
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
          linked_order_id?: string | null;
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
          linked_order_id?: string | null;
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
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          variant_id: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          variant_id: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          variant_id?: string;
          added_at?: string;
        };
      };
      legal_content: {
        Row: {
          id: string;
          slug: string;
          title: string;
          content: string;
          version: string;
          last_updated: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          content: string;
          version?: string;
          last_updated?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          content?: string;
          version?: string;
          last_updated?: string;
          created_at?: string;
        };
      };
      faqs: {
        Row: {
          id: string;
          category: string;
          question: string;
          answer: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          question: string;
          answer: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          question?: string;
          answer?: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          featured_image: string | null;
          author_id: string | null;
          category: string | null;
          tags: string[] | null;
          status: "draft" | "published";
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content: string;
          featured_image?: string | null;
          author_id?: string | null;
          category?: string | null;
          tags?: string[] | null;
          status?: "draft" | "published";
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string;
          featured_image?: string | null;
          author_id?: string | null;
          category?: string | null;
          tags?: string[] | null;
          status?: "draft" | "published";
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
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
          used_count: number;
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
          used_count?: number;
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
          used_count?: number;
          status?: "active" | "inactive" | "expired";
          starts_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          order_item_id: string | null;
          rating: number;
          title: string | null;
          content: string;
          helpful_count: number;
          verified_purchase: boolean;
          status: "pending" | "approved" | "rejected";
          admin_response: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          order_item_id?: string | null;
          rating: number;
          title?: string | null;
          content: string;
          helpful_count?: number;
          verified_purchase?: boolean;
          status?: "pending" | "approved" | "rejected";
          admin_response?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string;
          order_item_id?: string | null;
          rating?: number;
          title?: string | null;
          content?: string;
          helpful_count?: number;
          verified_purchase?: boolean;
          status?: "pending" | "approved" | "rejected";
          admin_response?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          status: "new" | "processed" | "spam";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          status?: "new" | "processed" | "spam";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          subject?: string;
          message?: string;
          status?: "new" | "processed" | "spam";
          created_at?: string;
          updated_at?: string;
        };
      };
      shipping_pickups: {
        Row: {
          id: string;
          pickup_id: string;
          pickup_date: string;
          pickup_time: string;
          pickup_location: Json;
          expected_package_count: number;
          status: "scheduled" | "confirmed" | "picked_up" | "cancelled";
          remark: string | null;
          order_ids: string[] | null;
          response_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pickup_id: string;
          pickup_date: string;
          pickup_time: string;
          pickup_location?: Json;
          expected_package_count: number;
          status?: "scheduled" | "confirmed" | "picked_up" | "cancelled";
          remark?: string | null;
          order_ids?: string[] | null;
          response_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pickup_id?: string;
          pickup_date?: string;
          pickup_time?: string;
          pickup_location?: Json;
          expected_package_count?: number;
          status?: "scheduled" | "confirmed" | "picked_up" | "cancelled";
          remark?: string | null;
          order_ids?: string[] | null;
          response_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_interactions: {
        Row: {
          id: string;
          user_id: string;
          interaction_type: string;
          product_id: string;
          rating: number | null;
          session_id: string;
          created_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          interaction_type: string;
          product_id: string;
          rating?: number | null;
          session_id?: string;
          created_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          interaction_type?: string;
          product_id?: string;
          rating?: number | null;
          session_id?: string;
          created_at?: string;
          metadata?: Json;
        };
      };
      recommendation_logs: {
        Row: {
          id: string;
          user_id: string;
          context: Json;
          recommendations: Json;
          algorithm_used: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          context: Json;
          recommendations: Json;
          algorithm_used?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          context?: Json;
          recommendations?: Json;
          algorithm_used?: string | null;
          created_at?: string;
        };
      };
      recommendation_analytics: {
        Row: {
          id: string;
          request_context: Json;
          recommendation_count: number;
          algorithm_used: string | null;
          processing_time_ms: number | null;
          user_id: string | null;
          session_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_context: Json;
          recommendation_count: number;
          algorithm_used?: string | null;
          processing_time_ms?: number | null;
          user_id?: string | null;
          session_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_context?: Json;
          recommendation_count?: number;
          algorithm_used?: string | null;
          processing_time_ms?: number | null;
          user_id?: string | null;
          session_id?: string | null;
          created_at?: string;
        };
      };
      search_analytics: {
        Row: {
          id: string;
          query: string;
          filters: Json;
          result_count: number;
          user_agent: string | null;
          ip_address: string | null;
          user_id: string | null;
          session_id: string | null;
          click_position: number | null;
          selected_result: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          query: string;
          filters?: Json;
          result_count: number;
          user_agent?: string | null;
          ip_address?: string | null;
          user_id?: string | null;
          session_id?: string | null;
          click_position?: number | null;
          selected_result?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          query?: string;
          filters?: Json;
          result_count?: number;
          user_agent?: string | null;
          ip_address?: string | null;
          user_id?: string | null;
          session_id?: string | null;
          click_position?: number | null;
          selected_result?: Json;
          created_at?: string;
        };
      };
      product_analytics: {
        Row: {
          id: string;
          product_slug: string;
          event_type: string;
          data: Json;
          user_id: string | null;
          session_id: string | null;
          timestamp: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          product_slug: string;
          event_type: string;
          data?: Json;
          user_id?: string | null;
          session_id?: string | null;
          timestamp?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          product_slug?: string;
          event_type?: string;
          data?: Json;
          user_id?: string | null;
          session_id?: string | null;
          timestamp?: string;
          metadata?: Json;
        };
      };
      page_views: {
        Row: {
          id: string;
          page: string;
          title: string | null;
          referrer: string | null;
          user_agent: string | null;
          user_id: string | null;
          session_id: string | null;
          timestamp: string;
          load_time: number | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          page: string;
          title?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
          session_id?: string | null;
          timestamp?: string;
          load_time?: number | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          page?: string;
          title?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
          session_id?: string | null;
          timestamp?: string;
          load_time?: number | null;
          metadata?: Json;
        };
      };
      product_interactions: {
        Row: {
          id: string;
          product_id: string;
          interaction_type: string;
          value: number | null;
          user_id: string | null;
          session_id: string | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          interaction_type: string;
          value?: number | null;
          user_id?: string | null;
          session_id?: string | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          interaction_type?: string;
          value?: number | null;
          user_id?: string | null;
          session_id?: string | null;
          timestamp?: string;
        };
      };
      conversions: {
        Row: {
          id: string;
          event_type: string;
          value: number | null;
          currency: string;
          user_id: string | null;
          session_id: string | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          value?: number | null;
          currency?: string;
          user_id?: string | null;
          session_id?: string | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          value?: number | null;
          currency?: string;
          user_id?: string | null;
          session_id?: string | null;
          timestamp?: string;
        };
      };
      zoho_tokens: {
        Row: {
          id: string;
          access_token: string;
          refresh_token: string;
          expires_at: string;
          scope: string;
          token_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          access_token: string;
          refresh_token: string;
          expires_at: string;
          scope: string;
          token_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          access_token?: string;
          refresh_token?: string;
          expires_at?: string;
          scope?: string;
          token_type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      zoho_sync_logs: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          operation: string;
          zoho_service: string;
          zoho_entity_type: string;
          zoho_entity_id: string | null;
          status: string;
          attempt_count: number;
          max_attempts: number;
          next_retry_at: string | null;
          error_message: string | null;
          error_details: Json | null;
          request_payload: Json | null;
          response_payload: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entity_type: string;
          entity_id: string;
          operation: string;
          zoho_service: string;
          zoho_entity_type: string;
          zoho_entity_id?: string | null;
          status: string;
          attempt_count?: number;
          max_attempts?: number;
          next_retry_at?: string | null;
          error_message?: string | null;
          error_details?: Json | null;
          request_payload?: Json | null;
          response_payload?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: string;
          entity_id?: string;
          operation?: string;
          zoho_service?: string;
          zoho_entity_type?: string;
          zoho_entity_id?: string | null;
          status?: string;
          attempt_count?: number;
          max_attempts?: number;
          next_retry_at?: string | null;
          error_message?: string | null;
          error_details?: Json | null;
          request_payload?: Json | null;
          response_payload?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      zoho_inventory_sync_logs: {
        Row: {
          id: string;
          variant_id: string;
          operation: string;
          supabase_quantity: number;
          zoho_quantity: number;
          difference: number;
          status: string;
          error_message: string | null;
          sync_timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          operation: string;
          supabase_quantity: number;
          zoho_quantity: number;
          status: string;
          error_message?: string | null;
          sync_timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          variant_id?: string;
          operation?: string;
          supabase_quantity?: number;
          zoho_quantity?: number;
          status?: string;
          error_message?: string | null;
          sync_timestamp?: string;
          created_at?: string;
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