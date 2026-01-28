import { render, screen, waitFor } from '@testing-library/react';
import { ShopPage } from '@/components/shop/shop-page';
import { getProducts } from '@/lib/product-service';

// Mock the product service
jest.mock('@/lib/product-service', () => ({
  getProducts: jest.fn(),
}));

// Mock the sub-components to focus on page integration
jest.mock('@/components/shop/product-grid', () => ({
  ProductGrid: ({ products }: any) => (
    <div data-testid="product-grid">
      {products.map((p: any) => <div key={p.id}>{p.name}</div>)}
    </div>
  ),
}));

jest.mock('@/components/shop/product-filters', () => ({
  ProductFilters: () => <div data-testid="product-filters">Filters</div>,
}));

describe('ShopPage Integration', () => {
  const mockProducts = [
    { id: '1', name: 'Product 1', slug: 'p1', segment: 'agriculture' },
    { id: '2', name: 'Product 2', slug: 'p2', segment: 'aquaculture' },
  ];

  const mockVariants = [
    { id: 'v1', product_id: '1', price: 100 },
    { id: 'v2', product_id: '2', price: 200 },
  ];

  it('fetches products and renders filters and grid', async () => {
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    // Also mock fetch for categories if needed, but for now we focus on products
    global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('/api/categories')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<ShopPage />);
    
    expect(screen.getByTestId('product-filters')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(getProducts).toHaveBeenCalled();
      expect(screen.getByTestId('product-grid')).toBeInTheDocument();
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });
});
