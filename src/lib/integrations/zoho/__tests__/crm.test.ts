/**
 * Unit tests for Zoho CRM API Client
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { zohoCRMClient } from '../crm';
import type { ZohoContact, ZohoLead } from '../crm';

// Mock dependencies
vi.mock('../auth', () => ({
  zohoAuth: {
    getAccessToken: vi.fn(),
  },
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn() as any;

describe('ZohoCRMClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createContact', () => {
    const mockContact: ZohoContact = {
      First_Name: 'John',
      Last_Name: 'Doe',
      Email: 'john.doe@example.com',
      Phone: '+1234567890',
      Company: 'Test Company',
    };

    it('should successfully create a contact', async () => {
      const { zohoAuth } = await import('../auth');
      vi.mocked(zohoAuth.getAccessToken).mockResolvedValue('test_token');

      const mockResponse = {
        data: [{
          code: 'SUCCESS',
          details: { id: '123456789' },
          message: 'Contact created successfully',
        }],
        status: 'success',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await zohoCRMClient.createContact(mockContact);

      expect(fetch).toHaveBeenCalledWith(
        'https://www.zohoapis.in/crm/v6/Contacts',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Zoho-oauthtoken test_token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: [mockContact],
            trigger: ['workflow']
          }),
        })
      );

      expect(result).toEqual({
        success: true,
        data: {
          id: '123456789',
          code: 'SUCCESS',
          details: { id: '123456789' },
          message: 'Contact created successfully',
        }
      });
    });

    it('should handle API errors', async () => {
      const { zohoAuth } = await import('../auth');
      vi.mocked(zohoAuth.getAccessToken).mockResolvedValue('test_token');

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid data' }),
      });

      const result = await zohoCRMClient.createContact(mockContact);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Zoho CRM API error: 400 - Invalid data');
    });
  });

  describe('updateContact', () => {
    const mockContactUpdate = {
      First_Name: 'John',
      Last_Name: 'Updated',
    };

    it('should successfully update a contact', async () => {
      const { zohoAuth } = await import('../auth');
      vi.mocked(zohoAuth.getAccessToken).mockResolvedValue('test_token');

      const mockResponse = {
        data: [{
          code: 'SUCCESS',
          details: { id: '123456789' },
          message: 'Contact updated successfully',
        }],
        status: 'success',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await zohoCRMClient.updateContact('123456789', mockContactUpdate);

      expect(fetch).toHaveBeenCalledWith(
        'https://www.zohoapis.in/crm/v6/Contacts/123456789',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            data: [{ ...mockContactUpdate, id: '123456789' }],
            trigger: ['workflow']
          }),
        })
      );

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('123456789');
    });
  });

  describe('createLead', () => {
    const mockLead: ZohoLead = {
      First_Name: 'Jane',
      Last_Name: 'Smith',
      Email: 'jane.smith@example.com',
      Company: 'Lead Company',
      Description: 'Interested in agricultural products',
      Lead_Source: 'Website',
    };

    it('should successfully create a lead', async () => {
      const { zohoAuth } = await import('../auth');
      vi.mocked(zohoAuth.getAccessToken).mockResolvedValue('test_token');

      const mockResponse = {
        data: [{
          code: 'SUCCESS',
          details: { id: '987654321' },
          message: 'Lead created successfully',
        }],
        status: 'success',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await zohoCRMClient.createLead(mockLead);

      expect(fetch).toHaveBeenCalledWith(
        'https://www.zohoapis.in/crm/v6/Leads',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            data: [mockLead],
            trigger: ['workflow']
          }),
        })
      );

      expect(result).toEqual({
        success: true,
        data: {
          id: '987654321',
          code: 'SUCCESS',
          details: { id: '987654321' },
          message: 'Lead created successfully',
        }
      });
    });
  });

  describe('getContactByEmail', () => {
    it('should find existing contact by email', async () => {
      const { zohoAuth } = await import('../auth');
      vi.mocked(zohoAuth.getAccessToken).mockResolvedValue('test_token');

      const mockResponse = {
        data: [{
          id: '123456789',
          First_Name: 'John',
          Last_Name: 'Doe',
          Email: 'john.doe@example.com',
        }],
        status: 'success',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await zohoCRMClient.getContactByEmail('john.doe@example.com');

      expect(fetch).toHaveBeenCalledWith(
        'https://www.zohoapis.in/crm/v6/Contacts/search?email=john.doe%40example.com'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data[0]);
    });

    it('should return not found when email does not exist', async () => {
      const { zohoAuth } = await import('../auth');
      vi.mocked(zohoAuth.getAccessToken).mockResolvedValue('test_token');

      const mockResponse = {
        data: [],
        status: 'success',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await zohoCRMClient.getContactByEmail('nonexistent@example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Contact not found');
    });
  });

  describe('syncUserToContact', () => {
    const mockUserData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      company_name: 'Test Company',
      gst_number: '27AAAPL1234C1ZV',
    };

    const userId = 'user-123';

    it('should create new contact if none exists', async () => {
      // Mock getContactByEmail to return not found
      vi.spyOn(zohoCRMClient, 'getContactByEmail').mockResolvedValue({
        success: false,
        error: 'Contact not found'
      });

      // Mock createContact to return success
      vi.spyOn(zohoCRMClient, 'createContact').mockResolvedValue({
        success: true,
        data: { id: 'new-contact-123' }
      });

      // Mock supabase update
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      (supabase as any) = mockSupabase;

      const result = await zohoCRMClient.syncUserToContact(userId, mockUserData);

      expect(zohoCRMClient.getContactByEmail).toHaveBeenCalledWith(mockUserData.email);
      expect(zohoCRMClient.createContact).toHaveBeenCalledWith({
        First_Name: mockUserData.first_name,
        Last_Name: mockUserData.last_name,
        Email: mockUserData.email,
        Phone: mockUserData.phone,
        Company: mockUserData.company_name,
        GST_No: mockUserData.gst_number,
        Lead_Source: 'Website Registration'
      });

      expect(result.success).toBe(true);
      expect(result.zohoContactId).toBe('new-contact-123');
    });

    it('should update existing contact if found', async () => {
      // Mock getContactByEmail to return existing contact
      vi.spyOn(zohoCRMClient, 'getContactByEmail').mockResolvedValue({
        success: true,
        data: { id: 'existing-contact-456' }
      });

      // Mock updateContact to return success
      vi.spyOn(zohoCRMClient, 'updateContact').mockResolvedValue({
        success: true,
        data: { id: 'existing-contact-456' }
      });

      // Mock supabase update
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      (supabase as any) = mockSupabase;

      const result = await zohoCRMClient.syncUserToContact(userId, mockUserData);

      expect(zohoCRMClient.getContactByEmail).toHaveBeenCalledWith(mockUserData.email);
      expect(zohoCRMClient.updateContact).toHaveBeenCalledWith('existing-contact-456', {
        First_Name: mockUserData.first_name,
        Last_Name: mockUserData.last_name,
        Email: mockUserData.email,
        Phone: mockUserData.phone,
        Company: mockUserData.company_name,
        GST_No: mockUserData.gst_number,
        Lead_Source: 'Website Registration'
      });

      expect(result.success).toBe(true);
      expect(result.zohoContactId).toBe('existing-contact-456');
    });
  });

  describe('createLeadFromQuote', () => {
    const mockQuoteData = {
      user_id: 'user-123',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567890',
      company_name: 'Quote Company',
      gst_number: '27AAAPL1234C1ZV',
      notes: 'Interested in bulk agricultural supplies',
    };

    it('should create lead from quote data', async () => {
      vi.spyOn(zohoCRMClient, 'createLead').mockResolvedValue({
        success: true,
        data: { id: 'quote-lead-789' }
      });

      // Mock supabase insert for logging
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      (supabase as any) = mockSupabase;

      const result = await zohoCRMClient.createLeadFromQuote(mockQuoteData);

      expect(zohoCRMClient.createLead).toHaveBeenCalledWith({
        First_Name: mockQuoteData.first_name,
        Last_Name: mockQuoteData.last_name,
        Email: mockQuoteData.email,
        Phone: mockQuoteData.phone,
        Company: mockQuoteData.company_name,
        Description: mockQuoteData.notes || `B2B Quote Request from ${mockQuoteData.company_name || 'Individual'}`,
        Lead_Source: 'B2B Quote Request'
      });

      expect(result.success).toBe(true);
      expect(result.zohoLeadId).toBe('quote-lead-789');
    });
  });
});