"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  FileText,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Filter,
} from "lucide-react";

interface EnhancedAnalyticsData {
  overview: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    totalB2BQuotes: number;
    totalB2BValue: number;
    b2bConversionRate: number;
    paymentRate: number;
    customerRetentionRate: number;
    lowStockAlerts: number;
    totalInventoryValue: number;
  };
  revenueByMonth: Array<{ month: string; revenue: number }>;
  b2bRevenueByMonth: Array<{ month: string; revenue: number }>;
  customerGrowth: Array<{ month: string; newCustomers: number }>;
  topProducts: Array<{
    name: string;
    sku: string;
    segment: string;
    totalRevenue: number;
    quantity: number;
    currentStock: number;
    unitPrice: number;
    isLowStock: boolean;
  }>;
  customerSegments: {
    b2c: number;
    b2b: number;
    other: number;
  };
  segmentPerformance: Array<{
    segment: string;
    revenue: number;
    quantity: number;
  }>;
  orderStatusDistribution: {
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
  b2bStatusDistribution: {
    draft: number;
    submitted: number;
    under_review: number;
    approved: number;
    rejected: number;
  };
  inventoryAlerts: {
    lowStock: number;
    totalValue: number;
    outOfStock: number;
  };
  couponAnalytics: {
    activeCoupons: number;
    totalUsage: number;
  };
  period: string;
}

const COLORS = [
  "#8BC34A",
  "#795548",
  "#FF9800",
  "#2196F3",
  "#F44336",
  "#9C27B0",
];

const STATUS_COLORS = {
  confirmed: "#FF9800",
  processing: "#2196F3",
  shipped: "#9C27B0",
  delivered: "#8BC34A",
};

const B2B_STATUS_COLORS = {
  draft: "#9E9E9E",
  submitted: "#2196F3",
  under_review: "#FF9800",
  approved: "#8BC34A",
  rejected: "#F44336",
};

