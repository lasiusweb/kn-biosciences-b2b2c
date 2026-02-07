/**
 * Zoho Books Sync Service
 * Handles financial synchronization - invoices for B2C orders and estimates for B2B quotes
 */

import { supabase } from '@/lib/supabase';
import { zohoBooksClient } from './books';

export interface OrderItemData {
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  product_id: string;
  variant_id: string;
}

export interface OrderSyncData {
  id: string;
  order_number: string;
  user_id: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
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
  items: OrderItemData[];
}

export interface QuoteItemData {
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  product_id: string;
  variant_id: string;
}

export interface QuoteSyncData {
  id: string;
  user_id: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  valid_until: string;
  notes?: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company_name?: string;
    gst_number?: string;
    billing_address?: any;
  };
  items: QuoteItemData[];
}

/**
 * Service for handling Zoho Books synchronization
 */
export class ZohoBooksSyncService {
  /**
   * Get detailed order data with items and user information
   */
  private async getOrderDetails(orderId: string): Promise<OrderSyncData | null> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
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
        .eq('id', orderId)
        .single();

      if (error || !order) {
        console.error('[Zoho Books Sync] Error fetching order:', error);
        return null;
      }

      // Get order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product_variants:products(
            name,
            sku
          )
        `)
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('[Zoho Books Sync] Error fetching order items:', itemsError);
        return null;
      }

      const mappedItems: OrderItemData[] = (orderItems || []).map(item => ({
        product_name: item.product_variants?.name || 'Unknown Product',
        sku: item.product_variants?.sku || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: 18, // Default GST rate - could be made configurable
        product_id: item.product_id,
        variant_id: item.variant_id,
      }));

      return {
        ...order,
        user: order.user!,
        items: mappedItems,
      };

    } catch (error) {
      console.error('[Zoho Books Sync] Error getting order details:', error);
      return null;
    }
  }

  /**
   * Get detailed quote data with items and user information
   */
  private async getQuoteDetails(quoteId: string): Promise<QuoteSyncData | null> {
    try {
      const { data: quote, error } = await supabase
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

      if (error || !quote) {
        console.error('[Zoho Books Sync] Error fetching quote:', error);
        return null;
      }

      // Get quote items
      const { data: quoteItems, error: itemsError } = await supabase
        .from('b2b_quote_items')
        .select(`
          *,
          product_variants:products(
            name,
            sku
          )
        `)
        .eq('quote_id', quoteId);

      if (itemsError) {
        console.error('[Zoho Books Sync] Error fetching quote items:', itemsError);
        return null;
      }

      const mappedItems: QuoteItemData[] = (quoteItems || []).map(item => ({
        product_name: item.product_variants?.name || 'Unknown Product',
        sku: item.product_variants?.sku || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: 18, // Default GST rate
        product_id: item.product_id,
        variant_id: item.variant_id,
      }));

      return {
        ...quote,
        user: quote.user!,
        items: mappedItems,
      };

    } catch (error) {
      console.error('[Zoho Books Sync] Error getting quote details:', error);
      return null;
    }
  }

  /**
   * Calculate GST tax breakdown for B2C orders
   */
  private calculateB2CGST(items: OrderItemData[]): {
    subtotal: number;
    tax_amount: number;
    total: number;
  } {
    let subtotal = 0;
    let taxAmount = 0;

    for (const item of items) {
      const itemTotal = item.quantity * item.unit_price;
      subtotal += itemTotal;
      
      // For B2C, typically simple GST calculation
      const itemTax = itemTotal * ((item.tax_rate || 18) / 100);
      taxAmount += itemTax;
    }

    return {
      subtotal,
      tax_amount: taxAmount,
      total: subtotal + taxAmount,
    };
  }

  /**
   * Calculate GST tax breakdown for B2B quotes
   */
  private calculateB2BGST(
    items: QuoteItemData[], 
    sellerGST?: string, 
    buyerGST?: string
  ): {
    subtotal: number;
    tax_amount: number;
    total: number;
    sgst: number;
    cgst: number;
    igst: number;
  } {
    let subtotal = 0;
    let sgst = 0;
    let cgst = 0;
    let igst = 0;

    // Determine if inter-state
    const isInterState = sellerGST && buyerGST 
      ? sellerGST.substring(0, 2) !== buyerGST.substring(0, 2)
      : true; // Default to inter-state if GST numbers missing

    for (const item of items) {
      const itemTotal = item.quantity * item.unit_price;
      subtotal += itemTotal;
      
      const taxRate = (item.tax_rate || 18) / 100;
      const itemTax = itemTotal * taxRate;
      
      if (isInterState) {
        // IGST for inter-state
        igst += itemTax;
      } else {
        // SGST + CGST for intra-state
        sgst += itemTax / 2;
        cgst += itemTax / 2;
      }
    }

    const totalTax = sgst + cgst + igst;

    return {
      subtotal,
      tax_amount: totalTax,
      total: subtotal + totalTax,
      sgst,
      cgst,
      igst,
    };
  }

  /**
   * Sync B2C order to Zoho Books Invoice
   */
  async syncOrderToInvoice(orderId: string): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
    try {
      console.log(`[Zoho Books Sync] Syncing order to invoice: ${orderId}`);

      const orderData = await this.getOrderDetails(orderId);
      if (!orderData) {
        throw new Error('Failed to get order details');
      }

      // Only sync paid orders to create invoices
      if (orderData.payment_status !== 'paid') {
        console.log(`[Zoho Books Sync] Skipping unpaid order: ${orderId} (status: ${orderData.payment_status})`);
        return { success: true }; // Not an error, just skip
      }

      // Calculate taxes (use existing calculations from order, recalculate for validation)
      const taxCalculation = this.calculateB2CGST(orderData.items);

      // Create invoice in Zoho Books
      const result = await zohoBooksClient.createInvoice({
        id: orderData.id,
        order_number: orderData.order_number,
        user: orderData.user,
        items: orderData.items,
        subtotal: orderData.subtotal,
        tax_amount: orderData.tax_amount,
        total_amount: orderData.total_amount,
        created_at: orderData.created_at,
      });

      if (result.success) {
        console.log(`[Zoho Books Sync] Successfully synced order: ${orderId} -> Zoho Invoice ID: ${result.invoiceId}`);
        
        // Log success
        await this.logSyncOperation(
          'order',
          orderId,
          'create_invoice',
          'Invoice',
          result.invoiceId || null,
          'success',
          undefined,
          {
            order_number: orderData.order_number,
            user_email: orderData.user.email,
            subtotal: orderData.subtotal,
            tax_amount: orderData.tax_amount,
            total_amount: orderData.total_amount,
          },
          { invoice_id: result.invoiceId }
        );

        return {
          success: true,
          invoiceId: result.invoiceId
        };
      } else {
        throw new Error(result.error || 'Failed to create invoice');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho Books Sync] Failed to sync order to invoice:', errorMessage);
      
      // Log error
      await this.logSyncOperation(
        'order',
        orderId,
        'create_invoice',
        'Invoice',
        null,
        'failed',
        errorMessage
      );

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Sync B2B quote to Zoho Books Estimate
   */
  async syncQuoteToEstimate(quoteId: string): Promise<{ success: boolean; estimateId?: string; error?: string }> {
    try {
      console.log(`[Zoho Books Sync] Syncing quote to estimate: ${quoteId}`);

      const quoteData = await this.getQuoteDetails(quoteId);
      if (!quoteData) {
        throw new Error('Failed to get quote details');
      }

      // Only sync approved quotes
      if (quoteData.status !== 'approved') {
        console.log(`[Zoho Books Sync] Skipping non-approved quote: ${quoteId} (status: ${quoteData.status})`);
        return { success: true }; // Not an error, just skip
      }

      // Calculate taxes for B2B
      const taxCalculation = this.calculateB2BGST(
        quoteData.items,
        process.env.COMPANY_GST_NUMBER,
        quoteData.user.gst_number
      );

      // Create estimate in Zoho Books
      const result = await zohoBooksClient.createEstimate({
        id: quoteData.id,
        user: quoteData.user,
        items: quoteData.items,
        subtotal: quoteData.subtotal,
        tax_amount: quoteData.tax_amount,
        total_amount: quoteData.total_amount,
        valid_until: quoteData.valid_until,
        notes: quoteData.notes,
      });

      if (result.success) {
        console.log(`[Zoho Books Sync] Successfully synced quote: ${quoteId} -> Zoho Estimate ID: ${result.estimateId}`);
        
        // Log success
        await this.logSyncOperation(
          'b2b_quote',
          quoteId,
          'create_estimate',
          'Estimate',
          result.estimateId || null,
          'success',
          undefined,
          {
            user_email: quoteData.user.email,
            company_name: quoteData.user.company_name,
            subtotal: quoteData.subtotal,
            tax_amount: quoteData.tax_amount,
            total_amount: quoteData.total_amount,
            valid_until: quoteData.valid_until,
            tax_breakdown: taxCalculation,
          },
          { estimate_id: result.estimateId }
        );

        return {
          success: true,
          estimateId: result.estimateId
        };
      } else {
        throw new Error(result.error || 'Failed to create estimate');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho Books Sync] Failed to sync quote to estimate:', errorMessage);
      
      // Log error
      await this.logSyncOperation(
        'b2b_quote',
        quoteId,
        'create_estimate',
        'Estimate',
        null,
        'failed',
        errorMessage
      );

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Batch sync pending paid orders
   */
  async syncPendingOrders(): Promise<{ success: boolean; processed: number; errors: number }> {
    try {
      console.log('[Zoho Books Sync] Starting batch sync of pending paid orders...');

      const { data: orders, error } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_status', 'paid')
        .is('zoho_books_id', null) // Only sync orders not yet synced
        .limit(50); // Process in batches

      if (error) {
        throw new Error(`Failed to fetch pending orders: ${error.message}`);
      }

      if (!orders || orders.length === 0) {
        console.log('[Zoho Books Sync] No pending orders to process');
        return { success: true, processed: 0, errors: 0 };
      }

      let processed = 0;
      let errors = 0;

      for (const order of orders) {
        const result = await this.syncOrderToInvoice(order.id);
        if (result.success) {
          processed++;
        } else {
          errors++;
        }
      }

      console.log(`[Zoho Books Sync] Batch sync completed: ${processed} processed, ${errors} errors`);

      return { success: true, processed, errors };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho Books Sync] Error in batch sync of orders:', errorMessage);
      return { success: false, processed: 0, errors: 1 };
    }
  }

  /**
   * Batch sync pending approved quotes
   */
  async syncPendingQuotes(): Promise<{ success: boolean; processed: number; errors: number }> {
    try {
      console.log('[Zoho Books Sync] Starting batch sync of pending approved quotes...');

      const { data: quotes, error } = await supabase
        .from('b2b_quotes')
        .select('id')
        .eq('status', 'approved')
        .is('zoho_books_id', null) // Only sync quotes not yet synced
        .limit(50); // Process in batches

      if (error) {
        throw new Error(`Failed to fetch pending quotes: ${error.message}`);
      }

      if (!quotes || quotes.length === 0) {
        console.log('[Zoho Books Sync] No pending quotes to process');
        return { success: true, processed: 0, errors: 0 };
      }

      let processed = 0;
      let errors = 0;

      for (const quote of quotes) {
        const result = await this.syncQuoteToEstimate(quote.id);
        if (result.success) {
          processed++;
        } else {
          errors++;
        }
      }

      console.log(`[Zoho Books Sync] Batch sync completed: ${processed} processed, ${errors} errors`);

      return { success: true, processed, errors };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Zoho Books Sync] Error in batch sync of quotes:', errorMessage);
      return { success: false, processed: 0, errors: 1 };
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
      console.error('[Zoho Books Sync] Failed to log sync operation:', error);
    }
  }

  /**
   * Get Books sync statistics
   */
  async getBooksSyncStats(): Promise<{
    totalInvoices: number;
    totalEstimates: number;
    successCount: number;
    failedCount: number;
    pendingCount: number;
  }> {
    try {
      const { data: logs, error } = await supabase
        .from('zoho_sync_logs')
        .select('status, zoho_entity_type')
        .eq('zoho_service', 'books')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      if (error) {
        throw new Error(`Failed to fetch Books sync stats: ${error.message}`);
      }

      const booksLogs = logs || [];
      const stats = {
        totalInvoices: booksLogs.filter(log => log.zoho_entity_type === 'Invoice').length,
        totalEstimates: booksLogs.filter(log => log.zoho_entity_type === 'Estimate').length,
        successCount: booksLogs.filter(log => log.status === 'success').length,
        failedCount: booksLogs.filter(log => log.status === 'failed').length,
        pendingCount: booksLogs.filter(log => log.status === 'pending').length,
      };

      return stats;

    } catch (error) {
      console.error('[Zoho Books Sync] Error getting sync stats:', error);
      return {
        totalInvoices: 0,
        totalEstimates: 0,
        successCount: 0,
        failedCount: 0,
        pendingCount: 0,
      };
    }
  }
}

// Export singleton instance
export const zohoBooksSyncService = new ZohoBooksSyncService();
export default zohoBooksSyncService;