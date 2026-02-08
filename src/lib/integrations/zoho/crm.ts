/**
 * Zoho CRM API Client
 * Handles CRM operations like creating/updating contacts and leads
 */

import { zohoAuth } from './auth';
import { supabase } from '@/lib/supabase';
import { maskPII } from '@/lib/utils';

export interface ZohoContact {
  First_Name: string;
  Last_Name: string;
  Email: string;
  Phone?: string;
  Company?: string;
  GST_No?: string;
  Lead_Source?: string;
}

export interface ZohoLead {
  First_Name: string;
  Last_Name: string;
  Email: string;
  Phone?: string;
  Company?: string;
  Description?: string;
  Lead_Source: string;
}

interface ZohoCRMResponse<T = any> {
  data: T[];
  status: string;
  message?: string;
  details?: any;
}

interface ZohoApiError {
  code: string;
  message: string;
  details?: any;
}

class ZohoCRMClient {
  private readonly baseURL = 'https://www.zohoapis.in/crm/v6';

  /**
   * Make authenticated request to Zoho CRM API
   */
  private async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const accessToken = await zohoAuth.getAccessToken();
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Zoho CRM API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error(`[Zoho CRM] API request failed:`, error);
      throw error;
    }
  }

  /**
   * Create a new contact in Zoho CRM
   */
  async createContact(contact: ZohoContact): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`[Zoho CRM] Creating contact for email: ${contact.Email.replace(/(.{2}).+(@.+)/, "$1***$2")}`);

      const response: ZohoCRMResponse = await this.makeRequest('/Contacts', {
        method: 'POST',
        body: JSON.stringify({
          data: [contact],
          trigger: ['workflow']
        }),
      });

      if (response.status === 'success' && response.data.length > 0) {
        const contactData = response.data[0];
        console.log(`[Zoho CRM] Successfully created contact with ID: ${contactData.details?.id}`);
        
        return {
          success: true,
          data: {
            id: contactData.details?.id,
            ...contactData
          }
        };
      } else {
        throw new Error(response.message || 'Failed to create contact');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho CRM] Failed to create contact:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Update an existing contact in Zoho CRM
   */
  async updateContact(
    zohoContactId: string, 
    contact: Partial<ZohoContact>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`[Zoho CRM] Updating contact ID: ${zohoContactId}`);

      const response: ZohoCRMResponse = await this.makeRequest(`/Contacts/${zohoContactId}`, {
        method: 'PUT',
        body: JSON.stringify({
          data: [{ ...contact, id: zohoContactId }],
          trigger: ['workflow']
        }),
      });

      if (response.status === 'success' && response.data.length > 0) {
        const contactData = response.data[0];
        console.log(`[Zoho CRM] Successfully updated contact: ${zohoContactId}`);
        
        return {
          success: true,
          data: {
            id: contactData.details?.id,
            ...contactData
          }
        };
      } else {
        throw new Error(response.message || 'Failed to update contact');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho CRM] Failed to update contact:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Create a new lead in Zoho CRM
   */
  async createLead(lead: ZohoLead): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`[Zoho CRM] Creating lead for email: ${lead.Email.replace(/(.{2}).+(@.+)/, "$1***$2")}`);

      const response: ZohoCRMResponse = await this.makeRequest('/Leads', {
        method: 'POST',
        body: JSON.stringify({
          data: [lead],
          trigger: ['workflow']
        }),
      });

      if (response.status === 'success' && response.data.length > 0) {
        const leadData = response.data[0];
        console.log(`[Zoho CRM] Successfully created lead with ID: ${leadData.details?.id}`);
        
        return {
          success: true,
          data: {
            id: leadData.details?.id,
            ...leadData
          }
        };
      } else {
        throw new Error(response.message || 'Failed to create lead');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho CRM] Failed to create lead:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get contact by email address
   */
  async getContactByEmail(email: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`[Zoho CRM] Searching for contact with email: ${email.replace(/(.{2}).+(@.+)/, "$1***$2")}`);

      const response: ZohoCRMResponse = await this.makeRequest(`/Contacts/search?email=${encodeURIComponent(email)}`);

      if (response.status === 'success' && response.data.length > 0) {
        console.log(`[Zoho CRM] Found contact: ${response.data[0].id}`);
        return {
          success: true,
          data: response.data[0]
        };
      } else {
        console.log(`[Zoho CRM] No contact found for email: ${email.replace(/(.{2}).+(@.+)/, "$1***$2")}`);
        return {
          success: false,
          error: 'Contact not found'
        };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho CRM] Failed to search contact:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Log CRM operation to sync logs table
   */
  private async logSyncOperation(
    entityType: string,
    entityId: string,
    operation: string,
    zohoEntityType: string,
    zohoEntityId: string | null,
    status: 'pending' | 'success' | 'failed' | 'retrying',
    errorMessage?: string,
    requestPayload?: any,
    responsePayload?: any
  ): Promise<void> {
    try {
      await supabase.from('zoho_sync_logs').insert({
        entity_type: entityType,
        entity_id: entityId,
        operation,
        zoho_service: 'crm',
        zoho_entity_type: zohoEntityType,
        zoho_entity_id: zohoEntityId,
        status,
        attempt_count: 1,
        max_attempts: 5,
        error_message: errorMessage,
        request_payload: maskPII(requestPayload),
        response_payload: maskPII(responsePayload),
      });
    } catch (error) {
      console.error('[Zoho CRM] Failed to log sync operation:', error);
    }
  }

  /**
   * Sync user to Zoho CRM contact
   */
  async syncUserToContact(userId: string, userData: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company_name?: string;
    gst_number?: string;
  }): Promise<{ success: boolean; zohoContactId?: string; error?: string }> {
    try {
      const contact: ZohoContact = {
        First_Name: userData.first_name,
        Last_Name: userData.last_name,
        Email: userData.email,
        Phone: userData.phone,
        Company: userData.company_name,
        GST_No: userData.gst_number,
        Lead_Source: 'Website Registration'
      };

      // First check if contact already exists
      const existingContact = await this.getContactByEmail(userData.email);
      
      let result;
      if (existingContact.success) {
        // Update existing contact
        result = await this.updateContact(existingContact.data.id, contact);
        if (result.success && result.data?.id) {
          // Update user record with Zoho CRM ID
          await supabase
            .from('users')
            .update({ zoho_crm_id: result.data.id })
            .eq('id', userId);
        }
      } else {
        // Create new contact
        result = await this.createContact(contact);
        if (result.success && result.data?.id) {
          // Update user record with Zoho CRM ID
          await supabase
            .from('users')
            .update({ zoho_crm_id: result.data.id })
            .eq('id', userId);
        }
      }

      // Log the operation
      await this.logSyncOperation(
        'user',
        userId,
        existingContact.success ? 'update' : 'create',
        'Contact',
        result.success ? result.data?.id || null : null,
        result.success ? 'success' : 'failed',
        result.error,
        contact,
        result.data
      );

      return {
        success: result.success,
        zohoContactId: result.success ? result.data?.id : undefined,
        error: result.error
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho CRM] Failed to sync user to contact:', errorMessage);
      
      await this.logSyncOperation(
        'user',
        userId,
        'sync',
        'Contact',
        null,
        'failed',
        errorMessage,
        userData
      );

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Create lead from B2B quote request
   */
  async createLeadFromQuote(quoteData: {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company_name?: string;
    gst_number?: string;
    notes?: string;
  }): Promise<{ success: boolean; zohoLeadId?: string; error?: string }> {
    try {
      const lead: ZohoLead = {
        First_Name: quoteData.first_name,
        Last_Name: quoteData.last_name,
        Email: quoteData.email,
        Phone: quoteData.phone,
        Company: quoteData.company_name,
        Description: quoteData.notes || `B2B Quote Request from ${quoteData.company_name || 'Individual'}`,
        Lead_Source: 'B2B Quote Request'
      };

      const result = await this.createLead(lead);

      // Log the operation
      await this.logSyncOperation(
        'b2b_quote',
        quoteData.user_id,
        'create',
        'Lead',
        result.success ? result.data?.id || null : null,
        result.success ? 'success' : 'failed',
        result.error,
        lead,
        result.data
      );

      return {
        success: result.success,
        zohoLeadId: result.success ? result.data?.id : undefined,
        error: result.error
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho CRM] Failed to create lead from quote:', errorMessage);
      
      await this.logSyncOperation(
        'b2b_quote',
        quoteData.user_id,
        'create',
        'Lead',
        null,
        'failed',
        errorMessage,
        quoteData
      );

      return {
        success: false,
        error: errorMessage
      };
    }
  }
}

// Export singleton instance
export const zohoCRMClient = new ZohoCRMClient();
export default zohoCRMClient;