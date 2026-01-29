'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Eye, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

const mockOrders = [
  { id: 'ORD-001', customer: 'Ramesh Kumar', date: '2026-01-28', total: 4500, status: 'pending', type: 'B2C' },
  { id: 'ORD-002', customer: 'Green Valley Distributors', date: '2026-01-27', total: 85000, status: 'processing', type: 'B2B' },
  { id: 'ORD-003', customer: 'Suresh Patil', date: '2026-01-26', total: 1200, status: 'shipped', type: 'B2C' },
];

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Filter },
  processing: { label: 'Processing', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Truck },
  shipped: { label: 'Shipped', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
};

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState(mockOrders);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Orders
          </Button>
        </div>
      </div>

      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Recent Orders</CardTitle>
            <div className="flex space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search orders..."
                  className="pl-8 bg-black border-zinc-800 text-white"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Order ID</TableHead>
                <TableHead className="text-zinc-400">Customer</TableHead>
                <TableHead className="text-zinc-400">Type</TableHead>
                <TableHead className="text-zinc-400">Total</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const status = statusMap[order.status];
                return (
                  <TableRow key={order.id} className="border-zinc-800">
                    <TableCell className="text-white font-medium">{order.id}</TableCell>
                    <TableCell className="text-zinc-300">{order.customer}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={order.type === 'B2B' ? 'border-purple-500 text-purple-500' : 'border-zinc-500 text-zinc-500'}>
                        {order.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white">₹{order.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={order.status}
                        onValueChange={(val) => handleStatusChange(order.id, val)}
                      >
                        <SelectTrigger className={`w-32 ${status.color} border`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                          {Object.entries(statusMap).map(([key, val]) => (
                            <SelectItem key={key} value={key}>{val.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
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

function Download(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
