import { jest } from '@jest/globals';

// Mock the enhanced product service
jest.mock('@/lib/enhanced-product-service', () => ({
  getKnowledgeCenterArticles: jest.fn(() => Promise.resolve([
    {
      id: '1',
      title: 'Sidebar Article 1',
      slug: 'sidebar-article-1',
      excerpt: 'Excerpt 1',
      category: 'Cultivation',
      read_time: '10 min',
      published_at: '2024-01-15'
    }
  ])),
}));

import { describe, it, expect } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import KnowledgeSidebar from './knowledge-sidebar';

// Mock Next.js components
jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>);
jest.mock('next/image', () => (props: any) => <img {...props} />);

// Mock GSAP
jest.mock('gsap', () => ({
  gsap: { fromTo: jest.fn() },
}));

describe('KnowledgeSidebar', () => {
  it('renders correctly', async () => {
    render(<KnowledgeSidebar crop="wheat" segment="cereals" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Upcoming Crops/i)).toBeInTheDocument();
      expect(screen.getByText(/Quick Tips/i)).toBeInTheDocument();
    });
  });
});
