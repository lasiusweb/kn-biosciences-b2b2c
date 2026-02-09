// components/admin/performance-dashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Database, 
  Globe, 
  Clock, 
  Server, 
  BarChart3, 
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  Shield,
  Zap,
  Eye,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Types for performance metrics
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

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  uptime: number;
  serverLoad: number;
}

interface TrafficMetric {
  time: string;
  visitors: number;
  pageViews: number;
  bounceRate: number;
}

interface ConversionMetric {
  name: string;
  value: number;
  change: number;
}

interface ErrorMetric {
  type: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const COLORS = ['#8BC34A', '#795548', '#FF9800', '#2196F3', '#F44336', '#9C27B0'];

const PerformanceDashboard = () => {
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    responseTime: 120,
    uptime: 99.98,
    serverLoad: 45
  });
  const [loading, setLoading] = useState(true);

  // Mock data generation - in a real app, this would come from an API
  useEffect(() => {
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

    const loadData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setMetrics(generateMockMetrics());
      setLoading(false);
    };

    loadData();
  }, [timeRange]);

  // Calculate averages
  const avgResponseTime = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length 
    : 0;
  
  const avgThroughput = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + m.throughput, 0) / metrics.length 
    : 0;
  
  const avgErrorRate = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length 
    : 0;

  // Sample data for charts
  const conversionData: ConversionMetric[] = [
    { name: 'Cart to Checkout', value: 65, change: 2.3 },
    { name: 'Checkout to Order', value: 82, change: -1.2 },
    { name: 'Guest to Account', value: 42, change: 3.1 },
    { name: 'B2B Conversion', value: 78, change: 0.8 }
  ];

  const errorData: ErrorMetric[] = [
    { type: 'API Errors', count: 12, severity: 'high' },
    { type: 'Database Errors', count: 5, severity: 'medium' },
    { type: 'Payment Errors', count: 3, severity: 'high' },
    { type: 'Authentication Errors', count: 8, severity: 'low' },
    { type: 'Page Not Found', count: 24, severity: 'low' }
  ];

  const trafficData: TrafficMetric[] = [
    { time: '00:00', visitors: 120, pageViews: 340, bounceRate: 45 },
    { time: '04:00', visitors: 85, pageViews: 210, bounceRate: 52 },
    { time: '08:00', visitors: 320, pageViews: 890, bounceRate: 38 },
    { time: '12:00', visitors: 450, pageViews: 1200, bounceRate: 32 },
    { time: '16:00', visitors: 380, pageViews: 1020, bounceRate: 35 },
    { time: '20:00', visitors: 210, pageViews: 580, bounceRate: 41 }
  ];

  const statusColor = {
    healthy: 'text-green-500',
    warning: 'text-yellow-500',
    critical: 'text-red-500'
  }[systemHealth.status];

  const statusBg = {
    healthy: 'bg-green-100',
    warning: 'bg-yellow-100',
    critical: 'bg-red-100'
  }[systemHealth.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-earth-900">Performance Dashboard</h1>
          <p className="text-earth-600">Monitor system performance and user experience metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-md bg-earth-100 p-1">
          {(['hour', 'day', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                timeRange === range
                  ? 'bg-white text-earth-900 shadow-sm'
                  : 'text-earth-600 hover:text-earth-900'
              }`}
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* System Health Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Overall system status and performance</CardDescription>
          </div>
          <Badge className={`${statusBg} ${statusColor}`}>
            {systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1)}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-earth-50 rounded-lg">
              <Server className="h-8 w-8 mx-auto text-organic-500 mb-2" />
              <div className="text-2xl font-bold text-earth-900">{systemHealth.responseTime}ms</div>
              <div className="text-sm text-earth-600">Avg Response Time</div>
            </div>
            <div className="text-center p-4 bg-earth-50 rounded-lg">
              <Globe className="h-8 w-8 mx-auto text-organic-500 mb-2" />
              <div className="text-2xl font-bold text-earth-900">{systemHealth.uptime}%</div>
              <div className="text-sm text-earth-600">Uptime</div>
            </div>
            <div className="text-center p-4 bg-earth-50 rounded-lg">
              <Zap className="h-8 w-8 mx-auto text-organic-500 mb-2" />
              <div className="text-2xl font-bold text-earth-900">{systemHealth.serverLoad}%</div>
              <div className="text-sm text-earth-600">Server Load</div>
            </div>
            <div className="text-center p-4 bg-earth-50 rounded-lg">
              <Shield className="h-8 w-8 mx-auto text-organic-500 mb-2" />
              <div className="text-2xl font-bold text-earth-900">0</div>
              <div className="text-sm text-earth-600">Security Incidents</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">+2.3% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgThroughput.toFixed(0)}/min</div>
            <p className="text-xs text-muted-foreground">+5.2% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgErrorRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">-1.1% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.length > 0 ? (metrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / metrics.length).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">+3.4% from last period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Response Time Trend
            </CardTitle>
            <CardDescription>Average response time over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                    formatter={(value) => [`${value}ms`, 'Response Time']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#8BC34A" 
                    fill="#8BC34A" 
                    fillOpacity={0.3} 
                    name="Response Time (ms)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Throughput Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Request Throughput
            </CardTitle>
            <CardDescription>Requests per minute over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                    formatter={(value) => [`${value} req/min`, 'Throughput']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="throughput" 
                    stroke="#795548" 
                    name="Requests/Min" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Conversion Rates
            </CardTitle>
            <CardDescription>Key conversion metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Conversion Rate (%)" fill="#8BC34A" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Error Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Distribution
            </CardTitle>
            <CardDescription>Types and severity of errors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={errorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="type"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {errorData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={{
                          'high': '#F44336',
                          'medium': '#FF9800',
                          'low': '#2196F3'
                        }[entry.severity] || '#8884d8'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} errors`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Traffic Overview
            </CardTitle>
            <CardDescription>Visitor metrics and behavior</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="visitors" 
                    name="Visitors" 
                    stroke="#8BC34A" 
                    fill="#8BC34A" 
                    fillOpacity={0.3} 
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="pageViews" 
                    name="Page Views" 
                    stroke="#795548" 
                    fill="#795548" 
                    fillOpacity={0.3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Resource Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Resource Usage
            </CardTitle>
            <CardDescription>Server resource consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">CPU Usage</span>
                  <span className="text-sm font-medium">{(metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length : 0).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-organic-500 h-2.5 rounded-full" 
                    style={{ 
                      width: `${(metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length : 0).toFixed(1)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm font-medium">{(metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length : 0).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-organic-600 h-2.5 rounded-full" 
                    style={{ 
                      width: `${(metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length : 0).toFixed(1)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Database Queries</span>
                  <span className="text-sm font-medium">{(metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.dbQueries, 0) / metrics.length : 0).toFixed(1)}/min</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-organic-700 h-2.5 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.dbQueries, 0) / metrics.length : 0) / 60 * 100).toFixed(1)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recent Events
          </CardTitle>
          <CardDescription>Latest system events and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'info', message: 'Cache warming completed successfully', time: '2 min ago' },
              { type: 'success', message: 'Database backup completed', time: '15 min ago' },
              { type: 'warning', message: 'High memory usage detected on server 2', time: '32 min ago' },
              { type: 'error', message: 'Payment gateway timeout - retrying', time: '1 hour ago' },
              { type: 'info', message: 'New user registration: 24 today', time: '2 hours ago' }
            ].map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-3 hover:bg-earth-50 rounded-lg">
                <div className={`mt-1 w-3 h-3 rounded-full ${
                  event.type === 'error' ? 'bg-red-500' :
                  event.type === 'warning' ? 'bg-yellow-500' :
                  event.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium text-earth-900">{event.message}</p>
                  <p className="text-sm text-earth-500">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDashboard;