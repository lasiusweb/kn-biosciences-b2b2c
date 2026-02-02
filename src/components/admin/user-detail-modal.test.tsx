import { render, screen, fireEvent } from '@testing-library/react';
import { UserDetailModal } from './user-detail-modal';

// Mock UI Dialog since it might have dependency issues in test env
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
}));

// Mock Select components
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange, disabled }: any) => (
    <div data-testid="select-wrapper">
      <select 
        data-testid="select-mock" 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
      >
        {children}
      </select>
    </div>
  ),
  SelectTrigger: ({ children }: any) => <button>{children}</button>,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
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
        onRoleChange={() => {}}
        onStatusChange={() => {}}
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

  it('allows editing role and status', () => {
    const onRoleChange = jest.fn();
    const onStatusChange = jest.fn();

    render(
      <UserDetailModal 
        user={mockUser} 
        isOpen={true} 
        onClose={() => {}}
        onRoleChange={onRoleChange}
        onStatusChange={onStatusChange}
      />
    );

    // Initial state: Badges are shown, Selects might be hidden or disabled
    // But since we are changing implementation to "Edit Mode", checking for button is good
    
    // Click "Edit User Profile" to enable editing
    const editButton = screen.getByText('Edit User Profile');
    fireEvent.click(editButton);

    // Now look for Selects (mocked as <select>)
    // We expect 2 selects: one for role, one for status
    const selects = screen.getAllByTestId('select-mock');
    expect(selects).toHaveLength(2);

    // Change Role
    fireEvent.change(selects[0], { target: { value: 'staff' } });
    expect(onRoleChange).toHaveBeenCalledWith('staff');

    // Change Status
    fireEvent.change(selects[1], { target: { value: 'suspended' } });
    expect(onStatusChange).toHaveBeenCalledWith('suspended');
  });
});
