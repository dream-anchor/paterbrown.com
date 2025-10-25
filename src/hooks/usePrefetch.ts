import { useCallback, useEffect, useRef } from 'react';

interface UsePrefetchOptions {
  trigger?: 'hover' | 'delay' | 'immediate';
  delay?: number;
}

/**
 * Hook to prefetch external links for faster navigation
 * Improves conversion rates by reducing perceived loading time
 */
export const usePrefetch = (url: string, options: UsePrefetchOptions = {}) => {
  const { trigger = 'hover', delay = 3000 } = options;
  const prefetchedRef = useRef(false);

  const prefetch = useCallback(() => {
    // Avoid duplicate prefetches
    if (prefetchedRef.current) return;
    
    // Check if link already exists
    const existingLink = document.querySelector(`link[href="${url}"]`);
    if (existingLink) {
      prefetchedRef.current = true;
      return;
    }

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document';
    document.head.appendChild(link);
    
    prefetchedRef.current = true;
  }, [url]);

  useEffect(() => {
    if (trigger === 'immediate') {
      prefetch();
    } else if (trigger === 'delay') {
      const timer = setTimeout(prefetch, delay);
      return () => clearTimeout(timer);
    }
  }, [trigger, delay, prefetch]);

  return {
    onMouseEnter: trigger === 'hover' ? prefetch : undefined,
    onFocus: trigger === 'hover' ? prefetch : undefined,
  };
};
