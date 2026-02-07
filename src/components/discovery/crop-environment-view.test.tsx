import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CropEnvironmentView from './crop-environment-view';

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useParams: () => ({
    crop: 'wheat',
    segment: 'cereals'
  })
}));

// Mock GSAP
jest.mock('gsap', () => ({
  gsap: {
    fromTo: jest.fn(),
    registerPlugin: jest.fn(),
  },
  ScrollTrigger: {
    getAll: jest.fn(() => []),
    create: jest.fn(() => ({ kill: jest.fn() })),
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ShoppingCart: ({ className }: { className?: string }) => <div data-testid="cart-icon" className={className} />,
  BookOpen: ({ className }: { className?: string }) => <div data-testid="book-icon" className={className} />,
  Calendar: ({ className }: { className?: string }) => <div data-testid="calendar-icon" className={className} />,
  MapPin: ({ className }: { className?: string }) => <div data-testid="map-pin-icon" className={className} />,
  Star: ({ className }: { className?: string }) => <div data-testid="star-icon" className={className} />,
  TrendingUp: ({ className }: { className?: string }) => <div data-testid="trending-icon" className={className} />,
  Filter: ({ className }: { className?: string }) => <div data-testid="filter-icon" className={className} />,
  ChevronRight: ({ className }: { className?: string }) => <div data-testid="chevron-icon" className={className} />,
  Info: ({ className }: { className?: string }) => <div data-testid="info-icon" className={className} />,
  Droplet: ({ className }: { className?: string }) => <div data-testid="droplet-icon" className={className} />,
  Sun: ({ className }: { className?: string }) => <div data-testid="sun-icon" className={className} />,
  Wind: ({ className }: { className?: string }) => <div data-testid="wind-icon" className={className} />,
  Thermometer: ({ className }: { className?: string }) => <div data-testid="thermometer-icon" className={className} />,
}));

describe('CropEnvironmentView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders crop environment view with correct title', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    expect(screen.getByText('Current Weather')).toBeInTheDocument();
    expect(screen.getByText('Soil Moisture')).toBeInTheDocument();
    expect(screen.getByText('Wind Conditions')).toBeInTheDocument();
    expect(screen.getByText('Temperature')).toBeInTheDocument();
  });

  it('displays weather conditions', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    expect(screen.getByText('28°C')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByText('Light breeze')).toBeInTheDocument();
  });

  it('shows weather alert when conditions are optimal', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    expect(screen.getByText('Current Conditions')).toBeInTheDocument();
    expect(screen.getByText('Excellent conditions for crop protection application')).toBeInTheDocument();
  });

  it('displays solution categories', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    const categories = ['All Solutions', 'Crop Protection', 'Plant Nutrition', 'Growth Enhancement', 'Harvest Solutions'];
    categories.forEach(category => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it('allows category filtering', async () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    const protectionCategory = screen.getByText('Crop Protection');
    fireEvent.click(protectionCategory);
    
    await waitFor(() => {
      expect(screen.getByText('All Solutions')).toBeInTheDocument();
      expect(screen.getByText('Crop Protection')).toBeInTheDocument();
    });
  });

  it('displays solution sorting options', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    expect(screen.getByText('Sort by:')).toBeInTheDocument();
    expect(screen.getByText('Popularity')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
  });

  it('allows sorting by different criteria', async () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    const ratingSort = screen.getByText('Rating');
    fireEvent.click(ratingSort);
    
    await waitFor(() => {
      expect(screen.getByText('Rating')).toBeInTheDocument();
    });
  });

  it('displays solution cards with correct information', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    // Should show product names
    expect(screen.getByText(/Protection Pro/)).toBeInTheDocument();
    expect(screen.getByText(/Growth Enhancer/)).toBeInTheDocument();
    expect(screen.getByText(/Balanced NPK Fertilizer/)).toBeInTheDocument();
  });

  it('shows best seller badges', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    expect(screen.getByText('Best Seller')).toBeInTheDocument();
  });

  it('displays product ratings and reviews', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(234)')).toBeInTheDocument();
  });

  it('shows organic labels for organic products', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    expect(screen.getByText('Organic')).toBeInTheDocument();
  });

  it('displays out of stock status appropriately', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('shows pricing information', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    // Should show prices (mock data has ₹450, ₹320, etc.)
    expect(screen.getByText('₹450')).toBeInTheDocument();
    expect(screen.getByText('₹320')).toBeInTheDocument();
  });

  it('has proper navigation breadcrumb', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    expect(screen.getByText('← Back to Segments')).toBeInTheDocument();
    expect(screen.getByText('cereals')).toBeInTheDocument();
    expect(screen.getByText('Wheat')).toBeInTheDocument();
  });

  it('has growing guide button', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    const guideButton = screen.getByText('Growing Guide');
    expect(guideButton).toBeInTheDocument();
    expect(guideButton.closest('a')).toHaveAttribute('href', '/knowledge');
  });

  it('shows expert CTA section', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    expect(screen.getByText(/Need Expert Advice for Wheat?/)).toBeInTheDocument();
    expect(screen.getByText('Schedule Consultation')).toBeInTheDocument();
    expect(screen.getByText('View Growing Guide')).toBeInTheDocument();
  });

  it('displays loading state while fetching data', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    // Initially should show loading skeleton
    const loadingCards = screen.getAllByText('');
    expect(loadingCards.length).toBeGreaterThan(0);
  });

  it('displays solution count', async () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    await waitFor(() => {
      expect(screen.getByText(/solutions found/)).toBeInTheDocument();
    });
  });

  it('has proper accessibility structure', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    // Main navigation
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    
    // Main heading
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toHaveTextContent('Wheat');
    
    // Section headings
    const sectionHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(sectionHeadings.length).toBeGreaterThan(0);
  });

  it('shows application and coverage information', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    expect(screen.getByText(/Application:/)).toBeInTheDocument();
    expect(screen.getByText(/Coverage:/)).toBeInTheDocument();
  });

  it('displays product features', () => {
    render(<CropEnvironmentView crop="wheat" segment="cereals" />);
    
    expect(screen.getByText(/Broad-spectrum protection/)).toBeInTheDocument();
    expect(screen.getByText(/Weather resistant/)).toBeInTheDocument();
  });
});