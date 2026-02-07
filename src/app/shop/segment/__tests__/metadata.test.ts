import { describe, it, expect, jest } from '@jest/globals';
import { getProductsBySegment } from '@/lib/product-service'; // Import the function to be mocked

// Mock the product-service module before importing the page that uses it
jest.mock('@/lib/product-service'); // This will auto-mock all exports as jest.fn()

import { generateMetadata as generateSegmentMetadata } from '../[slug]/page'; // Import the module under test
import type { Product } from '@/types'; // Import Product type for mock data


describe('Segment Metadata', () => {
  // Cast the imported function to jest.Mock once
  const mockGetProductsBySegment = getProductsBySegment as jest.Mock<Promise<Product[]>, [string]>;

  beforeEach(() => {
    jest.clearAllMocks(); // Clears all mocks registered with Jest
    mockGetProductsBySegment.mockReset(); // Resets mock implementation and calls for getProductsBySegment
  });

  it('should generate metadata for a valid segment', async () => {
    const mockSegment = 'agriculture';
    const mockProducts: Product[] = [
      {
        id: 'p1',
        name: 'Organic Fertilizer',
        slug: 'organic-fertilizer',
        description: 'Best organic fertilizer for agriculture.',
        meta_title: 'Organic Fertilizer for Agriculture',
        meta_description: 'Buy organic fertilizer.',
        segment: mockSegment,
        status: 'active',
        featured: true,
        category_id: 'c1',
        short_description: 'short desc',
        created_at: '',
        updated_at: '',
      },
    ];

    mockGetProductsBySegment.mockResolvedValueOnce(mockProducts);

    const metadata = await generateSegmentMetadata({ params: { slug: mockSegment } });

    expect(mockGetProductsBySegment).toHaveBeenCalledWith(mockSegment);
    expect(metadata.title).toBe('Organic Fertilizer for Agriculture'); // Should use product's meta_title
    expect(metadata.description).toBe('Buy organic fertilizer.'); // Should use product's meta_description
    expect(metadata.openGraph?.title).toBe('Organic Fertilizer for Agriculture');
    expect(metadata.openGraph?.description).toBe('Buy organic fertilizer.');
    expect(metadata.openGraph?.url).toBe(`/shop/segment/${mockSegment}`);
    expect(metadata.twitter?.title).toBe('Organic Fertilizer for Agriculture');
    expect(metadata.twitter?.description).toBe('Buy organic fertilizer.');
  });

  it('should generate default metadata if segment has no products or is not found', async () => {
    const mockSegment = 'nonexistent';
    mockGetProductsBySegment.mockResolvedValueOnce([]);

    const metadata = await generateSegmentMetadata({ params: { slug: mockSegment } });

    expect(mockGetProductsBySegment).toHaveBeenCalledWith(mockSegment);
    expect(metadata.title).toBe('Shop Products - KN Biosciences');
    expect(metadata.description).toBe('Explore the wide range of agricultural and aquaculture products by KN Biosciences.');
    expect(metadata.openGraph?.title).toBe('Shop Products - KN Biosciences');
    expect(metadata.openGraph?.description).toBe('Explore the wide range of agricultural and aquaculture products by KN Biosciences.');
    expect(metadata.openGraph?.url).toBe(`/shop`);
    expect(metadata.twitter?.title).toBe('Shop Products - KN Biosciences');
    expect(metadata.twitter?.description).toBe('Explore the wide range of agricultural and aquaculture products by KN Biosciences.');
  });

  it('should prioritize segment-specific meta_title and meta_description from first product', async () => {
    const mockSegment = 'aquaculture';
    const mockProducts: Product[] = [
      {
        id: 'p1',
        name: 'Aquaculture Boost',
        slug: 'aquaculture-boost',
        description: 'Enhances fish growth.',
        meta_title: 'Aquaculture Boost Product Page',
        meta_description: 'Buy best aquaculture products.',
        segment: mockSegment,
        status: 'active',
        featured: true,
        category_id: 'c2',
        short_description: 'short desc',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'p2',
        name: 'Fish Feed',
        slug: 'fish-feed',
        description: 'Premium fish feed.',
        meta_title: 'Premium Fish Feed', // This should not be used as it's not the first product's meta
        meta_description: 'Best fish feed.',
        segment: mockSegment,
        status: 'active',
        featured: false,
        category_id: 'c2',
        short_description: 'another short desc',
        created_at: '',
        updated_at: '',
      },
    ];

    mockGetProductsBySegment.mockResolvedValueOnce(mockProducts);

    const metadata = await generateSegmentMetadata({ params: { slug: mockSegment } });

    expect(mockGetProductsBySegment).toHaveBeenCalledWith(mockSegment);
    expect(metadata.title).toBe('Aquaculture Boost Product Page');
    expect(metadata.description).toBe('Buy best aquaculture products.');
  });
});
