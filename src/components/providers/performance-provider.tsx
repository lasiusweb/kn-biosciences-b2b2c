"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";

interface PerformanceContextType {
  recordMetric: (
    name: string,
    responseTime?: number,
    error?: boolean,
    cacheHit?: boolean,
  ) => void;
  getMetrics: (serviceName?: string) => any;
  startTime: number;
  isTracked: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

interface PerformanceProviderProps {
  children: ReactNode;
  enableMonitoring?: boolean;
  options?: {
    trackPageViews?: boolean;
    trackUserInteractions?: boolean;
    trackResources?: boolean;
    sampleRate?: number;
  };
}

export function PerformanceProvider({
  children,
  enableMonitoring = true,
  options = {},
}: PerformanceProviderProps) {
  const performanceData = usePerformanceMonitoring(
    enableMonitoring
      ? options
      : {
          trackPageViews: false,
          trackUserInteractions: false,
          trackResources: false,
        },
  );

  return (
    <PerformanceContext.Provider value={performanceData}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error("usePerformance must be used within a PerformanceProvider");
  }
  return context;
}

// Higher-order component for automatic performance tracking
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
) {
  return function TrackedComponent(props: P) {
    const { recordMetric, startTime } = usePerformance();
    const name =
      componentName || Component.displayName || Component.name || "Unknown";

    useEffect(() => {
      const renderTime = Date.now() - startTime;
      recordMetric(`component-render-${name}`, renderTime, false, false);
    }, []);

    return <Component {...props} />;
  };
}
