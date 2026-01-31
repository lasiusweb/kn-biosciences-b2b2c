import { searchProducts } from '../search-service';
import { supabase } from '../supabase';

jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: null })),
  },
}));

describe('searchProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty array for empty query', async () => {
    const result = await searchProducts('');
    expect(result).toEqual([]);
  });

  it('searches products with ilike', async () => {
    const mockData = [{ id: '1', name: 'Test Product' }];
    (supabase.from('').select('').or('').eq('').limit as jest.Mock).mockResolvedValue({
      data: mockData,
      error: null,
    });

    const result = await searchProducts('test');
    expect(supabase.from).toHaveBeenCalledWith('products');
    expect(supabase.or).toHaveBeenCalledWith(expect.stringContaining('name.ilike.%test%'));
    expect(result).toEqual(mockData);
  });

  it('returns empty array on error', async () => {
    (supabase.from('').select('').or('').eq('').limit as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'DB Error' },
    });

    const result = await searchProducts('test');
    expect(result).toEqual([]);
  });
});