import { render, screen } from '@testing-library/react';
import AboutPage from '../page';

// Mock GSAP
jest.mock('gsap', () => ({
  gsap: {
    registerPlugin: jest.fn(),
    context: jest.fn((cb) => {
      cb();
      return { revert: jest.fn() };
    }),
    from: jest.fn(),
  },
}));

jest.mock('gsap/dist/ScrollTrigger', () => ({
  ScrollTrigger: jest.fn(),
}));

describe('AboutPage', () => {
  it('renders about us sections', () => {
    render(<AboutPage />);
    expect(screen.getByText(/Nurturing Nature with Science/i)).toBeInTheDocument();
    expect(screen.getByText(/Our Mission & Vision/i)).toBeInTheDocument();
    expect(screen.getByText(/Our Story/i)).toBeInTheDocument();
    expect(screen.getByText(/Impact & Sustainability/i)).toBeInTheDocument();
    expect(screen.getByText(/Our Leadership/i)).toBeInTheDocument();
  });
});
