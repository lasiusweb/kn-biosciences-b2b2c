/**
 * Zoho Books API Client
 * Handles financial operations like creating invoices and estimates with GST compliance
 */

import { zohoAuth } from './auth';
import { supabase } from '@/lib/supabase';

export interface ZohoBooksContact {
  contact_id?: string;
  contact_name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  gst_no?: string;
  billing_address?: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface ZohoBooksLineItem {
  item_id?: string;
  name: string;
  description?: string;
  rate: number;
  quantity: number;
  discount?: number;
  tax_id?: string;
  item_total: number;
}

export interface ZohoBooksInvoice {
  customer_id: string;
  contact_name: string;
  date: string;
  due_date: string;
  payment_terms?: number;
  payment_terms_label?: string;
  is_inclusive_tax: boolean; // GST inclusive
  line_items: ZohoBooksLineItem[];
  sub_total: number;
  tax_total: number;
  total: number;
  currency_code: string;
  notes?: string;
  terms?: string;
  custom_fields?: Array<{
    label: string;
    value: string;
  }>;
}

export interface ZohoBooksEstimate {
  customer_id: string;
  contact_name: string;
  date: string;
  expiry_date: string;
  payment_terms?: number;
  payment_terms_label?: string;
  is_inclusive_tax: boolean;
  line_items: ZohoBooksLineItem[];
  sub_total: number;
  tax_total: number;
  total: number;
  currency_code: string;
  notes?: string;
  terms?: string;
  status: string;
  custom_fields?: Array<{
    label: string;
    value: string;
  }>;
}

export interface GSTTaxInfo {
  sgst?: number;
  cgst?: number;
  igst?: number;
  cess?: number;
  tax_rate: number;
  is_inter_state: boolean;
}

interface ZohoBooksResponse<T = any> {
  code: number;
  message: string;
  invoice?: T;
  estimate?: T;
  estimates?: T[];
  invoices?: T[];
  line_items?: T[];
}

interface ZohoBooksError {
  code: string;
  message: string;
  details?: any;
}

class ZohoBooksClient {
  private readonly baseURL = 'https://books.zoho.in/api/v3';
  private readonly organizationId: string;

  constructor() {
    this.organizationId = process.env.ZOHO_BOOKS_ORG_ID || '';
  }

  /**
   * Make authenticated request to Zoho Books API
   */
  async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const accessToken = await zohoAuth.getAccessToken();
      
      const url = new URL(`${this.baseURL}${endpoint}`);
      url.searchParams.set('organization_id', this.organizationId);

      const response = await fetch(url.toString(), {
        ...options,
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Zoho Books API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error(`[Zoho Books] API request failed:`, error);
      throw error;
    }
  }

