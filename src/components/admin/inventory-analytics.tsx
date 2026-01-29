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
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Target,
} from "lucide-react";

interface InventoryAnalyticsData {
  overview: {
    totalProducts: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    turnoverRate: number;
    averageHoldingTime: number;
  };
  stockLevels: Array<{
    productName: string;
    sku: string;
    segment: string;
    currentStock: number;
    lowStockThreshold: number;
    reorderPoint: number;
    unitCost: number;
    totalValue: number;
    status: "healthy" | "low" | "critical" | "out";
  }>;
  stockMovement: Array<{
    date: string;
    inbound: number;
    outbound: number;
    netChange: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    value: number;
    items: number;
    lowStockCount: number;
  }>;
  topMovingProducts: Array<{
    productName: string;
    sku: string;
    movement: number;
    trend: "up" | "down" | "stable";
    avgDailyConsumption: number;
  }>;
  slowMovingProducts: Array<{
    productName: string;
    sku: string;
    lastSold: string;
    daysInStock: number;
    value: number;
    holdingCost: number;
  }>;
  forecasting: Array<{
    date: string;
    predictedDemand: number;
    currentStock: number;
    recommendedStock: number;
  }>;
  period: string;
}

const COLORS = [
  "#8BC34A",
  "#795548",
  "#FF9800",
  "#F44336",
  "#2196F3",
  "#9C27B0",
];
const STATUS_COLORS = {
  healthy: "#8BC34A",
  low: "#FF9800",
  critical: "#F44336",
  out: "#9E9E9E",
};

export function InventoryAnalytics() {
  const [data, setData] = useState<InventoryAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [stockView, setStockView] = useState<"overview" | "movement" | "forecasting">("overview");

  useEffect(() => {
    fetchInventoryAnalytics();
  }, [period]);

  const fetchInventoryAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/enhanced?period=${period}`);
      if (response.ok) {
        const analyticsData = await response.json();
        const inventoryData = {
          overview: {
            totalProducts: 156,
            totalValue: analyticsData.inventoryAlerts?.totalValue || 2500000,
            lowStockItems: analyticsData.inventoryAlerts?.lowStock || 12,
            outOfStockItems: analyticsData.inventoryAlerts?.outOfStock || 3,
            turnoverRate: 4.2,
            averageHoldingTime: 45,
          },
          stockLevels:
            analyticsData.topProducts?.map((product: any) => ({
              productName: product.name,
              sku: product.sku,
              segment: product.segment,
              currentStock: product.currentStock || 0,
              lowStockThreshold: 20,
              reorderPoint: 25,
              unitCost: product.unitPrice || 100,
              totalValue: (product.currentStock || 0) * (product.unitPrice || 100),
              status: product.isLowStock ? "low" : "healthy",
            })) || [],
          stockMovement: Array.from({ length: 30 }, (_, i) => ({
            date: `Day ${i + 1}`,
            inbound: Math.floor(Math.random() * 50) + 10,
            outbound: Math.floor(Math.random() * 60) + 20,
            netChange: Math.floor(Math.random() * 40) - 20,
          })),
          categoryDistribution:
            analyticsData.segmentPerformance?.map((segment: any) => ({
              category: segment.segment.replace("_", " "),
              value: segment.revenue,
              items: Math.floor(Math.random() * 30) + 10,
              lowStockCount: Math.floor(Math.random() * 5),
            })) || [],
          topMovingProducts: [],
          slowMovingProducts: [],
          forecasting: [],
          period: analyticsData.period || period,
        };
        setData(inventoryData);
      }
    } catch (error) {
      console.error("Error fetching inventory analytics:", error);
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
    format?: "number" | "currency" | "percentage" | "days";
    color?: "default" | "success" | "warning" | "danger";
  }) => {
    const displayValue =
      format === "currency"
        ? formatCurrency(value)
        : format === "percentage"
          ? `${value.toFixed(1)}%`
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
            <p className={`text-xs flex items-center ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
              {change >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              {Math.abs(change)}%
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load data</div>;

  const stockStatusData = [
    { name: "Healthy", value: data.stockLevels.filter(i => i.status === "healthy").length, fill: STATUS_COLORS.healthy },
    { name: "Low", value: data.stockLevels.filter(i => i.status === "low").length, fill: STATUS_COLORS.low },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Inventory Analytics</h1>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={stockView} onValueChange={(v: any) => setStockView(v)}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="movement">Movement</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Products" value={data.overview.totalProducts} icon={Package} />
        <MetricCard title="Inventory Value" value={data.overview.totalValue} icon={DollarSign} format="currency" />
        <MetricCard title="Low Stock" value={data.overview.lowStockItems} icon={AlertTriangle} color="warning" />
        <MetricCard title="Turnover Rate" value={data.overview.turnoverRate} icon={RefreshCw} format="days" />
      </div>

      {stockView === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Stock Status</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={stockStatusData} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name }) => name}>
                    {stockStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Category Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.categoryDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                  <Bar dataKey="value" fill="#8BC34A" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}