import { render, screen } from '@testing-library/react';
import MarketingAdminPage from './page';

describe('Marketing Admin Page', () => {
  it('should render tabs and coupons list', () => {
    render(<MarketingAdminPage />);
    expect(screen.getByText('Marketing & Campaigns')).toBeInTheDocument();
    expect(screen.getByText('SAVE10')).toBeInTheDocument();
    expect(screen.getByText('Promo Banners')).toBeInTheDocument();
  });
});