  /**
   * Get list of taxes from Zoho Books
   */
  async getTaxes(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('[Zoho Books] Fetching tax rates...');
      
      const response: ZohoBooksResponse = await this.makeRequest('/settings/taxes');

      if (response.code === 0 && response.taxes) {
        console.log(`[Zoho Books] Found ${response.taxes.length} tax rates`);
        return {
          success: true,
          data: response.taxes
        };
      } else {
        throw new Error(response.message || 'Failed to fetch taxes');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho Books] Failed to fetch taxes:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get or create a contact in Zoho Books
   */
  async getOrCreateContact(contactData: ZohoBooksContact): Promise<{ success: boolean; contactId?: string; error?: string }> {
    try {
      // First try to find existing contact by email
      if (contactData.email) {
        const searchResponse: ZohoBooksResponse = await this.makeRequest(`/contacts?email=${encodeURIComponent(contactData.email)}`);
        
        if (searchResponse.code === 0 && searchResponse.contacts && searchResponse.contacts.length > 0) {
          const existingContact = searchResponse.contacts[0];
          console.log(`[Zoho Books] Found existing contact: ${existingContact.contact_id}`);
          
          return {
            success: true,
            contactId: existingContact.contact_id
          };
        }
      }

      // Create new contact if not found
      console.log(`[Zoho Books] Creating new contact: ${contactData.contact_name}`);
      
      const response: ZohoBooksResponse = await this.makeRequest('/contacts', {
        method: 'POST',
        body: JSON.stringify({
          JSONString: JSON.stringify([contactData])
        }),
      });

      if (response.code === 0 && response.contact) {
        console.log(`[Zoho Books] Successfully created contact: ${response.contact.contact_id}`);
        
        return {
          success: true,
          contactId: response.contact.contact_id
        };
      } else {
        throw new Error(response.message || 'Failed to create contact');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho Books] Failed to get/create contact:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Calculate GST tax for line items
   */
  private calculateGSTTax(amount: number, taxInfo: GSTTaxInfo): number {
    if (taxInfo.is_inter_state) {
      // IGST for inter-state transactions
      return amount * (taxInfo.tax_rate / 100);
    } else {
      // SGST + CGST for intra-state transactions
      return amount * (taxInfo.tax_rate / 100);
    }
  }

  /**
   * Determine if transaction is inter-state based on GST numbers
   */
  private isInterStateTransaction(sellerGST?: string, buyerGST?: string): boolean {
    if (!sellerGST || !buyerGST) {
      return true; // Default to inter-state if GST numbers missing
    }
    
    // Extract state codes from GST numbers (first 2 digits)
    const sellerState = sellerGST.substring(0, 2);
    const buyerState = buyerGST.substring(0, 2);
    
    return sellerState !== buyerState;
  }

  /**
   * Create an invoice in Zoho Books for B2C order
   */
  async createInvoice(
    orderData: {
      id: string;
      order_number: string;
      user: {
        first_name: string;
        last_name: string;
        email: string;
        phone?: string;
        company_name?: string;
        gst_number?: string;
        shipping_address: any;
        billing_address: any;
      };
      items: Array<{
        product_name: string;
        quantity: number;
        unit_price: number;
        tax_rate?: number;
      }>;
      subtotal: number;
      tax_amount: number;
      total_amount: number;
      created_at: string;
    }
  ): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
    try {
      console.log(`[Zoho Books] Creating invoice for order: ${orderData.order_number}`);

      // Get or create contact
      const contactResult = await this.getOrCreateContact({
        contact_name: `${orderData.user.first_name} ${orderData.user.last_name}`,
        company_name: orderData.user.company_name,
        email: orderData.user.email,
        phone: orderData.user.phone,
        gst_no: orderData.user.gst_number,
        billing_address: {
          address: orderData.user.billing_address?.address_line1 || '',
          city: orderData.user.billing_address?.city || '',
          state: orderData.user.billing_address?.state || '',
          zip: orderData.user.billing_address?.postal_code || '',
          country: orderData.user.billing_address?.country || 'India',
        }
      });

      if (!contactResult.success) {
        throw new Error(contactResult.error || 'Failed to get/create contact');
      }

      // Determine tax treatment
      const isInterState = this.isInterStateTransaction(
        process.env.COMPANY_GST_NUMBER,
        orderData.user.gst_number
      );

      // Prepare line items
      const lineItems: ZohoBooksLineItem[] = orderData.items.map((item, index) => {
        const itemTotal = item.quantity * item.unit_price;
        const taxAmount = this.calculateGSTTax(itemTotal, {
          tax_rate: item.tax_rate || 18, // Default 18% GST
          is_inter_state: isInterState,
        });

        return {
          name: item.product_name,
          description: `SKU: ${item.product_name}`,
          rate: item.unit_price,
          quantity: item.quantity,
          item_total: itemTotal,
          // tax_id would be set based on GST type (SGST/CGST vs IGST)
        };
      });

      const invoiceData: ZohoBooksInvoice = {
        customer_id: contactResult.contactId!,
        contact_name: `${orderData.user.first_name} ${orderData.user.last_name}`,
        date: new Date(orderData.created_at).toISOString().split('T')[0],
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days
        payment_terms: 15,
        payment_terms_label: 'Net 15',
        is_inclusive_tax: false, // GST is typically exclusive in B2C
        line_items: lineItems,
        sub_total: orderData.subtotal,
        tax_total: orderData.tax_amount,
        total: orderData.total_amount,
        currency_code: 'INR',
        notes: `Order Number: ${orderData.order_number}`,
        custom_fields: [
          {
            label: 'Order ID',
            value: orderData.id
          },
          {
            label: 'Website Order',
            value: 'true'
          }
        ]
      };

      const response: ZohoBooksResponse = await this.makeRequest('/invoices', {
        method: 'POST',
        body: JSON.stringify({
          JSONString: JSON.stringify([invoiceData])
        }),
      });

      if (response.code === 0 && response.invoice) {
        console.log(`[Zoho Books] Successfully created invoice: ${response.invoice.invoice_id}`);
        
        // Update order with Zoho Books ID
        await supabase
          .from('orders')
          .update({ zoho_books_id: response.invoice.invoice_id })
          .eq('id', orderData.id);

        return {
          success: true,
          invoiceId: response.invoice.invoice_id
        };
      } else {
        throw new Error(response.message || 'Failed to create invoice');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho Books] Failed to create invoice:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Create an estimate in Zoho Books for B2B quote
   */
  async createEstimate(
    quoteData: {
      id: string;
      user: {
        first_name: string;
        last_name: string;
        email: string;
        phone?: string;
        company_name?: string;
        gst_number?: string;
        billing_address: any;
      };
      items: Array<{
        product_name: string;
        quantity: number;
        unit_price: number;
        tax_rate?: number;
      }>;
      subtotal: number;
      tax_amount: number;
      total_amount: number;
      valid_until: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; estimateId?: string; error?: string }> {
    try {
      console.log(`[Zoho Books] Creating estimate for quote: ${quoteData.id}`);

      // Get or create contact
      const contactResult = await this.getOrCreateContact({
        contact_name: `${quoteData.user.first_name} ${quoteData.user.last_name}`,
        company_name: quoteData.user.company_name,
        email: quoteData.user.email,
        phone: quoteData.user.phone,
        gst_no: quoteData.user.gst_number,
        billing_address: {
          address: quoteData.user.billing_address?.address_line1 || '',
          city: quoteData.user.billing_address?.city || '',
          state: quoteData.user.billing_address?.state || '',
          zip: quoteData.user.billing_address?.postal_code || '',
          country: quoteData.user.billing_address?.country || 'India',
        }
      });

      if (!contactResult.success) {
        throw new Error(contactResult.error || 'Failed to get/create contact');
      }

      // Determine tax treatment
      const isInterState = this.isInterStateTransaction(
        process.env.COMPANY_GST_NUMBER,
        quoteData.user.gst_number
      );

      // Prepare line items
      const lineItems: ZohoBooksLineItem[] = quoteData.items.map((item) => {
        const itemTotal = item.quantity * item.unit_price;
        
        return {
          name: item.product_name,
          description: `Bulk pricing - ${item.product_name}`,
          rate: item.unit_price,
          quantity: item.quantity,
          item_total: itemTotal,
        };
      });

      const estimateData: ZohoBooksEstimate = {
        customer_id: contactResult.contactId!,
        contact_name: `${quoteData.user.first_name} ${quoteData.user.last_name}`,
        date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(quoteData.valid_until).toISOString().split('T')[0],
        payment_terms: 30,
        payment_terms_label: 'Net 30',
        is_inclusive_tax: true, // GST typically inclusive in B2B quotes
        line_items: lineItems,
        sub_total: quoteData.subtotal,
        tax_total: quoteData.tax_amount,
        total: quoteData.total_amount,
        currency_code: 'INR',
        notes: quoteData.notes || `B2B Quote from KN Biosciences`,
        status: 'sent',
        custom_fields: [
          {
            label: 'Quote ID',
            value: quoteData.id
          },
          {
            label: 'B2B Quote',
            value: 'true'
          }
        ]
      };

      const response: ZohoBooksResponse = await this.makeRequest('/estimates', {
        method: 'POST',
        body: JSON.stringify({
          JSONString: JSON.stringify([estimateData])
        }),
      });

      if (response.code === 0 && response.estimate) {
        console.log(`[Zoho Books] Successfully created estimate: ${response.estimate.estimate_id}`);
        
        // Update quote with Zoho Books ID
        await supabase
          .from('b2b_quotes')
          .update({ zoho_books_id: response.estimate.estimate_id })
          .eq('id', quoteData.id);

        return {
          success: true,
          estimateId: response.estimate.estimate_id
        };
      } else {
        throw new Error(response.message || 'Failed to create estimate');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho Books] Failed to create estimate:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Log Books operation to sync logs table
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
        zoho_service: 'books',
        zoho_entity_type: zohoEntityType,
        zoho_entity_id: zohoEntityId,
        status,
        attempt_count: 1,
        max_attempts: 5,
        error_message: errorMessage,
        request_payload: requestPayload,
        response_payload: responsePayload,
      });
    } catch (error) {
      console.error('[Zoho Books] Failed to log sync operation:', error);
    }
  }
}

// Export singleton instance
export const zohoBooksClient = new ZohoBooksClient();
export default zohoBooksClient;