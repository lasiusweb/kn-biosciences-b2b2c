import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import UserDirectoryPage from './page';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { access_token: 'token' } } }),
    },
  },
}));

// Mock fetch for API
global.fetch = jest.fn();

// Increase timeout for all tests in this file
jest.setTimeout(15000);

describe('UserDirectoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        users: [
          { id: '1', email: 'test@example.com', first_name: 'Test', last_name: 'User', role: 'customer', status: 'active', created_at: new Date().toISOString() }
        ],
        pagination: { page: 1, totalPages: 1 }
      }),
    });
  });

  it('renders the user directory title and fetches users', async () => {
    render(<UserDirectoryPage />);

    expect(screen.getByText(/User Directory/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it('filters users by search query', async () => {
    render(<UserDirectoryPage />);
    
    const searchInput = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=John'),
        expect.any(Object)
      );
    }, { timeout: 10000 });
  });
});
