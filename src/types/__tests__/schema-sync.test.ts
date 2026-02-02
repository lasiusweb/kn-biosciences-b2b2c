import { User, B2BQuote } from '../index';

describe('Schema Synchronization', () => {
  it('User role should support sales_manager', () => {
    const user: User = {
      id: '1',
      email: 'sales@example.com',
      first_name: 'Sales',
      last_name: 'Manager',
      role: 'sales_manager', 
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    expect(user.role).toBe('sales_manager');
  });

  it('B2BQuote should have linked_order_id field', () => {
    const quote: B2BQuote = {
      id: '1',
      user_id: 'user-1',
      status: 'approved',
      subtotal: 1000,
      tax_amount: 180,
      total_amount: 1180,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      valid_until: new Date().toISOString(),
      linked_order_id: 'order-1'
    };
    expect(quote.linked_order_id).toBeDefined();
  });
});
