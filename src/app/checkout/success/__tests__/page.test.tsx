import { render, screen, waitFor } from '@testing-library/react';
import CheckoutSuccessPage from '../page';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// Mock jspdf
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFont: jest.fn(),
    setFontSize: jest.fn(),
    text: jest.fn(),
    line: jest.fn(),
    addPage: jest.fn(),
    save: jest.fn(),
    internal: { pages: [null, {}] },
    splitTextToSize: jest.fn((text) => [text]),
  }));
});

// Mock Order PDF logic
jest.mock('@/lib/order-pdf', () => ({
  downloadOrderInvoice: jest.fn(),
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  },
}));

describe('CheckoutSuccessPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (useSearchParams as jest.Mock).mockReturnValue({ get: () => null });
    (supabase.single as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves

    render(<CheckoutSuccessPage />);
    expect(screen.getByText(/Loading your order details/i)).toBeInTheDocument();
  });

  it('renders order confirmation details', async () => {
    const mockOrder = {
      id: 'order-123',
      order_number: 'ORD-TEST-1',
      total_amount: 1500,
      subtotal: 1200,
      tax_amount: 200,
      shipping_amount: 100,
      shipping_type: 'COURIER',
      shipping_address: { first_name: 'John', address_line1: '123 Main St', city: 'Hyd', state: 'TS', postal_code: '500001' },
      order_items: [
        { 
          variant_id: 'v1', 
          quantity: 2, 
          unit_price: 600, 
          total_price: 1200,
          product_variants: { products: { name: 'Bio-Fert' } } 
        }
      ]
    };

    (useSearchParams as jest.Mock).mockReturnValue({ get: (key: string) => key === 'payment_id' ? 'pay-123' : null });
    (supabase.single as jest.Mock).mockResolvedValue({ data: mockOrder, error: null });

    render(<CheckoutSuccessPage />);

    await waitFor(() => {
      expect(screen.getByText(/Order Confirmed!/i)).toBeInTheDocument();
      expect(screen.getByText(/ORD-TEST-1/i)).toBeInTheDocument();
      expect(screen.getByText(/John/i)).toBeInTheDocument();
      expect(screen.getByText(/₹1,500/i)).toBeInTheDocument();
    });
  });
});
