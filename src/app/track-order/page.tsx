"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Calendar,
  User,
  AlertCircle,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface OrderStatus {
  status: string;
  label: string;
  description: string;
  timestamp?: string;
  completed: boolean;
}

interface TrackingInfo {
  orderNumber: string;
  status: string;
  currentStatus: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string;
  deliveredAt?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: any;
  items: any[];
  statusHistory: OrderStatus[];
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem('orderSearchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const saveToHistory = (orderNum: string) => {
    const newHistory = [orderNum, ...searchHistory.filter(h => h !== orderNum)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('orderSearchHistory', JSON.stringify(newHistory));
  };

  const getStatusHistory = (order: any): OrderStatus[] => {
    const history: OrderStatus[] = [];
    const createdAt = order.created_at;
    
    // Always have order placed
    history.push({
      status: 'placed',
      label: 'Order Placed',
      description: 'Your order has been received and is being processed.',
      timestamp: createdAt,
      completed: true
    });

    // Add confirmed status if applicable
    if (['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)) {
      history.push({
        status: 'confirmed',
        label: 'Order Confirmed',
        description: 'Your order has been confirmed and is being prepared.',
        completed: true
      });
    }

    // Add processing status if applicable
    if (['processing', 'shipped', 'delivered'].includes(order.status)) {
      history.push({
        status: 'processing',
        label: 'Processing',
        description: 'Your order is being packed and prepared for shipment.',
        completed: true
      });
    }

    // Add shipped status if applicable
    if (['shipped', 'delivered'].includes(order.status)) {
      history.push({
        status: 'shipped',
        label: 'Shipped',
        description: `Your order has been shipped via ${order.shipping_carrier || 'our delivery partner'}.`,
        timestamp: order.shipped_at,
        completed: true
      });
    }

    // Add delivered status if applicable
    if (order.status === 'delivered') {
      history.push({
        status: 'delivered',
        label: 'Delivered',
        description: 'Your order has been successfully delivered.',
        timestamp: order.delivered_at,
        completed: true
      });
    }

    // Add cancelled status if applicable
    if (order.status === 'cancelled') {
      history.push({
        status: 'cancelled',
        label: 'Cancelled',
        description: 'Your order has been cancelled.',
        completed: true
      });
    }

    // Add current status if not in history
    if (!history.find(h => h.status === order.status)) {
      const statusLabels: { [key: string]: string } = {
        'pending': 'Pending Confirmation',
        'confirmed': 'Confirmed',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
        'refunded': 'Refunded'
      };

      history.push({
        status: order.status,
        label: statusLabels[order.status] || order.status,
        description: `Order status: ${order.status}`,
        completed: false
      });
    }

    return history;
  };

  const handleTrackOrder = async () => {
    if (!orderNumber.trim()) {
      setError("Please enter an order number");
      return;
    }

    setLoading(true);
    setError("");
    setTrackingInfo(null);

    try {
      // First try to get order by order number
      let orderQuery = supabase
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
          ),
          users (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq("order_number", orderNumber.trim().toUpperCase())
        .single();

      const { data: order, error: orderError } = await orderQuery;

      if (orderError || !order) {
        setError("Order not found. Please check the order number and try again.");
        return;
      }

      // If email is provided, verify it matches
      if (email.trim() && order.users?.email !== email.trim()) {
        setError("Email does not match the order. Please check your email address.");
        return;
      }

      // Create tracking info
      const statusHistory = getStatusHistory(order);
      
      const trackingData: TrackingInfo = {
        orderNumber: order.order_number,
        status: order.status,
        currentStatus: order.status.replace('_', ' ').toUpperCase(),
        estimatedDelivery: order.estimated_delivery,
        trackingNumber: order.tracking_number,
        carrier: order.shipping_carrier,
        shippedAt: order.shipped_at,
        deliveredAt: order.delivered_at,
        customerName: `${order.users?.first_name || ''} ${order.users?.last_name || ''}`.trim() || 'Customer',
        customerEmail: order.users?.email || '',
        customerPhone: order.users?.phone,
        shippingAddress: order.shipping_address,
        items: order.order_items || [],
        statusHistory
      };

      setTrackingInfo(trackingData);
      saveToHistory(order.order_number);
    } catch (error) {
      console.error("Error tracking order:", error);
      setError("An error occurred while tracking your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed':
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return "Address not available";
    
    const parts = [
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.postal_code,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-earth-900 mb-2">Track Your Order</h1>
        <p className="text-earth-600">
          Enter your order number and email to track your shipment status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Search Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Track Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input
                  id="orderNumber"
                  placeholder="e.g., KNORD-2024-001234"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="uppercase"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleTrackOrder}
                disabled={loading}
                className="w-full bg-organic-500 hover:bg-organic-600"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Track Order
                  </>
                )}
              </Button>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-earth-700 mb-2">Recent Searches</p>
                  <div className="space-y-1">
                    {searchHistory.map((orderNum) => (
                      <Button
                        key={orderNum}
                        variant="ghost"
                        size="sm"
                        onClick={() => setOrderNumber(orderNum)}
                        className="w-full justify-start text-left"
                      >
                        {orderNum}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tracking Results */}
        <div className="lg:col-span-2">
          {trackingInfo ? (
            <div className="space-y-6">
              {/* Order Status Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-earth-900">
                        Order #{trackingInfo.orderNumber}
                      </h2>
                      <Badge className={getStatusColor(trackingInfo.status)}>
                        {trackingInfo.currentStatus}
                      </Badge>
                    </div>
                    <Package className="h-12 w-12 text-organic-600" />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-earth-600">Order Date</p>
                      <p className="font-medium">
                        {new Date(trackingInfo.statusHistory[0]?.timestamp || '').toLocaleDateString()}
                      </p>
                    </div>
                    {trackingInfo.estimatedDelivery && (
                      <div>
                        <p className="text-earth-600">Est. Delivery</p>
                        <p className="font-medium">
                          {new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {trackingInfo.carrier && (
                      <div>
                        <p className="text-earth-600">Carrier</p>
                        <p className="font-medium">{trackingInfo.carrier}</p>
                      </div>
                    )}
                    {trackingInfo.trackingNumber && (
                      <div>
                        <p className="text-earth-600">Tracking Number</p>
                        <p className="font-medium">{trackingInfo.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Status Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackingInfo.statusHistory.map((status, index) => (
                      <div key={status.status} className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className={cn(
                            "w-8 h-8 rounded-full border-2 flex items-center justify-center",
                            status.completed 
                              ? "bg-organic-500 border-organic-500" 
                              : "bg-gray-100 border-gray-300"
                          )}>
                            {status.completed ? (
                              <CheckCircle className="h-4 w-4 text-white" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          {index < trackingInfo.statusHistory.length - 1 && (
                            <div className="w-0.5 h-16 bg-gray-200 mx-auto mt-2" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-earth-900">{status.label}</h3>
                          <p className="text-sm text-earth-600">{status.description}</p>
                          {status.timestamp && (
                            <p className="text-xs text-earth-500 mt-1">
                              {new Date(status.timestamp).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-earth-600">Name</p>
                      <p className="font-medium">{trackingInfo.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-earth-600">Email</p>
                      <p className="font-medium">{trackingInfo.customerEmail}</p>
                    </div>
                    {trackingInfo.customerPhone && (
                      <div>
                        <p className="text-sm text-earth-600">Phone</p>
                        <p className="font-medium">{trackingInfo.customerPhone}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{formatAddress(trackingInfo.shippingAddress)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items ({trackingInfo.items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trackingInfo.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={
                            item.product_variants?.products?.images?.[0] ||
                            "/placeholder-product.jpg"
                          }
                          alt={item.product_variants?.products?.name}
                          className="w-12 h-12 object-cover rounded border"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-earth-900">
                            {item.product_variants?.products?.name}
                          </h4>
                          <p className="text-sm text-earth-600">
                            SKU: {item.product_variants?.sku}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{item.unit_price?.toFixed(2)}</p>
                          <p className="text-sm text-earth-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-16">
                <Truck className="h-16 w-16 mx-auto text-earth-300 mb-4" />
                <h3 className="text-lg font-medium text-earth-900 mb-2">
                  No Order to Track
                </h3>
                <p className="text-earth-600 mb-6">
                  Enter your order number and email to track your shipment.
                </p>
                <div className="text-sm text-earth-500">
                  <p>Don't have your order number?</p>
                  <p>Check your email inbox for the order confirmation.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}