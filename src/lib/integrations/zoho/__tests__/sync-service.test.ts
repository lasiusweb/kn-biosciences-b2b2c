/**
 * Unit tests for Zoho Sync Service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { zohoSyncService } from '../sync-service';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('./crm', () => ({
  zohoCRMClient: {
    syncUserToContact: vi.fn(),
    createLead: vi.fn(),
    createLeadFromQuote: vi.fn(),
  },
}));

describe('ZohoSyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('syncUserRegistration', () => {
    const mockUser = {
      id: 'user-123',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      company_name: 'Test Company',
      gst_number: '27AAAPL1234C1ZV',
      role: 'customer',
    };

    it('should successfully sync user registration', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: mockUser, 
          error: null 
        }),
      };
      (supabase as any) = mockSupabase;

      const { zohoCRMClient } = await import('./crm');
      vi.mocked(zohoCRMClient.syncUserToContact).mockResolvedValue({
        success: true,
        zohoContactId: 'zoho-contact-123',
      });

      const result = await zohoSyncService.syncUserRegistration('user-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(zohoCRMClient.syncUserToContact).toHaveBeenCalledWith('user-123', {
        id: mockUser.id,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        email: mockUser.email,
        phone: mockUser.phone,
        company_name: mockUser.company_name,
        gst_number: mockUser.gst_number,
        role: mockUser.role,
      });

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle user not found error', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'User not found' }
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await zohoSyncService.syncUserRegistration('nonexistent-user');

      expect(result.success).toBe(false);
      expect(result.error).toContain('User not found');
    });

    it('should handle CRM sync failure', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: mockUser, 
          error: null 
        }),
      };
      (supabase as any) = mockSupabase;

      const { zohoCRMClient } = await import('./crm');
      vi.mocked(zohoCRMClient.syncUserToContact).mockResolvedValue({
        success: false,
        error: 'CRM API Error',
      });

      const result = await zohoSyncService.syncUserRegistration('user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('CRM API Error');
    });
  });

  describe('syncContactSubmission', () => {
    const mockSubmission = {
      id: 'submission-123',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567890',
      company: 'Contact Company',
      subject: 'Product Inquiry',
      message: 'I am interested in your agricultural products',
      status: 'new',
    };

    it('should successfully sync contact submission', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: vi.fn()
          .mockReturnThis()
          .mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: mockSubmission, 
          error: null 
        }),
        update: vi.fn().mockReturnThis(),
      };
      (supabase as any) = mockSupabase;

      const { zohoCRMClient } = await import('./crm');
      vi.mocked(zohoCRMClient.createLead).mockResolvedValue({
        success: true,
        zohoLeadId: 'zoho-lead-123',
      });

      const result = await zohoSyncService.syncContactSubmission('submission-123');

      expect(zohoCRMClient.createLead).toHaveBeenCalledWith({
        First_Name: 'Jane',
        Last_Name: 'Smith',
        Email: 'jane.smith@example.com',
        Phone: '+1234567890',
        Company: 'Contact Company',
        Description: 'Product Inquiry\n\nI am interested in your agricultural products',
        Lead_Source: 'Contact Form',
      });

      expect(result.success).toBe(true);
    });

    it('should handle submission not found', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Submission not found' }
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await zohoSyncService.syncContactSubmission('nonexistent-submission');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Contact submission not found');
    });

    it('should split name into first and last name correctly', async () => {
      const submissionWithSingleName = {
        ...mockSubmission,
        name: 'SingleName',
      };

      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: submissionWithSingleName, 
          error: null 
        }),
        update: vi.fn().mockReturnThis(),
      };
      (supabase as any) = mockSupabase;

      const { zohoCRMClient } = await import('./crm');
      vi.mocked(zohoCRMClient.createLead).mockResolvedValue({
        success: true,
        zohoLeadId: 'zoho-lead-123',
      });

      await zohoSyncService.syncContactSubmission('submission-123');

      expect(zohoCRMClient.createLead).toHaveBeenCalledWith(
        expect.objectContaining({
          First_Name: 'SingleName',
          Last_Name: '',
        })
      );
    });
  });

  describe('syncB2BQuote', () => {
    const mockQuote = {
      id: 'quote-123',
      user_id: 'user-456',
      total_amount: 15000,
      notes: 'Bulk order for agricultural supplies',
      status: 'submitted',
      user: {
        id: 'user-456',
        first_name: 'Business',
        last_name: 'User',
        email: 'business@example.com',
        phone: '+1234567890',
        company_name: 'Business Corp',
        gst_number: '27AAAPL1234C1ZV',
      },
    };

    it('should successfully sync B2B quote', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: mockQuote, 
          error: null 
        }),
        update: vi.fn().mockReturnThis(),
      };
      (supabase as any) = mockSupabase;

      const { zohoCRMClient } = await import('./crm');
      vi.mocked(zohoCRMClient.createLeadFromQuote).mockResolvedValue({
        success: true,
        zohoLeadId: 'zoho-lead-456',
      });

      const result = await zohoSyncService.syncB2BQuote('quote-123');

      expect(zohoCRMClient.createLeadFromQuote).toHaveBeenCalledWith({
        user_id: mockQuote.user_id,
        first_name: mockQuote.user.first_name,
        last_name: mockQuote.user.last_name,
        email: mockQuote.user.email,
        phone: mockQuote.user.phone,
        company_name: mockQuote.user.company_name,
        gst_number: mockQuote.user.gst_number,
        notes: mockQuote.notes,
        total_amount: mockQuote.total_amount,
      });

      expect(result.success).toBe(true);
    });

    it('should handle quote not found', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Quote not found' }
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await zohoSyncService.syncB2BQuote('nonexistent-quote');

      expect(result.success).toBe(false);
      expect(result.error).toContain('B2B quote not found');
    });

    it('should handle missing user association', async () => {
      const quoteWithoutUser = {
        ...mockQuote,
        user: null,
      };

      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: quoteWithoutUser, 
          error: null 
        }),
      };
      (supabase as any) = mockSupabase;

      const result = await zohoSyncService.syncB2BQuote('quote-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('User associated with quote not found');
    });
  });

  describe('syncPendingContactSubmissions', () => {
    it('should process batch of pending submissions', async () => {
      const pendingSubmissions = [
        { id: 'sub-1' },
        { id: 'sub-2' },
        { id: 'sub-3' },
      ];

      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };
      (supabase as any) = mockSupabase;

      // Mock the query to return pending submissions
      mockSupabase.limit.mockResolvedValueOnce({
        data: pendingSubmissions,
        error: null,
      });

      // Mock individual sync calls
      vi.spyOn(zohoSyncService, 'syncContactSubmission')
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce({ success: false })
        .mockResolvedValueOnce({ success: true });

      const result = await zohoSyncService.syncPendingContactSubmissions();

      expect(result.success).toBe(true);
      expect(result.processed).toBe(2);
      expect(result.errors).toBe(1);
    });

    it('should handle no pending submissions', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };
      (supabase as any) = mockSupabase;

      mockSupabase.limit.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const result = await zohoSyncService.syncPendingContactSubmissions();

      expect(result.success).toBe(true);
      expect(result.processed).toBe(0);
      expect(result.errors).toBe(0);
    });
  });

  describe('getSyncStats', () => {
    it('should return sync statistics', async () => {
      const mockLogs = [
        { status: 'success' },
        { status: 'success' },
        { status: 'failed' },
        { status: 'pending' },
        { status: 'retrying' },
      ];

      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
      };
      (supabase as any) = mockSupabase;

      mockSupabase.gte.mockResolvedValueOnce({
        data: mockLogs,
        error: null,
      });

      const stats = await zohoSyncService.getSyncStats();

      expect(stats.totalLogs).toBe(5);
      expect(stats.successCount).toBe(2);
      expect(stats.failedCount).toBe(1);
      expect(stats.pendingCount).toBe(1);
      expect(stats.retryingCount).toBe(1);
    });

    it('should handle database errors', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
      };
      (supabase as any) = mockSupabase;

      mockSupabase.gte.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      const stats = await zohoSyncService.getSyncStats();

      expect(stats.totalLogs).toBe(0);
      expect(stats.successCount).toBe(0);
      expect(stats.failedCount).toBe(0);
      expect(stats.pendingCount).toBe(0);
      expect(stats.retryingCount).toBe(0);
    });
  });
});