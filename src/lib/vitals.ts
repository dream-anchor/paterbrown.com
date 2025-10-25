/**
 * Web Vitals tracking utilities
 */

export interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Report Web Vitals metrics
 */
export function reportWebVitals(metric: Metric) {
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating
    });
  }
  
  // In production, send to analytics service
  // Example: analytics.track('web_vital', metric);
}

/**
 * Measure First Contentful Paint
 */
export function measureFCP() {
  const paintEntries = performance.getEntriesByType('paint');
  const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
  
  if (fcpEntry) {
    const value = fcpEntry.startTime;
    const rating = value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor';
    reportWebVitals({ name: 'FCP', value, rating });
  }
}

/**
 * Measure Largest Contentful Paint
 */
export function measureLCP() {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
    const value = lastEntry.renderTime || lastEntry.loadTime || 0;
    const rating = value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
    reportWebVitals({ name: 'LCP', value, rating });
  });

  observer.observe({ type: 'largest-contentful-paint', buffered: true });
}

/**
 * Measure Cumulative Layout Shift
 */
export function measureCLS() {
  let clsValue = 0;
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
      if (!layoutShiftEntry.hadRecentInput) {
        clsValue += layoutShiftEntry.value || 0;
      }
    }
    
    const rating = clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor';
    reportWebVitals({ name: 'CLS', value: clsValue, rating });
  });

  observer.observe({ type: 'layout-shift', buffered: true });
}

/**
 * Measure First Input Delay
 */
export function measureFID() {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const firstInputEntry = entry as PerformanceEventTiming;
      const value = firstInputEntry.processingStart - firstInputEntry.startTime;
      const rating = value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor';
      reportWebVitals({ name: 'FID', value, rating });
    }
  });

  observer.observe({ type: 'first-input', buffered: true });
}

/**
 * Initialize all Web Vitals measurements
 */
export function initWebVitals() {
  if (typeof window === 'undefined') return;
  
  measureFCP();
  measureLCP();
  measureCLS();
  measureFID();
}
