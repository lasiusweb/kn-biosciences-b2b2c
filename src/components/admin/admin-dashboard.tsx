"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Truck,
  DollarSign,
  FileText,
  Plus,
  Eye,
  Edit,
  Trash,
  Clock,
} from "lucide-react";

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [recentQuotes, setRecentQuotes] = useState([]);

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        // const statsResponse = await fetch('/api/admin/stats')
        // const statsData = await statsResponse.json()
        // setStats(statsData)
        // Fetch recent orders
        // const ordersResponse = await fetch('/api/admin/orders?limit=10')
        // const ordersData = await ordersResponse.json()
        // setRecentOrders(ordersData)
        // Fetch recent quotes
        // const quotesResponse = await fetch('/api/admin/quotes?limit=10')
        // const quotesData = await quotesResponse.json()
        // setRecentQuotes(quotesData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (
    status: string,
    type: "order" | "quote" = "order",
  ) => {
    const statusConfig = {
      order: {
        pending: {
          variant: "secondary" as const,
          icon: Clock,
          text: "Pending",
        },
        confirmed: {
          variant: "default" as const,
          icon: CheckCircle,
          text: "Confirmed",
        },
        processing: {
          variant: "default" as const,
          icon: Package,
          text: "Processing",
        },
        shipped: { variant: "default" as const, icon: Truck, text: "Shipped" },
        delivered: {
          variant: "default" as const,
          icon: CheckCircle,
          text: "Delivered",
        },
        cancelled: {
          variant: "destructive" as const,
          icon: AlertCircle,
          text: "Cancelled",
        },
        refunded: {
          variant: "destructive" as const,
          icon: AlertCircle,
          text: "Refunded",
        },
      },
      quote: {
        draft: { variant: "secondary" as const, icon: FileText, text: "Draft" },
        submitted: {
          variant: "default" as const,
          icon: FileText,
          text: "Submitted",
        },
        under_review: {
          variant: "default" as const,
          icon: Eye,
          text: "Under Review",
        },
        approved: {
          variant: "default" as const,
          icon: CheckCircle,
          text: "Approved",
        },
        rejected: {
          variant: "destructive" as const,
          icon: AlertCircle,
          text: "Rejected",
        },
        expired: {
          variant: "destructive" as const,
          icon: AlertCircle,
          text: "Expired",
        },
      },
    };

    const config =
      (statusConfig[type] as any)[status] || statusConfig.order.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Low Stock Alerts",
      value: stats.lowStockProducts,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-earth-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-earth-600">Manage your e-commerce platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div
                  className={`${stat.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                >
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-earth-900">
                  {stat.value}
                </div>
                <div className="text-sm text-earth-600">{stat.title}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest customer orders</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.length === 0 ? (
                    <p className="text-earth-600 text-center py-4">
                      No recent orders
                    </p>
                  ) : (
                    recentOrders.map((order: any) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {order.order_number}
                          </div>
                          <div className="text-sm text-earth-600">
                            {order.user.email}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ₹{order.total_amount}
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Quotes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent B2B Quotes</CardTitle>
                  <CardDescription>
                    Latest wholesale quote requests
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentQuotes.length === 0 ? (
                    <p className="text-earth-600 text-center py-4">
                      No recent quotes
                    </p>
                  ) : (
                    recentQuotes.map((quote: any) => (
                      <div
                        key={quote.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            Quote {quote.id.substring(0, 8).toUpperCase()}
                          </div>
                          <div className="text-sm text-earth-600">
                            {quote.user.company_name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ₹{quote.total_amount}
                          </div>
                          {getStatusBadge(quote.status, "quote")}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button className="bg-organic-500 hover:bg-organic-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
                <Button variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Inventory
                </Button>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  View Customers
                </Button>
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Sales Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Management */}
        <TabsContent value="orders" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-earth-900">
              Orders Management
            </h2>
            <Button className="bg-organic-500 hover:bg-organic-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {/* Orders table would go here */}
              <div className="p-8 text-center text-earth-600">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-earth-400" />
                <p>Orders management interface</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Management */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-earth-900">
              Products Management
            </h2>
            <Button className="bg-organic-500 hover:bg-organic-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Categories list */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span>Agriculture</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Products</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Recent products list */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span>BioNPK Plus</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Management */}
        <TabsContent value="customers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-earth-900">
              Customers Management
            </h2>
            <Button className="bg-organic-500 hover:bg-organic-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {/* Customers table would go here */}
              <div className="p-8 text-center text-earth-600">
                <Users className="h-12 w-12 mx-auto mb-4 text-earth-400" />
                <p>Customers management interface</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
