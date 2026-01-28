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
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Activity,
  Award,
  Eye,
  Timer,
  RefreshCw,
} from "lucide-react";

interface B2BAnalyticsData {
  overview: {
    totalQuotes: number;
    totalValue: number;
    conversionRate: number;
    averageDealSize: number;
    salesCycle: number;
    clientRetention: number;
  };
  quoteFunnel: Array<{
    stage: string;
    count: number;
    value: number;
    conversion: number;
  }>;
  monthlyPerformance: Array<{
    month: string;
    quotes: number;
    converted: number;
    value: number;
    conversionRate: number;
  }>;
  topClients: Array<{
    companyName: string;
    industry: string;
    totalQuotes: number;
    totalValue: number;
    conversionRate: number;
    lastQuoteDate: string;
  }>;
  segmentPerformance: Array<{
    segment: string;
    quotes: number;
    value: number;
    conversion: number;
    avgDealSize: number;
  }>;
  salesCycleAnalysis: Array<{
    stage: string;
    averageDays: number;
    conversionRate: number;
    dropOffRate: number;
  }>;
  clientSatisfaction: Array<{
    metric: string;
    score: number;
    benchmark: number;
  }>;
  revenueByClientTier: Array<{
    tier: string;
    clients: number;
    revenue: number;
    avgRevenue: number;
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
const B2B_STATUS_COLORS = {
  draft: "#9E9E9E",
  submitted: "#2196F3",
  under_review: "#FF9800",
  approved: "#8BC34A",
  rejected: "#F44336",
};

export function B2BAnalytics() {
  const [data, setData] = useState<B2BAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [viewMode, setViewMode] = useState<
    "overview" | "performance" | "clients"
  >("overview");

  useEffect(() => {
    fetchB2BAnalytics();
  }, [period]);

  const fetchB2BAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/enhanced?period=${period}`);
      if (response.ok) {
        const analyticsData = await response.json();
        // Transform data for B2B analytics
        const b2bData = {
          overview: {
            totalQuotes: analyticsData.overview.totalB2BQuotes || 45,
            totalValue: analyticsData.overview.totalB2BValue || 2800000,
            conversionRate: analyticsData.overview.b2bConversionRate || 68.5,
            averageDealSize: 62222, // Mock data
            salesCycle: 28, // days
            clientRetention: 85.2,
          },
          quoteFunnel: [
            {
              stage: "Draft",
              count: 100,
              value: 5000000,
              conversion: 100,
            },
            {
              stage: "Submitted",
              count: 85,
              value: 4250000,
              conversion: 85,
            },
            {
              stage: "Under Review",
              count: 70,
              value: 3500000,
              conversion: 82.4,
            },
            {
              stage: "Approved",
              count: 45,
              value: 2800000,
              conversion: 64.3,
            },
          ],
          monthlyPerformance: Array.from({ length: 12 }, (_, i) => ({
            month: `Month ${i + 1}`,
            quotes: Math.floor(Math.random() * 20) + 10,
            converted: Math.floor(Math.random() * 15) + 5,
            value: Math.floor(Math.random() * 500000) + 200000,
            conversionRate: Math.random() * 30 + 50,
          })),
          topClients: [
            {
              companyName: "AgriCorp Solutions",
              industry: "Agriculture",
              totalQuotes: 8,
              totalValue: 450000,
              conversionRate: 87.5,
              lastQuoteDate: "2024-01-20",
            },
            {
              companyName: "FarmTech Industries",
              industry: "Technology",
              totalQuotes: 6,
              totalValue: 380000,
              conversionRate: 83.3,
              lastQuoteDate: "2024-01-18",
            },
            {
              companyName: "BioGreen Holdings",
              industry: "Organic Farming",
              totalQuotes: 5,
              totalValue: 320000,
              conversionRate: 80.0,
              lastQuoteDate: "2024-01-15",
            },
          ],
          segmentPerformance:
            analyticsData.segmentPerformance?.map((segment: any) => ({
              segment:
                segment.segment.replace("_", " ").charAt(0).toUpperCase() +
                segment.segment.replace("_", " ").slice(1),
              quotes: Math.floor(Math.random() * 10) + 5,
              value: segment.revenue,
              conversion: Math.random() * 30 + 60,
              avgDealSize:
                segment.revenue / (Math.floor(Math.random() * 10) + 5),
            })) || [],
          salesCycleAnalysis: [
            {
              stage: "Quote Preparation",
              averageDays: 3,
              conversionRate: 95,
              dropOffRate: 5,
            },
            {
              stage: "Initial Review",
              averageDays: 5,
              conversionRate: 88,
              dropOffRate: 12,
            },
            {
              stage: "Technical Evaluation",
              averageDays: 10,
              conversionRate: 72,
              dropOffRate: 28,
            },
            {
              stage: "Final Approval",
              averageDays: 7,
              conversionRate: 85,
              dropOffRate: 15,
            },
            {
              stage: "Contract Signing",
              averageDays: 3,
              conversionRate: 95,
              dropOffRate: 5,
            },
          ],
          clientSatisfaction: [
            {
              metric: "Product Quality",
              score: 4.6,
              benchmark: 4.2,
            },
            {
              metric: "Customer Service",
              score: 4.4,
              benchmark: 4.1,
            },
            {
              metric: "Delivery Time",
              score: 4.3,
              benchmark: 4.0,
            },
            {
              metric: "Technical Support",
              score: 4.5,
              benchmark: 4.1,
            },
            {
              metric: "Value for Money",
              score: 4.2,
              benchmark: 3.9,
            },
          ],
          revenueByClientTier: [
            {
              tier: "Enterprise",
              clients: 8,
              revenue: 1800000,
              avgRevenue: 225000,
            },
            {
              tier: "Medium",
              clients: 15,
              revenue: 800000,
              avgRevenue: 53333,
            },
            {
              tier: "Small",
              clients: 22,
              revenue: 200000,
              avgRevenue: 9091,
            },
          ],
          period: analyticsData.period,
        };
        setData(b2bData);
      } else {
        console.error("Failed to fetch B2B analytics");
      }
    } catch (error) {
      console.error("Error fetching B2B analytics:", error);
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
    format?: "number" | "currency" | "percentage" | "days";
    color?: "default" | "success" | "warning" | "danger";
    description?: string;
  }) => {
    const displayValue =
      format === "currency"
        ? formatCurrency(value)
        : format === "percentage"
          ? formatPercentage(value)
          : format === "days"
            ? `${value} days`
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
            <p className="text-earth-600">Loading B2B analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-earth-600">Failed to load B2B data</p>
          <Button onClick={fetchB2BAnalytics} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const clientTierData = data.revenueByClientTier.map((tier, index) => ({
    name: tier.tier,
    value: tier.revenue,
    clients: tier.clients,
    fill: COLORS[index % COLORS.length],
  }));

  const satisfactionRadarData = data.clientSatisfaction.map((metric) => ({
    metric: metric.metric.replace(" ", "\n"),
    current: metric.score * 20, // Scale to 100
    benchmark: metric.benchmark * 20,
  }));

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 mb-2">
            B2B Analytics
          </h1>
          <p className="text-earth-600">
            Comprehensive B2B quote management and client performance analysis
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
            value={viewMode}
            onValueChange={(value: any) => setViewMode(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="clients">Clients</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key B2B Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Quotes"
          value={data.overview.totalQuotes}
          change={18.5}
          icon={FileText}
          color="success"
        />
        <MetricCard
          title="Total Value"
          value={data.overview.totalValue}
          change={24.3}
          icon={DollarSign}
          format="currency"
          color="success"
        />
        <MetricCard
          title="Conversion Rate"
          value={data.overview.conversionRate}
          change={5.2}
          icon={CheckCircle}
          format="percentage"
          color="success"
        />
        <MetricCard
          title="Average Deal Size"
          value={data.overview.averageDealSize}
          change={8.7}
          icon={Target}
          format="currency"
          color="success"
        />
      </div>

      {viewMode === "overview" && (
        <>
          {/* Quote Funnel and Monthly Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quote Conversion Funnel</CardTitle>
                <CardDescription>
                  B2B quote stages and conversion rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <FunnelChart>
                    <Funnel
                      data={data.quoteFunnel}
                      dataKey="count"
                      isAnimationActive
                    >
                      <LabelList
                        position="center"
                        fill="#fff"
                        fontSize={12}
                        content={({ stage, count, conversion }) => (
                          <text
                            x={0}
                            y={0}
                            fill="#fff"
                            textAnchor="middle"
                            fontSize={12}
                          >
                            {stage}
                            <tspan x={0} dy="15">
                              {count} quotes
                            </tspan>
                            <tspan x={0} dy="30">
                              {conversion}%
                            </tspan>
                          </text>
                        )}
                      />
                    </Funnel>
                    <Tooltip />
                  </FunnelChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>
                  B2B quotes and conversion trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="quotes"
                      stackId="1"
                      stroke="#795548"
                      fill="#795548"
                      fillOpacity={0.6}
                      name="Total Quotes"
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="converted"
                      stackId="2"
                      stroke="#8BC34A"
                      fill="#8BC34A"
                      fillOpacity={0.6}
                      name="Converted"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="conversionRate"
                      stroke="#FF9800"
                      strokeWidth={2}
                      name="Conversion Rate"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sales Cycle Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Cycle Analysis</CardTitle>
              <CardDescription>
                Time spent and conversion rates by stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.salesCycleAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="stage"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="averageDays"
                    fill="#2196F3"
                    name="Avg Days"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="conversionRate"
                    fill="#8BC34A"
                    name="Conversion Rate"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {viewMode === "performance" && (
        <>
          {/* Segment Performance and Client Satisfaction */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Segment Performance</CardTitle>
                <CardDescription>
                  B2B performance by business segment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.segmentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="segment"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="value" fill="#8BC34A" name="Revenue" />
                    <Bar
                      dataKey="avgDealSize"
                      fill="#795548"
                      name="Avg Deal Size"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Satisfaction</CardTitle>
                <CardDescription>
                  Customer satisfaction metrics vs benchmarks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={satisfactionRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Current Score"
                      dataKey="current"
                      stroke="#8BC34A"
                      fill="#8BC34A"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Industry Benchmark"
                      dataKey="benchmark"
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
          </div>

          {/* Revenue by Client Tier */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Client Tier</CardTitle>
              <CardDescription>
                Revenue distribution across client segments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={clientTierData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, clients }) =>
                      `${name} (${clients}) ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {clientTierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {viewMode === "clients" && (
        <>
          {/* Top B2B Clients */}
          <Card>
            <CardHeader>
              <CardTitle>Top B2B Clients</CardTitle>
              <CardDescription>
                Most valuable B2B clients by revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Company</th>
                      <th className="text-left p-2">Industry</th>
                      <th className="text-right p-2">Quotes</th>
                      <th className="text-right p-2">Total Value</th>
                      <th className="text-right p-2">Conversion Rate</th>
                      <th className="text-left p-2">Last Quote</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topClients.map((client, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">
                          {client.companyName}
                        </td>
                        <td className="p-2">
                          <span className="px-2 py-1 bg-organic-100 text-organic-800 rounded-full text-xs">
                            {client.industry}
                          </span>
                        </td>
                        <td className="p-2 text-right">{client.totalQuotes}</td>
                        <td className="p-2 text-right">
                          {formatCurrency(client.totalValue)}
                        </td>
                        <td className="p-2 text-right">
                          {formatPercentage(client.conversionRate)}
                        </td>
                        <td className="p-2 text-xs">{client.lastQuoteDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Additional Client Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Sales Cycle"
              value={data.overview.salesCycle}
              change={-3.2}
              icon={Timer}
              format="days"
              color="success"
              description="Average days to close"
            />
            <MetricCard
              title="Client Retention"
              value={data.overview.clientRetention}
              change={2.8}
              icon={Users}
              format="percentage"
              color="success"
              description="Annual retention rate"
            />
            <MetricCard
              title="Repeat Business"
              value={72.5}
              change={6.4}
              icon={RefreshCw}
              format="percentage"
              color="success"
              description="Clients with repeat orders"
            />
          </div>
        </>
      )}
    </div>
  );
}
