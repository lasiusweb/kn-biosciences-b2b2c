-- Migration to secure Zoho integration tables
-- Enables RLS and ensures no public access to sensitive tokens and logs

-- Secure zoho_tokens table
ALTER TABLE zoho_tokens ENABLE ROW LEVEL SECURITY;

-- Secure zoho_sync_logs table
ALTER TABLE zoho_sync_logs ENABLE ROW LEVEL SECURITY;

-- Secure zoho_inventory_sync_logs table
ALTER TABLE zoho_inventory_sync_logs ENABLE ROW LEVEL SECURITY;

-- By default, enabling RLS without policies denies all access to non-superusers (like service_role)
-- This is the desired state for these tables as they should not be accessed by the frontend.

COMMENT ON TABLE zoho_tokens IS 'Stores Zoho OAuth 2.0 tokens. RLS enabled, restricted to service_role.';
COMMENT ON TABLE zoho_sync_logs IS 'Tracks Zoho sync operations. RLS enabled, restricted to service_role.';
COMMENT ON TABLE zoho_inventory_sync_logs IS 'Tracks inventory sync operations. RLS enabled, restricted to service_role.';
