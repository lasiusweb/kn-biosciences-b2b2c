'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Shield, 
  FlaskConical, 
  Factory, 
  Globe, 
  FileText, 
  AlertTriangle, 
  BadgeCheck,
  Download,
  Upload
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ProductFormProps {
  product?: Product;
  variants?: ProductVariant[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ product, variants = [], onSubmit, onCancel }: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<any>({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    category_id: product?.category_id || '',
    segment: product?.segment || '',
    status: product?.status || 'draft',
    featured: product?.featured || false,
    meta_title: product?.meta_title || '',
    meta_description: product?.meta_description || '',
    featured_image: product?.featured_image || '',
    
    // New fields for safety and compliance
    brand_name: product?.brand_name || '',
    gtin: product?.gtin || '',
    country_of_origin: product?.country_of_origin || '',
    chemical_composition: product?.chemical_composition || '',
    safety_warnings: product?.safety_warnings || '',
    antidote_statement: product?.antidote_statement || '',
    directions_of_use: product?.directions_of_use || '',
    precautions: product?.precautions || '',
    recommendations: product?.recommendations || '',
    cbirc_compliance: product?.cbirc_compliance || '',
    manufacturing_license: product?.manufacturing_license || '',
    customer_care_details: product?.customer_care_details || '',
    market_by: product?.market_by || '',
    net_content: product?.net_content || '',
    leaflet_urls: product?.leaflet_urls || [],
  });
  
  const [variantData, setVariantData] = useState<ProductVariant>(
    variants[0] || {
      id: '',
      product_id: product?.id || '',
      sku: '',
      weight: 0,
      weight_unit: 'kg',
      packing_type: 'bag',
      form: 'powder',
      price: 0,
      compare_price: 0,
      cost_price: 0,
      stock_quantity: 0,
      low_stock_threshold: 5,
      track_inventory: true,
      image_urls: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      net_weight: 0,
      gross_weight: 0,
      net_content: ''
    }
  );

  const segments = [
    'agriculture', 'aquaculture', 'poultry_healthcare', 
    'animal_healthcare', 'bioremediation', 'seeds', 
    'organic_farming', 'farm_equipment', 'testing_lab', 'oilpalm'
  ];

  const packingTypes = ['bag', 'box', 'drum', 'bottle', 'pouch'];
  const forms = ['powder', 'liquid', 'granules', 'tablet', 'capsule'];
  const weightUnits = ['g', 'kg', 'ml', 'l'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVariantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setVariantData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddLeaflet = () => {
    setFormData(prev => ({
      ...prev,
      leaflet_urls: [...(prev.leaflet_urls || []), '']
    }));
  };

  const handleLeafletChange = (index: number, value: string) => {
    const newUrls = [...formData.leaflet_urls];
    newUrls[index] = value;
    setFormData(prev => ({
      ...prev,
      leaflet_urls: newUrls
    }));
  };

  const handleRemoveLeaflet = (index: number) => {
    const newUrls = formData.leaflet_urls.filter((_: any, i: number) => i !== index);
    setFormData(prev => ({
      ...prev,
      leaflet_urls: newUrls
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      variants: [variantData]
    };
    
    await onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="safety">Safety & Compliance</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>General product details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Textarea
                  id="short_description"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category ID</Label>
                  <Input
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="segment">Segment *</Label>
                  <Select 
                    name="segment" 
                    value={formData.segment} 
                    onValueChange={(value) => setFormData({...formData, segment: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {segments.map((seg) => (
                        <SelectItem key={seg} value={seg}>
                          {seg.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    name="status" 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Safety & Compliance Tab */}
        <TabsContent value="safety" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety Information
              </CardTitle>
              <CardDescription>Product safety and hazard information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chemical_composition">Chemical Composition</Label>
                <Textarea
                  id="chemical_composition"
                  name="chemical_composition"
                  value={formData.chemical_composition}
                  onChange={handleChange}
                  rows={3}
                  placeholder="List all chemical components and their concentrations"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="safety_warnings">Safety Warnings</Label>
                <Textarea
                  id="safety_warnings"
                  name="safety_warnings"
                  value={formData.safety_warnings}
                  onChange={handleChange}
                  rows={3}
                  placeholder="List all safety warnings and hazards"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="antidote_statement">Antidote Statement</Label>
                <Textarea
                  id="antidote_statement"
                  name="antidote_statement"
                  value={formData.antidote_statement}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Emergency antidote information"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="precautions">Precautions</Label>
                <Textarea
                  id="precautions"
                  name="precautions"
                  value={formData.precautions}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Safety precautions for handling and use"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="directions_of_use">Directions of Use</Label>
                <Textarea
                  id="directions_of_use"
                  name="directions_of_use"
                  value={formData.directions_of_use}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Detailed instructions for proper use"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea
                  id="recommendations"
                  name="recommendations"
                  value={formData.recommendations}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Application recommendations and best practices"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5" />
                Compliance Information
              </CardTitle>
              <CardDescription>Regulatory compliance and licensing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gtin">GTIN/EAN/UPC</Label>
                  <Input
                    id="gtin"
                    name="gtin"
                    value={formData.gtin}
                    onChange={handleChange}
                    placeholder="Global Trade Item Number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country_of_origin">Country of Origin</Label>
                  <Input
                    id="country_of_origin"
                    name="country_of_origin"
                    value={formData.country_of_origin}
                    onChange={handleChange}
                    placeholder="Manufacturing country"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cbirc_compliance">CBIRC Compliance</Label>
                  <Input
                    id="cbirc_compliance"
                    name="cbirc_compliance"
                    value={formData.cbirc_compliance}
                    onChange={handleChange}
                    placeholder="Compliance certification"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="manufacturing_license">Manufacturing License</Label>
                  <Input
                    id="manufacturing_license"
                    name="manufacturing_license"
                    value={formData.manufacturing_license}
                    onChange={handleChange}
                    placeholder="License number"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customer_care_details">Customer Care Details</Label>
                <Input
                  id="customer_care_details"
                  name="customer_care_details"
                  value={formData.customer_care_details}
                  onChange={handleChange}
                  placeholder="Contact information for support"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="market_by">Marketed By</Label>
                <Input
                  id="market_by"
                  name="market_by"
                  value={formData.market_by}
                  onChange={handleChange}
                  placeholder="Marketing entity"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Specifications Tab */}
        <TabsContent value="specifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5" />
                Product Specifications
              </CardTitle>
              <CardDescription>Detailed product specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand_name">Brand Name</Label>
                  <Input
                    id="brand_name"
                    name="brand_name"
                    value={formData.brand_name}
                    onChange={handleChange}
                    placeholder="Product brand"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="net_content">Net Content</Label>
                  <Input
                    id="net_content"
                    name="net_content"
                    value={formData.net_content}
                    onChange={handleChange}
                    placeholder="Net quantity (e.g., 500ml, 1kg)"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leaflet_urls">Leaflet URLs</Label>
                <div className="space-y-2">
                  {formData.leaflet_urls.map((url: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={url}
                        onChange={(e) => handleLeafletChange(index, e.target.value)}
                        placeholder="PDF download URL"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveLeaflet(index)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddLeaflet}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Add Leaflet URL
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Variant Specifications
              </CardTitle>
              <CardDescription>Specific variant details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={variantData.sku}
                    onChange={(e) => handleVariantChange(e)}
                    placeholder="Stock Keeping Unit"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    value={variantData.weight}
                    onChange={(e) => handleVariantChange(e)}
                    placeholder="Numeric value"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight_unit">Weight Unit</Label>
                  <Select 
                    name="weight_unit" 
                    value={variantData.weight_unit} 
                    onValueChange={(value) => setVariantData({...variantData, weight_unit: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {weightUnits.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="packing_type">Packing Type</Label>
                  <Select 
                    name="packing_type" 
                    value={variantData.packing_type} 
                    onValueChange={(value) => setVariantData({...variantData, packing_type: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select packing" />
                    </SelectTrigger>
                    <SelectContent>
                      {packingTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="form">Form</Label>
                  <Select 
                    name="form" 
                    value={variantData.form} 
                    onValueChange={(value) => setVariantData({...variantData, form: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select form" />
                    </SelectTrigger>
                    <SelectContent>
                      {forms.map(form => (
                        <SelectItem key={form} value={form}>{form}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={variantData.price}
                    onChange={(e) => handleVariantChange(e)}
                    placeholder="Selling price"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="compare_price">Compare Price</Label>
                  <Input
                    id="compare_price"
                    name="compare_price"
                    type="number"
                    value={variantData.compare_price}
                    onChange={(e) => handleVariantChange(e)}
                    placeholder="Original/MRP price"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Cost Price</Label>
                  <Input
                    id="cost_price"
                    name="cost_price"
                    type="number"
                    value={variantData.cost_price}
                    onChange={(e) => handleVariantChange(e)}
                    placeholder="Cost to business"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    value={variantData.stock_quantity}
                    onChange={(e) => handleVariantChange(e)}
                    placeholder="Available quantity"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                  <Input
                    id="low_stock_threshold"
                    name="low_stock_threshold"
                    type="number"
                    value={variantData.low_stock_threshold}
                    onChange={(e) => handleVariantChange(e)}
                    placeholder="Minimum stock level"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="net_weight">Net Weight</Label>
                  <Input
                    id="net_weight"
                    name="net_weight"
                    type="number"
                    value={variantData.net_weight}
                    onChange={(e) => handleVariantChange(e)}
                    placeholder="Net weight value"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gross_weight">Gross Weight</Label>
                  <Input
                    id="gross_weight"
                    name="gross_weight"
                    type="number"
                    value={variantData.gross_weight}
                    onChange={(e) => handleVariantChange(e)}
                    placeholder="Gross weight value"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="variant_net_content">Variant Net Content</Label>
                  <Input
                    id="variant_net_content"
                    name="net_content"
                    value={variantData.net_content}
                    onChange={(e) => handleVariantChange(e)}
                    placeholder="Net content for this variant"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="track_inventory"
                  name="track_inventory"
                  checked={variantData.track_inventory}
                  onCheckedChange={(checked) => setVariantData({...variantData, track_inventory: checked})}
                />
                <Label htmlFor="track_inventory">Track Inventory</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO & Meta Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                SEO Information
              </CardTitle>
              <CardDescription>Optimize for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  placeholder="Title for search engines"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Description for search engines"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="featured_image">Featured Image URL</Label>
                <Input
                  id="featured_image"
                  name="featured_image"
                  value={formData.featured_image}
                  onChange={handleChange}
                  placeholder="URL to featured image"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}