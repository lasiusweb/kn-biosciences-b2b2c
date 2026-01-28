import { productSchema, categorySchema } from '../schemas';

describe('Product and Category Validation', () => {
  const validProduct = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Product',
    slug: 'test-product',
    description: 'A test product description',
    short_description: 'Short desc',
    category_id: '550e8400-e29b-41d4-a716-446655440001',
    segment: 'agriculture',
    status: 'active',
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const validCategory = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Test Category',
    slug: 'test-category',
    description: 'Category description',
    sort_order: 0,
    is_active: true
  };

  it('should validate a correct product', async () => {
    const isValid = await productSchema.isValid(validProduct);
    expect(isValid).toBe(true);
  });

  it('should validate a correct category', async () => {
    const isValid = await categorySchema.isValid(validCategory);
    expect(isValid).toBe(true);
  });

  it('should fail on invalid segment', async () => {
    const invalidProduct = { ...validProduct, segment: 'invalid_segment' };
    const isValid = await productSchema.isValid(invalidProduct);
    expect(isValid).toBe(false);
  });

  it('should fail on invalid status', async () => {
    const invalidProduct = { ...validProduct, status: 'invalid_status' };
    const isValid = await productSchema.isValid(invalidProduct);
    expect(isValid).toBe(false);
  });
});

import { variantSchema } from '../schemas';

describe('Product Variant Validation', () => {
  const validVariant = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    product_id: '550e8400-e29b-41d4-a716-446655440000',
    sku: 'KN-AG-001',
    weight: 1.0,
    weight_unit: 'kg',
    packing_type: 'bag',
    form: 'powder',
    price: 500.00,
    cost_price: 350.00,
    stock_quantity: 100,
    low_stock_threshold: 10,
    track_inventory: true,
    image_urls: ['https://example.com/image.jpg'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  it('should validate a correct variant', async () => {
    const isValid = await variantSchema.isValid(validVariant);
    expect(isValid).toBe(true);
  });

  it('should fail on invalid weight unit', async () => {
    const invalidVariant = { ...validVariant, weight_unit: 'ton' };
    const isValid = await variantSchema.isValid(invalidVariant);
    expect(isValid).toBe(false);
  });
});
