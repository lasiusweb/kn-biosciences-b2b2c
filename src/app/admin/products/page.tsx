'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Plus, Download, Search, AlertCircle } from 'lucide-react';
import { parseCSV, parseExcel, ParsedProduct } from '@/utils/import-parser';
import { bulkImportProducts } from '@/lib/admin-service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      } else {
        setError(`Import failed: ${result.errors[0]?.message}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

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
          <Button>
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
          <div className="text-zinc-500 text-center py-10">
            No products found. Add your first product or use bulk import.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
