import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuotesAdminPage from '../page';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ 
        data: { session: { access_token: 'token' } } 
      }),
    },
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Mock window.alert
global.alert = jest.fn();

const mockQuote = { 
  id: 'quote-123', 
  status: 'submitted', 
  total_amount: 1500, 
  subtotal: 1271.19,
  tax_amount: 228.81,
  created_at: new Date().toISOString(),
  users: { 
    first_name: 'John', 
    last_name: 'Doe',
    email: 'john@example.com',
    company_name: 'Acme Corp'
  },
  b2b_quote_items: [
    {
      id: 'item-1',
      variant_id: 'var-1',
      quantity: 10,
      unit_price: 127.12,
      total_price: 1271.19,
      product_variants: {
        sku: 'SKU-1',
        products: { name: 'Test Product' }
      }
    }
  ]
};

describe('Quotes Admin Integration Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should go through the full review and approval flow', async () => {
    // 1. Mock initial quotes fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        quotes: [mockQuote],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 }
      }),
    });

    render(<QuotesAdminPage />);

    // Wait for quote to appear
    const reviewButton = await screen.findByRole('button', { name: /review/i });
    fireEvent.click(reviewButton);

    // 2. Modal should be open
    expect(await screen.findByText(/Review Quote:/i)).toBeInTheDocument();

    // 3. Mock save (PATCH) and approve (POST)
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true }) // PATCH save
      .mockResolvedValueOnce({ 
        ok: true, 
        json: async () => ({ orderNumber: 'ORD-123', orderId: 'ord-123' }) 
      }) // POST approve
      .mockResolvedValueOnce({ // Refetch quotes after approval
        ok: true,
        json: async () => ({
          quotes: [{ ...mockQuote, status: 'approved' }],
          pagination: { page: 1, totalPages: 1, total: 1, limit: 10 }
        }),
      });

    // Click Approve button
    const approveButton = screen.getByRole('button', { name: /approve & create order/i });
    fireEvent.click(approveButton);

    // 4. Verify API calls
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/quotes', expect.any(Object));
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/quotes/approve', expect.any(Object));
      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Quote approved successfully'));
    });

    // 5. Verify modal closed and list updated
    await waitFor(() => {
      expect(screen.queryByText(/Review Quote: QUOTE-123/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Approved/i)).toBeInTheDocument();
    });
  });
});
