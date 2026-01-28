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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  FileText,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
} from "lucide-react";
import { AnalyticsExporter } from "@/lib/analytics-exporter";

interface SalesAnalyticsData {
  overview: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    totalB2BQuotes: number;
    totalB2BValue: number;
    b2bConversionRate: number;
    paymentRate: number;
  };
  revenueByMonth: Array<{ month: string; revenue: number }>;
  b2bRevenueByMonth: Array<{ month: string; revenue: number }>;
  topProducts: Array<{
    name: string;
    sku: string;
    segment: string;
    totalRevenue: number;
    quantity: number;
    unitPrice: number;
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
  period: string;
}

const COLORS = ["#8BC34A", "#795548", "#FF9800", "#2196F3", "#F44336"];
const STATUS_COLORS = {
  confirmed: "#FF9800",
  processing: "#2196F3",
  shipped: "#9C27B0",
  delivered: "#8BC34A",
};

export function SalesAnalytics() {
  const [data, setData] = useState<SalesAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [comparison, setComparison] = useState(false);
  const exporter = new AnalyticsExporter();

  useEffect(() => {
    fetchSalesAnalytics();
  }, [period]);

  const fetchSalesAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/enhanced?period=${period}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      } else {
        console.error("Failed to fetch sales analytics");
      }
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    format = "number",
    color = "default",
    description,
  }: {
    title: string;
    value: number;
    change?: number;
    icon: any;
    format?: "number" | "currency" | "percentage";
    color?: "default" | "success" | "warning" | "danger";
    description?: string;
  }) => {
    const displayValue =
      format === "currency"
        ? formatCurrency(value)
        : format === "percentage"
          ? formatPercentage(value)
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
              className={`text-xs flex items-center ${colorClasses[change >= 0 ? "success" : "danger"]}`}
            >
              {change >= 0 ? (
                <ArrowUpRight className="inline h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="inline h-3 w-3 mr-1" />
              )}
              {Math.abs(change)}% from last period
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
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
            <p className="text-earth-600">Loading sales analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-earth-600">Failed to load sales data</p>
          <Button onClick={fetchSalesAnalytics} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Prepare combined revenue data for comparison
  const combinedRevenueData = data.revenueByMonth.map((item, index) => ({
    month: item.month,
    salesRevenue: item.revenue,
    b2bRevenue: data.b2bRevenueByMonth[index]?.revenue || 0,
    totalRevenue: item.revenue + (data.b2bRevenueByMonth[index]?.revenue || 0),
  }));

  const orderStatusChartData = Object.entries(data.orderStatusDistribution).map(
    ([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      fill: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
    }),
  );

  const topProductsByRevenue = data.topProducts
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  const topProductsByQuantity = data.topProducts
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 mb-2">
            Sales Analytics
          </h1>
          <p className="text-earth-600">
            Comprehensive sales performance and revenue analysis
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setComparison(!comparison)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {comparison ? "Hide" : "Show"} Comparison
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exporter.exportSalesReport(data)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Sales"
          value={data.overview.totalSales}
          change={12.5}
          icon={DollarSign}
          format="currency"
          color="success"
          description="All confirmed orders"
        />
        <MetricCard
          title="Total Orders"
          value={data.overview.totalOrders}
          change={8.2}
          icon={ShoppingCart}
          color="default"
          description="Confirmed orders"
        />
        <MetricCard
          title="Average Order Value"
          value={data.overview.averageOrderValue}
          change={3.7}
          icon={TrendingUp}
          format="currency"
          color="success"
          description="Revenue per order"
        />
        <MetricCard
          title="Payment Rate"
          value={data.overview.paymentRate}
          change={5.1}
          icon={CheckCircle}
          format="percentage"
          color="success"
          description="Paid orders percentage"
        />
      </div>

      {/* B2B Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="B2B Quotes"
          value={data.overview.totalB2BQuotes}
          change={15.3}
          icon={FileText}
          color="default"
          description="Total quote requests"
        />
        <MetricCard
          title="B2B Value"
          value={data.overview.totalB2BValue}
          change={18.7}
          icon={DollarSign}
          format="currency"
          color="success"
          description="Total quote value"
        />
        <MetricCard
          title="B2B Conversion Rate"
          value={data.overview.b2bConversionRate}
          change={2.4}
          icon={CheckCircle}
          format="percentage"
          color="success"
          description="Approved quotes percentage"
        />
      </div>

      {/* Revenue Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend Analysis</CardTitle>
            <CardDescription>
              Monthly revenue from sales and B2B quotes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={combinedRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === "salesRevenue"
                      ? "Sales Revenue"
                      : name === "b2bRevenue"
                        ? "B2B Revenue"
                        : "Total Revenue",
                  ]}
                />
                <Legend />
                <Bar dataKey="b2bRevenue" fill="#795548" name="B2B Revenue" />
                <Line
                  type="monotone"
                  dataKey="salesRevenue"
                  stroke="#8BC34A"
                  strokeWidth={2}
                  name="Sales Revenue"
                />
                {comparison && (
                  <Line
                    type="monotone"
                    dataKey="totalRevenue"
                    stroke="#FF9800"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Total Revenue"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
      </div>

      {/* Product Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
            <CardDescription>
              Best performing products by revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsByRevenue} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="totalRevenue" fill="#8BC34A" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products by Quantity Sold</CardTitle>
            <CardDescription>Most sold products by quantity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsByQuantity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#795548" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Product Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Product Performance</CardTitle>
          <CardDescription>
            Complete performance metrics for top products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Product Name</th>
                  <th className="text-left p-2">SKU</th>
                  <th className="text-left p-2">Segment</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {topProductsByRevenue.map((product, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{product.name}</td>
                    <td className="p-2">{product.sku}</td>
                    <td className="p-2">{product.segment}</td>
                    <td className="p-2 text-right">
                      {formatCurrency(product.totalRevenue)}
                    </td>
                    <td className="p-2 text-right">
                      {product.quantity.toLocaleString()}
                    </td>
                    <td className="p-2 text-right">
                      {formatCurrency(product.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
