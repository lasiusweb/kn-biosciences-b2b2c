import { render, screen } from '@testing-library/react';
import { PolicyLayout } from './policy-layout';

describe('PolicyLayout', () => {
  it('renders title and children', () => {
    render(
      <PolicyLayout title="Test Policy">
        <p>Policy Content</p>
      </PolicyLayout>
    );
    
    expect(screen.getByText('Test Policy')).toBeInTheDocument();
    expect(screen.getByText('Policy Content')).toBeInTheDocument();
  });

  it('renders last updated date when provided', () => {
    render(
      <PolicyLayout title="Test Policy" lastUpdated="January 31, 2026">
        <p>Policy Content</p>
      </PolicyLayout>
    );
    
    expect(screen.getByText(/Last updated: January 31, 2026/i)).toBeInTheDocument();
  });
});
