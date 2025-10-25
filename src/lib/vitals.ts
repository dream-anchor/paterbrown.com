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
  if (import.meta.env.PROD) {
    // Google Analytics 4
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag;
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        metric_rating: metric.rating,
        non_interaction: true,
        metric_id: `${metric.name}_${Date.now()}`
      });
    }
    
    // Alternative: Send to custom analytics endpoint
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   body: JSON.stringify(metric),
    //   headers: { 'Content-Type': 'application/json' }
    // }).catch(() => {
    //   // Silently fail to not impact user experience
    // });
  }
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
 * Measure Interaction to Next Paint (INP) - replacing FID in Core Web Vitals
 */
export function measureINP() {
  let worstINP = 0;
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const eventEntry = entry as PerformanceEventTiming;
      const duration = eventEntry.duration;
      
      // Only track interactions longer than 16ms (one frame)
      if (duration > 16 && duration > worstINP) {
        worstINP = duration;
        const rating = duration < 200 ? 'good' : duration < 500 ? 'needs-improvement' : 'poor';
        reportWebVitals({ name: 'INP', value: duration, rating });
      }
    }
  });

  try {
    observer.observe({ type: 'event', buffered: true } as PerformanceObserverInit);
  } catch (e) {
    // INP observation not supported in this browser
  }
}

/**
 * Measure Time to First Byte (TTFB)
 */
export function measureTTFB() {
  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (navigationEntry) {
    const value = navigationEntry.responseStart - navigationEntry.requestStart;
    const rating = value < 800 ? 'good' : value < 1800 ? 'needs-improvement' : 'poor';
    reportWebVitals({ name: 'TTFB', value, rating });
  }
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
  measureINP(); // New Core Web Vital replacing FID
  measureTTFB(); // Additional performance metric
}
