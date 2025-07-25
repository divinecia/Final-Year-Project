'use client';

import React, { useEffect } from 'react';

export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('Navigation Timing:', {
              DNS: navEntry.domainLookupEnd - navEntry.domainLookupStart,
              Connection: navEntry.connectEnd - navEntry.connectStart,
              Request: navEntry.responseStart - navEntry.requestStart,
              Response: navEntry.responseEnd - navEntry.responseStart,
              DOM: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              Total: navEntry.loadEventEnd - navEntry.fetchStart,
            });
          }

          if (entry.entryType === 'paint') {
            console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
          }

          if (entry.entryType === 'largest-contentful-paint') {
            console.log(`LCP: ${entry.startTime.toFixed(2)}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });

      // Monitor memory usage
      const checkMemory = () => {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          console.log('Memory Usage:', {
            used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
          });
        }
      };

      const memoryInterval = setInterval(checkMemory, 30000); // Check every 30 seconds

      return () => {
        observer.disconnect();
        clearInterval(memoryInterval);
      };
    }
  }, []);

  return null;
}

// React performance profiler
export function withPerformanceProfiler<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function ProfiledComponent(props: P) {
    return (
      <React.Profiler
        id={componentName}
        onRender={(id, phase, actualDuration) => {
          if (actualDuration > 16) { // Log slow renders (>16ms)
            console.warn(`Slow render in ${id} (${phase}): ${actualDuration.toFixed(2)}ms`);
          }
        }}
      >
        <Component {...props} />
      </React.Profiler>
    );
  };
}