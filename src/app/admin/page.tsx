import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedAnalyticsDashboard } from "@/components/admin/enhanced-analytics-dashboard";
import { PerformanceDashboard } from "@/components/admin/performance-dashboard";
import { SecurityDashboard } from "@/components/admin/security-dashboard";
import { CDNDashboard } from "@/components/admin/cdn-dashboard";
import { CacheDashboard } from "@/components/admin/cache-dashboard";
import { MicroservicesDashboard } from "@/components/admin/microservices-dashboard";
import { SafetyComplianceDashboard } from "@/components/admin/safety-compliance-dashboard";
import {
  Activity,
  BarChart3,
  Shield,
  Cloud,
  Database,
  Server,
  AlertTriangle,
} from "lucide-react";

export default function AdminPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your e-commerce platform</p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger
            value="analytics"
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger
            value="safety-compliance"
            className="flex items-center space-x-2"
          >
            <Shield className="h-4 w-4" />
            <span>Safety & Compliance</span>
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="flex items-center space-x-2"
          >
            <Activity className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="cache" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Cache</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center space-x-2">
            <Server className="h-4 w-4" />
            <span>Services</span>
          </TabsTrigger>
          <TabsTrigger value="cdn" className="flex items-center space-x-2">
            <Cloud className="h-4 w-4" />
            <span>CDN</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <EnhancedAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="safety-compliance">
          <SafetyComplianceDashboard />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceDashboard />
        </TabsContent>

        <TabsContent value="security">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="cache">
          <CacheDashboard />
        </TabsContent>

        <TabsContent value="services">
          <MicroservicesDashboard />
        </TabsContent>

        <TabsContent value="cdn">
          <CDNDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
