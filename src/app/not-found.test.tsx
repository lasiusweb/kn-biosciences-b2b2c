import { render, screen } from '@testing-library/react';
import NotFound from './not-found';

// Mock Next.js navigation
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock Search Component
jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} data-testid="search-input" />,
}));

// Mock Button
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

describe('Not Found Page', () => {
  it('renders the 404 message', () => {
    render(<NotFound />);
    expect(screen.getByText(/404/i)).toBeInTheDocument();
  });

  it('provides a way to return home', () => {
    render(<NotFound />);
    expect(screen.getByText(/Return Home/i)).toBeInTheDocument();
  });

  it('includes a search bar', () => {
    render(<NotFound />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });
});
