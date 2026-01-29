'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Eye, Truck, CheckCircle, XCircle, Download, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getOrders, updateOrderStatus } from '@/lib/admin-service';
import { Order } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Filter },
  processing: { label: 'Processing', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Truck },
  shipped: { label: 'Shipped', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
};

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  if (loading) return <div className="text-white p-8">Loading orders...</div>;

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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                <TableHead className="text-zinc-400">Total</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow className="border-zinc-800">
                  <TableCell colSpan={5} className="text-center py-10 text-zinc-500">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const status = statusMap[order.status] || statusMap.pending;
                  return (
                    <TableRow key={order.id} className="border-zinc-800">
                      <TableCell className="text-white font-medium">{order.order_number}</TableCell>
                      <TableCell className="text-zinc-300">
                        {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                      </TableCell>
                      <TableCell className="text-white">₹{order.total_amount.toLocaleString()}</TableCell>
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
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
