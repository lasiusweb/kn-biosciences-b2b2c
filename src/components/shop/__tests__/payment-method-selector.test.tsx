import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentMethodSelector } from '../payment-method-selector';

describe('PaymentMethodSelector', () => {
  const onMethodChange = jest.fn();
  const onProceed = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders payment methods correctly, including Easebuzz', () => {
    render(
      <PaymentMethodSelector 
        selectedMethod="easebuzz" 
        onMethodChange={onMethodChange} 
        onProceed={onProceed} 
      />
    );

    // Use selector to distinguish between label and button
    expect(screen.getByText("Online Payment (Cards, UPI, Net Banking)", { selector: "label" })).toBeInTheDocument();
    expect(screen.getByText(/Pay securely with Easebuzz/i)).toBeInTheDocument();
    expect(screen.getByText(/Razorpay/i)).toBeInTheDocument();
    expect(screen.getByText(/Cash on Delivery/i)).toBeInTheDocument();
  });

  it('calls onMethodChange when a method is selected', () => {
    render(
      <PaymentMethodSelector 
        selectedMethod="easebuzz" 
        onMethodChange={onMethodChange} 
        onProceed={onProceed} 
      />
    );

    const razorpayOption = screen.getByText(/Razorpay/i);
    fireEvent.click(razorpayOption);

    expect(onMethodChange).toHaveBeenCalledWith('razorpay');
  });

  it('calls onProceed when the button is clicked', async () => {
    onProceed.mockResolvedValueOnce(undefined);
    
    render(
      <PaymentMethodSelector 
        selectedMethod="easebuzz" 
        onMethodChange={onMethodChange} 
        onProceed={onProceed} 
      />
    );

    const proceedButton = screen.getByRole('button', { name: /Proceed with Online Payment/i });
    
    const { act } = require('react-dom/test-utils');
    await act(async () => {
      fireEvent.click(proceedButton);
    });

    expect(onProceed).toHaveBeenCalled();
  });
});
