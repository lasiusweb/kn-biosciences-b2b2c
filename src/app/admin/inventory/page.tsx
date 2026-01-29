'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Package, History, ArrowUpRight } from 'lucide-react';

const mockInventory = [
  { id: '1', name: 'Bio-NPK Booster', stock: 150, minStock: 50, batch: 'BN-2026-01', expiry: '2027-01-20' },
  { id: '2', name: 'Aqua-Pro Prebiotic', stock: 15, minStock: 30, batch: 'AQ-2025-12', expiry: '2026-12-15' },
  { id: '3', name: 'Phos-Solubilizer', stock: 500, minStock: 100, batch: 'PS-2026-02', expiry: '2027-02-10' },
];

export default function InventoryAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-950 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-zinc-400" />
              <span className="text-zinc-400">Total Items</span>
            </div>
            <div className="text-3xl font-bold mt-2">665</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="text-zinc-400">Low Stock Alerts</span>
            </div>
            <div className="text-3xl font-bold mt-2 text-yellow-500">12</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5 text-zinc-400" />
              <span className="text-zinc-400">Restock Orders</span>
            </div>
            <div className="text-3xl font-bold mt-2">3</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Stock Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Product</TableHead>
                <TableHead className="text-zinc-400">Batch Number</TableHead>
                <TableHead className="text-zinc-400">Expiry Date</TableHead>
                <TableHead className="text-zinc-400">Stock Level</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInventory.map((item) => {
                const isLow = item.stock < item.minStock;
                const percentage = Math.min((item.stock / (item.minStock * 2)) * 100, 100);
                
                return (
                  <TableRow key={item.id} className="border-zinc-800">
                    <TableCell className="text-white font-medium">{item.name}</TableCell>
                    <TableCell className="text-zinc-300 font-mono text-xs">{item.batch}</TableCell>
                    <TableCell className="text-zinc-400">{item.expiry}</TableCell>
                    <TableCell className="w-64">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-zinc-500">
                          <span>{item.stock} units</span>
                          <span>Min: {item.minStock}</span>
                        </div>
                        <Progress value={percentage} className={`h-1.5 ${isLow ? 'bg-yellow-500/20' : 'bg-zinc-800'}`} />
                      </div>
                    </TableCell>
                    <TableCell>
                      {isLow ? (
                        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          Healthy
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
