import { render, screen, waitFor } from '@testing-library/react';
import CheckoutPage from '../page';
import { supabase } from '@/lib/supabase';

// Mock Supabase with proper chaining
const mockSupabaseQuery = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
};

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => mockSupabaseQuery),
  },
}));

// Mock CheckoutFlow
jest.mock('@/components/shop/checkout-flow', () => ({
  CheckoutFlow: ({ orderId, amount }: any) => (
    <div data-testid="checkout-flow">
      Order: {orderId}, Amount: {amount}
    </div>
  ),
}));

// Mock LoadingSpinner
jest.mock('@/components/ui/loading-spinner', () => ({
  LoadingSpinner: () => <div data-testid="loading">Loading...</div>,
}));

describe('CheckoutPage Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock setup for successful initialization
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } }
    });

    // Reset default mock behaviors
    mockSupabaseQuery.single.mockImplementation(async () => ({ data: {} }));
    mockSupabaseQuery.select.mockImplementation(() => mockSupabaseQuery);
  });

  it('initializes order and renders checkout flow', async () => {
    // Specific implementation for this test
    mockSupabaseQuery.single.mockImplementation(async () => {
        // Return different data based on which table is being queried?
        // Since we can't easily distinguish table in the implementation without state
        // Let's use a simpler approach or just return what's needed.
        return { data: { id: 'order-999', first_name: 'John', last_name: 'Doe', phone: '123', postal_code: '500001' } };
    });
    
    mockSupabaseQuery.select.mockImplementation((query) => {
        if (query && query.includes('product_variants')) {
            return {
                ...mockSupabaseQuery,
                mockResolvedValue: jest.fn().mockResolvedValue({ data: [{ quantity: 2, product_variants: { price: 500 } }] }),
                // Need to handle the promise
                then: (fn: any) => Promise.resolve({ data: [{ quantity: 2, product_variants: { price: 500 } }] }).then(fn)
            };
        }
        return mockSupabaseQuery;
    });

    // Redefine more strictly
    (supabase.from as jest.Mock).mockImplementation((table) => {
        const query = { ...mockSupabaseQuery };
        if (table === 'cart_items') {
            query.select = jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ data: [{ quantity: 2, product_variants: { price: 500 } }] })
            });
        } else if (table === 'orders') {
            query.insert = jest.fn().mockReturnThis();
            query.select = jest.fn().mockReturnThis();
            query.single = jest.fn().mockResolvedValue({ data: { id: 'order-999' } });
        } else if (table === 'users' || table === 'addresses') {
            query.single = jest.fn().mockResolvedValue({ data: { first_name: 'John', last_name: 'Doe', phone: '123', postal_code: '500001' } });
        }
        return query;
    });

    render(<CheckoutPage />);

    // Initially shows loading
    expect(screen.getByText(/preparing your checkout/i)).toBeInTheDocument();

    // Eventually shows checkout flow with data
    await waitFor(() => {
      expect(screen.getByTestId('checkout-flow')).toBeInTheDocument();
      expect(screen.getByText(/Order: order-999/)).toBeInTheDocument();
      expect(screen.getByText(/Amount: 1000/)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it('shows error if cart is empty', async () => {
    (supabase.from as jest.Mock).mockImplementation((table) => {
      const query = { ...mockSupabaseQuery };
      if (table === 'cart_items') {
        query.select = jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: [] })
        });
      }
      return query;
    });

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    });
  });
});