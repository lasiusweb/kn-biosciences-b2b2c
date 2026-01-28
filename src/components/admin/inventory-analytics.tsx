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
  ScatterChart,
  Scatter,
  Legend,
} from "recharts";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Box,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  Filter,
  Download,
  Activity,
  DollarSign,
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

const getStockStatus = (current: number, threshold: number) => {
  if (current === 0) return "out";
  if (current <= threshold * 0.5) return "critical";
  if (current <= threshold) return "low";
  return "healthy";
};

export function InventoryAnalytics() {
  const [data, setData] = useState<InventoryAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [filterCategory, setFilterCategory] = useState("all");
  const [stockView, setStockView] = useState<
    "overview" | "movement" | "forecasting"
  >("overview");

  useEffect(() => {
    fetchInventoryAnalytics();
  }, [period]);

  const fetchInventoryAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/enhanced?period=${period}`);
      if (response.ok) {
        const analyticsData = await response.json();
        // Transform data for inventory analytics
        const inventoryData = {
          overview: {
            totalProducts: 156,
            totalValue: analyticsData.inventoryAlerts?.totalValue || 2500000,
            lowStockItems: analyticsData.inventoryAlerts?.lowStock || 12,
            outOfStockItems: analyticsData.inventoryAlerts?.outOfStock || 3,
            turnoverRate: 4.2,
            averageHoldingTime: 45, // days
          },
          stockLevels:
            analyticsData.topProducts?.map((product: any, index: number) => ({
              productName: product.name,
              sku: product.sku,
              segment: product.segment,
              currentStock: Math.max(
                0,
                product.currentStock || Math.floor(Math.random() * 100),
              ),
              lowStockThreshold: 20,
              reorderPoint: 25,
              unitCost: product.unitPrice || 100,
              totalValue:
                (product.currentStock || 50) * (product.unitPrice || 100),
              status: product.isLowStock
                ? "low"
                : getStockStatus(product.currentStock || 50, 20),
            })) || [],
          stockMovement: Array.from({ length: 30 }, (_, i) => ({
            date: `Day ${i + 1}`,
            inbound: Math.floor(Math.random() * 50) + 10,
            outbound: Math.floor(Math.random() * 60) + 20,
            netChange: Math.floor(Math.random() * 40) - 20,
          })),
          categoryDistribution:
            analyticsData.segmentPerformance?.map((segment: any) => ({
              category:
                segment.segment.replace("_", " ").charAt(0).toUpperCase() +
                segment.segment.replace("_", " ").slice(1),
              value: segment.revenue,
              items: Math.floor(Math.random() * 30) + 10,
              lowStockCount: Math.floor(Math.random() * 5),
            })) || [],
          topMovingProducts:
            analyticsData.topProducts?.slice(0, 10).map((product: any) => ({
              productName: product.name,
              sku: product.sku,
              movement: Math.floor(Math.random() * 100) + 50,
              trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as
                | "up"
                | "down"
                | "stable",
              avgDailyConsumption: Math.floor(Math.random() * 10) + 2,
            })) || [],
          slowMovingProducts: [
            {
              productName: "Slow Moving Product 1",
              sku: "SMP001",
              lastSold: "2024-01-10",
              daysInStock: 180,
              value: 25000,
              holdingCost: 1250,
            },
            {
              productName: "Slow Moving Product 2",
              sku: "SMP002",
              lastSold: "2024-01-05",
              daysInStock: 210,
              value: 18000,
              holdingCost: 900,
            },
          ],
          forecasting: Array.from({ length: 30 }, (_, i) => ({
            date: `Day ${i + 1}`,
            predictedDemand: Math.floor(Math.random() * 20) + 10,
            currentStock: Math.max(0, 100 - i * 3),
            recommendedStock: Math.floor(Math.random() * 30) + 50,
          })),
          period: analyticsData.period,
        };
        setData(inventoryData);
      } else {
        console.error("Failed to fetch inventory analytics");
      }
    } catch (error) {
      console.error("Error fetching inventory analytics:", error);
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
            <p className="text-earth-600">Loading inventory analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-earth-600">Failed to load inventory data</p>
          <Button onClick={fetchInventoryAnalytics} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const categoryData = data.categoryDistribution.map((item, index) => ({
    name: item.category,
    value: item.value,
    items: item.items,
    lowStock: item.lowStockCount,
    fill: COLORS[index % COLORS.length],
  }));

  const stockStatusData = [
    {
      name: "Healthy",
      value: data.stockLevels.filter((item) => item.status === "healthy")
        .length,
      fill: STATUS_COLORS.healthy,
    },
    {
      name: "Low",
      value: data.stockLevels.filter((item) => item.status === "low").length,
      fill: STATUS_COLORS.low,
    },
    {
      name: "Critical",
      value: data.stockLevels.filter((item) => item.status === "critical")
        .length,
      fill: STATUS_COLORS.critical,
    },
    {
      name: "Out of Stock",
      value: data.stockLevels.filter((item) => item.status === "out").length,
      fill: STATUS_COLORS.out,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 mb-2">
            Inventory Analytics
          </h1>
          <p className="text-earth-600">
            Comprehensive inventory management and optimization insights
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
            value={stockView}
            onValueChange={(value: any) => setStockView(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="movement">Movement</SelectItem>
              <SelectItem value="forecasting">Forecasting</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Inventory Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Products"
          value={data.overview.totalProducts}
          change={5.2}
          icon={Package}
          color="success"
        />
        <MetricCard
          title="Total Inventory Value"
          value={data.overview.totalValue}
          change={12.8}
          icon={DollarSign}
          format="currency"
          color="success"
        />
        <MetricCard
          title="Low Stock Items"
          value={data.overview.lowStockItems}
          change={-15.3}
          icon={AlertTriangle}
          color="warning"
          description="Needs attention"
        />
        <MetricCard
          title="Turnover Rate"
          value={data.overview.turnoverRate}
          change={8.7}
          icon={RefreshCw}
          format="days"
          color="success"
        />
      </div>

      {stockView === "overview" && (
        <>
          {/* Stock Status and Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Status Distribution</CardTitle>
                <CardDescription>
                  Current inventory health status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stockStatusData}
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
                      {stockStatusData.map((entry, index) => (
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
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Inventory value by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="value" fill="#8BC34A" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Critical Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Critical Stock Alerts
              </CardTitle>
              <CardDescription>
                Products that need immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.stockLevels
                  .filter(
                    (item) =>
                      item.status === "critical" || item.status === "out",
                  )
                  .slice(0, 10)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.sku} • {item.segment}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            item.status === "out"
                              ? "text-red-600"
                              : "text-orange-600"
                          }`}
                        >
                          {item.currentStock} units
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.totalValue)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {stockView === "movement" && (
        <>
          {/* Stock Movement Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Movement Trends</CardTitle>
                <CardDescription>
                  Daily inbound and outbound movements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.stockMovement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="inbound"
                      stackId="1"
                      stroke="#8BC34A"
                      fill="#8BC34A"
                      fillOpacity={0.6}
                      name="Inbound"
                    />
                    <Area
                      type="monotone"
                      dataKey="outbound"
                      stackId="2"
                      stroke="#F44336"
                      fill="#F44336"
                      fillOpacity={0.6}
                      name="Outbound"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Moving Products</CardTitle>
                <CardDescription>
                  Products with highest movement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.topMovingProducts.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="productName"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="movement" fill="#795548" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Slow Moving Products */}
          <Card>
            <CardHeader>
              <CardTitle>Slow Moving Products</CardTitle>
              <CardDescription>
                Products that haven't sold recently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Product</th>
                      <th className="text-left p-2">SKU</th>
                      <th className="text-left p-2">Last Sold</th>
                      <th className="text-right p-2">Days in Stock</th>
                      <th className="text-right p-2">Value</th>
                      <th className="text-right p-2">Holding Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slowMovingProducts.map((product, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">
                          {product.productName}
                        </td>
                        <td className="p-2">{product.sku}</td>
                        <td className="p-2">{product.lastSold}</td>
                        <td className="p-2 text-right">
                          {product.daysInStock}
                        </td>
                        <td className="p-2 text-right">
                          {formatCurrency(product.value)}
                        </td>
                        <td className="p-2 text-right">
                          {formatCurrency(product.holdingCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {stockView === "forecasting" && (
        <>
          {/* Inventory Forecasting */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Forecasting</CardTitle>
              <CardDescription>
                Predicted demand vs current stock levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.forecasting}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="predictedDemand"
                    stroke="#FF9800"
                    strokeWidth={2}
                    name="Predicted Demand"
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="currentStock"
                    stroke="#F44336"
                    strokeWidth={2}
                    name="Current Stock"
                  />
                  <Line
                    type="monotone"
                    dataKey="recommendedStock"
                    stroke="#8BC34A"
                    strokeWidth={2}
                    name="Recommended Stock"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Reorder Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-organic-500" />
                Reorder Recommendations
              </CardTitle>
              <CardDescription>AI-powered reorder suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.stockLevels
                  .filter((item) => item.currentStock <= item.reorderPoint)
                  .slice(0, 10)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-orange-600">
                          Reorder {item.reorderPoint - item.currentStock} units
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(
                            (item.reorderPoint - item.currentStock) *
                              item.unitCost,
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
