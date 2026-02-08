// src/app/admin/zoho/sync-logs/page.test.tsx
import { render, screen } from '@testing-library/react';
import ZohoSyncLogsPage from './page';
import '@testing-library/jest-dom';

// Mock the Auth hook or context if necessary
// For this simple test, we assume the layout provides the necessary context or we can mock it
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

jest.mock('@/lib/auth/user-management', () => ({
  getUserRole: jest.fn().mockResolvedValue('admin'), // Mock as admin for the test
}));

jest.mock('@/components/layout/admin-layout', () => {
  return ({ children, navItems, title }: any) => (
    <div>
      <h1>{title}</h1>
      <nav>
        {navItems.map((item: any) => (
          <a key={item.href} href={item.href}>{item.title}</a>
        ))}
      </nav>
      {children}
    </div>
  );
});

describe('ZohoSyncLogsPage', () => {
  it('renders the Zoho Sync Logs title', async () => {
    render(await ZohoSyncLogsPage());
    expect(screen.getByText('Zoho Sync Logs')).toBeInTheDocument();
  });
});
