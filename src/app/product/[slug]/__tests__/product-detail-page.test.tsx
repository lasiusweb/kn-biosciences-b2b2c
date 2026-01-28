import { render, screen, waitFor } from '@testing-library/react';
import ProductDetailPage from '../page';
import { getProductBySlug, getVariants } from '@/lib/product-service';

// Mock the product service
jest.mock('@/lib/product-service', () => ({
  getProductBySlug: jest.fn(),
  getVariants: jest.fn(),
}));

describe('ProductDetailPage Integration', () => {
  const mockProduct = {
    id: '1',
    name: 'Detail Product 1',
    slug: 'p1',
    description: 'Detailed description',
    short_description: 'Short',
    segment: 'agriculture',
  };

  it('fetches product by slug and renders details', async () => {
    (getProductBySlug as jest.Mock).mockResolvedValue(mockProduct);
    (getVariants as jest.Mock).mockResolvedValue([{ id: 'v1', product_id: '1', price: 100, image_urls: [] }]);
    
    render(await ProductDetailPage({ params: { slug: 'p1' } }) as any);
    
    await waitFor(() => {
      expect(getProductBySlug).toHaveBeenCalledWith('p1');
      expect(screen.getByText('Detail Product 1')).toBeInTheDocument();
    }, { timeout: 10000 });
  }, 30000);
});
