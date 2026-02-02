import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CheckoutFlow } from '../checkout-flow';
import React from 'react';

// Mock UI components
jest.mock('../shipping-method-selector', () => ({
  ShippingMethodSelector: ({ onProceed, onSelect, options }: any) => (
    <div data-testid="shipping-selector">
      <button onClick={() => onSelect(options[0])}>Select First Option</button>
      <button onClick={onProceed}>Proceed to Payment</button>
    </div>
  ),
}));

jest.mock('../payment-method-selector', () => ({
  PaymentMethodSelector: ({ onProceed }: any) => (
    <div data-testid="payment-selector">
      <button onClick={onProceed}>Proceed to Payment</button>
    </div>
  ),
}));

jest.mock('../payment-confirmation', () => ({
  PaymentConfirmation: () => <div data-testid="payment-confirmation">Success</div>,
}));

// Mock fetch
global.fetch = jest.fn();

describe('CheckoutFlow', () => {
  const mockProps = {
    orderId: 'order-123',
    amount: 1000,
    customerInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      pincode: '500001'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initially renders the shipping method step after loading', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ serviceable: true }),
    });

    render(<CheckoutFlow {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('shipping-selector')).toBeInTheDocument();
    });
  });

  it('proceeds to payment method after selecting shipping', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('serviceability')) {
            return Promise.resolve({ ok: true, json: async () => ({ serviceable: true }) });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    render(<CheckoutFlow {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('shipping-selector')).toBeInTheDocument();
    });

    // Select shipping
    fireEvent.click(screen.getByText('Select First Option'));
    
    // Proceed
    fireEvent.click(screen.getByText('Proceed to Payment'));

    // Should now show payment selector
    await waitFor(() => {
      expect(screen.getByTestId('payment-selector')).toBeInTheDocument();
    });
  });
});
