"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Calendar, 
  DollarSign,
  Truck,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_variants: {
    id: string;
    sku: string;
    weight?: number;
    weight_unit?: string;
    products: {
      name: string;
      images: string[];
    };
  };
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  subtotal: number;
  currency: string;
  created_at: string;
  updated_at: string;
  shipping_carrier?: string;
  tracking_number?: string;
  order_items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth?redirect=/account/orders');
        return;
      }

      let query = supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            product_variants (
              *,
              products (
                name,
                images
              )
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      // Apply date filter
      const now = new Date();
      let startDate = new Date();
      
      switch (dateFilter) {
        case "last30":
          startDate.setDate(now.getDate() - 30);
          break;
        case "last90":
          startDate.setDate(now.getDate() - 90);
          break;
        case "lastyear":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate = new Date(0); // Beginning of time
      }

      if (dateFilter !== "all") {
        query = query.gte("created_at", startDate.toISOString());
      }

      // Get total count
      const { count } = await query.select("*", { count: "exact", head: true });

      // Fetch paginated results
      const offset = (pagination.page - 1) * pagination.limit;
      const { data, error } = await query
        .range(offset, offset + pagination.limit - 1);

      if (error) throw error;

      setOrders(data || []);
      setPagination(prev => ({ ...prev, total: count || 0 }));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'refunded':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.order_items?.some(item =>
      item.product_variants?.products?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-earth-900 mb-2">My Orders</h1>
            <div className="flex items-center space-x-2 text-sm text-earth-600">
              <Link href="/" className="hover:text-earth-900">Home</Link>
              <span>/</span>
              <Link href="/account" className="hover:text-earth-900">Account</Link>
              <span>/</span>
              <span>Orders</span>
            </div>
          </div>
          <Button onClick={() => router.push('/account')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Order number or product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last90">Last 90 Days</SelectItem>
                  <SelectItem value="lastyear">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-organic-200 border-t-organic-600" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-earth-300 mb-4" />
            <h3 className="text-lg font-medium text-earth-900 mb-2">
              {searchTerm || statusFilter !== "all" || dateFilter !== "all" 
                ? "No orders found" 
                : "No orders yet"}
            </h3>
            <p className="text-earth-600 mb-4">
              {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your filters or search terms."
                : "Start shopping to see your orders here!"}
            </p>
            <div className="flex gap-4 justify-center">
              {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setDateFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Link href="/shop">
                <Button className="bg-organic-500 hover:bg-organic-600">
                  Start Shopping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-earth-900">
                          Order #{order.order_number}
                        </h3>
                        <Badge className={getStatusColor(order.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-earth-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {order.currency} {order.total_amount?.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {order.order_items?.length || 0} items
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link href={`/account/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="space-y-3">
                    {order.order_items?.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={
                            item.product_variants?.products?.images?.[0] ||
                            "/placeholder-product.jpg"
                          }
                          alt={item.product_variants?.products?.name}
                          className="w-12 h-12 object-cover rounded border"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-earth-900 truncate">
                            {item.product_variants?.products?.name}
                          </h4>
                          <p className="text-sm text-earth-600">
                            SKU: {item.product_variants?.sku}
                            {item.product_variants?.weight && (
                              <> • {item.product_variants.weight} {item.product_variants.weight_unit}</>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-organic-600">
                            ₹{item.unit_price?.toFixed(2)}
                          </div>
                          <div className="text-sm text-earth-600">
                            Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {order.order_items && order.order_items.length > 3 && (
                      <div className="text-center pt-2">
                        <p className="text-sm text-earth-600">
                          +{order.order_items.length - 3} more items
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm">
                      {order.tracking_number && (
                        <div className="flex items-center gap-1 text-organic-600">
                          <Truck className="h-4 w-4" />
                          Tracking: {order.tracking_number}
                        </div>
                      )}
                      {order.shipping_carrier && (
                        <div className="text-sm text-earth-600">
                          Carrier: {order.shipping_carrier}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm">
                          Download Invoice
                        </Button>
                      )}
                      <Link href={`/account/orders/${order.id}`}>
                        <Button size="sm" className="bg-organic-500 hover:bg-organic-600">
                          <ChevronRight className="h-4 w-4 ml-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}