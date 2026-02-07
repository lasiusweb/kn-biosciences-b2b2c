-- Create zoho_tokens table for storing OAuth 2.0 tokens
-- Migration for Zoho Ecosystem Integration

CREATE TABLE IF NOT EXISTS zoho_tokens (
  id VARCHAR(50) PRIMARY KEY, -- 'default' for single instance, could be extended for multiple accounts
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT NOT NULL,
  token_type VARCHAR(20) NOT NULL DEFAULT 'Bearer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE zoho_tokens IS 'Stores Zoho OAuth 2.0 tokens for API authentication';
COMMENT ON COLUMN zoho_tokens.id IS 'Identifier for the token set (use "default" for primary instance)';
COMMENT ON COLUMN zoho_tokens.access_token IS 'Current access token for API requests';
COMMENT ON COLUMN zoho_tokens.refresh_token IS 'Refresh token for obtaining new access tokens';
COMMENT ON COLUMN zoho_tokens.expires_at IS 'Expiration time of the access token';
COMMENT ON COLUMN zoho_tokens.scope IS 'OAuth scope granted to the tokens';
COMMENT ON COLUMN zoho_tokens.token_type IS 'Type of token (typically "Bearer")';

-- Create updated_at trigger
CREATE TRIGGER update_zoho_tokens_updated_at 
    BEFORE UPDATE ON zoho_tokens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();