import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SegmentHubLayout from './segment-hub-layout';

// Mock GSAP
jest.mock('gsap', () => ({
  gsap: {
    timeline: jest.fn(() => ({
      fromTo: jest.fn(),
      kill: jest.fn(),
    })),
    fromTo: jest.fn(),
    registerPlugin: jest.fn(),
  },
  ScrollTrigger: {
    getAll: jest.fn(() => []),
    create: jest.fn(() => ({ kill: jest.fn() })),
  },
}));

// Mock the enhanced product service
jest.mock('@/lib/enhanced-product-service', () => ({
  EnhancedProductService: jest.fn().mockImplementation(() => ({
    getProductsBySegment: jest.fn((segment: string) => {
      if (segment === 'cereals') {
        return Promise.resolve({
          title: 'Cereal Crop Solutions',
          description: 'Comprehensive protection and nutrition solutions for wheat, rice, and maize.',
          stats: {
            total_products: 156,
            total_crops: 12,
            featured_crops: 8
          },
          featured_crops: [
            {
              id: 'wheat-sol-1',
              title: 'Wheat Protection Bundle',
              description: 'Complete protection solution for wheat cultivation.',
              image_url: '/images/crops/wheat-field.jpg',
              crop_type: 'wheat',
              featured: true,
              products_count: 12,
              quick_stats: {
                min_price: 450,
                max_price: 2800,
                avg_yield: '+25%'
              },
              segment_url: '/segments/cereals/wheat',
              educational_articles: [],
              is_interactive: false
            }
          ],
          contextual_sidebar: {
            recommended_reading: [
              {
                id: 'rec-1',
                title: 'Seasonal Crop Planning Guide',
                description: 'Plan your cereal crop cultivation schedule.',
                url: '/knowledge/seasonal-planning',
                category: 'Planning',
                type: 'guide' as const,
                read_time: '15 min'
              }
            ],
            upcoming_crops: [],
            crop_tips: []
          }
        });
      }
      return Promise.resolve({
        title: 'Default Solutions',
        description: 'Default solutions for testing',
        stats: { total_products: 0, total_crops: 0, featured_crops: 0 },
        featured_crops: [],
        contextual_sidebar: { recommended_reading: [], upcoming_crops: [], crop_tips: [] }
      });
    }),
  })),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn((element) => {
    // Simulate intersection
    setTimeout(() => {
      callback([{ isIntersecting: true, target: element }]);
    }, 100);
  }),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('SegmentHubLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    render(<SegmentHubLayout segment="cereals" />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders segment data after loading', async () => {
    render(<SegmentHubLayout segment="cereals" />);
    
    await waitFor(() => {
      expect(screen.getByText('Cereal Crop Solutions')).toBeInTheDocument();
      expect(screen.getByText('156')).toBeInTheDocument();
      expect(screen.getByText('Wheat Protection Bundle')).toBeInTheDocument();
    });
  });

  it('displays hero section with correct content', async () => {
    render(<SegmentHubLayout segment="cereals" />);
    
    await waitFor(() => {
      expect(screen.getByText('Cereal Crop Solutions')).toBeInTheDocument();
      expect(screen.getByText(/Comprehensive protection and nutrition solutions/)).toBeInTheDocument();
      expect(screen.getByText('156')).toBeInTheDocument(); // Total Products
      expect(screen.getByText('12')).toBeInTheDocument(); // Supported Crops
      expect(screen.getByText('8')).toBeInTheDocument(); // Featured Solutions
    });
  });

  it('renders crop cards with correct information', async () => {
    render(<SegmentHubLayout segment="cereals" />);
    
    await waitFor(() => {
      const card = screen.getByText('Wheat Protection Bundle');
      expect(card).toBeInTheDocument();
      
      expect(screen.getByText('Complete protection solution for wheat cultivation.')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument(); // Products count
      expect(screen.getByText('₹450 - ₹2800')).toBeInTheDocument(); // Price range
      expect(screen.getByText('+25%')).toBeInTheDocument(); // Avg yield
    });
  });

  it('renders contextual sidebar when available', async () => {
    render(<SegmentHubLayout segment="cereals" />);
    
    await waitFor(() => {
      expect(screen.getByText('Recommended Reading')).toBeInTheDocument();
      expect(screen.getByText('Seasonal Crop Planning Guide')).toBeInTheDocument();
      expect(screen.getByText('Plan your cereal crop cultivation schedule.')).toBeInTheDocument();
      expect(screen.getByText('15 min read')).toBeInTheDocument();
    });
  });

  it('handles empty segment gracefully', async () => {
    render(<SegmentHubLayout segment="nonexistent" />);
    
    await waitFor(() => {
      expect(screen.getByText('Nonexistent Solutions')).toBeInTheDocument();
      expect(screen.getByText('Premium agricultural solutions for nonexistent crops')).toBeInTheDocument();
    });
  });

  it('has functional explore solutions button', async () => {
    render(<SegmentHubLayout segment="cereals" />);
    
    await waitFor(() => {
      const button = screen.getByText('Explore Solutions');
      expect(button).toBeInTheDocument();
      expect(button.closest('button')).toHaveClass('bg-organic-500');
    });
  });

  it('displays crop cards in responsive grid', async () => {
    render(<SegmentHubLayout segment="cereals" />);
    
    await waitFor(() => {
      const grid = screen.getByText('Featured Crop Solutions').closest('section');
      const cardsContainer = grid?.querySelector('.grid');
      expect(cardsContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
    });
  });

  it('shows featured badge on featured crops', async () => {
    render(<SegmentHubLayout segment="cereals" />);
    
    await waitFor(() => {
      expect(screen.getByText('Featured')).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', async () => {
    render(<SegmentHubLayout segment="cereals" />);
    
    await waitFor(() => {
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading).toHaveTextContent('Cereal Crop Solutions');
      
      const sectionHeading = screen.getByRole('heading', { level: 2 });
      expect(sectionHeading).toHaveTextContent('Featured Crop Solutions');
    });
  });
});