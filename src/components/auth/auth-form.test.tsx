import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthForm } from './auth-form';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
  },
}));

describe('AuthForm', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('calls signUp and inserts profile with correct ID', async () => {
    const mockUser = { id: 'test-user-id', email: 'test@example.com' };
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.from('').insert as jest.Mock).mockResolvedValue({
      error: null,
    });

    render(<AuthForm />);

    // Find the tab trigger specifically
    const signUpTab = screen.getByRole('tab', { name: /Sign Up/i });
    fireEvent.click(signUpTab);

    // Wait for the Sign Up content to be visible
    const firstNameInput = await screen.findByPlaceholderText(/First name/i);
    
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/Last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Create a password/i), { target: { value: 'password123' } });

    // Submit
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.from('users').insert).toHaveBeenCalledWith(expect.objectContaining({
        id: 'test-user-id',
        email: 'test@example.com',
      }));
      expect(mockPush).toHaveBeenCalledWith('/auth/success');
    }, { timeout: 5000 });
  });
});