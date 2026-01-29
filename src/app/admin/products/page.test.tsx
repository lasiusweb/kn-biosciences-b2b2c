import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductsAdminPage from './page';
import * as adminService from '@/lib/admin-service';
import * as parser from '@/utils/import-parser';

jest.mock('@/lib/admin-service');
jest.mock('@/utils/import-parser');

describe('Products Admin Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // JSDOM doesn't support Blob.text() yet
    if (typeof Blob.prototype.text !== 'function') {
      Blob.prototype.text = function() {
        return Promise.resolve('name,price,segment\nTest Product,100,seeds');
      };
    }
  });

  it('should render the page title and buttons', () => {
    render(<ProductsAdminPage />);
    expect(screen.getByText('Products Management')).toBeInTheDocument();
    expect(screen.getByText('Bulk Import')).toBeInTheDocument();
  });

  it('should show preview after file selection', async () => {
    const mockProducts = [{ name: 'Test Product', price: 100, segment: 'seeds', slug: 'test', description: '' }];
    (parser.parseCSV as jest.Mock).mockResolvedValue(mockProducts);

    render(<ProductsAdminPage />);
    
    const file = new File(['name,price,segment\nTest Product,100,seeds'], 'products.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Import Preview (1 products)')).toBeInTheDocument();
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });

  it('should call bulkImportProducts when confirmed', async () => {
    const mockProducts = [{ name: 'P1', price: 10, segment: 's', slug: 'p1', description: '' }];
    (parser.parseCSV as jest.Mock).mockResolvedValue(mockProducts);
    (adminService.bulkImportProducts as jest.Mock).mockResolvedValue({ success: true, importedCount: 1 });

    window.alert = jest.fn();

    render(<ProductsAdminPage />);
    
    const file = new File(['p'], 'p.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    const confirmBtn = await screen.findByText('Confirm Import');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(adminService.bulkImportProducts).toHaveBeenCalledWith(mockProducts);
      expect(window.alert).toHaveBeenCalledWith('Successfully imported 1 products.');
    });
  });
});
