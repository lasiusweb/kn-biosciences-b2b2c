import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuoteReviewModal } from './quote-review-modal';

// Mock UI Dialog
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
}));

const mockQuote: any = {
  id: 'quote-123',
  status: 'submitted',
  subtotal: 1000,
  tax_amount: 180,
  total_amount: 1180,
  users: {
    first_name: 'John',
    last_name: 'Doe',
    company_name: 'Acme Corp',
    email: 'john@acme.com'
  },
  b2b_quote_items: [
    {
      id: 'item-1',
      variant_id: 'var-1',
      quantity: 10,
      unit_price: 100,
      total_price: 1000,
      product_variants: {
        sku: 'SKU-100',
        products: { name: 'Bio-Fertilizer Alpha' }
      }
    }
  ]
};

describe('QuoteReviewModal', () => {
  it('renders quote details correctly', () => {
    render(
      <QuoteReviewModal 
        quote={mockQuote} 
        isOpen={true} 
        onClose={() => {}}
        onSave={() => {}}
        onApprove={() => {}}
      />
    );

    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Acme Corp/i)).toBeInTheDocument();
    expect(screen.getByText(/Bio-Fertilizer Alpha/i)).toBeInTheDocument();
    expect(screen.getByText(/₹1,180/i)).toBeInTheDocument();
  });

  it('allows editing item unit price and quantity', async () => {
    const onSave = jest.fn();
    render(
      <QuoteReviewModal 
        quote={mockQuote} 
        isOpen={true} 
        onClose={() => {}}
        onSave={onSave}
        onApprove={() => {}}
      />
    );

    const priceInput = screen.getByDisplayValue('100');
    fireEvent.change(priceInput, { target: { value: '90' } });

    const qtyInput = screen.getByDisplayValue('10');
    fireEvent.change(qtyInput, { target: { value: '20' } });

    // Check if total recalculated (90 * 20 = 1800 subtotal, + tax)
    // Recalculation logic will be implemented in component
    await waitFor(() => {
      expect(screen.getByText(/₹1,800/i)).toBeInTheDocument();
    });

    const saveButton = screen.getByText(/Save Changes/i);
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalled();
  });
});
