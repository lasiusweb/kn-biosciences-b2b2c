import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CropEnvironmentView from './crop-environment-view';

// Mock everything needed
jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>);
jest.mock('next/image', () => (props: any) => <img {...props} />);
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useParams: jest.fn(() => ({ crop: 'wheat', segment: 'cereals' }))
}));

// Mock GSAP
jest.mock('gsap', () => {
  const gsapMock = {
    registerPlugin: jest.fn(),
    fromTo: jest.fn().mockReturnThis(),
    timeline: jest.fn(() => ({ fromTo: jest.fn().mockReturnThis() })),
  };
  return { __esModule: true, default: gsapMock, ...gsapMock };
});

jest.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { getAll: jest.fn(() => []), create: jest.fn(() => ({ kill: jest.fn() })) }
}));

// Mock EnhancedProductService
jest.mock('@/lib/enhanced-product-service', () => ({
  getProducts: jest.fn(() => Promise.resolve({
    products: [
      { id: '1', name: 'Wheat Protection Pro', slug: 'wheat-pro', category: 'protection', product_variants: [{ price: 450 }] },
    ],
    totalCount: 1
  })),
  getKnowledgeCenterArticles: jest.fn(() => Promise.resolve([])),
}));

// Mock KnowledgeSidebar
jest.mock('@/components/knowledge/knowledge-sidebar', () => {
  return function MockKnowledgeSidebar() {
    return <div data-testid="mock-sidebar">Knowledge Sidebar</div>;
  };
});

describe('CropEnvironmentView with Sidebar', () => {
  it('renders the sidebar for guidance', async () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
      expect(screen.getByText('Knowledge Sidebar')).toBeInTheDocument();
    });
  });
});
