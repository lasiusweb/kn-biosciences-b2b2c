import { render, screen, waitFor } from '@testing-library/react';
import CMSPagesAdminPage from './page';

describe('CMS Pages Admin Page', () => {
  it('should render core pages list', () => {
    render(<CMSPagesAdminPage />);
    expect(screen.getByText('Content Pages')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('/for-crop-champions')).toBeInTheDocument();
  });
});
