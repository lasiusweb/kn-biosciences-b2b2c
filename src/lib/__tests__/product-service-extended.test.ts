import { describe, it, expect, jest } from '@jest/globals';
import { supabase } from '@/lib/supabase';
import { getProductsBySegment, getProductsByCrop, getProductsByProblem } from '@/lib/product-service'; // Assuming the fixed version of product-service

// Mock supabase client to control test data and errors
// This global mock is now minimal, individual tests will set up their spies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Product Service Extended', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks(); // Important to restore spies between tests
  });

  describe('getProductsBySegment', () => {
    it('should fetch products by segment successfully', async () => {
      const mockProducts = [
        { id: 'p1', name: 'Product 1', segment: 'agriculture' },
        { id: 'p2', name: 'Product 2', segment: 'agriculture' },
      ];

      const mockThen = jest.fn((callback) => callback({ data: mockProducts, error: null }));
      const mockOrder = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn(() => ({
          eq: mockEq,
          order: mockOrder,
          then: mockThen, // Final resolver in the chain
      }));

      jest.spyOn(supabase, 'from').mockReturnValue({
        select: mockSelect,
      });

      const segment = 'agriculture';
      const result = await getProductsBySegment(segment);

      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockSelect).toHaveBeenCalledWith(expect.any(String)); // Check for complex select string
      expect(mockEq).toHaveBeenCalledWith('status', 'active');
      expect(mockEq).toHaveBeenCalledWith('segment', segment);
      expect(result).toEqual(mockProducts);
    });

    it('should handle errors when fetching products by segment', async () => {
      const mockError = { code: 'PGRST100', message: 'Network error' };

      const mockThen = jest.fn((callback) => callback({ data: null, error: mockError }));
      const mockOrder = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn(() => ({
          eq: mockEq,
          order: mockOrder,
          then: mockThen,
      }));

      jest.spyOn(supabase, 'from').mockReturnValue({
        select: mockSelect,
      });

      const segment = 'aquaculture';
      await expect(getProductsBySegment(segment)).rejects.toThrow(`Failed to fetch products by segment: ${segment}`);
      expect(supabase.from).toHaveBeenCalledWith('products');
    });

    it('should return empty array if no data is found', async () => {
        const mockThen = jest.fn((callback) => callback({ data: null, error: null }));
        const mockOrder = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSelect = jest.fn(() => ({
            eq: mockEq,
            order: mockOrder,
            then: mockThen,
        }));

        jest.spyOn(supabase, 'from').mockReturnValue({
          select: mockSelect,
        });

        const segment = 'agriculture';
        const result = await getProductsBySegment(segment);
        expect(result).toEqual([]);
    });
  });

  describe('getProductsByCrop', () => {
    it('should fetch products by crop successfully', async () => {
      const mockProducts = [
        { id: 'p3', name: 'Product 3', crop_id: 'cereal' },
      ];

      const mockThen = jest.fn((callback) => callback({ data: mockProducts, error: null }));
      const mockOrder = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn(() => ({
          eq: mockEq,
          order: mockOrder,
          then: mockThen,
      }));

      jest.spyOn(supabase, 'from').mockReturnValue({
        select: mockSelect,
      });

      const cropId = 'cereal';
      const result = await getProductsByCrop(cropId);

      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockSelect).toHaveBeenCalledWith(expect.any(String));
      expect(mockEq).toHaveBeenCalledWith('status', 'active');
      // expect(mockEq).toHaveBeenCalledWith('product_crops.crop_id', cropId); // This is mockEq.mockReturnThis() not an actual call
      expect(result).toEqual(mockProducts);
    });

    it('should handle errors when fetching products by crop', async () => {
      const mockError = { code: 'PGRST101', message: 'Database error' };

      const mockThen = jest.fn((callback) => callback({ data: null, error: mockError }));
      const mockOrder = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn(() => ({
          eq: mockEq,
          order: mockOrder,
          then: mockThen,
      }));

      jest.spyOn(supabase, 'from').mockReturnValue({
        select: mockSelect,
      });

      const cropId = 'cereal';
      await expect(getProductsByCrop(cropId)).rejects.toThrow(`Failed to fetch products by crop: ${cropId}`);
      expect(supabase.from).toHaveBeenCalledWith('products');
    });
  });

  describe('getProductsByProblem', () => {
    it('should fetch products by problem successfully', async () => {
      const mockProducts = [
        { id: 'p4', name: 'Product 4', problem_ids: ['dry-soil'] },
      ];

      const mockThen = jest.fn((callback) => callback({ data: mockProducts, error: null }));
      const mockOrder = jest.fn().mockReturnThis();
      const mockContains = jest.fn().mockReturnThis();
      const mockEq = jest.fn(() => ({
          contains: mockContains, // eq leads to contains
          order: mockOrder, // if contains is not called, it would lead to order
          then: mockThen, // if nothing else is called
      }));
      const mockSelect = jest.fn(() => ({ eq: mockEq }));

      jest.spyOn(supabase, 'from').mockReturnValue({
        select: mockSelect,
      });

      const problemId = 'dry-soil';
      const result = await getProductsByProblem(problemId);

      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockSelect).toHaveBeenCalledWith(expect.any(String));
      expect(mockEq).toHaveBeenCalledWith('status', 'active');
      expect(mockContains).toHaveBeenCalledWith('problem_ids', [problemId]);
      expect(result).toEqual(mockProducts);
    });

    it('should handle errors when fetching products by problem', async () => {
      const mockError = { code: 'PGRST102', message: 'Query error' };

      const mockThen = jest.fn((callback) => callback({ data: null, error: mockError }));
      const mockOrder = jest.fn().mockReturnThis();
      const mockContains = jest.fn().mockReturnThis();
      const mockEq = jest.fn(() => ({
          contains: mockContains, // eq leads to contains
          order: mockOrder, // if contains is not called, it would lead to order
          then: mockThen, // if nothing else is called
      }));
      const mockSelect = jest.fn(() => ({ eq: mockEq }));

      jest.spyOn(supabase, 'from').mockReturnValue({
        select: mockSelect,
      });

      const problemId = 'pest-infestation';
      await expect(getProductsByProblem(problemId)).rejects.toThrow(`Failed to fetch products by problem: ${problemId}`);
      expect(supabase.from).toHaveBeenCalledWith('products');
    });
  });
});
