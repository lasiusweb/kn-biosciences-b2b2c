/**
 * Data mapping utilities for Zoho integration
 * Handles mapping between Supabase data structures and Zoho API formats
 */

import { supabase } from '@/lib/supabase';
import { zohoCRMClient } from './crm';
import type { User } from '@/types';

export interface UserSyncData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  gst_number?: string;
  role: string;
}

export interface ContactSubmissionSyncData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  company?: string;
}

export interface B2BQuoteSyncData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  gst_number?: string;
  notes?: string;
  total_amount: number;
}

/**
 * Service for handling Zoho CRM synchronization
 */
export class ZohoSyncService {
  /**
   * Sync user registration to Zoho CRM Contact
   */
  async syncUserRegistration(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user data from Supabase
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw new Error(`User not found: ${error?.message || 'Unknown error'}`);
      }

      const userSyncData: UserSyncData = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        company_name: user.company_name,
        gst_number: user.gst_number,
        role: user.role,
      };

      console.log(`[Zoho Sync] Syncing user registration: ${user.email}`);

      const result = await zohoCRMClient.syncUserToContact(userId, userSyncData);

      if (result.success) {
        console.log(`[Zoho Sync] Successfully synced user: ${user.email} -> Zoho Contact ID: ${result.zohoContactId}`);
      } else {
        console.error(`[Zoho Sync] Failed to sync user: ${user.email}`, result.error);
      }

      return { success: result.success, error: result.error };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho Sync] Error syncing user registration:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Sync contact form submission to Zoho CRM Lead
   */
  async syncContactSubmission(submissionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get contact submission from Supabase
      const { data: submission, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (error || !submission) {
        throw new Error(`Contact submission not found: ${error?.message || 'Unknown error'}`);
      }

      const nameParts = submission.name.split(' ', 2);
      const firstName = nameParts[0];
      const lastName = nameParts[1] || '';

      console.log(`[Zoho Sync] Syncing contact submission: ${submission.email}`);

      const leadData = {
        First_Name: firstName,
        Last_Name: lastName,
        Email: submission.email,
        Phone: submission.phone,
        Company: submission.company,
        Description: `${submission.subject}\n\n${submission.message}`,
        Lead_Source: 'Contact Form',
      };

      const result = await zohoCRMClient.createLead(leadData);

      if (result.success) {
        console.log(`[Zoho Sync] Successfully synced contact submission: ${submission.email} -> Zoho Lead ID: ${result.zohoLeadId}`);
        
        // Update submission status
        await supabase
          .from('contact_submissions')
          .update({ status: 'processed' })
          .eq('id', submissionId);
      } else {
        console.error(`[Zoho Sync] Failed to sync contact submission: ${submission.email}`, result.error);
      }

      return { success: result.success, error: result.error };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho Sync] Error syncing contact submission:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Sync B2B quote request to Zoho CRM Lead
   */
  async syncB2BQuote(quoteId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get quote and user data from Supabase
      const { data: quote, error: quoteError } = await supabase
        .from('b2b_quotes')
        .select(`
          *,
          user:users(
            id,
            first_name,
            last_name,
            email,
            phone,
            company_name,
            gst_number
          )
        `)
        .eq('id', quoteId)
        .single();

      if (quoteError || !quote) {
        throw new Error(`B2B quote not found: ${quoteError?.message || 'Unknown error'}`);
      }

      if (!quote.user) {
        throw new Error('User associated with quote not found');
      }

      console.log(`[Zoho Sync] Syncing B2B quote: ${quote.user.email} (Amount: ₹${quote.total_amount})`);

      const quoteSyncData: B2BQuoteSyncData = {
        user_id: quote.user_id,
        first_name: quote.user.first_name,
        last_name: quote.user.last_name,
        email: quote.user.email,
        phone: quote.user.phone,
        company_name: quote.user.company_name,
        gst_number: quote.user.gst_number,
        notes: quote.notes,
        total_amount: quote.total_amount,
      };

      const result = await zohoCRMClient.createLeadFromQuote(quoteSyncData);

      if (result.success) {
        console.log(`[Zoho Sync] Successfully synced B2B quote: ${quote.user.email} -> Zoho Lead ID: ${result.zohoLeadId}`);
        
        // Update quote with Zoho CRM ID
        await supabase
          .from('b2b_quotes')
          .update({ zoho_crm_id: result.zohoLeadId })
          .eq('id', quoteId);
      } else {
        console.error(`[Zoho Sync] Failed to sync B2B quote: ${quote.user.email}`, result.error);
      }

      return { success: result.success, error: result.error };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho Sync] Error syncing B2B quote:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Batch sync pending contact submissions
   */
  async syncPendingContactSubmissions(): Promise<{ success: boolean; processed: number; errors: number }> {
    try {
      console.log('[Zoho Sync] Starting batch sync of pending contact submissions...');

      const { data: submissions, error } = await supabase
        .from('contact_submissions')
        .select('id')
        .eq('status', 'new')
        .limit(50); // Process in batches

      if (error) {
        throw new Error(`Failed to fetch pending submissions: ${error.message}`);
      }

      if (!submissions || submissions.length === 0) {
        console.log('[Zoho Sync] No pending contact submissions to process');
        return { success: true, processed: 0, errors: 0 };
      }

      let processed = 0;
      let errors = 0;

      for (const submission of submissions) {
        const result = await this.syncContactSubmission(submission.id);
        if (result.success) {
          processed++;
        } else {
          errors++;
        }
      }

      console.log(`[Zoho Sync] Batch sync completed: ${processed} processed, ${errors} errors`);

      return { success: true, processed, errors };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho Sync] Error in batch sync of contact submissions:', errorMessage);
      return { success: false, processed: 0, errors: 1 };
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    totalLogs: number;
    successCount: number;
    failedCount: number;
    pendingCount: number;
    retryingCount: number;
  }> {
    try {
      const { data: logs, error } = await supabase
        .from('zoho_sync_logs')
        .select('status')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      if (error) {
        throw new Error(`Failed to fetch sync stats: ${error.message}`);
      }

      const stats = {
        totalLogs: logs?.length || 0,
        successCount: logs?.filter(log => log.status === 'success').length || 0,
        failedCount: logs?.filter(log => log.status === 'failed').length || 0,
        pendingCount: logs?.filter(log => log.status === 'pending').length || 0,
        retryingCount: logs?.filter(log => log.status === 'retrying').length || 0,
      };

      return stats;

    } catch (error) {
      console.error('[Zoho Sync] Error getting sync stats:', error);
      return {
        totalLogs: 0,
        successCount: 0,
        failedCount: 0,
        pendingCount: 0,
        retryingCount: 0,
      };
    }
  }
}

// Export singleton instance
export const zohoSyncService = new ZohoSyncService();
export default zohoSyncService;