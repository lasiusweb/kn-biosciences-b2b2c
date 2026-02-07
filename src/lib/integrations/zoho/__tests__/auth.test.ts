/**
 * Unit tests for Zoho OAuth 2.0 Authentication Client
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn() as any;

describe('ZohoAuthClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ZOHO_CLIENT_ID = 'test_client_id';
    process.env.ZOHO_CLIENT_SECRET = 'test_client_secret';
    process.env.ZOHO_REDIRECT_URI = 'https://test.example.com/callback';
    process.env.ZOHO_ACCOUNTS_DOMAIN = 'https://accounts.zoho.in';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAuthorizationUrl', () => {
    it('should generate correct authorization URL with default parameters', () => {
      // Import after mocking
      const { zohoAuth } = require('../auth');
      const url = zohoAuth.getAuthorizationUrl();
      
      expect(url).toContain('https://accounts.zoho.in/oauth/v2/auth');
      expect(url).toContain('response_type=code');
      expect(url).toContain('client_id=test_client_id');
      expect(url).toContain('redirect_uri=https://test.example.com/callback');
      expect(url).toContain('scope=ZohoCRM.modules.ALL,ZohoBooks.fullaccess.all');
      expect(url).toContain('access_type=offline');
      expect(url).toContain('state=zoho_oauth_state');
    });

    it('should include custom state parameter', () => {
      const { zohoAuth } = require('../auth');
      const customState = 'custom_state_123';
      const url = zohoAuth.getAuthorizationUrl(customState);
      
      expect(url).toContain(`state=${customState}`);
    });
  });

  describe('isConfigured', () => {
    it('should return true when tokens are valid', async () => {
      const { zohoAuth } = require('../auth');
      const { supabase } = require('@/lib/supabase');
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: {
            access_token: 'valid_token',
            refresh_token: 'refresh_token',
            expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
            scope: 'ZohoCRM.modules.ALL',
            token_type: 'Bearer',
          }, 
          error: null 
        }),
      };
      
      // Mock supabase
      supabase.from = mockSupabase.from;

      const isConfigured = await zohoAuth.isConfigured();
      expect(isConfigured).toBe(true);
    });

    it('should return false when tokens are not available', async () => {
      const { zohoAuth } = require('../auth');
      const { supabase } = require('@/lib/supabase');
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
      
      // Mock supabase
      supabase.from = mockSupabase.from;

      const isConfigured = await zohoAuth.isConfigured();
      expect(isConfigured).toBe(false);
    });
  });
});