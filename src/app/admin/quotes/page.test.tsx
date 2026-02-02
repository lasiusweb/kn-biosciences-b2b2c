import { render, screen, waitFor } from '@testing-library/react';
import QuotesAdminPage from './page';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { access_token: 'token' } } }),
    },
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('QuotesAdminPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the quotes directory and fetches quotes', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        quotes: [
          { 
            id: 'quote-1', 
            status: 'submitted', 
            total_amount: 1500, 
            created_at: new Date().toISOString(),
            users: { first_name: 'Test', last_name: 'User', company_name: 'Test Co' }
          }
        ],
        pagination: { page: 1, totalPages: 1 }
      }),
    });

    render(<QuotesAdminPage />);

    expect(screen.getByText(/Quotes Management/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('quote-1'.toUpperCase().substring(0, 8))).toBeInTheDocument();
      expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    });
  });
});
