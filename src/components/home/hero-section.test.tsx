import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeroSection from './hero-section';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowRight: ({ className }: { className?: string }) => <div data-testid="arrow-right" className={className} />,
  Play: ({ className }: { className?: string }) => <div data-testid="play-icon" className={className} />,
  CheckCircle: ({ className }: { className?: string }) => <div data-testid="check-circle" className={className} />,
  Leaf: ({ className }: { className?: string }) => <div data-testid="leaf-icon" className={className} />,
  Sprout: ({ className }: { className?: string }) => <div data-testid="sprout-icon" className={className} />,
  Users: ({ className }: { className?: string }) => <div data-testid="users-icon" className={className} />,
  TrendingUp: ({ className }: { className?: string }) => <div data-testid="trending-up" className={className} />,
}));

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('HeroSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders hero section with all segments', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('Agricultural Excellence')).toBeInTheDocument();
    expect(screen.getByText('For Every Farm')).toBeInTheDocument();
    
    // Should show all segments
    const segments = ['Cereal Crops', 'Fruit Crops', 'Vegetable Crops', 'Pulses & Legumes', 'Spice Crops', 'Plantation Crops'];
    segments.forEach(segment => {
      expect(screen.getByText(segment)).toBeInTheDocument();
    });
  });

  it('displays segment navigation tabs', () => {
    render(<HeroSection />);
    
    const segmentTabs = screen.getAllByRole('button');
    expect(segmentTabs.length).toBe(6);
    
    // First tab (cereals) should be active by default
    const cerealsTab = segmentTabs.find(tab => tab.textContent?.includes('Cereal'));
    expect(cerealsTab).toHaveClass('bg-organic-500');
  });

  it('shows featured segment with special styling', () => {
    render(<HeroSection />);
    
    // Cereal Crops should be featured
    const cerealsTab = screen.getByText('Cereal Crops');
    expect(cerealsTab.closest('.bg-gradient-to-r')).toBeInTheDocument();
  });

  it('displays segment statistics', () => {
    render(<HeroSection />);
    
    // Should show product counts
    expect(screen.getByText('156')).toBeInTheDocument();
    expect(screen.getByText('203')).toBeInTheDocument();
    expect(screen.getByText('187')).toBeInTheDocument();
    
    // Should show solution counts
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('62')).toBeInTheDocument();
    expect(screen.getByText('54')).toBeInTheDocument();
    
    // Should show popularity badges
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
    expect(screen.getByText('High Demand')).toBeInTheDocument();
  });

  it('displays overall statistics', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('50K+')).toBeInTheDocument();
    expect(screen.getByText('Happy Farmers')).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('24/7')).toBeInTheDocument();
  });

  it('displays CTA buttons', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('Explore Cereal Solutions')).toBeInTheDocument();
    expect(screen.getByText('Get Personalized Advice')).toBeInTheDocument();
  });

  it('displays quick links to knowledge center and segments', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('Knowledge Center')).toBeInTheDocument();
    expect(screen.getByText('All Segments')).toBeInTheDocument();
  });

  it('shows proper descriptions for each segment', () => {
    render(<HeroSection />);
    
    expect(screen.getByText(/Complete solutions for wheat, rice, maize/)).toBeInTheDocument();
    expect(screen.getByText(/Specialized treatments for mango, citrus, banana/)).toBeInTheDocument();
    expect(screen.getByText(/Premium solutions for vegetable farming/)).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    render(<HeroSection />);
    
    // Main heading
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
    
    // Should have properly labeled navigation
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('has segment cards with proper structure', () => {
    render(<HeroSection />);
    
    // Should have segment preview cards
    const segmentCards = screen.getAllByText('Cereal Crops');
    const segmentCard = segmentCards[0].closest('.segment-preview');
    expect(segmentCard).toBeInTheDocument();
    
    // Should have icons
    expect(screen.getByTestId('leaf-icon')).toBeInTheDocument();
    expect(screen.getByTestId('sprout-icon')).toBeInTheDocument();
    expect(screen.getByTestId('trending-up')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('check-circle')).toBeInTheDocument();
  });

  it('has animated background elements', () => {
    render(<HeroSection />);
    
    // Should have background divs for animations
    const heroSection = screen.getByRole('complementary').closest('.hero-gradient');
    const backgroundElements = heroSection?.querySelectorAll('div[class*="bg-"]');
    expect(backgroundElements.length).toBeGreaterThan(0);
  });

  it('renders responsive grid for segment cards', () => {
    render(<HeroSection />);
    
    const segmentsGrid = screen.getByText('Fruit Crops').closest('.grid');
    expect(segmentsGrid).toHaveClass('grid-cols-2');
    expect(segmentsGrid).toHaveClass('lg:grid-cols-3');
  });
});