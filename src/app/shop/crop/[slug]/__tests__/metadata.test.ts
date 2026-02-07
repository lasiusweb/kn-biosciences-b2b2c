import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { supabase } from '@/lib/supabase';
import { generateMetadata as generateCropMetadata } from '../page';

// Mock supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Crop Metadata', () => {
  let mockQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a mock query object that supports chaining
    mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn(),
    };
    
    jest.spyOn(supabase, 'from').mockReturnValue(mockQuery as any);
  });

  it('should generate metadata for a valid crop', async () => {
    const mockCrop = 'paddy';
    const mockProducts = [
      {
        id: 'p1',
        name: 'Paddy Boost',
        meta_title: 'Paddy Boost - High Yield Solutions',
        meta_description: 'Increase your paddy yield with Paddy Boost.',
        image_urls: ['http://example.com/paddy.jpg'],
      },
    ];

    mockQuery.then.mockImplementation((callback: any) => 
      Promise.resolve(callback({ data: mockProducts, error: null }))
    );

    const metadata = await generateCropMetadata({ params: { slug: mockCrop } });

    expect(supabase.from).toHaveBeenCalledWith('products');
    expect(metadata.title).toBe('Paddy Boost - High Yield Solutions');
    expect(metadata.description).toBe('Increase your paddy yield with Paddy Boost.');
    expect(metadata.openGraph?.images).toEqual([{ url: 'http://example.com/paddy.jpg' }]);
  });

  it('should generate default metadata if crop has no products', async () => {
    const mockCrop = 'exotic-fruit';
    
    mockQuery.then.mockImplementation((callback: any) => 
      Promise.resolve(callback({ data: [], error: null }))
    );

    const metadata = await generateCropMetadata({ params: { slug: mockCrop } });

    expect(metadata.title).toBe('Shop Products - KN Biosciences');
  });
});
