import { render, screen, fireEvent } from '@testing-library/react';
import { ProductFilters } from '../product-filters';

// Mock Slider because it's hard to test Radix Slider with fireEvent
jest.mock('@/components/ui/slider', () => ({
  Slider: ({ onValueChange, value, defaultValue, max }: any) => (
    <input 
      type="range" 
      data-testid="price-slider" 
      min="0" 
      max={max} 
      value={value ? value[0] : (defaultValue ? defaultValue[0] : 0)}
      onChange={(e) => onValueChange([parseInt(e.target.value)])} 
    />
  ),
}));

describe('ProductFilters', () => {
  const mockSegments = ['agriculture', 'aquaculture'];
  const mockCategories = [
    { id: '1', name: 'Fertilizers', slug: 'fertilizers' },
    { id: '2', name: 'Probiotics', slug: 'probiotics' },
  ];

  it('renders segments and categories correctly', () => {
    render(
      <ProductFilters 
        segments={mockSegments} 
        categories={mockCategories} 
        selectedSegments={[]}
        selectedCategories={[]}
        onSegmentChange={() => {}}
        onCategoryChange={() => {}}
        onPriceChange={() => {}}
      />
    );
    
    expect(screen.getByText(/segments/i)).toBeInTheDocument();
    expect(screen.getByText(/agriculture/i)).toBeInTheDocument();
    expect(screen.getByText(/aquaculture/i)).toBeInTheDocument();
    expect(screen.getByText(/fertilizers/i)).toBeInTheDocument();
    expect(screen.getByText(/probiotics/i)).toBeInTheDocument();
  });

  it('calls onSegmentChange when a segment is clicked', () => {
    const onSegmentChange = jest.fn();
    render(
      <ProductFilters 
        segments={mockSegments} 
        categories={mockCategories} 
        selectedSegments={[]}
        selectedCategories={[]}
        onSegmentChange={onSegmentChange}
        onCategoryChange={() => {}}
        onPriceChange={() => {}}
      />
    );
    
    const checkbox = screen.getByLabelText(/agriculture/i);
    fireEvent.click(checkbox);
    
    expect(onSegmentChange).toHaveBeenCalledWith('agriculture');
  });

  it('calls onPriceChange when slider moves', () => {
    const onPriceChange = jest.fn();
    render(
      <ProductFilters 
        segments={mockSegments} 
        categories={mockCategories} 
        selectedSegments={[]}
        selectedCategories={[]}
        onSegmentChange={() => {}}
        onCategoryChange={() => {}}
        onPriceChange={onPriceChange}
        maxPrice={1000}
      />
    );
    
    const slider = screen.getByTestId('price-slider');
    fireEvent.change(slider, { target: { value: '500' } });
    
    expect(onPriceChange).toHaveBeenCalledWith(500);
  });
});
