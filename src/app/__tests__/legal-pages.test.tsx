import { render, screen } from '@testing-library/react';
import PrivacyPolicy from '../privacy-policy/page';
import TermsAndConditions from '../terms-and-conditions/page';
import RefundPolicy from '../refund-policy/page';
import ShippingPolicy from '../shipping-policy/page';
import Disclaimer from '../disclaimer/page';

// Mock the layout to focus on content
jest.mock('@/components/layout/policy-layout', () => ({
  PolicyLayout: ({ title, children }: any) => (
    <div data-testid="policy-layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

describe('Legal Pages', () => {
  it('renders Privacy Policy', () => {
    render(<PrivacyPolicy />);
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('renders Terms and Conditions', () => {
    render(<TermsAndConditions />);
    expect(screen.getByText('Terms and Conditions')).toBeInTheDocument();
  });

  it('renders Refund Policy', () => {
    render(<RefundPolicy />);
    expect(screen.getByText('Refund Policy')).toBeInTheDocument();
  });

  it('renders Shipping Policy', () => {
    render(<ShippingPolicy />);
    expect(screen.getByText('Shipping Policy')).toBeInTheDocument();
  });

  it('renders Disclaimer', () => {
    render(<Disclaimer />);
    expect(screen.getByText('Disclaimer')).toBeInTheDocument();
  });
});
