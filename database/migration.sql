-- KN Biosciences E-commerce Platform - Complete Database Migration
-- This file contains all the missing tables that need to be added to the database

-- Contact Submissions (for contact form)
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) CHECK (status IN ('new', 'processed', 'spam')) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legal Content (for legal pages like terms, privacy, etc.)
CREATE TABLE IF NOT EXISTS legal_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  version VARCHAR(20) DEFAULT '1.0',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQs (for frequently asked questions)
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipping Pickups (for pickup scheduling)
CREATE TABLE IF NOT EXISTS shipping_pickups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_id VARCHAR(100) UNIQUE NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  pickup_location JSONB NOT NULL,
  expected_package_count INTEGER NOT NULL,
  status VARCHAR(20) CHECK (status IN ('scheduled', 'confirmed', 'picked_up', 'cancelled')) DEFAULT 'scheduled',
  remark TEXT,
  order_ids UUID[] DEFAULT '{}',
  response_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Interactions (for recommendation engine)
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Recommendation Logs (for recommendation tracking)
CREATE TABLE IF NOT EXISTS recommendation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  context JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  algorithm_used VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendation Analytics (for recommendation analytics)
CREATE TABLE IF NOT EXISTS recommendation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_context JSONB NOT NULL,
  recommendation_count INTEGER NOT NULL,
  algorithm_used VARCHAR(50),
  processing_time_ms INTEGER,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search Analytics (for search tracking)
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  result_count INTEGER NOT NULL,
  user_agent TEXT,
  ip_address INET,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  click_position INTEGER,
  selected_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Analytics (for product interaction tracking)
CREATE TABLE IF NOT EXISTS product_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  data JSONB DEFAULT '{}',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Page Views (for page view analytics)
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  referrer TEXT,
  user_agent TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  load_time INTEGER,
  metadata JSONB DEFAULT '{}'
);

-- Product Interactions (for product-specific interactions)
CREATE TABLE IF NOT EXISTS product_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL,
  value DECIMAL(10,2),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversions (for conversion tracking)
CREATE TABLE IF NOT EXISTS conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  value DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'INR',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_is_active ON faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_pickups_status ON shipping_pickups(status);
CREATE INDEX IF NOT EXISTS idx_shipping_pickups_pickup_date ON shipping_pickups(pickup_date);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_product_id ON user_interactions(product_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_logs_user_id ON recommendation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_analytics_user_id ON recommendation_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_user_id ON search_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at ON search_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_product_analytics_product_slug ON product_analytics(product_slug);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_product_interactions_product_id ON product_interactions(product_id);
CREATE INDEX IF NOT EXISTS idx_product_interactions_created_at ON product_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_conversions_user_id ON conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversions_created_at ON conversions(created_at);

-- Triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for new tables
CREATE TRIGGER IF NOT EXISTS update_contact_submissions_updated_at 
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_legal_content_updated_at 
    BEFORE UPDATE ON legal_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_faqs_updated_at 
    BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_shipping_pickups_updated_at 
    BEFORE UPDATE ON shipping_pickups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migration completed successfully
SELECT 'Database migration completed successfully!' as status;