import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SegmentHubLayout from './segment-hub-layout';

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
  getKnowledgeCenterArticles: jest.fn(() => Promise.resolve([])),
  getProductsBySegment: jest.fn((segment: string) => Promise.resolve({
    title: `${segment.charAt(0).toUpperCase() + segment.slice(1)} Solutions`,
    stats: { total_products: 50, total_crops: 5, featured_crops: 3 },
    featured_crops: [],
    contextual_sidebar: { recommended_reading: [], upcoming_crops: [], crop_tips: [] }
  })),
  EnhancedProductService: jest.fn().mockImplementation(() => ({
    getProductsBySegment: jest.fn((segment: string) => Promise.resolve({
      title: `${segment.charAt(0).toUpperCase() + segment.slice(1)} Solutions`,
      stats: { total_products: 50, total_crops: 5, featured_crops: 3 },
      featured_crops: [],
      contextual_sidebar: { recommended_reading: [], upcoming_crops: [], crop_tips: [] }
    }))
  }))
}));

// Mock subcomponents
jest.mock('@/components/knowledge/crop-knowledge-center', () => () => <div>KC</div>);
jest.mock('@/components/knowledge/knowledge-sidebar', () => () => <div>Sidebar</div>);
jest.mock('@/components/knowledge/quick-crop-tips', () => () => <div>Tips</div>);

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('SegmentHubLayout', () => {
  it('renders correctly', async () => {
    render(<SegmentHubLayout segment="cereals" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Cereals Solutions/i)).toBeInTheDocument();
    });
  });
});
