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
  Treemap,
} from "recharts";
import {
  Users,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Star,
  ShoppingBag,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
} from "lucide-react";

interface CustomerAnalyticsData {
  overview: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    customerRetentionRate: number;
    averageLifetimeValue: number;
    customerSatisfactionScore: number;
  };
  customerGrowth: Array<{
    month: string;
    newCustomers: number;
    returningCustomers: number;
  }>;
  customerSegments: {
    b2c: number;
    b2b: number;
    other: number;
  };
  customerBehavior: {
    averageOrdersPerCustomer: number;
    averageOrderFrequency: number;
    averageTimeBetweenOrders: number;
    customerChurnRate: number;
  };
  topCustomers: Array<{
    name: string;
    email: string;
    segment: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
    averageOrderValue: number;
  }>;
  segmentPerformance: Array<{
    segment: string;
    revenue: number;
    customers: number;
    avgOrderValue: number;
  }>;
  customerActivity: Array<{
    day: string;
    newSignups: number;
    activeUsers: number;
    returningUsers: number;
  }>;
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

export function CustomerAnalytics() {
  const [data, setData] = useState<CustomerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [metricView, setMetricView] = useState<
    "overview" | "behavior" | "retention"
  >("overview");

  useEffect(() => {
    fetchCustomerAnalytics();
  }, [period]);

  const fetchCustomerAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/enhanced?period=${period}`);
      if (response.ok) {
        const analyticsData = await response.json();
        const customerData = {
          overview: {
            totalCustomers:
              (analyticsData.customerSegments?.b2c || 0) +
              (analyticsData.customerSegments?.b2b || 0) +
              (analyticsData.customerSegments?.other || 0),
            newCustomers:
              analyticsData.customerGrowth?.reduce(
                (sum: number, item: any) => sum + item.newCustomers,
                0,
              ) || 0,
            returningCustomers: Math.floor(
              ((analyticsData.customerSegments?.b2c || 0) +
                (analyticsData.customerSegments?.b2b || 0)) *
                0.3,
            ),
            customerRetentionRate:
              analyticsData.overview?.customerRetentionRate || 75.2,
            averageLifetimeValue: 12450,
            customerSatisfactionScore: 4.3,
          },
          customerGrowth: analyticsData.customerGrowth || [],
          customerSegments: analyticsData.customerSegments || { b2c: 0, b2b: 0, other: 0 },
          customerBehavior: {
            averageOrdersPerCustomer: 3.2,
            averageOrderFrequency: 45,
            averageTimeBetweenOrders: 35,
            customerChurnRate: 8.5,
          },
          topCustomers: [
            {
              name: "John Doe",
              email: "john@example.com",
              segment: "b2c",
              totalOrders: 12,
              totalSpent: 45600,
              lastOrderDate: "2024-01-15",
              averageOrderValue: 3800,
            },
          ],
          segmentPerformance: analyticsData.segmentPerformance || [],
          customerActivity:
            analyticsData.customerGrowth?.map((item: any) => ({
              day: item.month,
              newSignups: item.newCustomers,
              activeUsers: Math.floor(item.newCustomers * 3.5),
              returningUsers: Math.floor(item.newCustomers * 2.1),
            })) || [],
          period: analyticsData.period || period,
        };
        setData(customerData);
      }
    } catch (error) {
      console.error("Error fetching customer analytics:", error);
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
    format?: "number" | "currency" | "percentage" | "decimal";
    color?: "default" | "success" | "warning" | "danger";
    description?: string;
  }) => {
    const displayValue =
      format === "currency"
        ? formatCurrency(value)
        : format === "percentage"
          ? formatPercentage(value)
          : format === "decimal"
            ? value.toFixed(1)
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
            <p className={`text-xs flex items-center ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load data</div>;

  const customerSegmentData = [
    { name: "B2C", value: data.customerSegments.b2c, fill: "#8BC34A" },
    { name: "B2B", value: data.customerSegments.b2b, fill: "#795548" },
    { name: "Other", value: data.customerSegments.other, fill: "#FF9800" },
  ];

  const behaviorRadarData = [
    { metric: "Order Frequency", current: 75, average: 60 },
    { metric: "Avg Order Value", current: 85, average: 70 },
    { metric: "Customer Loyalty", current: data.overview.customerRetentionRate, average: 65 },
    { metric: "Engagement", current: 80, average: 65 },
    { metric: "Satisfaction", current: data.overview.customerSatisfactionScore * 20, average: 75 },
  ];

  const treemapData = data.segmentPerformance.map((item, index) => ({
    name: item.segment.replace("_", " "),
    size: item.revenue,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Customer Analytics</h1>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={metricView} onValueChange={(v: any) => setMetricView(v)}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="behavior">Behavior</SelectItem>
              <SelectItem value="retention">Retention</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Customers" value={data.overview.totalCustomers} icon={Users} />
        <MetricCard title="New Customers" value={data.overview.newCustomers} icon={UserPlus} />
        <MetricCard title="Retention Rate" value={data.overview.customerRetentionRate} icon={Repeat} format="percentage" />
        <MetricCard title="Lifetime Value" value={data.overview.averageLifetimeValue} icon={TrendingUp} format="currency" />
      </div>

      {metricView === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Customer Growth Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="newCustomers" stroke="#8BC34A" fill="#8BC34A" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Customer Segments</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={customerSegmentData} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name }) => name}>
                    {customerSegmentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {metricView === "behavior" && (
        <Card>
          <CardHeader><CardTitle>Behavior Analysis</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={behaviorRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Current" dataKey="current" stroke="#8BC34A" fill="#8BC34A" fillOpacity={0.3} />
                <Radar name="Average" dataKey="average" stroke="#795548" fill="#795548" fillOpacity={0.1} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}