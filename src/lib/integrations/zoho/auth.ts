/**
 * Zoho OAuth 2.0 Authentication Client
 * Handles token generation, storage, and refresh logic for Zoho API integration
 */

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

interface ZohoTokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix timestamp
  scope: string;
  token_type: string;
}

interface ZohoConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accountsDomain: string;
}

class ZohoAuthClient {
  private config: ZohoConfig;
  private tokenCache: Map<string, ZohoTokenData> = new Map();

  constructor() {
    this.config = {
      clientId: process.env.ZOHO_CLIENT_ID || '',
      clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
      redirectUri: process.env.ZOHO_REDIRECT_URI || '',
      accountsDomain: process.env.ZOHO_ACCOUNTS_DOMAIN || 'https://accounts.zoho.in'
    };
  }

  /**
   * Get the authorization URL for OAuth 2.0 flow
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'ZohoCRM.modules.ALL,ZohoBooks.fullaccess.all',
      access_type: 'offline',
      state: state || 'zoho_oauth_state'
    });

    return `${this.config.accountsDomain}/oauth/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access and refresh tokens
   */
  async exchangeCodeForTokens(code: string): Promise<ZohoTokenData> {
    try {
      const response = await fetch(`${this.config.accountsDomain}/oauth/v2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          code: code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to exchange code for tokens: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      const tokenData: ZohoTokenData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + (data.expires_in * 1000), // Convert to milliseconds
        scope: data.scope,
        token_type: data.token_type,
      };

      // Store tokens securely in database
      await this.storeTokens(tokenData);
      
      // Cache in memory for immediate use
      this.tokenCache.set('default', tokenData);

      console.log('[Zoho Auth] Successfully obtained and stored tokens');
      return tokenData;

    } catch (error) {
      console.error('[Zoho Auth] Error exchanging code for tokens:', error);
      throw error;
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    try {
      // Check memory cache first
      let tokenData = this.tokenCache.get('default');
      
      if (!tokenData) {
        // Try to load from database
        tokenData = await this.loadTokens();
      }

      if (!tokenData) {
        throw new Error('No Zoho tokens available. Please initiate OAuth flow.');
      }

      // Check if token is expired or about to expire (5 minute buffer)
      if (Date.now() >= (tokenData.expires_at - 5 * 60 * 1000)) {
        console.log('[Zoho Auth] Token expired or expiring soon, refreshing...');
        tokenData = await this.refreshToken(tokenData.refresh_token);
      }

      return tokenData.access_token;

    } catch (error) {
      console.error('[Zoho Auth] Error getting access token:', error);
      throw error;
    }
  }

  /**
   * Refresh the access token using refresh token
   */
  private async refreshToken(refreshToken: string): Promise<ZohoTokenData> {
    try {
      const response = await fetch(`${this.config.accountsDomain}/oauth/v2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to refresh token: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      const tokenData: ZohoTokenData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken, // Use new refresh token if provided, otherwise keep existing
        expires_at: Date.now() + (data.expires_in * 1000),
        scope: data.scope,
        token_type: data.token_type,
      };

      // Update stored tokens
      await this.storeTokens(tokenData);
      
      // Update cache
      this.tokenCache.set('default', tokenData);

      console.log('[Zoho Auth] Successfully refreshed tokens');
      return tokenData;

    } catch (error) {
      console.error('[Zoho Auth] Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Store tokens securely in database
   */
  private async storeTokens(tokenData: ZohoTokenData): Promise<void> {
    try {
      const { error } = await supabase
        .from('zoho_tokens')
        .upsert({
          id: 'default',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(tokenData.expires_at).toISOString(),
          scope: tokenData.scope,
          token_type: tokenData.token_type,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('[Zoho Auth] Error storing tokens:', error);
      throw error;
    }
  }

  /**
   * Load tokens from database
   */
  private async loadTokens(): Promise<ZohoTokenData | undefined> {
    try {
      const { data, error } = await supabase
        .from('zoho_tokens')
        .select('*')
        .eq('id', 'default')
        .single();

      if (error || !data) {
        return undefined;
      }

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(data.expires_at).getTime(),
        scope: data.scope,
        token_type: data.token_type,
      };

    } catch (error) {
      console.error('[Zoho Auth] Error loading tokens:', error);
      return undefined;
    }
  }

  /**
   * Revoke stored tokens (for logout or token reset)
   */
  async revokeTokens(): Promise<void> {
    try {
      // Clear memory cache
      this.tokenCache.delete('default');
      
      // Remove from database
      const { error } = await supabase
        .from('zoho_tokens')
        .delete()
        .eq('id', 'default');

      if (error) {
        throw error;
      }

      console.log('[Zoho Auth] Successfully revoked tokens');

    } catch (error) {
      console.error('[Zoho Auth] Error revoking tokens:', error);
      throw error;
    }
  }

  /**
   * Check if tokens are available and valid
   */
  async isConfigured(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const zohoAuth = new ZohoAuthClient();
export default zohoAuth;