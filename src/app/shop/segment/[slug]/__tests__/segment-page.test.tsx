import { render, screen, waitFor } from '@testing-library/react';
import SegmentPage from '../page';
import { getProductsBySegment, getVariants } from '@/lib/product-service';

// Mock the product service
jest.mock('@/lib/product-service', () => ({
  getProductsBySegment: jest.fn(),
  getVariants: jest.fn(),
}));

// Mock the sub-components
jest.mock('@/components/shop/product-grid', () => ({
  ProductGrid: ({ products }: any) => (
    <div data-testid="product-grid">
      {products.map((p: any) => <div key={p.id}>{p.name}</div>)}
    </div>
  ),
}));

describe('SegmentPage Integration', () => {
  const mockProducts = [
    { id: '1', name: 'Agri Product 1', slug: 'p1', segment: 'agriculture' },
  ];

  it('fetches products by segment slug and renders them', async () => {
    (getProductsBySegment as jest.Mock).mockResolvedValue(mockProducts);
    (getVariants as jest.Mock).mockResolvedValue([]);
    
    // In Next.js App Router, params are passed as a prop
    render(await SegmentPage({ params: { slug: 'agriculture' } }) as any);
    
    await waitFor(() => {
      expect(getProductsBySegment).toHaveBeenCalledWith('agriculture');
      expect(getVariants).toHaveBeenCalled();
      expect(screen.getByText('Agri Product 1')).toBeInTheDocument();
    });
  });
});
