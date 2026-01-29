import { getAdminAnalytics, bulkImportProducts, updatePageSEO, createCoupon } from '../admin-service';
import { supabase } from '../supabase';

jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

describe('Admin Service', () => {
  let mockQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    };
    (supabase.from as jest.Mock).mockReturnValue(mockQuery);
  });

  describe('getAdminAnalytics', () => {
    it('should fetch analytics data via RPC', async () => {
      const mockData = {
        revenue: [{ period: '2026-01', amount: 1000 }],
        topProducts: [],
        customerDistribution: [],
        stockTurnover: []
      };
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: mockData, error: null });

      const analytics = await getAdminAnalytics();
      
      expect(supabase.rpc).toHaveBeenCalledWith('get_admin_analytics');
      expect(analytics).toEqual(mockData);
    });

    it('should throw error if RPC fails', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: null, error: { message: 'RPC Error' } });
      await expect(getAdminAnalytics()).rejects.toThrow('Failed to fetch admin analytics');
    });
  });

  describe('updatePageSEO', () => {
    it('should update or insert SEO metadata', async () => {
      mockQuery.update.mockReturnThis();
      mockQuery.eq.mockResolvedValue({ error: null });

      const metadata = { title: 'About Us', description: 'Our story', keywords: ['bio'] };
      await updatePageSEO('/about', metadata);

      expect(supabase.from).toHaveBeenCalledWith('seo_metadata');
      expect(mockQuery.update).toHaveBeenCalledWith(metadata);
      expect(mockQuery.eq).toHaveBeenCalledWith('page_path', '/about');
    });

    it('should throw error if update fails', async () => {
      mockQuery.update.mockReturnThis();
      mockQuery.eq.mockResolvedValue({ error: { message: 'Update Error' } });
      await expect(updatePageSEO('/about', { title: 'T' } as any)).rejects.toThrow('Failed to update SEO metadata');
    });
  });

  describe('createCoupon', () => {
    it('should insert a new coupon', async () => {
      mockQuery.insert.mockResolvedValue({ error: null });

      const coupon = {
        code: 'SAVE10',
        type: 'percentage' as const,
        value: 10,
        startDate: '2026-01-01',
        endDate: '2026-12-31'
      };
      await createCoupon(coupon);

      expect(supabase.from).toHaveBeenCalledWith('coupons');
      expect(mockQuery.insert).toHaveBeenCalledWith(coupon);
    });

    it('should throw error if insert fails', async () => {
      mockQuery.insert.mockResolvedValue({ error: { message: 'Insert Error' } });
      await expect(createCoupon({ code: 'FAIL' } as any)).rejects.toThrow('Failed to create coupon');
    });
  });

  describe('bulkImportProducts', () => {
    it('should insert multiple products', async () => {
      mockQuery.insert.mockResolvedValue({ error: null });
      const products = [{ name: 'P1' }, { name: 'P2' }];
      const result = await bulkImportProducts(products);

      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockQuery.insert).toHaveBeenCalledWith(products);
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(2);
    });

    it('should return error details if insert fails', async () => {
      mockQuery.insert.mockResolvedValue({ error: { message: 'Bulk Error' } });
      const result = await bulkImportProducts([{ name: 'P1' }]);

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toBe('Bulk Error');
    });
  });
});
