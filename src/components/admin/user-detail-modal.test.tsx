import { render, screen } from '@testing-library/react';
import { UserDetailModal } from './user-detail-modal';

// Mock UI Dialog since it might have dependency issues in test env
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
}));

const mockUser: any = {
  id: '1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  role: 'customer',
  status: 'active',
  created_at: new Date().toISOString(),
  addresses: [
    {
      id: 'addr1',
      type: 'shipping',
      street_address: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400001',
      country: 'India',
      is_default: true
    }
  ]
};

describe('UserDetailModal', () => {
  it('renders user details correctly', () => {
    render(
      <UserDetailModal 
        user={mockUser} 
        isOpen={true} 
        onClose={() => {}} 
      />
    );

    expect(screen.getByText(/John/)).toBeInTheDocument();
    expect(screen.getByText(/Doe/)).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
    expect(screen.getByText(/Mumbai/)).toBeInTheDocument();
    expect(screen.getByText(/Maharashtra/)).toBeInTheDocument();
    expect(screen.getByText(/400001/)).toBeInTheDocument();
  });
});
