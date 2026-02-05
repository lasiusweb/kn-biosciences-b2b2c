import { render, screen, fireEvent } from '@testing-library/react';
import FAQClient from '../faq-client';
import { FAQ } from '@/lib/cms-service';

const mockFAQs: FAQ[] = [
  {
    id: '1',
    category: 'Shipping',
    question: 'How long does shipping take?',
    answer: 'Shipping takes 3-5 business days.',
    display_order: 1,
    is_active: true,
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
  },
  {
    id: '2',
    category: 'Shipping',
    question: 'Do you ship internationally?',
    answer: 'Yes, we do.',
    display_order: 2,
    is_active: true,
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
  },
  {
    id: '3',
    category: 'Payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept Visa, Mastercard, and PayPal.',
    display_order: 3,
    is_active: true,
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
  },
];

// Mock GSAP
jest.mock('gsap', () => ({
  gsap: {
    to: jest.fn(),
    from: jest.fn(),
    set: jest.fn(),
  },
}));

describe('FAQClient', () => {
  it('renders all categories and questions initially', () => {
    render(<FAQClient faqs={mockFAQs} />);
    
    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
    expect(screen.getByText('How long does shipping take?')).toBeInTheDocument();
    expect(screen.getByText('What payment methods do you accept?')).toBeInTheDocument();
  });

  it('filters FAQs based on search query', () => {
    render(<FAQClient faqs={mockFAQs} />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'payment' } });

    expect(screen.getByText('What payment methods do you accept?')).toBeInTheDocument();
    expect(screen.queryByText('How long does shipping take?')).not.toBeInTheDocument();
  });

  it('shows answer when accordion is clicked', () => {
    render(<FAQClient faqs={mockFAQs} />);
    
    const question = screen.getByText('How long does shipping take?');
    fireEvent.click(question);

    expect(screen.getByText('Shipping takes 3-5 business days.')).toBeInTheDocument();
  });

  it('displays no results message when search matches nothing', () => {
    render(<FAQClient faqs={mockFAQs} />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'xyz' } });

    expect(screen.getByText(/no faqs found/i)).toBeInTheDocument();
  });
});
