import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactPage from '../page';
import { useToast } from '@/components/ui/use-toast';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock useToast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn().mockReturnValue({ toast: jest.fn() }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('ContactPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact form and info', () => {
    render(<ContactPage />);
    expect(screen.getByText(/Get In Touch/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact Information/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<ContactPage />);
    
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Subject/i), { target: { value: 'Inquiry' } });
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Hello' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contact/submit', expect.any(Object));
      expect(useToast().toast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Message Sent!",
      }));
    });
  });

  it('shows error toast on submission failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<ContactPage />);
    
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Subject/i), { target: { value: 'Inquiry' } });
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Hello' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(useToast().toast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Submission Failed",
        variant: "destructive",
      }));
    });
  });
});
