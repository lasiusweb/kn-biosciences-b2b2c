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
  TreemapChart,
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
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Heart,
  MessageSquare,
  Gift,
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

const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, name, value } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: props.color,
          stroke: "#fff",
          strokeWidth: 2,
          strokeOpacity: 1,
        }}
      />
      {width > 50 && height > 30 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 5}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
            fontWeight="bold"
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            fill="#fff"
            fontSize={10}
          >
            {value}
          </text>
        </>
      )}
    </g>
  );
};

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
        // Transform data for customer analytics
        const customerData = {
          overview: {
            totalCustomers:
              analyticsData.customerSegments.b2c +
              analyticsData.customerSegments.b2b +
              analyticsData.customerSegments.other,
            newCustomers:
              analyticsData.customerGrowth?.reduce(
                (sum: number, item: any) => sum + item.newCustomers,
                0,
              ) || 0,
            returningCustomers: Math.floor(
              (analyticsData.customerSegments.b2c +
                analyticsData.customerSegments.b2b) *
                0.3,
            ), // Mock data
            customerRetentionRate:
              analyticsData.overview.customerRetentionRate || 75.2,
            averageLifetimeValue: 12450, // Mock data
            customerSatisfactionScore: 4.3, // Mock data out of 5
          },
          customerGrowth: analyticsData.customerGrowth || [],
          customerSegments: analyticsData.customerSegments,
          customerBehavior: {
            averageOrdersPerCustomer: 3.2,
            averageOrderFrequency: 45, // days
            averageTimeBetweenOrders: 35, // days
            customerChurnRate: 8.5, // percentage
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
            {
              name: "Jane Smith",
              email: "jane@example.com",
              segment: "b2b",
              totalOrders: 8,
              totalSpent: 128000,
              lastOrderDate: "2024-01-20",
              averageOrderValue: 16000,
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
          period: analyticsData.period,
        };
        setData(customerData);
      } else {
        console.error("Failed to fetch customer analytics");
      }
    } catch (error) {
      console.error("Error fetching customer analytics:", error);
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
            <p className="text-earth-600">Loading customer analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-earth-600">Failed to load customer data</p>
          <Button onClick={fetchCustomerAnalytics} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const customerSegmentData = [
    { name: "B2C", value: data.customerSegments.b2c, fill: "#8BC34A" },
    { name: "B2B", value: data.customerSegments.b2b, fill: "#795548" },
    { name: "Other", value: data.customerSegments.other, fill: "#FF9800" },
  ];

  const behaviorRadarData = [
    {
      metric: "Order Frequency",
      current: 75,
      average: 60,
    },
    {
      metric: "Avg Order Value",
      current: 85,
      average: 70,
    },
    {
      metric: "Customer Loyalty",
      current: data.overview.customerRetentionRate,
      average: 65,
    },
    {
      metric: "Engagement",
      current: 80,
      average: 65,
    },
    {
      metric: "Satisfaction",
      current: data.overview.customerSatisfactionScore * 20,
      average: 75,
    },
  ];

  const treemapData = data.segmentPerformance.map((item, index) => ({
    name:
      item.segment.replace("_", " ").charAt(0).toUpperCase() +
      item.segment.replace("_", " ").slice(1),
    size: item.revenue,
    customers: item.customers,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 mb-2">
            Customer Analytics
          </h1>
          <p className="text-earth-600">
            Comprehensive customer behavior and retention analysis
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
          <Select
            value={metricView}
            onValueChange={(value: any) => setMetricView(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="behavior">Behavior</SelectItem>
              <SelectItem value="retention">Retention</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Customers"
          value={data.overview.totalCustomers}
          change={15.3}
          icon={Users}
          color="success"
          description="Active customers"
        />
        <MetricCard
          title="New Customers"
          value={data.overview.newCustomers}
          change={22.7}
          icon={UserPlus}
          color="success"
          description="New signups"
        />
        <MetricCard
          title="Retention Rate"
          value={data.overview.customerRetentionRate}
          change={3.2}
          icon={Repeat}
          format="percentage"
          color="success"
          description="Customer retention"
        />
        <MetricCard
          title="Lifetime Value"
          value={data.overview.averageLifetimeValue}
          change={8.5}
          icon={TrendingUp}
          format="currency"
          color="success"
          description="Average LTV"
        />
      </div>

      {metricView === "overview" && (
        <>
          {/* Customer Growth and Segments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth Trend</CardTitle>
                <CardDescription>Monthly customer acquisition</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.customerGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="newCustomers"
                      stackId="1"
                      stroke="#8BC34A"
                      fill="#8BC34A"
                      fillOpacity={0.6}
                      name="New Customers"
                    />
                    <Area
                      type="monotone"
                      dataKey="returningCustomers"
                      stackId="1"
                      stroke="#795548"
                      fill="#795548"
                      fillOpacity={0.6}
                      name="Returning Customers"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Distribution by customer type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerSegmentData}
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
                      {customerSegmentData.map((entry, index) => (
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

          {/* Segment Performance Treemap */}
          <Card>
            <CardHeader>
              <CardTitle>Segment Performance</CardTitle>
              <CardDescription>
                Revenue distribution by customer segment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <TreemapChart
                  data={treemapData}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  stroke="#fff"
                  content={<CustomTreemapContent />}
                >
                  <Tooltip
                    content={({ x, y, width, height, name, value }) => (
                      <div className="bg-white p-2 border rounded shadow-lg">
                        <p className="font-semibold">{name}</p>
                        <p>Revenue: {formatCurrency(value)}</p>
                      </div>
                    )}
                  />
                </TreemapChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {metricView === "behavior" && (
        <>
          {/* Customer Behavior Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Avg Orders/Customer"
              value={data.customerBehavior.averageOrdersPerCustomer}
              change={5.2}
              icon={ShoppingBag}
              format="decimal"
              color="success"
            />
            <MetricCard
              title="Order Frequency"
              value={data.customerBehavior.averageOrderFrequency}
              change={-2.1}
              icon={Calendar}
              description="Days between orders"
            />
            <MetricCard
              title="Satisfaction Score"
              value={data.overview.customerSatisfactionScore}
              change={8.7}
              icon={Star}
              format="decimal"
              color="success"
              description="Out of 5 stars"
            />
            <MetricCard
              title="Churn Rate"
              value={data.customerBehavior.customerChurnRate}
              change={-1.3}
              icon={TrendingDown}
              format="percentage"
              color="danger"
            />
          </div>

          {/* Behavior Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Behavior Analysis</CardTitle>
              <CardDescription>
                Key metrics compared to industry average
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={behaviorRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Current Performance"
                    dataKey="current"
                    stroke="#8BC34A"
                    fill="#8BC34A"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Industry Average"
                    dataKey="average"
                    stroke="#795548"
                    fill="#795548"
                    fillOpacity={0.1}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {metricView === "retention" && (
        <>
          {/* Retention Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Returning Customers"
              value={data.overview.returningCustomers}
              change={12.8}
              icon={Repeat}
              color="success"
              description="Active returning users"
            />
            <MetricCard
              title="Avg Time Between Orders"
              value={data.customerBehavior.averageTimeBetweenOrders}
              change={-5.3}
              icon={Calendar}
              description="Days"
              color="warning"
            />
            <MetricCard
              title="Customer Churn Rate"
              value={data.customerBehavior.customerChurnRate}
              change={-1.8}
              icon={TrendingDown}
              format="percentage"
              color="success"
              description="Monthly churn"
            />
          </div>

          {/* Customer Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Activity Timeline</CardTitle>
              <CardDescription>
                Daily customer engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.customerActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="newSignups"
                    stroke="#8BC34A"
                    strokeWidth={2}
                    name="New Signups"
                  />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    stroke="#795548"
                    strokeWidth={2}
                    name="Active Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="returningUsers"
                    stroke="#FF9800"
                    strokeWidth={2}
                    name="Returning Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Top Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
          <CardDescription>
            Most valuable customers by total spending
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Segment</th>
                  <th className="text-right p-2">Orders</th>
                  <th className="text-right p-2">Total Spent</th>
                  <th className="text-right p-2">Avg Order Value</th>
                  <th className="text-left p-2">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {data.topCustomers.map((customer, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-2">
                      <span className="px-2 py-1 bg-organic-100 text-organic-800 rounded-full text-xs">
                        {customer.segment.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2 text-right">{customer.totalOrders}</td>
                    <td className="p-2 text-right">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="p-2 text-right">
                      {formatCurrency(customer.averageOrderValue)}
                    </td>
                    <td className="p-2 text-xs">{customer.lastOrderDate}</td>
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
