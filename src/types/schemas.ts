import * as yup from 'yup';

export const productSchema = yup.object({
  id: yup.string().uuid().required(),
  name: yup.string().required(),
  slug: yup.string().required(),
  description: yup.string().required(),
  short_description: yup.string().nullable(),
  category_id: yup.string().uuid().nullable(),
  segment: yup.string().oneOf([
    'agriculture', 'aquaculture', 'poultry_healthcare', 'animal_healthcare', 
    'bioremediation', 'seeds', 'organic_farming', 'farm_equipment', 
    'testing_lab', 'oilpalm'
  ]).required(),
  status: yup.string().oneOf(['active', 'inactive', 'draft']).required(),
  featured: yup.boolean().default(false),
  meta_title: yup.string().nullable(),
  meta_description: yup.string().nullable(),
  created_at: yup.string().required(),
  updated_at: yup.string().required()
});

export const categorySchema = yup.object({
  id: yup.string().uuid().required(),
  name: yup.string().required(),
  slug: yup.string().required(),
  description: yup.string().nullable(),
  image_url: yup.string().url().nullable(),
  parent_id: yup.string().uuid().nullable(),
  sort_order: yup.number().integer().default(0),
  is_active: yup.boolean().default(true)
});

export const variantSchema = yup.object({
  id: yup.string().uuid().required(),
  product_id: yup.string().uuid().required(),
  sku: yup.string().required(),
  weight: yup.number().required(),
  weight_unit: yup.string().oneOf(['g', 'kg', 'ml', 'l']).required(),
  packing_type: yup.string().oneOf(['box', 'drum', 'bag', 'bottle', 'pouch']).required(),
  form: yup.string().oneOf(['powder', 'liquid', 'granules', 'tablet', 'capsule']).required(),
  price: yup.number().required(),
  compare_price: yup.number().nullable(),
  cost_price: yup.number().required(),
  stock_quantity: yup.number().integer().default(0),
  low_stock_threshold: yup.number().integer().default(10),
  track_inventory: yup.boolean().default(true),
  image_urls: yup.array().of(yup.string()).default([]),
  created_at: yup.string().required(),
  updated_at: yup.string().required()
});
