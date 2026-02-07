import { jest } from '@jest/globals';

// Mock the enhanced product service
jest.mock('@/lib/enhanced-product-service', () => ({
  getKnowledgeCenterArticles: jest.fn(() => Promise.resolve([
    {
      id: '1',
      title: 'Complete Wheat Cultivation Guide',
      slug: 'wheat-cultivation-guide',
      excerpt: 'Comprehensive guide...',
      category: 'cultivation',
      tags: ['wheat'],
      read_time: '15 min',
      published_at: '2024-01-15',
      author: { name: 'Dr. Expert' }
    }
  ])),
}));

import { describe, it, expect } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CropKnowledgeCenter from './crop-knowledge-center';

// Mock Next.js components
jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>);
jest.mock('next/image', () => (props: any) => <img {...props} />);

// Mock GSAP
jest.mock('gsap', () => ({
  gsap: { fromTo: jest.fn(), registerPlugin: jest.fn() },
  ScrollTrigger: { getAll: jest.fn(() => []), create: jest.fn(() => ({ kill: jest.fn() })) },
}));

describe('CropKnowledgeCenter', () => {
  it('renders knowledge content', async () => {
    render(<CropKnowledgeCenter crop="wheat" segment="cereals" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Knowledge Center:/i)).toBeInTheDocument();
      // Use findByText or similar if needed, but here we just need to ensure it's there
      const title = screen.getAllByText(/Wheat/i)[0];
      expect(title).toBeInTheDocument();
      expect(screen.getByText('Complete Wheat Cultivation Guide')).toBeInTheDocument();
    });
  });
});
