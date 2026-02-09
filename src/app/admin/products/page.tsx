'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Plus, Download, Search, AlertCircle, Edit, Trash2, Eye } from 'lucide-react';
import { parseCSV, parseExcel, ParsedProduct } from '@/utils/import-parser';
import { bulkImportProducts } from '@/lib/admin-service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ProductForm } from '@/components/admin/product-form';
import { Product, ProductVariant } from '@/types';

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [importing, setImporting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setAllProducts(data.products || []);
          setVariants(data.variants || []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      }
    };
    
    fetchProducts();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      let parsed: ParsedProduct[] = [];
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        parsed = await parseCSV(text);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        parsed = parseExcel(buffer);
      } else {
        throw new Error('Unsupported file format. Please use CSV or Excel.');
      }
      setProducts(parsed);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleImport = async () => {
    if (products.length === 0) return;
    setImporting(true);
    setError(null);

    try {
      const result = await bulkImportProducts(products);
      if (result.success) {
        alert(`Successfully imported ${result.importedCount} products.`);
        setProducts([]);
        // Refresh the product list
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setAllProducts(data.products || []);
        }
      } else {
        setError(`Import failed: ${result.errors[0]?.message}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/admin/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setAllProducts(allProducts.filter(p => p.id !== id));
        alert('Product deleted successfully');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete product');
      }
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  const handleSubmitProduct = async (data: any) => {
    try {
      let response;
      if (editingProduct) {
        // Update existing product
        response = await fetch('/admin/api/products', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: editingProduct.id, ...data }),
        });
      } else {
        // Create new product
        response = await fetch('/admin/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      }
      
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        
        // Refresh the product list
        const productsResponse = await fetch('/api/products');
        if (productsResponse.ok) {
          const data = await productsResponse.json();
          setAllProducts(data.products || []);
        }
        
        setShowForm(false);
        setEditingProduct(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Operation failed');
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h1>
          <Button variant="outline" onClick={handleCancelForm}>
            Back to Products
          </Button>
        </div>
        
        <Card className="bg-zinc-950 border-zinc-800">
          <CardContent className="p-6">
            <ProductForm
              product={editingProduct || undefined}
              variants={editingProduct ? variants.filter(v => v.product_id === editingProduct.id) : []}
              onSubmit={handleSubmitProduct}
              onCancel={handleCancelForm}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileUpload}
          />
          <Button onClick={handleAddProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-bold">Error</span>
          </div>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {products.length > 0 && (
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Import Preview ({products.length} products)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400">Name</TableHead>
                    <TableHead className="text-zinc-400">Price</TableHead>
                    <TableHead className="text-zinc-400">Segment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p, i) => (
                    <TableRow key={i} className="border-zinc-800">
                      <TableCell className="text-white">{p.name}</TableCell>
                      <TableCell className="text-white">₹{p.price}</TableCell>
                      <TableCell className="text-white capitalize">{p.segment}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setProducts([])} className="text-zinc-400">
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={importing}>
                {importing ? 'Importing...' : 'Confirm Import'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">All Products</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search products..."
                className="pl-8 bg-black border-zinc-800 text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {allProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Name</TableHead>
                  <TableHead className="text-zinc-400">Segment</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allProducts.map((product) => (
                  <TableRow key={product.id} className="border-zinc-800">
                    <TableCell className="text-white font-medium">{product.name}</TableCell>
                    <TableCell className="text-zinc-300 capitalize">{product.segment}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.status === 'active' 
                          ? 'bg-green-500/10 text-green-500' 
                          : product.status === 'draft'
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {product.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-zinc-500 text-center py-10">
              No products found. Add your first product or use bulk import.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
