import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminLayout from './layout';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Admin Layout', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('should redirect to login if user is not authenticated', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null }, error: null });

    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth');
    });
  });

  it('should redirect to home if user is not an admin', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: '1', user_metadata: { role: 'customer' } } },
      error: null,
    });

    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('should render children if user is an admin', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: '1', user_metadata: { role: 'admin' } } },
      error: null,
    });

    render(
      <AdminLayout>
        <div data-testid="admin-content">Admin Content</div>
      </AdminLayout>
    );

    const content = await screen.findByTestId('admin-content');
    expect(content).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('should sign out and redirect on logout click', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: '1', user_metadata: { role: 'admin' } } },
      error: null,
    });

    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    const logoutButton = await screen.findByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
