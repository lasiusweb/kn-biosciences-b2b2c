"use client";

import { useEffect, useRef } from "react";
import { performanceMonitor } from "@/lib/performance/monitoring";

interface PerformanceOptions {
  trackPageViews?: boolean;
  trackUserInteractions?: boolean;
  trackResources?: boolean;
  sampleRate?: number;
}

export function usePerformanceMonitoring(options: PerformanceOptions = {}) {
  const {
    trackPageViews = true,
    trackUserInteractions = true,
    trackResources = false,
    sampleRate = 0.1, // 10% sampling to avoid too much data
  } = options;

  const startTimeRef = useRef<number>(Date.now());
  const isTrackedRef = useRef<boolean>(Math.random() < sampleRate);

  useEffect(() => {
    if (!isTrackedRef.current) return;

    // Track page load performance
    if (trackPageViews && typeof window !== "undefined") {
      const handleLoad = () => {
        const navigation = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;

        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;
          performanceMonitor.recordMetric("page-load", loadTime, false, false);
        }
      };

      if (document.readyState === "complete") {
        handleLoad();
      } else {
        window.addEventListener("load", handleLoad);
        return () => window.removeEventListener("load", handleLoad);
      }
    }
  }, [trackPageViews, isTrackedRef.current]);

  useEffect(() => {
    if (!isTrackedRef.current || !trackUserInteractions) return;

    // Track click interactions
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const elementName = target.tagName.toLowerCase();
      const className = target.className || "no-class";

      const interactionTime = Date.now() - startTimeRef.current;
      performanceMonitor.recordMetric(
        `click-${elementName}-${className}`,
        interactionTime,
        false,
        false,
      );
    };

    // Track form submissions
    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      const formName = form.name || form.className || "unnamed-form";

      performanceMonitor.recordMetric(
        `form-submit-${formName}`,
        0,
        false,
        false,
      );
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleSubmit);
    };
  }, [trackUserInteractions, isTrackedRef.current]);

  useEffect(() => {
    if (!isTrackedRef.current || !trackResources) return;

    // Track resource loading performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "resource") {
          const resource = entry as PerformanceResourceTiming;
          const loadTime = resource.responseEnd - resource.startTime;
          const resourceName = resource.name.split("/").pop() || "unknown";

          performanceMonitor.recordMetric(
            `resource-${resourceName}`,
            loadTime,
            false,
            false,
          );
        }
      }
    });

    observer.observe({ entryTypes: ["resource"] });

    return () => observer.disconnect();
  }, [trackResources, isTrackedRef.current]);

  // Manual metric recording
  const recordMetric = (
    name: string,
    responseTime?: number,
    error?: boolean,
    cacheHit?: boolean,
  ) => {
    if (!isTrackedRef.current) return;

    const time = responseTime || Date.now() - startTimeRef.current;
    performanceMonitor.recordMetric(name, time, error, cacheHit);
  };

  // Get current performance metrics
  const getMetrics = (serviceName?: string) => {
    if (!isTrackedRef.current) return null;

    return serviceName
      ? performanceMonitor.getServiceMetrics(serviceName)
      : performanceMonitor.getSystemHealth();
  };

  return {
    recordMetric,
    getMetrics,
    startTime: startTimeRef.current,
    isTracked: isTrackedRef.current,
  };
}
