import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CropKnowledgeCenter from './crop-knowledge-center';

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock('next/image', () => {
  return ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />;
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
  Calendar: ({ className }: { className?: string }) => <div data-testid="calendar-icon" className={className} />,
  Clock: ({ className }: { className?: string }) => <div data-testid="clock-icon" className={className} />,
  BookOpen: ({ className }: { className?: string }) => <div data-testid="book-icon" className={className} />,
  Video: ({ className }: { className?: string }) => <div data-testid="video-icon" className={className} />,
  ChevronRight: ({ className }: { className?: string }) => <div data-testid="chevron-icon" className={className} />,
  Play: ({ className }: { className?: string }) => <div data-testid="play-icon" className={className} />,
}));

describe('CropKnowledgeCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    render(<CropKnowledgeCenter crop="wheat" segment="cereals" />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders knowledge content after loading', async () => {
    render(<CropKnowledgeCenter crop="wheat" segment="cereals" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Knowledge Center: Wheat/i)).toBeInTheDocument();
      expect(screen.getByText(/Expert guides, tutorials, and best practices/i)).toBeInTheDocument();
    });
  });

  it('displays featured article correctly', async () => {
    render(<CropKnowledgeCenter crop="wheat" segment="cereals" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Complete Wheat Cultivation Guide/i)).toBeInTheDocument();
      expect(screen.getByText(/Comprehensive guide for wheat cultivation/i)).toBeInTheDocument();
      expect(screen.getByText(/Dr. Agricultural Expert/i)).toBeInTheDocument();
      expect(screen.getByText(/15 min/i)).toBeInTheDocument();
    });
  });

  it('shows category filter buttons', async () => {
    render(<CropKnowledgeCenter crop="wheat" segment="cereals" />);
    
    await waitFor(() => {
      expect(screen.getByText(/All Articles \(5\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Cultivation/i)).toBeInTheDocument();
      expect(screen.getByText(/Pest Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Disease Control/i)).toBeInTheDocument();
    });
  });

  it('filters articles by category', async () => {
    render(<CropKnowledgeCenter crop="wheat" segment="cereals" />);
    
    await waitFor(() => {
      const pestManagementButton = screen.getByText(/Pest Management/i);
      fireEvent.click(pestManagementButton);
    });
    
    // After filtering, should only show pest management articles
    await waitFor(() => {
      expect(screen.getByText(/Pest Management for Wheat/i)).toBeInTheDocument();
    });
  });

  it('displays article metadata correctly', async () => {
    render(<CropKnowledgeCenter crop="wheat" segment="cereals" />);
    
    await waitFor(() => {
      // Check for read time icons
      expect(screen.getAllByTestId('clock-icon')).toHaveLength(5); // One for featured + 4 regular articles
      
      // Check for calendar icons
      expect(screen.getAllByTestId('calendar-icon')).toHaveLength(5);
      
      // Check for video indicator
      expect(screen.getByTestId('video-icon')).toBeInTheDocument();
    });
  });

  it('shows related products in featured article', async () => {
    render(<CropKnowledgeCenter crop="wheat" segment="cereals" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Recommended Products/i)).toBeInTheDocument();
      expect(screen.getByText(/Organic Fertilizer/i)).toBeInTheDocument();
      expect(screen.getByText(/Crop Protection Spray/i)).toBeInTheDocument();
      expect(screen.getByText(/₹450/)).toBeInTheDocument();
      expect(screen.getByText(/₹320/)).toBeInTheDocument();
    });
  });

  it('has working navigation links', async () => {
    render(<CropKnowledgeCenter crop="wheat" segment="cereals" />);
    
    await waitFor(() => {
      const readFullArticleLinks = screen.getAllByText(/Read Full Article/i);
      expect(readFullArticleLinks.length).toBeGreaterThan(0);
      
      readFullArticleLinks.forEach(link => {
        expect(link.closest('a')).toHaveAttribute('href');
      });
    });
  });

  it('displays call to action section', async () => {
    render(<CropKnowledgeCenter crop="wheat" segment="cereals" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Need More Specific Guidance?/i)).toBeInTheDocument();
      expect(screen.getByText(/Connect with our agricultural experts/i)).toBeInTheDocument();
      expect(screen.getByText(/Contact Expert/i)).toBeInTheDocument();
      expect(screen.getByText(/Browse All Articles/i)).toBeInTheDocument();
      expect(screen.getByTestId('book-icon')).toBeInTheDocument();
    });
  });

  it('shows article tags', async () => {
    render(<CropKnowledgeCenter crop="wheat" segment="cereals" />);
    
    await waitFor(() => {
      // Check for tags in articles
      expect(screen.getByText('#wheat')).toBeInTheDocument();
      expect(screen.getByText('#cultivation')).toBeInTheDocument();
      expect(screen.getByText('#best-practices')).toBeInTheDocument();
    });
  });

  it('has proper accessibility structure', async () => {
    render(<CropKnowledgeCenter crop="wheat" segment="cereals" />);
    
    await waitFor(() => {
      // Main heading
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading).toHaveTextContent(/Knowledge Center: Wheat/i);
      
      // Featured article heading
      const featuredHeading = screen.getByRole('heading', { level: 2 });
      expect(featuredHeading).toBeInTheDocument();
      
      // Regular article headings
      const articleHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(articleHeadings.length).toBeGreaterThan(0);
    });
  });

  it('handles video articles correctly', async () => {
    render(<CropKnowledgeCenter crop="wheat" segment="cereals" />);
    
    await waitFor(() => {
      // Should show video indicator on video articles
      expect(screen.getByText(/Watch Video/i)).toBeInTheDocument();
      expect(screen.getByTestId('play-icon')).toBeInTheDocument();
      
      // Video articles should have video badge
      const videoBadges = screen.getAllByText(/video/i);
      expect(videoBadges.length).toBeGreaterThan(0);
    });
  });

  it('displays author information', async () => {
    render(<CropKnowledgeCenter crop="wheat" segment="cereals" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Dr. Agricultural Expert/i)).toBeInTheDocument();
      
      // Check for publication date
      const publicationDates = screen.getAllByText(/2024/);
      expect(publicationDates.length).toBeGreaterThan(0);
    });
  });
});