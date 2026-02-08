/**
 * Zoho Background Sync Queue Service
 * Handles asynchronous task processing with retries and exponential backoff
 */

import { supabase } from '@/lib/supabase';
import { zohoSyncService } from './sync-service';
import { zohoBooksSyncService } from './books-sync-service';
import { zohoInventorySyncService } from './inventory-sync-service';

export type ZohoEntity = 'user' | 'product' | 'order' | 'b2b_quote' | 'inventory' | 'contact_submission';
export type ZohoService = 'crm' | 'books';
export type SyncOperation = 'create' | 'update' | 'delete' | 'sync_pull';

export interface QueueTask {
  entity_type: ZohoEntity;
  entity_id: string;
  operation: SyncOperation;
  zoho_service: ZohoService;
  zoho_entity_type: string;
  request_payload?: any;
}

export class ZohoQueueService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly BASE_RETRY_DELAY_MINUTES = 5;

  /**
   * Add a task to the sync queue
   */
  async addToQueue(task: QueueTask): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('zoho_sync_logs')
        .insert({
          entity_type: task.entity_type,
          entity_id: task.entity_id,
          operation: task.operation,
          zoho_service: task.zoho_service,
          zoho_entity_type: task.zoho_entity_type,
          request_payload: task.request_payload,
          status: 'pending',
          attempt_count: 0,
          max_attempts: this.MAX_ATTEMPTS,
        })
        .select('id')
        .single();

      if (error) throw error;

      return { success: true, id: data.id };
    } catch (error) {
      console.error('[Zoho Queue] Failed to add to queue:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Process pending and retrying tasks in the queue
   */
  async processQueue(batchSize: number = 20): Promise<{ processed: number; success: number; failed: number }> {
    const now = new Date().toISOString();
    
    try {
      // Fetch pending or retrying tasks whose retry time has passed
      const { data: tasks, error } = await supabase
        .from('zoho_sync_logs')
        .select('*')
        .or(`status.eq.pending,and(status.eq.retrying,next_retry_at.lte.${now})`)
        .limit(batchSize);

      if (error) throw error;
      if (!tasks || tasks.length === 0) return { processed: 0, success: 0, failed: 0 };

      let successCount = 0;
      let failedCount = 0;

      for (const task of tasks) {
        const result = await this.executeTask(task);
        if (result.success) {
          successCount++;
          await this.markTaskSuccess(task.id, result.response);
        } else {
          failedCount++;
          await this.handleTaskFailure(task, result.error);
        }
      }

      return { processed: tasks.length, success: successCount, failed: failedCount };
    } catch (error) {
      console.error('[Zoho Queue] Error processing queue:', error);
      return { processed: 0, success: 0, failed: 0 };
    }
  }

  /**
   * Execute a specific task based on its type and operation
   */
  private async executeTask(task: any): Promise<{ success: boolean; response?: any; error?: string }> {
    try {
      console.log(`[Zoho Queue] Executing task: ${task.entity_type}:${task.operation} (${task.id})`);

      switch (task.entity_type) {
        case 'user':
          return await zohoSyncService.syncUserRegistration(task.entity_id);
        
        case 'contact_submission':
          return await zohoSyncService.syncContactSubmission(task.entity_id);

        case 'b2b_quote':
          if (task.zoho_service === 'crm') {
            return await zohoSyncService.syncB2BQuote(task.entity_id);
          } else if (task.zoho_service === 'books') {
            return await zohoBooksSyncService.syncQuoteToEstimate(task.entity_id);
          }
          break;
        
        case 'order':
          if (task.zoho_entity_type === 'Invoice') {
            return await zohoBooksSyncService.syncOrderToInvoice(task.entity_id);
          }
          break;

        case 'b2b_quote':
          if (task.zoho_service === 'crm') {
            return await zohoSyncService.syncB2BQuote(task.entity_id);
          } else if (task.zoho_service === 'books') {
            return await zohoBooksSyncService.syncQuoteToEstimate(task.entity_id);
          }
          break;

        case 'inventory':
          return await zohoInventorySyncService.pushInventoryToZoho(task.entity_id);

        // Add more cases as needed for other entity types
      }

      throw new Error(`Unsupported task type: ${task.entity_type} for service ${task.zoho_service}`);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Mark a task as successfully completed
   */
  private async markTaskSuccess(id: string, response?: any): Promise<void> {
    await supabase
      .from('zoho_sync_logs')
      .update({
        status: 'success',
        response_payload: response,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  }

  /**
   * Handle task failure by scheduling a retry or marking as failed
   */
  private async handleTaskFailure(task: any, error?: string): Promise<void> {
    const nextAttempt = (task.attempt_count || 0) + 1;
    
    if (nextAttempt >= task.max_attempts) {
      // Mark as permanently failed
      await supabase
        .from('zoho_sync_logs')
        .update({
          status: 'failed',
          error_message: `Max attempts reached: ${error || 'Unknown error'}`,
          attempt_count: nextAttempt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', task.id);
    } else {
      // Calculate next retry time with exponential backoff
      const delayMinutes = this.BASE_RETRY_DELAY_MINUTES * Math.pow(2, nextAttempt - 1);
      const nextRetryAt = new Date();
      nextRetryAt.setMinutes(nextRetryAt.getMinutes() + delayMinutes);

      await supabase
        .from('zoho_sync_logs')
        .update({
          status: 'retrying',
          error_message: error,
          attempt_count: nextAttempt,
          next_retry_at: nextRetryAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', task.id);
    }
  }
}

export const zohoQueueService = new ZohoQueueService();
export default zohoQueueService;
