import { render, screen, waitFor } from '@testing-library/react';
import CategoryNotFound from '../shop/category-not-found/page';
import NotFound from '../not-found';
import { useSearchParams, usePathname } from 'next/navigation';
import { searchProducts } from '@/lib/search-service';

// Mock navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock search service
jest.mock('@/lib/search-service', () => ({
  searchProducts: jest.fn(),
}));

describe('End-to-End Error Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Flow: Broken Category URL -> Category Not Found Page', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'slug' ? 'invalid-seeds' : null),
    });

    render(<CategoryNotFound />);

    expect(screen.getByText(/Category Not Found/i)).toBeInTheDocument();
    expect(screen.getByText(/"invalid-seeds"/i)).toBeInTheDocument();
    expect(screen.getByText(/Return to Shop/i)).toBeInTheDocument();
  });

  it('Flow: Generic 404 -> Not Found Page with Fuzzy Suggestions', async () => {
    (usePathname as jest.Mock).mockReturnValue('/shop/bio-fertilizer-old-link');
    (searchProducts as jest.Mock).mockResolvedValue([
      { id: '1', name: 'Premium Bio-Fertilizer', slug: 'premium-bio-fertilizer' }
    ]);

    render(<NotFound />);

    expect(screen.getByText(/404/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(searchProducts).toHaveBeenCalledWith('bio fertilizer old link');
      expect(screen.getByText('Did you mean...?')).toBeInTheDocument();
      expect(screen.getByText('Premium Bio-Fertilizer')).toBeInTheDocument();
    });
  });
});
