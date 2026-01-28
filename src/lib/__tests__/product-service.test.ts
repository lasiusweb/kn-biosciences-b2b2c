import { getProducts, getProductsBySegment, getProductBySlug, getProductsByCrop, getProductsByProblem, getVariants } from '../product-service';
import { supabase } from '../supabase';

jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Product Data Fetching Service', () => {
  const mockProducts = [
    { id: '1', name: 'Product 1', slug: 'product-1', status: 'active', segment: 'agriculture' },
    { id: '2', name: 'Product 2', slug: 'product-2', status: 'active', segment: 'aquaculture' },
  ];

  let mockQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a mock query object that supports chaining
    mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    };
    
    (supabase.from as jest.Mock).mockReturnValue(mockQuery);
  });

  it('should fetch all active products', async () => {
    mockQuery.order.mockResolvedValue({ data: mockProducts, error: null });

    const products = await getProducts();
    
    expect(supabase.from).toHaveBeenCalledWith('products');
    expect(mockQuery.select).toHaveBeenCalledWith('*');
    expect(mockQuery.eq).toHaveBeenCalledWith('status', 'active');
    expect(products).toEqual(mockProducts);
  });

  it('should fetch products by segment', async () => {
    mockQuery.order.mockResolvedValue({ data: [mockProducts[0]], error: null });

    const products = await getProductsBySegment('agriculture');
    
    expect(supabase.from).toHaveBeenCalledWith('products');
    expect(mockQuery.eq).toHaveBeenCalledWith('segment', 'agriculture');
    expect(products).toEqual([mockProducts[0]]);
  });

  it('should fetch a single product by slug', async () => {
    mockQuery.single.mockResolvedValue({ data: mockProducts[0], error: null });

    const product = await getProductBySlug('product-1');
    
    expect(supabase.from).toHaveBeenCalledWith('products');
    expect(mockQuery.eq).toHaveBeenCalledWith('slug', 'product-1');
    expect(product).toEqual(mockProducts[0]);
  });

  it('should fetch products by crop', async () => {
    mockQuery.order.mockResolvedValue({ data: [mockProducts[0]], error: null });

    const products = await getProductsByCrop('paddy');
    
    expect(supabase.from).toHaveBeenCalledWith('products');
    expect(mockQuery.eq).toHaveBeenCalledWith('crop_id', 'paddy');
    expect(products).toEqual([mockProducts[0]]);
  });

  it('should fetch products by problem', async () => {
    mockQuery.order.mockResolvedValue({ data: [mockProducts[0]], error: null });

    const products = await getProductsByProblem('thrips');
    
    expect(supabase.from).toHaveBeenCalledWith('products');
        expect(mockQuery.contains).toHaveBeenCalledWith('problem_ids', ['thrips']);
        expect(products).toEqual([mockProducts[0]]);
      });
    
      it('should throw error when fetching products fails', async () => {
        mockQuery.order.mockResolvedValue({ data: null, error: { message: 'DB Error' } });
    
        await expect(getProducts()).rejects.toThrow('Failed to fetch products');
      });
    
      it('should return null when product by slug is not found', async () => {
        mockQuery.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
    
        const product = await getProductBySlug('non-existent');
        
        expect(product).toBeNull();
      });
    
      it('should throw error when product by slug fetch fails with other error', async () => {
        mockQuery.single.mockResolvedValue({ data: null, error: { code: 'OTHER', message: 'Error' } });
    
            await expect(getProductBySlug('error-slug')).rejects.toThrow('Failed to fetch product by slug');
          });
        
          it('should fetch all variants', async () => {
            const mockVarData = [{ id: 'v1', product_id: '1' }];
            mockQuery.select.mockResolvedValue({ data: mockVarData, error: null });
        
            const variants = await getVariants();
            
            expect(supabase.from).toHaveBeenCalledWith('product_variants');
            expect(variants).toEqual(mockVarData);
          });
        });
        