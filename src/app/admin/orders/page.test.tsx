import { render, screen, waitFor } from '@testing-library/react';
import OrdersAdminPage from './page';
import * as adminService from '@/lib/admin-service';

jest.mock('@/lib/admin-service');

describe('Orders Admin Page', () => {
  it('should render orders list from service', async () => {
    const mockOrders = [
      { id: '1', order_number: 'ORD-001', total_amount: 100, status: 'pending', shipping_address: { first_name: 'John', last_name: 'Doe' } }
    ];
    (adminService.getOrders as jest.Mock).mockResolvedValue(mockOrders);

    render(<OrdersAdminPage />);
    
    expect(screen.getByText(/Loading orders/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
