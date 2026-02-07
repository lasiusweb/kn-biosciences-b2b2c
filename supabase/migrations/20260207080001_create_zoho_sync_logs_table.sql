-- Create Zoho sync logs table for tracking integration status
-- Migration for Zoho Ecosystem Integration

CREATE TABLE zoho_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('user', 'product', 'order', 'b2b_quote', 'inventory')),
  entity_id UUID NOT NULL,
  operation VARCHAR(50) NOT NULL CHECK (operation IN ('create', 'update', 'delete', 'sync_pull')),
  zoho_service VARCHAR(20) NOT NULL CHECK (zoho_service IN ('crm', 'books')),
  zoho_entity_type VARCHAR(50) NOT NULL, -- Contact, Deal, Product, Invoice, etc.
  zoho_entity_id VARCHAR(50),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  error_details JSONB,
  request_payload JSONB,
  response_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_zoho_sync_logs_entity ON zoho_sync_logs(entity_type, entity_id);
CREATE INDEX idx_zoho_sync_logs_status ON zoho_sync_logs(status);
CREATE INDEX idx_zoho_sync_logs_service ON zoho_sync_logs(zoho_service);
CREATE INDEX idx_zoho_sync_logs_next_retry ON zoho_sync_logs(next_retry_at) WHERE status = 'retrying';
CREATE INDEX idx_zoho_sync_logs_created_at ON zoho_sync_logs(created_at);

-- Add comments for documentation
COMMENT ON TABLE zoho_sync_logs IS 'Tracks all Zoho integration sync operations with status, retries, and error details';
COMMENT ON COLUMN zoho_sync_logs.entity_type IS 'Type of entity being synced (user, product, order, etc.)';
COMMENT ON COLUMN zoho_sync_logs.entity_id IS 'UUID of the entity in our database';
COMMENT ON COLUMN zoho_sync_logs.operation IS 'Type of operation performed (create, update, delete, sync_pull)';
COMMENT ON COLUMN zoho_sync_logs.zoho_service IS 'Zoho service targeted (crm or books)';
COMMENT ON COLUMN zoho_sync_logs.zoho_entity_type IS 'Type of entity in Zoho (Contact, Invoice, etc.)';
COMMENT ON COLUMN zoho_sync_logs.zoho_entity_id IS 'ID of the entity in Zoho';
COMMENT ON COLUMN zoho_sync_logs.status IS 'Current status of the sync operation';
COMMENT ON COLUMN zoho_sync_logs.attempt_count IS 'Number of retry attempts made';
COMMENT ON COLUMN zoho_sync_logs.max_attempts IS 'Maximum retry attempts allowed';
COMMENT ON COLUMN zoho_sync_logs.next_retry_at IS 'When to retry the operation (for failed operations)';
COMMENT ON COLUMN zoho_sync_logs.error_message IS 'Human-readable error message';
COMMENT ON COLUMN zoho_sync_logs.error_details IS 'Detailed error information in JSON format';
COMMENT ON COLUMN zoho_sync_logs.request_payload IS 'The payload sent to Zoho API';
COMMENT ON COLUMN zoho_sync_logs.response_payload IS 'The response received from Zoho API';

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_zoho_sync_logs_updated_at 
    BEFORE UPDATE ON zoho_sync_logs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();