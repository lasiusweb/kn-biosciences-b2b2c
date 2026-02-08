'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  BarChart3, 
  Clock, 
  Database, 
  Globe, 
  Server, 
  Shield, 
  TrendingDown, 
  TrendingUp,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Types for our monitoring data
interface PerformanceMetric {
  timestamp: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  dbQueries: number;
  cacheHitRate: number;
}

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  uptime: number;
}

interface ErrorRate {
  service: string;
  errorCount: number;
  errorRate: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

interface DatabaseStats {
  connections: number;
  activeQueries: number;
  slowQueries: number;
  avgQueryTime: number;
}

// Mock data generators
const generateMockMetrics = (): PerformanceMetric[] => {
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => {
    const time = new Date(now);
    time.setHours(time.getHours() - i);
    
    return {
      timestamp: time.toISOString(),
      responseTime: Math.floor(Math.random() * 500) + 100, // 100-600ms
      throughput: Math.floor(Math.random() * 100) + 50, // 50-150 requests/min
      errorRate: Math.random() * 5, // 0-5%
      cpuUsage: Math.random() * 100, // 0-100%
      memoryUsage: Math.random() * 100, // 0-100%
      dbQueries: Math.floor(Math.random() * 50) + 10, // 10-60 queries
      cacheHitRate: Math.random() * 100 // 0-100%
    };
  }).reverse();
};

const generateMockServices = (): ServiceHealth[] => [
  { name: 'Web API', status: 'healthy', responseTime: 120, uptime: 99.9 },
  { name: 'Database', status: 'healthy', responseTime: 45, uptime: 99.8 },
  { name: 'Payment Gateway', status: 'degraded', responseTime: 850, uptime: 98.5 },
  { name: 'Email Service', status: 'healthy', responseTime: 200, uptime: 99.7 },
  { name: 'File Storage', status: 'healthy', responseTime: 180, uptime: 99.9 },
  { name: 'Search Service', status: 'healthy', responseTime: 95, uptime: 99.6 }
];

const generateMockErrors = (): ErrorRate[] => [
  { service: 'Web API', errorCount: 12, errorRate: 0.2 },
  { service: 'Payment Gateway', errorCount: 8, errorRate: 1.5 },
  { service: 'Email Service', errorCount: 3, errorRate: 0.1 },
  { service: 'Search Service', errorCount: 5, errorRate: 0.3 }
];

const generateMockCacheStats = (): CacheStats => ({
  hits: 8423,
  misses: 1577,
  hitRate: 84.2
});

