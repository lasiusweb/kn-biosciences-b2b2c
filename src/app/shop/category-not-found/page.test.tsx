import { render, screen } from '@testing-library/react';
import CategoryNotFound from './page';
import { useSearchParams } from 'next/navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// Mock Link since it's used in the component
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock dependencies (Recommendations, Search) - placeholders for now
jest.mock('@/lib/product-service', () => ({
  getRecommendedProducts: jest.fn().mockResolvedValue([
    { id: '1', name: 'Trending Product', slug: 'trending-1', price: 99 }
  ]),
}));

describe('CategoryNotFound Page', () => {
  const mockSlug = 'mystery-fertilizer';

  beforeEach(() => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'slug' ? mockSlug : null),
    });
  });

  it('renders the not found message', () => {
    render(<CategoryNotFound />);
    expect(screen.getByText(/Category Not Found/i)).toBeInTheDocument();
  });

  it('displays breadcrumbs or link to return to shop', () => {
    render(<CategoryNotFound />);
    expect(screen.getByText(/Return to Shop/i)).toBeInTheDocument();
  });
});
