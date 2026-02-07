import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { supabase } from '@/lib/supabase';
import { generateMetadata as generateSegmentMetadata } from '../[slug]/page';

// Mock supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Segment Metadata', () => {
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

  it('should generate metadata for a valid segment', async () => {
    const mockSegment = 'agriculture';
    const mockProducts = [
      {
        id: 'p1',
        name: 'Organic Fertilizer',
        meta_title: 'Organic Fertilizer for Agriculture',
        meta_description: 'Buy organic fertilizer.',
        image_urls: ['http://example.com/image.jpg'],
      },
    ];

    // Mock the then() call which product-service uses
    mockQuery.then.mockImplementation((callback: any) => 
      Promise.resolve(callback({ data: mockProducts, error: null }))
    );

    const metadata = await generateSegmentMetadata({ params: { slug: mockSegment } });

    expect(supabase.from).toHaveBeenCalledWith('products');
    expect(metadata.title).toBe('Organic Fertilizer for Agriculture');
    expect(metadata.description).toBe('Buy organic fertilizer.');
    expect(metadata.openGraph?.title).toBe('Organic Fertilizer for Agriculture');
    expect(metadata.openGraph?.images).toEqual([{ url: 'http://example.com/image.jpg' }]);
  });

  it('should generate default metadata if segment has no products', async () => {
    const mockSegment = 'nonexistent';
    
    mockQuery.then.mockImplementation((callback: any) => 
      Promise.resolve(callback({ data: [], error: null }))
    );

    const metadata = await generateSegmentMetadata({ params: { slug: mockSegment } });

    expect(metadata.title).toBe('Shop Products - KN Biosciences');
    expect(metadata.description).toBe('Explore the wide range of agricultural and aquaculture products by KN Biosciences.');
  });

  it('should use fallback title if meta_title is missing', async () => {
    const mockSegment = 'agriculture-tools';
    const mockProducts = [
      {
        id: 'p1',
        name: 'Tool 1',
        // meta_title missing
        meta_description: 'Desc 1',
      },
    ];

    mockQuery.then.mockImplementation((callback: any) => 
      Promise.resolve(callback({ data: mockProducts, error: null }))
    );

    const metadata = await generateSegmentMetadata({ params: { slug: mockSegment } });

    expect(metadata.title).toBe('Agriculture Tools Solutions - KN Biosciences');
  });
});