const generateMockDatabaseStats = (): DatabaseStats => ({
  connections: 24,
  activeQueries: 3,
  slowQueries: 2,
  avgQueryTime: 45.2
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [errors, setErrors] = useState<ErrorRate[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data fetching
  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        setMetrics(generateMockMetrics());
        setServices(generateMockServices());
        setErrors(generateMockErrors());
        setCacheStats(generateMockCacheStats());
        setDatabaseStats(generateMockDatabaseStats());
        setIsLoading(false);
      }, 800);
    };

    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [timeRange]);

  const getStatusColor = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (value: number, baseline: number) => {
    if (value > baseline * 1.1) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (value < baseline * 0.9) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <TrendingUp className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-earth-900">Performance Dashboard</h1>
          <p className="text-earth-600">Monitor system health and performance metrics</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245ms</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span>+12ms</span>
              <span className="ml-1">from last hour</span>
              {getTrendIcon(245, 233)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128/min</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span>-8/min</span>
              <span className="ml-1">from last hour</span>
              {getTrendIcon(120, 128)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.24%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span>+0.03%</span>
              <span className="ml-1">from last hour</span>
              {getTrendIcon(0.24, 0.21)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84.2%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span>-2.1%</span>
              <span className="ml-1">from last hour</span>
              {getTrendIcon(82.1, 84.2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="response-time">Response Time</TabsTrigger>
          <TabsTrigger value="throughput">Throughput</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time (ms)</CardTitle>
                <CardDescription>Average response time over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                        formatter={(value) => [`${value} ms`, 'Response Time']}
                      />
                      <Area type="monotone" dataKey="responseTime" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Throughput Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Throughput (requests/min)</CardTitle>
                <CardDescription>Requests per minute over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                        formatter={(value) => [`${value} req/min`, 'Throughput']}
                      />
                      <Line type="monotone" dataKey="throughput" stroke="#82ca9d" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Error Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Error Rate (%)</CardTitle>
                <CardDescription>System error rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                        formatter={(value) => [`${value} %`, 'Error Rate']}
                      />
                      <Bar dataKey="errorRate" fill="#ff4d4f" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Service Health */}
            <Card>
              <CardHeader>
                <CardTitle>Service Health</CardTitle>
                <CardDescription>Status of all system services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`}></div>
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">{service.responseTime}ms</span>
                        <span className="text-sm text-muted-foreground">{service.uptime}%</span>
                        {getStatusIcon(service.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="response-time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Response Time Analysis</CardTitle>
              <CardDescription>Breakdown of response times by service and endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'API /products', avg: 120, p95: 250, p99: 450 },
                      { name: 'API /cart', avg: 95, p95: 180, p99: 320 },
                      { name: 'API /checkout', avg: 320, p95: 650, p99: 980 },
                      { name: 'API /search', avg: 180, p95: 380, p99: 620 },
                      { name: 'Static Assets', avg: 45, p95: 80, p99: 120 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avg" fill="#8884d8" name="Average" />
                    <Bar dataKey="p95" fill="#82ca9d" name="95th Percentile" />
                    <Bar dataKey="p99" fill="#ff8042" name="99th Percentile" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="throughput" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Throughput Analysis</CardTitle>
              <CardDescription>Requests per minute by endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { time: '00:00', products: 45, cart: 23, checkout: 8, search: 67 },
                      { time: '04:00', products: 12, cart: 5, checkout: 2, search: 18 },
                      { time: '08:00', products: 89, cart: 45, checkout: 15, search: 120 },
                      { time: '12:00', products: 156, cart: 78, checkout: 25, search: 201 },
                      { time: '16:00', products: 134, cart: 67, checkout: 22, search: 187 },
                      { time: '20:00', products: 98, cart: 54, checkout: 18, search: 145 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="products" stroke="#8884d8" name="Products" />
                    <Line type="monotone" dataKey="cart" stroke="#82ca9d" name="Cart" />
                    <Line type="monotone" dataKey="checkout" stroke="#ff8042" name="Checkout" />
                    <Line type="monotone" dataKey="search" stroke="#ff4d4f" name="Search" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Error Distribution</CardTitle>
                <CardDescription>Types of errors occurring in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'API Errors', value: 45 },
                          { name: 'Database Errors', value: 25 },
                          { name: 'Payment Errors', value: 15 },
                          { name: 'Network Errors', value: 10 },
                          { name: 'Other', value: 5 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'API Errors', value: 45 },
                          { name: 'Database Errors', value: 25 },
                          { name: 'Payment Errors', value: 15 },
                          { name: 'Network Errors', value: 10 },
                          { name: 'Other', value: 5 },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rates by Service</CardTitle>
                <CardDescription>Which services are experiencing the most errors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {errors.map((error, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{error.service}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">{error.errorCount} errors</span>
                        <Badge variant={error.errorRate > 1 ? "destructive" : "secondary"}>
                          {error.errorRate.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>CPU and Memory usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      />
                      <YAxis unit="%" />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                        formatter={(value) => [`${value} %`, 'Usage']}
                      />
                      <Area type="monotone" dataKey="cpuUsage" stackId="1" stroke="#ff4d4f" fill="#ff4d4f" fillOpacity={0.3} name="CPU" />
                      <Area type="monotone" dataKey="memoryUsage" stackId="2" stroke="#5dade2" fill="#5dade2" fillOpacity={0.3} name="Memory" />
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Metrics</CardTitle>
                <CardDescription>Connection and query statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {databaseStats && (
                    <>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-muted-foreground">Active Connections</span>
                        <span className="font-medium">{databaseStats.connections}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-muted-foreground">Active Queries</span>
                        <span className="font-medium">{databaseStats.activeQueries}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-muted-foreground">Slow Queries (last hour)</span>
                        <span className="font-medium">{databaseStats.slowQueries}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-muted-foreground">Avg Query Time</span>
                        <span className="font-medium">{databaseStats.avgQueryTime}ms</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cache Performance</CardTitle>
              <CardDescription>Cache hit/miss statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{cacheStats?.hits || 0}</div>
                  <div className="text-sm text-muted-foreground">Hits</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-red-600">{cacheStats?.misses || 0}</div>
                  <div className="text-sm text-muted-foreground">Misses</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{cacheStats?.hitRate || 0}%</div>
                  <div className="text-sm text-muted-foreground">Hit Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alerts Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>Recent system alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">High Response Time Warning</h4>
                <p className="text-sm text-yellow-600">API response time exceeded 500ms threshold at 14:32</p>
                <p className="text-xs text-yellow-500 mt-1">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start p-4 border-l-4 border-red-500 bg-red-50 rounded-r">
              <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Payment Gateway Degraded</h4>
                <p className="text-sm text-red-600">Payment gateway response time increased to 850ms</p>
                <p className="text-xs text-red-500 mt-1">4 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start p-4 border-l-4 border-green-500 bg-green-50 rounded-r">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">System Recovery</h4>
                <p className="text-sm text-green-600">Database connection restored after temporary outage</p>
                <p className="text-xs text-green-500 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}