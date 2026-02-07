import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CropDiscoveryFunnel from './crop-discovery-funnel';

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

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
  ChevronRight: ({ className }: { className?: string }) => <div data-testid="chevron-right" className={className} />,
  ChevronLeft: ({ className }: { className?: string }) => <div data-testid="chevron-left" className={className} />,
  Filter: ({ className }: { className?: string }) => <div data-testid="filter" className={className} />,
  Search: ({ className }: { className?: string }) => <div data-testid="search" className={className} />,
  MapPin: ({ className }: { className?: string }) => <div data-testid="map-pin" className={className} />,
  Calendar: ({ className }: { className?: string }) => <div data-testid="calendar" className={className} />,
  CheckCircle: ({ className }: { className?: string }) => <div data-testid="check-circle" className={className} />,
  AlertCircle: ({ className }: { className?: string }) => <div data-testid="alert-circle" className={className} />,
  Info: ({ className }: { className?: string }) => <div data-testid="info" className={className} />,
  Leaf: ({ className }: { className?: string }) => <div data-testid="leaf" className={className} />,
}));

describe('CropDiscoveryFunnel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders discovery funnel with all steps', () => {
    render(<CropDiscoveryFunnel segment="cereals" />);
    
    expect(screen.getByText('Crop Discovery Assistant')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    
    const steps = ['Select Your Crop', 'Growing Region', 'Identify Challenges', 'Get Recommendations'];
    steps.forEach(step => {
      expect(screen.getByText(step)).toBeInTheDocument();
    });
  });

  it('shows correct step indicators', () => {
    render(<CropDiscoveryFunnel segment="cereals" />);
    
    const stepIndicators = screen.getAllByTestId(/step-indicator/);
    expect(stepIndicators.length).toBe(4);
    
    // First step should be active
    const firstStep = screen.getByText('Select Your Crop');
    expect(firstStep.closest('.border-organic-500')).toBeInTheDocument();
  });

  it('renders crop selection step initially', () => {
    render(<CropDiscoveryFunnel segment="cereals" />);
    
    expect(screen.getByText('Select Your Crop')).toBeInTheDocument();
    expect(screen.getByText('Choose the crop you\'re cultivating to get personalized recommendations')).toBeInTheDocument();
    
    // Should show crop options
    const crops = ['Wheat', 'Rice', 'Maize'];
    crops.forEach(crop => {
      expect(screen.getByText(crop)).toBeInTheDocument();
    });
  });

  it('allows crop selection', async () => {
    render(<CropDiscoveryFunnel segment="cereals" />);
    
    const wheatOption = screen.getByText('Wheat');
    fireEvent.click(wheatOption);
    
    await waitFor(() => {
      expect(screen.getByText('Selected: Wheat')).toBeInTheDocument();
      
      // Next button should be enabled
      const nextButton = screen.getByText('Next Step');
      expect(nextButton).not.toBeDisabled();
    });
  });

  it('navigates to next step when crop is selected', async () => {
    render(<CropDiscoveryFunnel segment="cereals" />);
    
    // First select a crop
    const wheatOption = screen.getByText('Wheat');
    fireEvent.click(wheatOption);
    
    await waitFor(() => {
      const nextButton = screen.getByText('Next Step');
      fireEvent.click(nextButton);
      
      // Should show region selection step
      expect(screen.getByText('Growing Region')).toBeInTheDocument();
      expect(screen.getByText('North India')).toBeInTheDocument();
    });
  });

  it('shows region selection step', async () => {
    render(<CropDiscoveryFunnel segment="cereals" />);
    
    // Navigate to region step
    const nextButton = screen.getByText('Next Step');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Growing Region')).toBeInTheDocument();
      expect(screen.getByText('Tell us about your farming region for localized advice')).toBeInTheDocument();
      
      const regions = ['North India', 'South India', 'East India', 'West India'];
      regions.forEach(region => {
        expect(screen.getByText(region)).toBeInTheDocument();
      });
    });
  });

  it('allows region selection', async () => {
    render(<CropDiscoveryFunnel segment="cereals" />);
    
    // Navigate to region step
    const nextButton = screen.getByText('Next Step');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      const northRegion = screen.getByText('North India');
      fireEvent.click(northRegion);
      
      expect(screen.getByText('Region: North India')).toBeInTheDocument();
    });
  });

  it('shows problem identification step', async () => {
    render(<CropDiscoveryFunnel segment="cereals" />);
    
    // Navigate to problem identification step
    let nextButton = screen.getByText('Next Step');
    fireEvent.click(nextButton);
    fireEvent.click(nextButton); // Skip crop step for this test
    
    await waitFor(() => {
      expect(screen.getByText('Identify Challenges')).toBeInTheDocument();
      expect(screen.getByText('Select the problems you\'re experiencing')).toBeInTheDocument();
      
      const problems = ['Pest Attack', 'Fungal Infection', 'Nutrient Deficiency', 'Water Stress'];
      problems.forEach(problem => {
        expect(screen.getByText(problem)).toBeInTheDocument();
      });
    });
  });

  it('allows problem selection', async () => {
    render(<CropDiscoveryFunnel segment="cereals" />);
    
    // Navigate to problem step
    let nextButton = screen.getByText('Next Step');
    fireEvent.click(nextButton);
    fireEvent.click(nextButton); // Skip crop step
    
    await waitFor(() => {
      const pestProblem = screen.getByText('Pest Attack');
      fireEvent.click(pestProblem);
      
      expect(screen.getByText('1 problem selected')).toBeInTheDocument();
      
      // Should enable next button
      const nextStepButton = screen.getByText('Next Step');
      expect(nextStepButton).not.toBeDisabled();
    });
  });

  it('shows recommendations step', async () => {
    render(<CropDiscoveryFunnel segment="cereals" />);
    
    // Navigate through all steps
    let nextButton = screen.getByText('Next Step');
    fireEvent.click(nextButton); // Skip crop step
    fireEvent.click(nextButton); // Skip region step
    fireEvent.click(nextButton); // Skip to problem step
    fireEvent.click(screen.getByText('Pest Attack')); // Select a problem
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Next Step'));
      
      expect(screen.getByText('Get Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Your Personalized Recommendations')).toBeInTheDocument();
    });
  });

  it('shows completion message when all steps done', async () => {
    render(<CropDiscoveryFunnel segment="cereals" />);
    
    // Navigate through all steps
    const nextButton = screen.getByText('Next Step');
    fireEvent.click(nextButton); // Skip crop step
    fireEvent.click(nextButton); // Skip region step
    fireEvent.click(nextButton); // Skip to problem step
    fireEvent.click(screen.getByText('Pest Attack')); // Select a problem
    fireEvent.click(nextButton); // Go to recommendations
    
    await waitFor(() => {
      const viewResultsButton = screen.getByText('View Results');
      expect(viewResultsButton).toBeInTheDocument();
      
      // Step should be marked as completed
      const recommendationsStep = screen.getByText('Get Recommendations');
      expect(recommendationsStep.closest('.border-organic-500')).toBeInTheDocument();
    });
  });

  it('disables previous button on first step', () => {
    render(<CropDiscoveryFunnel segment="cereals" />);
    
    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  it('enables previous button on subsequent steps', async () => {
    render(<CropDiscoveryFunnel segment="cereals" />);
    
    // Navigate to second step
    const nextButton = screen.getByText('Next Step');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      const prevButton = screen.getByText('Previous');
      expect(prevButton).not.toBeDisabled();
    });
  });

  it('prevents navigation without completing current step', () => {
    render(<CropDiscoveryFunnel segment="cereals" />);
    
    const nextButton = screen.getByText('Next Step');
    expect(nextButton).toBeDisabled();
  });

  it('has proper accessibility structure', () => {
    render(<CropDiscoveryFunnel segment="cereals" />);
    
    // Main heading
    const mainHeading = screen.getByRole('heading', { level: 2 });
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toHaveTextContent('Crop Discovery Assistant');
    
    // Step progress indicator
    const stepHeading = screen.getByRole('heading', { level: 3 });
    expect(stepHeading).toBeInTheDocument();
    
    // Should have proper navigation
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next Step' })).toBeInTheDocument();
  });

  it('displays correct step descriptions', () => {
    render(<CropDiscoveryFunnel segment="cereals" />);
    
    const descriptions = [
      'Choose the crop you\'re cultivating to get personalized recommendations',
      'Tell us about your farming region for localized advice',
      'Select the problems you\'re experiencing',
      'Receive personalized product and practice recommendations'
    ];
    
    descriptions.forEach(description => {
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });
});