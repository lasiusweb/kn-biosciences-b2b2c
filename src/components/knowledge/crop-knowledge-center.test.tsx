import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CropKnowledgeCenter from './crop-knowledge-center';

// Mock Next.js components
jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>);
jest.mock('next/image', () => (props: any) => <img {...props} />);

// Mock GSAP
jest.mock('gsap', () => {
  const gsapMock = {
    registerPlugin: jest.fn(),
    fromTo: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    timeline: jest.fn(() => ({ fromTo: jest.fn().mockReturnThis() })),
    context: jest.fn((cb: any) => {
      if (typeof cb === 'function') cb();
      return { revert: jest.fn(), add: jest.fn() };
    }),
  };
  return { __esModule: true, default: gsapMock, ...gsapMock };
});

jest.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { getAll: jest.fn(() => []), create: jest.fn(() => ({ kill: jest.fn() })) }
}));

// Mock EnhancedProductService
jest.mock('@/lib/enhanced-product-service', () => ({
  getKnowledgeCenterArticles: jest.fn(() => Promise.resolve([
    {
      id: '1',
      title: 'Complete Wheat Cultivation Guide',
      slug: 'wheat-cultivation-guide',
      excerpt: 'Comprehensive guide...',
      category: 'cultivation',
      tags: ['wheat'],
      read_time: '15 min',
      published_at: '2024-01-15',
      author: { name: 'Dr. Expert' }
    }
  ])),
}));

describe('CropKnowledgeCenter', () => {
  it('renders knowledge content', async () => {
    render(<CropKnowledgeCenter crop="wheat" segment="cereals" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Knowledge Center:/i)).toBeInTheDocument();
      // Expect specific article title
      expect(screen.getByText('Complete Wheat Cultivation Guide')).toBeInTheDocument();
    });
  });
});