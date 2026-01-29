import { render, screen, fireEvent } from '@testing-library/react';
import OrdersAdminPage from './page';

describe('Orders Admin Page', () => {
  it('should render orders list', () => {
    render(<OrdersAdminPage />);
    expect(screen.getByText('Orders Management')).toBeInTheDocument();
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
  });

  it('should allow status changes', () => {
    render(<OrdersAdminPage />);
    const trigger = screen.getAllByRole('combobox')[0];
    expect(trigger).toHaveTextContent('Pending');
  });
});
