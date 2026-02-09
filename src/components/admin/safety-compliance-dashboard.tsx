'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Factory, 
  Globe,
  FlaskConical,
  Download,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { SafetyComplianceAnalyticsService, SafetyComplianceAnalytics, SafetyAlert } from '@/lib/safety-compliance-analytics-service';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function SafetyComplianceDashboard() {
  const [analytics, setAnalytics] = useState<SafetyComplianceAnalytics | null>(null);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsData = await SafetyComplianceAnalyticsService.getAnalytics();
      const alertsData = await SafetyComplianceAnalyticsService.getSafetyAlerts(10);
      
      setAnalytics(analyticsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error fetching safety and compliance analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">Loading safety and compliance analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10 text-red-500">Failed to load analytics data</div>
      </div>
    );
  }

  // Prepare data for charts
  const complianceByTypeData = [
    { name: 'CBIRC', value: analytics.complianceByType.cbirc },
    { name: 'Mfg License', value: analytics.complianceByType.manufacturingLicense },
    { name: 'GTIN', value: analytics.complianceByType.gtin },
    { name: 'Country', value: analytics.complianceByType.countryOfOrigin },
  ];

  const safetyByTypeData = [
    { name: 'Composition', value: analytics.safetyByType.chemicalComposition },
    { name: 'Warnings', value: analytics.safetyByType.safetyWarnings },
    { name: 'Antidote', value: analytics.safetyByType.antidoteStatement },
    { name: 'Directions', value: analytics.safetyByType.directionsOfUse },
    { name: 'Precautions', value: analytics.safetyByType.precautions },
  ];

  const complianceTrendData = analytics.complianceTrends;

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    format = 'number',
    color = 'default',
  }: {
    title: string;
    value: number;
    change?: number;
    icon: any;
    format?: 'number' | 'currency' | 'percentage';
    color?: 'default' | 'success' | 'warning' | 'danger';
  }) => {
    const displayValue =
      format === 'percentage'
        ? formatPercentage(value)
        : value.toLocaleString();

    const colorClasses = {
      default: 'text-muted-foreground',
      success: 'text-green-600',
      warning: 'text-orange-600',
      danger: 'text-red-600',
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
            <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Safety & Compliance Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor product safety and regulatory compliance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Safety
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Total Products" 
              value={analytics.totalProducts} 
              icon={Package} 
            />
            <MetricCard 
              title="With Safety Info" 
              value={analytics.productsWithSafetyInfo} 
              change={5.2}
              icon={FlaskConical} 
              color={analytics.productsWithSafetyInfo > 0 ? 'success' : 'danger'}
            />
            <MetricCard 
              title="With Compliance Info" 
              value={analytics.productsWithComplianceInfo} 
              change={3.8}
              icon={Shield} 
              color={analytics.productsWithComplianceInfo > 0 ? 'success' : 'danger'}
            />
            <MetricCard 
              title="Fully Compliant" 
              value={analytics.productsWithBoth} 
              change={8.1}
              icon={Shield} 
              format="percentage"
              value={analytics.totalProducts > 0 ? (analytics.productsWithBoth / analytics.totalProducts) * 100 : 0}
              color={analytics.productsWithBoth > 0 ? 'success' : 'danger'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance by Type
                </CardTitle>
                <CardDescription>Distribution of compliance attributes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={complianceByTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {complianceByTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Safety Info by Type
                </CardTitle>
                <CardDescription>Distribution of safety attributes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={safetyByTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8BC34A" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Compliance Trend
              </CardTitle>
              <CardDescription>Compliance improvement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={complianceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="compliantProducts" 
                    stroke="#8BC34A" 
                    name="Compliant Products" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalProducts" 
                    stroke="#FF8042" 
                    name="Total Products" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>CBIRC Compliance</span>
                    <Badge variant="secondary">{analytics.complianceByType.cbirc}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Manufacturing License</span>
                    <Badge variant="secondary">{analytics.complianceByType.manufacturingLicense}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>GTIN/EAN/UPC</span>
                    <Badge variant="secondary">{analytics.complianceByType.gtin}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Country of Origin</span>
                    <Badge variant="secondary">{analytics.complianceByType.countryOfOrigin}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  Top Brands by Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topBrandsByCompliance.slice(0, 5).map((brand, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{brand.brand}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{brand.complianceRate.toFixed(1)}%</span>
                        <Badge variant="outline">{brand.compliantProducts}/{brand.totalProducts}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="safety" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Safety Information Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Chemical Composition</span>
                    <Badge variant="secondary">{analytics.safetyByType.chemicalComposition}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Safety Warnings</span>
                    <Badge variant="secondary">{analytics.safetyByType.safetyWarnings}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Antidote Statement</span>
                    <Badge variant="secondary">{analytics.safetyByType.antidoteStatement}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Directions of Use</span>
                    <Badge variant="secondary">{analytics.safetyByType.directionsOfUse}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Precautions</span>
                    <Badge variant="secondary">{analytics.safetyByType.precautions}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Safety & Compliance Alerts
              </CardTitle>
              <CardDescription>Issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-4 rounded-lg border ${
                        alert.severity === 'high' 
                          ? 'bg-red-50 border-red-200' 
                          : alert.severity === 'medium' 
                            ? 'bg-yellow-50 border-yellow-200' 
                            : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{alert.productName}</h4>
                        <Badge 
                          variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'default' : 'secondary'}
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(alert.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No safety or compliance alerts at this time
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}