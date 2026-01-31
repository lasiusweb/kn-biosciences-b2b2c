import { render, screen, waitFor } from '@testing-library/react';
import NotFound from './not-found';
import { usePathname } from 'next/navigation';
import { searchProducts } from '@/lib/search-service';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock Search Service
jest.mock('@/lib/search-service', () => ({
  searchProducts: jest.fn(),
}));

// Mock GSAP
jest.mock('gsap', () => ({
  context: jest.fn((cb) => {
    cb();
    return { revert: jest.fn() };
  }),
  from: jest.fn(),
}));

// Mock UI Components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}));
jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} data-testid="search-input" />
}));

describe('Not Found Page', () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/some-random-page');
    (searchProducts as jest.Mock).mockResolvedValue([]);
  });

  it('renders the 404 message', () => {
    render(<NotFound />);
    expect(screen.getByText(/404/i)).toBeInTheDocument();
  });

  it('provides a way to return home', () => {
    render(<NotFound />);
    expect(screen.getByText(/Return Home/i)).toBeInTheDocument();
  });

  it('includes a search bar', () => {
    render(<NotFound />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('searches for products based on URL slug', async () => {
     (usePathname as jest.Mock).mockReturnValue('/shop/my-missing-product');
     (searchProducts as jest.Mock).mockResolvedValue([
         { id: '1', name: 'Found Product', slug: 'found-product', price: 10 }
     ]);

     render(<NotFound />);
     
     await waitFor(() => {
         // Expect it to extract the last segment and replace hyphens
         expect(searchProducts).toHaveBeenCalledWith('my missing product');
         expect(screen.getByText('Found Product')).toBeInTheDocument();
     });
  });
});