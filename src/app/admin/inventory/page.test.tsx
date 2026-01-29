import { render, screen } from '@testing-library/react';
import InventoryAdminPage from './page';

describe('Inventory Admin Page', () => {
  it('should render inventory stats and table', () => {
    render(<InventoryAdminPage />);
    expect(screen.getByText('Inventory Management')).toBeInTheDocument();
    expect(screen.getByText('Bio-NPK Booster')).toBeInTheDocument();
    expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument();
  });

  it('should show low stock badge correctly', () => {
    render(<InventoryAdminPage />);
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
  });
});
