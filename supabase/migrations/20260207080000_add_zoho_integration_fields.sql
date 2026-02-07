-- Add Zoho integration fields to existing tables
-- Migration for Zoho Ecosystem Integration

-- Add Zoho CRM and Books IDs to users table
ALTER TABLE users 
ADD COLUMN zoho_crm_id VARCHAR(50),
ADD COLUMN zoho_books_id VARCHAR(50);

-- Add Zoho CRM and Books IDs to products table  
ALTER TABLE products
ADD COLUMN zoho_crm_id VARCHAR(50),
ADD COLUMN zoho_books_id VARCHAR(50);

-- Add Zoho CRM and Books IDs to orders table
ALTER TABLE orders
ADD COLUMN zoho_crm_id VARCHAR(50),
ADD COLUMN zoho_books_id VARCHAR(50);

-- Add Zoho CRM and Books IDs to b2b_quotes table
ALTER TABLE b2b_quotes
ADD COLUMN zoho_crm_id VARCHAR(50),
ADD COLUMN zoho_books_id VARCHAR(50);

-- Create indexes for Zoho ID lookups
CREATE INDEX idx_users_zoho_crm_id ON users(zoho_crm_id);
CREATE INDEX idx_users_zoho_books_id ON users(zoho_books_id);
CREATE INDEX idx_products_zoho_crm_id ON products(zoho_crm_id);
CREATE INDEX idx_products_zoho_books_id ON products(zoho_books_id);
CREATE INDEX idx_orders_zoho_crm_id ON orders(zoho_crm_id);
CREATE INDEX idx_orders_zoho_books_id ON orders(zoho_books_id);
CREATE INDEX idx_b2b_quotes_zoho_crm_id ON b2b_quotes(zoho_crm_id);
CREATE INDEX idx_b2b_quotes_zoho_books_id ON b2b_quotes(zoho_books_id);

-- Add comments for documentation
COMMENT ON COLUMN users.zoho_crm_id IS 'Zoho CRM Contact ID for user synchronization';
COMMENT ON COLUMN users.zoho_books_id IS 'Zoho Books Contact ID for financial synchronization';
COMMENT ON COLUMN products.zoho_crm_id IS 'Zoho CRM Product ID for synchronization';
COMMENT ON COLUMN products.zoho_books_id IS 'Zoho Books Item ID for inventory synchronization';
COMMENT ON COLUMN orders.zoho_crm_id IS 'Zoho CRM Sales Order ID for synchronization';
COMMENT ON COLUMN orders.zoho_books_id IS 'Zoho Books Invoice ID for financial synchronization';
COMMENT ON COLUMN b2b_quotes.zoho_crm_id IS 'Zoho CRM Quote ID for synchronization';
COMMENT ON COLUMN b2b_quotes.zoho_books_id IS 'Zoho Books Estimate ID for synchronization';