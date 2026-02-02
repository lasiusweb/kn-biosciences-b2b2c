import { render, screen, fireEvent } from '@testing-library/react';
import CheckoutFailurePage from '../page';
import { useSearchParams, useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

describe('CheckoutFailurePage', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  it('renders default error message if no reason provided', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => null,
    });

    render(<CheckoutFailurePage />);

    expect(screen.getByText(/Payment Failed/i)).toBeInTheDocument();
    expect(screen.getByText(/Your payment could not be processed/i)).toBeInTheDocument();
  });

  it('renders specific error message for user cancellation', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => key === 'reason' ? 'user_cancelled' : null,
    });

    render(<CheckoutFailurePage />);

    expect(screen.getByText(/The payment was cancelled by you/i)).toBeInTheDocument();
  });

  it('navigates back to checkout when Try Again is clicked', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => null,
    });

    render(<CheckoutFailurePage />);

    const retryButton = screen.getByRole('button', { name: /Try Again/i });
    fireEvent.click(retryButton);

    expect(push).toHaveBeenCalledWith('/checkout');
  });
});
