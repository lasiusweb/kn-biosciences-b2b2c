import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../product-card';
import { Product, ProductVariant } from '@/types';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} fill={props.fill ? "true" : undefined} />;
  },
}));

describe('ProductCard', () => {
  const mockProduct: Product = {
    id: 'prod-1',
    name: 'Bio-Fertilizer Alpha',
    slug: 'bio-fertilizer-alpha',
    description: 'High quality fertilizer',
    short_description: 'Alpha fertilizer',
    category_id: 'cat-1',
    segment: 'agriculture',
    status: 'active',
    featured: false,
    created_at: '',
    updated_at: ''
  };

  const mockVariant: ProductVariant = {
    id: 'var-1',
    product_id: 'prod-1',
    sku: 'KN-AG-001',
    weight: 1,
    weight_unit: 'kg',
    packing_type: 'bag',
    form: 'powder',
    price: 450,
    compare_price: 600,
    cost_price: 300,
    stock_quantity: 100,
    low_stock_threshold: 10,
    track_inventory: true,
    image_urls: ['/test-image.jpg'],
    created_at: '',
    updated_at: ''
  };

  it('renders product details correctly', () => {
    render(<ProductCard product={mockProduct} variant={mockVariant} />);
    
    expect(screen.getByText('Bio-Fertilizer Alpha')).toBeInTheDocument();
    expect(screen.getByText('₹450')).toBeInTheDocument();
    expect(screen.getByText('₹600')).toBeInTheDocument();
    expect(screen.getByAltText('Bio-Fertilizer Alpha')).toBeInTheDocument();
  });

  it('calls onAddToCart when Quick Add button is clicked', () => {
    const onAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} variant={mockVariant} onAddToCart={onAddToCart} />);
    
    const addButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addButton);
    
    expect(onAddToCart).toHaveBeenCalledWith(mockVariant.id);
  });

  it('displays B2B tiered pricing when in B2B mode', () => {
    const b2bPrices = { dealer: 400, distributor: 350 };
    render(<ProductCard product={mockProduct} variant={mockVariant} b2bPricing={b2bPrices} role="dealer" />);
    
    expect(screen.getByText('₹400')).toBeInTheDocument();
    expect(screen.queryByText('₹450')).not.toBeInTheDocument();
  });
});
