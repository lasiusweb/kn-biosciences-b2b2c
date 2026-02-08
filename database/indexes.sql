-- Database indexes for improved search performance
-- These should be added to the schema to optimize search queries

-- Indexes for product search
CREATE INDEX CONCURRENTLY idx_products_name_gin_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX CONCURRENTLY idx_products_description_gin_trgm ON products USING gin (description gin_trgm_ops);
CREATE INDEX CONCURRENTLY idx_products_short_desc_gin_trgm ON products USING gin (short_description gin_trgm_ops);
CREATE INDEX CONCURRENTLY idx_products_segment ON products (segment);
CREATE INDEX CONCURRENTLY idx_products_category ON products (category_id);
CREATE INDEX CONCURRENTLY idx_products_status ON products (status);
CREATE INDEX CONCURRENTLY idx_products_featured ON products (featured);

-- Indexes for product variants (for price filtering)
CREATE INDEX CONCURRENTLY idx_product_variants_price ON product_variants (price);
CREATE INDEX CONCURRENTLY idx_product_variants_stock ON product_variants (stock_quantity);
CREATE INDEX CONCURRENTLY idx_product_variants_product_id ON product_variants (product_id);

-- Composite indexes for common search/filter combinations
CREATE INDEX CONCURRENTLY idx_products_status_segment ON products (status, segment);
CREATE INDEX CONCURRENTLY idx_products_status_category ON products (status, category_id);
CREATE INDEX CONCURRENTLY idx_products_status_featured ON products (status, featured);

-- Index for crop and problem IDs if they exist as arrays
-- CREATE INDEX CONCURRENTLY idx_products_crop_ids ON products USING gin (crop_ids);
-- CREATE INDEX CONCURRENTLY idx_products_problem_ids ON products USING gin (problem_ids);

-- Indexes for full-text search
CREATE INDEX CONCURRENTLY idx_products_fulltext ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(short_description, '') || ' ' || COALESCE(description, '')));

-- Indexes for common ordering patterns
CREATE INDEX CONCURRENTLY idx_products_created_at ON products (created_at DESC);
CREATE INDEX CONCURRENTLY idx_products_name_asc ON products (name ASC);
CREATE INDEX CONCURRENTLY idx_products_name_desc ON products (name DESC);

-- Indexes for the search analytics table
CREATE INDEX CONCURRENTLY idx_search_analytics_query ON search_analytics (query);
CREATE INDEX CONCURRENTLY idx_search_analytics_created_at ON search_analytics (created_at DESC);
CREATE INDEX CONCURRENTLY idx_search_analytics_user_id ON search_analytics (user_id);