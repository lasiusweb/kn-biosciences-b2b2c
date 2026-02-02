-- Database schema for KN Biosciences E-commerce Platform

-- Users and Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) CHECK (role IN ('customer', 'b2b_client', 'admin', 'staff', 'sales_manager')) DEFAULT 'customer',
  company_name VARCHAR(255),
  gst_number VARCHAR(15),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(10) CHECK (type IN ('shipping', 'billing')) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Categories
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  parent_id UUID REFERENCES product_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  category_id UUID REFERENCES product_categories(id),
  segment VARCHAR(50) CHECK (
    segment IN ('agriculture', 'aquaculture', 'poultry_healthcare', 'animal_healthcare', 
               'bioremediation', 'seeds', 'organic_farming', 'farm_equipment', 'testing_lab', 'oilpalm')
  ) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'draft')) DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Variants
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100) UNIQUE NOT NULL,
  weight DECIMAL(10,3) NOT NULL,
  weight_unit VARCHAR(5) CHECK (weight_unit IN ('g', 'kg', 'ml', 'l')) NOT NULL,
  packing_type VARCHAR(20) CHECK (packing_type IN ('box', 'drum', 'bag', 'bottle', 'pouch')) NOT NULL,
  form VARCHAR(20) CHECK (form IN ('powder', 'liquid', 'granules', 'tablet', 'capsule')) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  cost_price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  track_inventory BOOLEAN DEFAULT true,
  image_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Batches
CREATE TABLE product_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  lot_number VARCHAR(100) NOT NULL,
  manufacturing_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  quantity INTEGER NOT NULL,
  remaining_quantity INTEGER NOT NULL,
  status VARCHAR(20) CHECK (status IN ('active', 'expired', 'recalled')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carts
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  status VARCHAR(20) CHECK (status IN ('active', 'abandoned', 'converted')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Items
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cart_id, variant_id)
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  status VARCHAR(20) CHECK (
    status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
  ) DEFAULT 'pending',
  payment_status VARCHAR(20) CHECK (
    payment_status IN ('pending', 'paid', 'failed', 'refunded')
  ) DEFAULT 'pending',
  payment_method VARCHAR(20) CHECK (
    payment_method IN ('razorpay', 'payu', 'easebuzz', 'bank_transfer', 'cod')
  ),
  currency VARCHAR(3) DEFAULT 'INR',
  subtotal DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  payment_link_url TEXT,
  shipping_type VARCHAR(20) CHECK (shipping_type IN ('COURIER', 'TRANSPORT')),
  shipping_carrier VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  batch_id UUID REFERENCES product_batches(id)
);

-- B2B Quotes
CREATE TABLE b2b_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  status VARCHAR(20) CHECK (
    status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'expired')
  ) DEFAULT 'draft',
  valid_until TIMESTAMP WITH TIME ZONE,
  subtotal DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  linked_order_id UUID REFERENCES orders(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B2B Quote Items
CREATE TABLE b2b_quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES b2b_quotes(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL
);

-- Coupons
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) CHECK (type IN ('percentage', 'fixed_amount')) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  minimum_amount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, variant_id)
);

-- Blog Posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image VARCHAR(500),
  author_id UUID REFERENCES users(id),
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(20) CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zoho Integration
CREATE TABLE zoho_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id VARCHAR(100),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sync_status VARCHAR(20) CHECK (sync_status IN ('pending', 'synced', 'failed')) DEFAULT 'pending',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipments
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  carrier VARCHAR(100) NOT NULL,
  tracking_number VARCHAR(255),
  status VARCHAR(30) CHECK (
    status IN ('label_created', 'in_transit', 'out_for_delivery', 'delivered', 'exception')
  ) DEFAULT 'label_created',
  shipped_at TIMESTAMP WITH TIME ZONE,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_segment ON products(segment);
CREATE INDEX idx_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_b2b_quotes_user_id ON b2b_quotes(user_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_b2b_quotes_updated_at BEFORE UPDATE ON b2b_quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own addresses" ON addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own addresses" ON addresses
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own carts" ON carts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own carts" ON carts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own cart items" ON cart_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM carts WHERE id = cart_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can manage own cart items" ON cart_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM carts WHERE id = cart_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can view own quotes" ON b2b_quotes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own quotes" ON b2b_quotes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quote items" ON b2b_quote_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM b2b_quotes WHERE id = quote_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can manage own wishlist" ON wishlist
    FOR ALL USING (auth.uid() = user_id);

-- Public access policies for products and content
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (status = 'active');

CREATE POLICY "Product variants are viewable by everyone" ON product_variants
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM products WHERE id = product_id AND status = 'active')
    );

CREATE POLICY "Categories are viewable by everyone" ON product_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Blog posts are viewable by everyone" ON blog_posts
    FOR SELECT USING (status = 'published' AND published_at <= NOW());