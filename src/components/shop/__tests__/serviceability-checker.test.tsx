import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ServiceabilityChecker } from '../serviceability-checker';

// Mock the fetch call
global.fetch = jest.fn();

describe('ServiceabilityChecker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with initial state', () => {
    render(<ServiceabilityChecker />);
    expect(screen.getByPlaceholderText(/enter pincode/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check/i })).toBeInTheDocument();
  });

  it('shows error for invalid pincode', async () => {
    render(<ServiceabilityChecker />);
    const input = screen.getByPlaceholderText(/enter pincode/i);
    const button = screen.getByRole('button', { name: /check/i });

    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.click(button);

    expect(screen.getByText(/invalid pincode/i)).toBeInTheDocument();
  });

  it('shows serviceable status and EDD when API returns success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        serviceable: true,
        edd: '2026-02-10',
        description: 'Standard Home Delivery'
      }),
    });

    render(<ServiceabilityChecker />);
    const input = screen.getByPlaceholderText(/enter pincode/i);
    const button = screen.getByRole('button', { name: /check/i });

    fireEvent.change(input, { target: { value: '500001' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/serviceable/i)).toBeInTheDocument();
      expect(screen.getByText(/delivery by/i)).toBeInTheDocument();
      expect(screen.getByText(/10 Feb/i)).toBeInTheDocument();
    });
  });

  it('shows unserviceable message when API returns failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        serviceable: false,
        message: 'Not serviceable'
      }),
    });

    render(<ServiceabilityChecker />);
    const input = screen.getByPlaceholderText(/enter pincode/i);
    const button = screen.getByRole('button', { name: /check/i });

    fireEvent.change(input, { target: { value: '999999' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/not serviceable/i)).toBeInTheDocument();
      expect(screen.getByText(/transport options available/i)).toBeInTheDocument();
    });
  });
});
