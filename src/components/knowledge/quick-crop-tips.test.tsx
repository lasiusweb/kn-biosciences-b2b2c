import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuickCropTips from './quick-crop-tips';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />;
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Lightbulb: ({ className }: { className?: string }) => <div data-testid="lightbulb-icon" className={className} />,
  Droplet: ({ className }: { className?: string }) => <div data-testid="droplet-icon" className={className} />,
  Bug: ({ className }: { className?: string }) => <div data-testid="bug-icon" className={className} />,
  Leaf: ({ className }: { className?: string }) => <div data-testid="leaf-icon" className={className} />,
  Sun: ({ className }: { className?: string }) => <div data-testid="sun-icon" className={className} />,
  ChevronDown: ({ className }: { className?: string }) => <div data-testid="chevron-down-icon" className={className} />,
  ChevronUp: ({ className }: { className?: string }) => <div data-testid="chevron-up-icon" className={className} />,
}));

describe('QuickCropTips', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<QuickCropTips crop="wheat" />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders crop tips after loading', async () => {
    render(<QuickCropTips crop="wheat" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Quick Crop Tips for Wheat/i)).toBeInTheDocument();
      expect(screen.getByText(/5 recommendations available/i)).toBeInTheDocument();
    });
  });

  it('displays correct number of tips', async () => {
    render(<QuickCropTips crop="wheat" />);
    
    await waitFor(() => {
      const tipCards = screen.getAllByText(/Optimal|Pest|Nutrient|Harvest|General/i);
      expect(tipCards.length).toBe(5);
    });
  });

  it('shows tip categories and priorities', async () => {
    render(<QuickCropTips crop="wheat" />);
    
    await waitFor(() => {
      expect(screen.getByText(/high priority/i)).toBeInTheDocument();
      expect(screen.getByText(/medium priority/i)).toBeInTheDocument();
      expect(screen.getByText(/watering/i)).toBeInTheDocument();
      expect(screen.getByText(/pest-control/i)).toBeInTheDocument();
    });
  });

  it('displays tip metadata', async () => {
    render(<QuickCropTips crop="wheat" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Stage: Flowering/i)).toBeInTheDocument();
      expect(screen.getByText(/Season: all/i)).toBeInTheDocument();
      expect(screen.getByText(/120-150 kg\/ha/i)).toBeInTheDocument();
      expect(screen.getByText(/25-30 mm\/week/i)).toBeInTheDocument();
    });
  });

  it('shows warning for tips that have warnings', async () => {
    render(<QuickCropTips crop="wheat" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Warning:/i)).toBeInTheDocument();
      expect(screen.getByText(/Overwatering can lead to root rot/i)).toBeInTheDocument();
    });
  });

  it('has functional expand/collapse buttons', async () => {
    render(<QuickCropTips crop="wheat" />);
    
    await waitFor(() => {
      const expandButtons = screen.getAllByTestId('chevron-down-icon');
      expect(expandButtons.length).toBe(5); // All tips should start collapsed
    });
  });

  it('displays action items when expanded', async () => {
    render(<QuickCropTips crop="wheat" />);
    
    await waitFor(() => {
      // Find and click the first expand button
      const expandButtons = screen.getAllByRole('button');
      const firstExpandButton = expandButtons.find(btn => 
        btn.querySelector('[data-testid="chevron-down-icon"]')
      );
      
      if (firstExpandButton) {
        firstExpandButton.click();
      }
    });

    await waitFor(() => {
      expect(screen.getByText(/Check soil moisture 2-3 inches deep/i)).toBeInTheDocument();
      expect(screen.getByText(/Water early morning to reduce evaporation/i)).toBeInTheDocument();
      expect(screen.getByText(/Use drip irrigation for efficiency/i)).toBeInTheDocument();
    });
  });

  it('has proper accessibility structure', async () => {
    render(<QuickCropTips crop="wheat" />);
    
    await waitFor(() => {
      // Main heading
      const mainHeading = screen.getByRole('heading', { level: 3 });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading).toHaveTextContent(/Quick Crop Tips for Wheat/i);
      
      // Tip headings
      const tipHeadings = screen.getAllByRole('heading', { level: 4 });
      expect(tipHeadings.length).toBe(5);
      
      // Icons should be present
      expect(screen.getByTestId('lightbulb-icon')).toBeInTheDocument();
    });
  });

  it('shows quick actions section', async () => {
    render(<QuickCropTips crop="wheat" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Need personalized advice?/i)).toBeInTheDocument();
      expect(screen.getByText(/Connect with our agricultural experts/i)).toBeInTheDocument();
      expect(screen.getByText(/View Full Guide/i)).toBeInTheDocument();
      expect(screen.getByText(/Get Expert Help/i)).toBeInTheDocument();
    });
  });

  it('displays correct crop-specific content', async () => {
    render(<QuickCropTips crop="rice" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Quick Crop Tips for Rice/i)).toBeInTheDocument();
      expect(screen.getByText(/rice requires consistent moisture/i)).toBeInTheDocument();
    });
  });
});