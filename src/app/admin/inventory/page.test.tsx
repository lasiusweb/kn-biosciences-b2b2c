import { render, screen, waitFor } from '@testing-library/react';
import InventoryAdminPage from './page';
import * as adminService from '@/lib/admin-service';

jest.mock('@/lib/admin-service');

describe('Inventory Admin Page', () => {
  it('should render inventory stats and table from service', async () => {
    const mockInventory = [
      { id: '1', name: 'Bio-NPK Booster', stock: 150, minStock: 50, batch: 'B1', expiry: '2027' }
    ];
    (adminService.getInventory as jest.Mock).mockResolvedValue(mockInventory);

    render(<InventoryAdminPage />);
    
    expect(screen.getByText(/Loading inventory/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Bio-NPK Booster')).toBeInTheDocument();
      expect(screen.getByText('150 units')).toBeInTheDocument();
    });
  });
});
