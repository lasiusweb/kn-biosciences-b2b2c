import { render, screen, waitFor } from '@testing-library/react';
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

describe('UserDirectoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the user directory title and fetches users', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        users: [
          { id: '1', email: 'test@example.com', first_name: 'Test', last_name: 'User', role: 'customer', status: 'active', created_at: new Date().toISOString() }
        ],
        pagination: { page: 1, totalPages: 1 }
      }),
    });

    render(<UserDirectoryPage />);

    expect(screen.getByText(/User Directory/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });
});
