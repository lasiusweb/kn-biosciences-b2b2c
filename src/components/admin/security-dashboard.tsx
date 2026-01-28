"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSecurityManager } from "@/hooks/use-security-manager";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  AlertTriangle,
  Ban,
  Activity,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Trash2,
} from "lucide-react";

function ThreatSeverityBadge({ severity }: { severity: string }) {
  const variants = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };

  return (
    <Badge
      className={variants[severity as keyof typeof variants] || variants.low}
    >
      {severity.toUpperCase()}
    </Badge>
  );
}

function ThreatIcon({ type }: { type: string }) {
  const iconMap = {
    "XSS Attempt": <AlertTriangle className="h-4 w-4 text-red-500" />,
    "SQL Injection Attempt": <Ban className="h-4 w-4 text-red-600" />,
    "Path Traversal Attempt": (
      <AlertTriangle className="h-4 w-4 text-orange-500" />
    ),
    "Suspicious User Agent": <Eye className="h-4 w-4 text-yellow-500" />,
  };

  return (
    iconMap[type as keyof typeof iconMap] || (
      <Shield className="h-4 w-4 text-gray-500" />
    )
  );
}

export function SecurityDashboard() {
  const {
    metrics,
    blockIP,
    unblockIP,
    clearMetrics,
    isMonitoring,
    setIsMonitoring,
  } = useSecurityManager();
  const [newBlockedIP, setNewBlockedIP] = useState("");
  const [showEvents, setShowEvents] = useState(true);

  const securityScore = Math.max(
    0,
    100 -
      (metrics.blockedRequests * 10 +
        metrics.suspiciousRequests * 5 +
        metrics.securityViolations.filter((v) => v.severity === "critical")
          .length *
          25),
  );

  const getSecurityStatus = () => {
    if (securityScore >= 90)
      return { text: "Excellent", color: "text-green-600", icon: ShieldCheck };
    if (securityScore >= 70)
      return { text: "Good", color: "text-blue-600", icon: Shield };
    if (securityScore >= 50)
      return { text: "Warning", color: "text-yellow-600", icon: AlertTriangle };
    return { text: "Critical", color: "text-red-600", icon: ShieldOff };
  };

  const status = getSecurityStatus();
  const StatusIcon = status.icon;

  const handleBlockIP = () => {
    if (newBlockedIP.trim()) {
      blockIP(newBlockedIP.trim());
      setNewBlockedIP("");
    }
  };

  const exportSecurityData = () => {
    const data = {
      metrics,
      securityScore,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-6 w-6 text-organic-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Security Dashboard
          </h2>
          <div className="flex items-center space-x-2">
            <StatusIcon className={`h-5 w-5 ${status.color}`} />
            <Badge className={`${status.color} bg-opacity-10`}>
              {status.text} ({Math.round(securityScore)})
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isMonitoring ? "default" : "outline"}
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? (
              <Eye className="h-4 w-4 mr-2" />
            ) : (
              <EyeOff className="h-4 w-4 mr-2" />
            )}
            {isMonitoring ? "Monitoring" : "Paused"}
          </Button>
          <Button variant="outline" size="sm" onClick={exportSecurityData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-organic-600" />
              <h3 className="text-sm font-medium text-gray-600">
                Total Requests
              </h3>
            </div>
            <p className="text-2xl font-semibold mt-2">
              {metrics.totalRequests.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Tracked requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Ban className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-medium text-gray-600">
                Blocked Requests
              </h3>
            </div>
            <p className="text-2xl font-semibold mt-2 text-red-600">
              {metrics.blockedRequests}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.totalRequests > 0
                ? `${((metrics.blockedRequests / metrics.totalRequests) * 100).toFixed(2)}%`
                : "0%"}{" "}
              of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <h3 className="text-sm font-medium text-gray-600">
                Suspicious Activity
              </h3>
            </div>
            <p className="text-2xl font-semibold mt-2 text-yellow-600">
              {metrics.suspiciousRequests}
            </p>
            <p className="text-xs text-gray-500 mt-1">Threats detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-organic-600" />
              <h3 className="text-sm font-medium text-gray-600">Blocked IPs</h3>
            </div>
            <p className="text-2xl font-semibold mt-2">
              {metrics.blockedIPs.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Active blocks</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Security Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-organic-600" />
                <span>Recent Security Events</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEvents(!showEvents)}
              >
                {showEvents ? "Hide" : "Show"}
              </Button>
            </CardTitle>
          </CardHeader>
          {showEvents && (
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {metrics.recentEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No security events detected
                  </p>
                ) : (
                  metrics.recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <ThreatIcon type={event.type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium truncate">
                            {event.type}
                          </p>
                          <ThreatSeverityBadge severity={event.severity} />
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {event.path}
                        </p>
                        <p className="text-xs text-gray-400">
                          {event.ip} •{" "}
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* IP Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-organic-600" />
                <span>IP Management</span>
              </div>
              <Button variant="outline" size="sm" onClick={clearMetrics}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Block New IP */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter IP to block"
                  value={newBlockedIP}
                  onChange={(e) => setNewBlockedIP(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleBlockIP()}
                />
                <Button onClick={handleBlockIP} disabled={!newBlockedIP.trim()}>
                  Block IP
                </Button>
              </div>

              {/* Blocked IPs List */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Blocked IPs
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {metrics.blockedIPs.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No IPs currently blocked
                    </p>
                  ) : (
                    metrics.blockedIPs.map((ip, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-red-50 rounded"
                      >
                        <span className="text-sm font-mono">{ip}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unblockIP(ip)}
                        >
                          Unblock
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Threat Types Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Threat Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(
              metrics.securityViolations.reduce(
                (acc, event) => {
                  acc[event.type] = (acc[event.type] || 0) + 1;
                  return acc;
                },
                {} as Record<string, number>,
              ),
            ).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <ThreatIcon type={type} />
                  <span className="text-sm font-medium">{type}</span>
                </div>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
