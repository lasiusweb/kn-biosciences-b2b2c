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
  XCircle,
  Download,
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
      }
    } catch (error) {
      console.error("Error fetching enhanced analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: any) => {
    const val = typeof amount === "number" ? amount : 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
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
            <p className={`text-xs ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load data</div>;

  const orderStatusChartData = Object.entries(data.orderStatusDistribution).map(
    ([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      fill: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
    }),
  );

  const radarData = data.segmentPerformance.map((item) => ({
    segment: item.segment.replace("_", " "),
    revenue: item.revenue / 1000,
    quantity: item.quantity * 10,
  }));

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Total Sales" value={data.overview.totalSales} icon={DollarSign} format="currency" />
            <MetricCard title="Total Orders" value={data.overview.totalOrders} icon={ShoppingCart} />
            <MetricCard title="Payment Rate" value={data.overview.paymentRate} icon={CheckCircle} format="percentage" />
            <MetricCard title="Customer Retention" value={data.overview.customerRetentionRate} icon={Users} format="percentage" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v: any) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="revenue" stroke="#8BC34A" fill="#8BC34A" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Customer Growth</CardTitle></CardHeader>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Order Status Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={orderStatusChartData} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name }) => name}>
                      {orderStatusChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Top Products Performance</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.topProducts.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} hide />
                    <Tooltip formatter={(v: any) => formatCurrency(v)} />
                    <Bar dataKey="totalRevenue" fill="#8BC34A" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}