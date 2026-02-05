import { render, screen } from '@testing-library/react';
import LegalPage from '../page';
import { cmsService } from '@/lib/cms-service';
import { notFound } from 'next/navigation';

// Mock dependencies
jest.mock('@/lib/cms-service');
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

// Mock Data
const mockLegalContent = {
  id: '1',
  slug: 'privacy-policy',
  title: 'Privacy Policy',
  content: '<p>This is the privacy policy.</p>',
  version: '1.0',
  last_updated: '2023-01-01',
  created_at: '2023-01-01',
};

describe('LegalPage', () => {
  it('renders legal content when found', async () => {
    (cmsService.getLegalContent as jest.Mock).mockResolvedValue(mockLegalContent);

    const jsx = await LegalPage({ params: { slug: 'privacy-policy' } });
    render(jsx);

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('This is the privacy policy.')).toBeInTheDocument();
    expect(screen.getByText(/Last Updated:/)).toBeInTheDocument();
  });

  it('calls notFound when content is not found', async () => {
    (cmsService.getLegalContent as jest.Mock).mockResolvedValue(null);

    try {
      await LegalPage({ params: { slug: 'unknown-slug' } });
    } catch (e) {
      // ignore
    }

    expect(notFound).toHaveBeenCalled();
  });
});
