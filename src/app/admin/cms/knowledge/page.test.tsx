import { render, screen, waitFor } from '@testing-library/react';
import CMSKnowledgeAdminPage from './page';
import * as adminService from '@/lib/admin-service';

jest.mock('@/lib/admin-service');

describe('CMS Knowledge Admin Page', () => {
  it('should render blog posts from service', async () => {
    const mockPosts = [
      { id: '1', title: 'Top 10 Advices', status: 'published', tags: ['bio'], published_at: '2026-01-01' }
    ];
    (adminService.getBlogPosts as jest.Mock).mockResolvedValue(mockPosts);

    render(<CMSKnowledgeAdminPage />);
    
    expect(screen.getByText(/Loading articles/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Top 10 Advices')).toBeInTheDocument();
      expect(screen.getByText('published')).toBeInTheDocument();
    });
  });
});
