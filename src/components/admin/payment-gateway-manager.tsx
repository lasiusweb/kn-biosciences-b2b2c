'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertTriangle, Settings, RefreshCw } from 'lucide-react';
import { paymentGatewayManager } from '@/lib/payments/gateway-manager';

interface GatewayStatus {
  id: string;
  name: string;
  isConfigured: boolean;
  lastTested?: string;
  testResult?: any;
}

export default function PaymentGatewayManager() {
  const [gateways, setGateways] = useState<GatewayStatus[]>([]);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    loadGateways();
  }, []);

  const loadGateways = async () => {
    try {
      const response = await fetch('/api/payments/gateways');
      const data = await response.json();
      if (data.success) {
        setGateways(data.data.gateways.map(gw => ({
          id: gw.id,
          name: gw.name,
          isConfigured: gw.isConfigured,
        })));
      }
    } catch (error) {
      console.error('Failed to load gateways:', error);
    }
  };

  const testGateway = async (gatewayId: string) => {
    setLoading(`Testing ${gatewayId}...`);
    try {
      const response = await fetch(`/api/payments/gateways/test/${gatewayId}`);
      const data = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        [gatewayId]: data.data,
      }));

      if (data.data?.status === 'success') {
        setGateways(prev => 
          prev.map(gw => 
            gw.id === gatewayId 
              ? { ...gw, lastTested: new Date().toISOString(), testResult: data.data }
              : gw
          )
        );
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [gatewayId]: { status: 'error', message: error.message }
      }));
    } finally {
      setLoading(null);
    }
  };

  const testAllGateways = async () => {
    setLoading('Testing all gateways...');
    try {
      const response = await fetch('/api/payments/gateways/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gatewayIds: ['razorpay', 'payu', 'easebuzz'],
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        data.data.tests.forEach((test: any) => {
          setTestResults(prev => ({
            ...prev,
            [test.gateway]: test,
          }));
          
          if (test.status === 'success') {
            setGateways(prev => 
              prev.map(gw => 
                gw.id === test.gateway 
                  ? { ...gw, lastTested: new Date().toISOString(), testResult: test }
                  : gw
              )
            );
          }
        });

        setLoading(null);
      }
    } catch (error) {
      console.error('Failed to test all gateways:', error);
      setLoading('Test failed');
    }
  };

  const getConfig = async () => {
    setLoading('Loading configuration...');
    try {
      const response = await fetch('/api/payments/config');
      const data = await response.json();
      
      if (data.success) {
        setTestResults(prev => ({
          ...prev,
          configLoaded: true,
        }));
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
      setLoading('Config load failed');
    } finally {
      setLoading(null);
    }
  };

  const getHealthStatus = async () => {
    try {
      const response = await fetch('/api/payments/health');
      const data = await response.json();
      return data.data;
    } catch (error) {
      return { overall: 'error', issues: ['Health check failed'] };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Settings className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Payment Gateway Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button
              onClick={getConfig}
              variant="outline"
              size="sm"
              disabled={loading !== null}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {loading || 'Load Configuration'}
            </Button>
            <Button
              onClick={testAllGateways}
              disabled={loading !== null}
              variant="outline"
              size="sm"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {loading || 'Test All'}
            </Button>
          </div>

          {/* Gateway Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gateways.map((gateway) => (
              <Card key={gateway.id} className={gateway.isConfigured ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{gateway.name}</CardTitle>
                    <Badge variant={gateway.isConfigured ? 'default' : 'destructive'}>
                      {gateway.isConfigured ? 'Configured' : 'Not Configured'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {gateway.lastTested && (
                      <div className="text-sm text-gray-600">
                        Last tested: {new Date(gateway.lastTested).toLocaleString()}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => testGateway(gateway.id)}
                        disabled={loading !== null}
                        size="sm"
                        variant={gateway.isConfigured ? 'default' : 'outline'}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Test
                      </Button>
                      
                      {gateway.id === 'razorpay' && (
                        <Button
                          onClick={() => window.open('https://dashboard.razorpay.com/app', '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Dashboard
                        </Button>
                      )}
                    </div>

                    {testResults[gateway.id] && (
                      <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(testResults[gateway.id].status)}
                          <span className={`font-medium ${getStatusColor(testResults[gateway.id].status)}`}>
                            {testResults[gateway.id].status === 'success' ? 'Test Successful' : 'Test Failed'}
                          </span>
                        </div>
                        <Alert>
                          <AlertDescription>
                            {testResults[gateway.id].message}
                          </AlertDescription>
                        </Alert>
                        
                        {testResults[gateway.id].details && (
                          <details className="mt-2">
                            <summary className="text-sm text-gray-600 cursor-pointer">
                              View Details
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                              {JSON.stringify(testResults[gateway.id].details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={getHealthStatus}
                disabled={loading !== null}
                variant="outline"
              >
                Check Health
              </Button>
              <Button
                onClick={() => window.open('/api/payments/health', '_blank')}
                variant="outline"
              >
                API Endpoint
              </Button>
            </div>
            
            <Alert>
              <AlertDescription>
                Click "Check Health" to test payment gateway connectivity and configuration status.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}