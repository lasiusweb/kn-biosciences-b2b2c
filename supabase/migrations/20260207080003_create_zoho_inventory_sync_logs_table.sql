-- Create zoho_inventory_sync_logs table for tracking inventory synchronization
-- Migration for Zoho Ecosystem Integration

CREATE TABLE zoho_inventory_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  operation VARCHAR(50) NOT NULL CHECK (operation IN ('push_to_zoho', 'pull_from_zoho')),
  supabase_quantity INTEGER NOT NULL,
  zoho_quantity INTEGER NOT NULL,
  difference INTEGER GENERATED ALWAYS AS (zoho_quantity - supabase_quantity) STORED,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  error_message TEXT,
  sync_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_zoho_inventory_sync_logs_variant ON zoho_inventory_sync_logs(variant_id);
CREATE INDEX idx_zoho_inventory_sync_logs_operation ON zoho_inventory_sync_logs(operation);
CREATE INDEX idx_zoho_inventory_sync_logs_status ON zoho_inventory_sync_logs(status);
CREATE INDEX idx_zoho_inventory_sync_logs_timestamp ON zoho_inventory_sync_logs(sync_timestamp);

-- Add comments for documentation
COMMENT ON TABLE zoho_inventory_sync_logs IS 'Tracks bi-directional inventory synchronization between Supabase and Zoho Books';
COMMENT ON COLUMN zoho_inventory_sync_logs.variant_id IS 'ID of the product variant being synchronized';
COMMENT ON COLUMN zoho_inventory_sync_logs.operation IS 'Direction of sync (push_to_zoho or pull_from_zoho)';
COMMENT ON COLUMN zoho_inventory_sync_logs.supabase_quantity IS 'Stock quantity in Supabase before sync';
COMMENT ON COLUMN zoho_inventory_sync_logs.zoho_quantity IS 'Stock quantity in Zoho Books after sync';
COMMENT ON COLUMN zoho_inventory_sync_logs.difference IS 'Difference between Zoho and Supabase quantities';
COMMENT ON COLUMN zoho_inventory_sync_logs.status IS 'Current status of the sync operation';
COMMENT ON COLUMN zoho_inventory_sync_logs.error_message IS 'Error message if sync failed';
COMMENT ON COLUMN zoho_inventory_sync_logs.sync_timestamp IS 'When the sync operation was performed';

-- Create updated_at trigger for legacy compatibility
CREATE TRIGGER update_zoho_inventory_sync_logs_updated_at 
    BEFORE UPDATE ON zoho_inventory_sync_logs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();