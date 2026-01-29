import { render, screen, waitFor } from '@testing-library/react';
import { AnalyticsDashboard } from './analytics-dashboard';
import * as adminService from '@/lib/admin-service';

jest.mock('@/lib/admin-service');

describe('Analytics Dashboard', () => {
  const mockData = {
    revenue: [{ period: '2026-01-01', amount: 5000 }],
    topProducts: [{ id: '1', name: 'Product A', salesCount: 50, revenue: 5000 }],
    customerDistribution: [
      { type: 'B2C', count: 80 },
      { type: 'B2B', count: 20 }
    ],
    stockTurnover: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Recharts uses ResizeObserver which is mocked in jest.setup.js
  });

  it('should render loading state initially', () => {
    (adminService.getAdminAnalytics as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<AnalyticsDashboard />);
    expect(screen.getByText(/Loading analytics/i)).toBeInTheDocument();
  });

  it('should render analytics data after fetching', async () => {
    (adminService.getAdminAnalytics as jest.Mock).mockResolvedValue(mockData);
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Analytics Overview')).toBeInTheDocument();
      expect(screen.getByText('₹5,000')).toBeInTheDocument(); // Total Revenue
      expect(screen.getByText('50')).toBeInTheDocument(); // Total Orders
    });
  });

  it('should handle error state', async () => {
    (adminService.getAdminAnalytics as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load analytics data')).toBeInTheDocument();
    });
  });
});
