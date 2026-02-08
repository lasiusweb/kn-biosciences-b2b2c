/**
 * Unit tests for Zoho Background Sync Queue Service
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock Zoho Services
jest.mock('../sync-service', () => ({
  zohoSyncService: {
    syncUserRegistration: jest.fn(),
    syncContactSubmission: jest.fn(),
    syncB2BQuote: jest.fn(),
  },
}));

jest.mock('../books-sync-service', () => ({
  zohoBooksSyncService: {
    syncOrderToInvoice: jest.fn(),
    syncQuoteToEstimate: jest.fn(),
  },
}));

jest.mock('../inventory-sync-service', () => ({
  zohoInventorySyncService: {
    pushInventoryToZoho: jest.fn(),
  },
}));

describe('ZohoQueueService', () => {
  let ZohoQueueService: any;
  let zohoQueueService: any;
  let supabase: any;
  let zohoSyncService: any;
  let zohoBooksSyncService: any;
  let zohoInventorySyncService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Import after mocking
    const queueModule = require('../queue-service');
    ZohoQueueService = queueModule.ZohoQueueService;
    zohoQueueService = queueModule.zohoQueueService;
    
    supabase = require('@/lib/supabase').supabase;
    zohoSyncService = require('../sync-service').zohoSyncService;
    zohoBooksSyncService = require('../books-sync-service').zohoBooksSyncService;
    zohoInventorySyncService = require('../inventory-sync-service').zohoInventorySyncService;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('processQueue', () => {
    it('should poll for pending and retrying tasks', async () => {
      const mockLogs = [
        { 
          id: 'log-1', 
          entity_type: 'user', 
          entity_id: 'user-1', 
          operation: 'update', 
          zoho_service: 'crm', 
          zoho_entity_type: 'Contact',
          status: 'pending',
          attempt_count: 0
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: mockLogs, error: null }),
      };

      supabase.from.mockReturnValue(mockQuery);
      zohoSyncService.syncUserRegistration.mockResolvedValue({ success: true });

      // Mock update for status change
      const mockUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      supabase.from.mockReturnValueOnce(mockQuery).mockReturnValue(mockUpdate);

      const result = await zohoQueueService.processQueue();
      
      expect(result.processed).toBe(1);
      expect(zohoSyncService.syncUserRegistration).toHaveBeenCalledWith('user-1');
    });

    it('should handle failures and schedule retries with exponential backoff', async () => {
      const mockLogs = [
        { 
          id: 'log-2', 
          entity_type: 'order', 
          entity_id: 'order-1', 
          operation: 'create', 
          zoho_service: 'books', 
          zoho_entity_type: 'Invoice',
          status: 'pending',
          attempt_count: 1,
          max_attempts: 5
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: mockLogs, error: null }),
      };

      supabase.from.mockReturnValue(mockQuery);
      zohoBooksSyncService.syncOrderToInvoice.mockResolvedValue({ success: false, error: 'API Error' });

      const mockUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      supabase.from.mockReturnValueOnce(mockQuery).mockReturnValue(mockUpdate);

      const result = await zohoQueueService.processQueue();
      
      expect(result.failed).toBe(1);
      expect(mockUpdate.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'retrying',
        attempt_count: 2,
        error_message: 'API Error',
        next_retry_at: expect.any(String)
      }));
    });

    it('should mark as failed when max attempts are reached', async () => {
      const mockLogs = [
        { 
          id: 'log-3', 
          entity_type: 'inventory', 
          entity_id: 'variant-1', 
          operation: 'update', 
          zoho_service: 'books', 
          zoho_entity_type: 'Item',
          status: 'retrying',
          attempt_count: 5,
          max_attempts: 5
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: mockLogs, error: null }),
      };

      supabase.from.mockReturnValue(mockQuery);
      zohoInventorySyncService.pushInventoryToZoho.mockResolvedValue({ success: false, error: 'Persistent Error' });

      const mockUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      supabase.from.mockReturnValueOnce(mockQuery).mockReturnValue(mockUpdate);

      const result = await zohoQueueService.processQueue();
      
      expect(result.failed).toBe(1);
      expect(mockUpdate.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'failed',
        error_message: 'Max attempts reached: Persistent Error'
      }));
    });
  });

  describe('addToQueue', () => {
    it('should insert a new pending log entry', async () => {
      const mockInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { id: 'new-log-id' }, error: null }),
      };
      supabase.from.mockReturnValue(mockInsert);

      const result = await zohoQueueService.addToQueue({
        entity_type: 'user',
        entity_id: 'user-123',
        operation: 'create',
        zoho_service: 'crm',
        zoho_entity_type: 'Contact'
      });

      expect(result.success).toBe(true);
      expect(mockInsert.insert).toHaveBeenCalledWith(expect.objectContaining({
        entity_type: 'user',
        status: 'pending'
      }));
    });
  });
});
