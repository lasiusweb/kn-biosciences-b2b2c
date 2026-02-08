// src/app/admin/zoho/sync-logs/__tests__/page.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ZohoSyncLogsPage from '../page';
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

// Mock user-management to always return admin role
jest.mock('@/lib/auth/user-management', () => ({
  getUserRole: jest.fn().mockResolvedValue('admin'),
}));

// Mock AdminLayout
jest.mock('@/components/layout/admin-layout', () => {
  return ({ children }: any) => <div>{children}</div>;
});

// Mock useToast
const mockToast = jest.fn();
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock fetch API
global.fetch = jest.fn();

const mockLogs = [
  {
    id: 'log-1',
    entity_type: 'user',
    entity_id: 'user-1',
    operation: 'create',
    zoho_service: 'crm',
    zoho_entity_type: 'Contact',
    zoho_entity_id: 'zc-1',
    status: 'success',
    attempt_count: 1,
    max_attempts: 5,
    next_retry_at: null,
    error_message: null,
    created_at: '2023-01-01T10:00:00Z',
    updated_at: '2023-01-01T10:00:00Z',
  },
  {
    id: 'log-2',
    entity_type: 'order',
    entity_id: 'order-1',
    operation: 'create',
    zoho_service: 'books',
    zoho_entity_type: 'Invoice',
    zoho_entity_id: null,
    status: 'failed',
    attempt_count: 3,
    max_attempts: 5,
    next_retry_at: '2023-01-01T11:00:00Z',
    error_message: 'API rate limit exceeded',
    created_at: '2023-01-01T10:05:00Z',
    updated_at: '2023-01-01T10:30:00Z',
  },
];

describe('ZohoSyncLogsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockLogs, count: mockLogs.length, page: 1, pageSize: 10 }),
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [], count: 0, page: 1, pageSize: 10 }), // Default for subsequent fetches
      });
  });

  it('renders the Zoho Sync Logs title', async () => {
    render(<ZohoSyncLogsPage />);
    expect(screen.getByText('Zoho Sync Logs')).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  });

  it('displays sync logs in a table', async () => {
    render(<ZohoSyncLogsPage />);
    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Entity')).toBeInTheDocument();
      expect(screen.getByText('Operation')).toBeInTheDocument();
      expect(screen.getByText('Zoho Service')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Attempts')).toBeInTheDocument();
      expect(screen.getByText('Error Message')).toBeInTheDocument();
      expect(screen.getByText('Created At')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();

      expect(screen.getByText('log-1'.substring(0, 8) + '...')).toBeInTheDocument();
      expect(screen.getByText('user-1'.substring(0, 8) + '...')).toBeInTheDocument();
      expect(screen.getByText('create')).toBeInTheDocument();
      expect(screen.getByText('crm')).toBeInTheDocument();
      expect(screen.getAllByText('success')[0]).toBeInTheDocument(); // Use getAllByText as "success" might appear multiple times
      expect(screen.getByText('1/5')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();

      expect(screen.getByText('log-2'.substring(0, 8) + '...')).toBeInTheDocument();
      expect(screen.getByText('order-1'.substring(0, 8) + '...')).toBeInTheDocument();
      expect(screen.getByText('API rate limit exceeded')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });
  });

  it('filters logs by status', async () => {
    render(<ZohoSyncLogsPage />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('combobox', { name: 'Filter by Status' }));
    fireEvent.click(screen.getByText('Failed'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
      const calledUrl = (fetch as jest.Mock).mock.calls[1][0];
      expect(calledUrl).toContain('status=failed');
    });
  });

  it('handles retry button click for failed logs', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockLogs, count: mockLogs.length, page: 1, pageSize: 10 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'Task scheduled for retry' }),
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: mockLogs, count: mockLogs.length, page: 1, pageSize: 10 }), // Refetch logs
      });

    render(<ZohoSyncLogsPage />);
    await waitFor(() => screen.getByText('API rate limit exceeded'));

    const retryButton = screen.getByRole('button', { name: 'Retry' });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3); // Initial fetch + retry POST + refetch
      const postCall = (fetch as jest.Mock).mock.calls[1];
      expect(postCall[0]).toBe('/api/admin/zoho/sync-logs');
      expect(postCall[1].method).toBe('POST');
      expect(JSON.parse(postCall[1].body)).toEqual({ logId: 'log-2', action: 'retry' });
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Retry Scheduled',
        description: 'The task has been scheduled for immediate retry.',
      }));
    });
  });
});
