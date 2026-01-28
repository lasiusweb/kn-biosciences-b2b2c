"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, AlertTriangle, ShieldCheck, ShieldOff } from "lucide-react";

interface SecurityEvent {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  ip: string;
  path: string;
  timestamp: Date;
  details: Record<string, any>;
}

interface SecurityMetrics {
  totalRequests: number;
  blockedRequests: number;
  suspiciousRequests: number;
  securityViolations: SecurityEvent[];
  blockedIPs: string[];
  recentEvents: SecurityEvent[];
}

export function useSecurityManager() {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalRequests: 0,
    blockedRequests: 0,
    suspiciousRequests: 0,
    securityViolations: [],
    blockedIPs: [],
    recentEvents: [],
  });
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Threat detection patterns
  const threatPatterns = {
    xss: [
      /<script[^>]*>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /alert\s*\(/gi,
    ],
    sqlInjection: [
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/gi,
      /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/gi,
      /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/gi,
      /union\s+select/gi,
      /insert\s+into/gi,
      /drop\s+table/gi,
    ],
    pathTraversal: [
      /\.\.\//g,
      /\.\.\\/g,
      /\%2e\%2e\%2f/gi,
      /\%2e\%2e\\/gi,
      /etc\/passwd/gi,
    ],
    suspiciousAgents: [
      /bot/gi,
      /crawler/gi,
      /scanner/gi,
      /sqlmap/gi,
      /nikto/gi,
      /nmap/gi,
    ],
  };

  const detectThreats = useCallback(
    (url: string, userAgent: string, method: string): SecurityEvent | null => {
      const checkThreat = (
        patterns: RegExp[],
        threatType: string,
        severity: "low" | "medium" | "high" | "critical",
      ): SecurityEvent | null => {
        for (const pattern of patterns) {
          if (pattern.test(url) || pattern.test(userAgent)) {
            return {
              id: Math.random().toString(36).substr(2, 9),
              type: threatType,
              severity,
              ip: "client", // In real app, get from server
              path: url,
              timestamp: new Date(),
              details: {
                method,
                userAgent,
                matchedPattern: pattern.toString(),
              },
            };
          }
        }
        return null;
      };

      // Check for various threats
      return (
        checkThreat(threatPatterns.xss, "XSS Attempt", "high") ||
        checkThreat(
          threatPatterns.sqlInjection,
          "SQL Injection Attempt",
          "critical",
        ) ||
        checkThreat(
          threatPatterns.pathTraversal,
          "Path Traversal Attempt",
          "high",
        ) ||
        checkThreat(
          threatPatterns.suspiciousAgents,
          "Suspicious User Agent",
          "medium",
        )
      );
    },
    [],
  );

  const recordSecurityEvent = useCallback((event: SecurityEvent) => {
    setMetrics((prev) => ({
      ...prev,
      securityViolations: [...prev.securityViolations, event],
      recentEvents: [event, ...prev.recentEvents].slice(0, 50),
      blockedRequests:
        event.severity === "critical"
          ? prev.blockedRequests + 1
          : prev.blockedRequests,
      suspiciousRequests: ["high", "critical"].includes(event.severity)
        ? prev.suspiciousRequests + 1
        : prev.suspiciousRequests,
    }));

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `Security Event [${event.severity.toUpperCase()}]: ${event.type}`,
        event,
      );
    }
  }, []);

  const scanRequest = useCallback(
    (url: string, userAgent: string, method: string) => {
      if (!isMonitoring) return;

      setMetrics((prev) => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
      }));

      const threat = detectThreats(url, userAgent, method);
      if (threat) {
        recordSecurityEvent(threat);
      }
    },
    [isMonitoring, detectThreats, recordSecurityEvent],
  );

  const blockIP = useCallback((ip: string) => {
    setMetrics((prev) => ({
      ...prev,
      blockedIPs: [...prev.blockedIPs, ip],
    }));
  }, []);

  const unblockIP = useCallback((ip: string) => {
    setMetrics((prev) => ({
      ...prev,
      blockedIPs: prev.blockedIPs.filter((blockedIP) => blockedIP !== ip),
    }));
  }, []);

  const clearMetrics = useCallback(() => {
    setMetrics({
      totalRequests: 0,
      blockedRequests: 0,
      suspiciousRequests: 0,
      securityViolations: [],
      blockedIPs: [],
      recentEvents: [],
    });
  }, []);

  return {
    metrics,
    scanRequest,
    blockIP,
    unblockIP,
    clearMetrics,
    isMonitoring,
    setIsMonitoring,
  };
}