export function EnhancedAnalyticsDashboard() {
  const [data, setData] = useState<EnhancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchEnhancedAnalytics();
  }, [period]);

  const fetchEnhancedAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/enhanced?period=${period}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      } else {
        console.error("Failed to fetch enhanced analytics");
      }
    } catch (error) {
      console.error("Error fetching enhanced analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (typeof amount !== "number") return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    format = "number",
    color = "default",
  }: {
    title: string;
    value: number;
    change?: number;
    icon: any;
    format?: "number" | "currency" | "percentage";
    color?: "default" | "success" | "warning" | "danger";
  }) => {
    const displayValue =
      format === "currency"
        ? formatCurrency(value)
        : format === "percentage"
          ? `${value.toFixed(1)}%`
          : value.toLocaleString();

    const colorClasses = {
      default: "text-muted-foreground",
      success: "text-green-600",
      warning: "text-orange-600",
      danger: "text-red-600",
    };

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayValue}</div>
          {change !== undefined && (
            <p
              className={`text-xs ${colorClasses[change >= 0 ? "success" : "danger"]}`}
            >
              {change >= 0 ? (
                <TrendingUp className="inline h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="inline h-3 w-3 mr-1" />
              )}
              {Math.abs(change)}% from last period
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-organic-500 mx-auto mb-4"></div>
            <p className="text-earth-600">Loading enhanced analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-earth-600">Failed to load analytics data</p>
          <Button onClick={fetchEnhancedAnalytics} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const orderStatusChartData = Object.entries(data.orderStatusDistribution).map(
    ([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      fill: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
    }),
  );

  const b2bStatusChartData = Object.entries(data.b2bStatusDistribution).map(
    ([status, count]) => ({
      name:
        status.replace("_", " ").charAt(0).toUpperCase() +
        status.replace("_", " ").slice(1),
      value: count,
      fill: B2B_STATUS_COLORS[status as keyof typeof B2B_STATUS_COLORS],
    }),
  );

  const radarData = data.segmentPerformance.map((item) => ({
    segment:
      item.segment.replace("_", " ").charAt(0).toUpperCase() +
      item.segment.replace("_", " ").slice(1),
    revenue: item.revenue / 1000, // Scale down for better visualization
    quantity: item.quantity * 10, // Scale up for better visualization
  }));

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 mb-2">
            Advanced Analytics Dashboard
          </h1>
          <p className="text-earth-600">
            Comprehensive business intelligence and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Sales"
              value={data.overview.totalSales}
              icon={DollarSign}
              format="currency"
              color="success"
            />
            <MetricCard
              title="Total Orders"
              value={data.overview.totalOrders}
              icon={ShoppingCart}
              color="default"
            />
            <MetricCard
              title="Payment Rate"
              value={data.overview.paymentRate}
              icon={CheckCircle}
              format="percentage"
              color="success"
            />
            <MetricCard
              title="Customer Retention"
              value={data.overview.customerRetentionRate}
              icon={Users}
              format="percentage"
              color="success"
            />
          </div>

          {/* Revenue Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue from sales</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8BC34A"
                      fill="#8BC34A"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New customers by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.customerGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="newCustomers" fill="#795548" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          {/* Sales Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Average Order Value"
              value={data.overview.averageOrderValue}
              icon={TrendingUp}
              format="currency"
              color="success"
            />
            <MetricCard
              title="B2B Quotes"
              value={data.overview.totalB2BQuotes}
              icon={FileText}
              color="default"
            />
            <MetricCard
              title="B2B Conversion Rate"
              value={data.overview.b2bConversionRate}
              icon={CheckCircle}
              format="percentage"
              color="success"
            />
          </div>

          {/* Sales Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Current status of all orders</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Products Performance</CardTitle>
                <CardDescription>
                  Best performing products by revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={data.topProducts.slice(0, 8)}
                    layout="horizontal"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="totalRevenue" fill="#8BC34A" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          {/* Customer Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="B2C Customers"
              value={data.customerSegments.b2c}
              icon={Users}
              color="success"
            />
            <MetricCard
              title="B2B Clients"
              value={data.customerSegments.b2b}
              icon={Users}
              color="warning"
            />
            <MetricCard
              title="Customer Retention"
              value={data.overview.customerRetentionRate}
              icon={TrendingUp}
              format="percentage"
              color="success"
            />
          </div>

          {/* Customer Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>
                  Distribution of customer types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "B2C", value: data.customerSegments.b2c },
                        { name: "B2B", value: data.customerSegments.b2b },
                        { name: "Other", value: data.customerSegments.other },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#8BC34A" />
                      <Cell fill="#795548" />
                      <Cell fill="#FF9800" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segment Performance</CardTitle>
                <CardDescription>
                  Revenue and quantity by segment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="segment" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Revenue (K)"
                      dataKey="revenue"
                      stroke="#8BC34A"
                      fill="#8BC34A"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Quantity (x10)"
                      dataKey="quantity"
                      stroke="#795548"
                      fill="#795548"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          {/* Inventory Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Total Inventory Value"
              value={data.overview.totalInventoryValue}
              icon={Package}
              format="currency"
              color="success"
            />
            <MetricCard
              title="Low Stock Alerts"
              value={data.inventoryAlerts.lowStock}
              icon={AlertTriangle}
              color="warning"
            />
            <MetricCard
              title="Out of Stock"
              value={data.inventoryAlerts.outOfStock}
              icon={XCircle}
              color="danger"
            />
            <MetricCard
              title="Active Coupons"
              value={data.couponAnalytics.activeCoupons}
              icon={FileText}
              color="default"
            />
          </div>

          {/* Low Stock Products */}
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
              <CardDescription>Products that need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topProducts
                  .filter((product) => product.isLowStock)
                  .slice(0, 10)
                  .map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-orange-600">
                          {product.currentStock} units
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(product.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
