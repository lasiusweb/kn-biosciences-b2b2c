import { render, screen } from '@testing-library/react';
import SEOAdminPage from './page';

describe('SEO Admin Page', () => {
  it('should render page list and metadata form', () => {
    render(<SEOAdminPage />);
    expect(screen.getByText('SEO Management')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('SEO Title')).toBeInTheDocument();
  });
});
