import { render, screen } from '@testing-library/react';
import { ProductGrid } from '../product-grid';
import { Product, ProductVariant } from '@/types';

// Mock ProductCard
jest.mock('../product-card', () => ({
  ProductCard: ({ product }: any) => <div data-testid="product-card">{product.name}</div>,
}));

describe('ProductGrid', () => {
  const mockProducts = [
    { id: '1', name: 'Product 1', slug: 'p1', segment: 'agriculture' },
    { id: '2', name: 'Product 2', slug: 'p2', segment: 'aquaculture' },
  ] as any[];

  const mockVariants = [
    { id: 'v1', product_id: '1', price: 100 },
    { id: 'v2', product_id: '2', price: 200 },
  ] as any[];

  it('renders correct number of product cards', () => {
    render(<ProductGrid products={mockProducts} variants={mockVariants} />);
    
    const cards = screen.getAllByTestId('product-card');
    expect(cards).toHaveLength(2);
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('renders empty state when no products provided', () => {
    render(<ProductGrid products={[]} variants={[]} />);
    
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });

  it('displays loading state when loading is true', () => {
    render(<ProductGrid products={[]} variants={[]} isLoading={true} />);
    
    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
  });
});
