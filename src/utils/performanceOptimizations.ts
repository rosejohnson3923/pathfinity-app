/**
 * Performance Optimization Utilities
 * Helper functions and utilities for optimizing React components
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Debounce function
 * Delays execution until after wait time has passed since last call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * Ensures function is called at most once per specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Hook for debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttled callback
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useRef(throttle(callback, delay));

  useEffect(() => {
    throttledCallback.current = throttle(callback, delay);
  }, [callback, delay]);

  return useCallback(
    (...args: Parameters<T>) => throttledCallback.current(...args),
    []
  ) as T;
}

/**
 * Lazy load component with retry logic
 */
export function lazyLoadWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries: number = 3
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    let lastError: any;

    for (let i = 0; i < retries; i++) {
      try {
        return await componentImport();
      } catch (error) {
        lastError = error;
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }

    throw lastError;
  });
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Check if element is in viewport
 * Useful for lazy rendering/loading
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Hook for intersection observer (lazy loading)
 */
export function useIntersectionObserver(
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}

/**
 * Virtual scrolling helper
 * Calculate which items should be rendered based on scroll position
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): { start: number; end: number } {
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);

  const start = Math.max(0, visibleStart - overscan);
  const end = Math.min(totalItems, visibleEnd + overscan);

  return { start, end };
}

/**
 * Image preloader
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      url =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        })
    )
  );
}

/**
 * Request animation frame throttle
 * Limits updates to animation frame rate
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  callback: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;

  return function throttledCallback(...args: Parameters<T>) {
    if (rafId) return;

    rafId = requestAnimationFrame(() => {
      callback(...args);
      rafId = null;
    });
  };
}

/**
 * Hook for RAF throttled callback
 */
export function useRafThrottle<T extends (...args: any[]) => any>(
  callback: T
): (...args: Parameters<T>) => void {
  const rafThrottledCallback = useRef(rafThrottle(callback));

  useEffect(() => {
    rafThrottledCallback.current = rafThrottle(callback);
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => rafThrottledCallback.current(...args),
    []
  );
}

/**
 * Deep comparison for memoization
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Shallow comparison for props
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Cancel pending promises on unmount
 */
export function useCancelToken() {
  const cancelTokenRef = useRef({ cancelled: false });

  useEffect(() => {
    return () => {
      cancelTokenRef.current.cancelled = true;
    };
  }, []);

  return cancelTokenRef;
}

/**
 * Performance monitor hook
 * Logs render time and count
 */
export function usePerformanceMonitor(componentName: string, enabled: boolean = false) {
  const renderCount = useRef(0);
  const renderStartTime = useRef<number>(0);

  if (enabled) {
    renderCount.current++;
    renderStartTime.current = performance.now();
  }

  useEffect(() => {
    if (enabled) {
      const renderTime = performance.now() - renderStartTime.current;
      console.log(
        `[${componentName}] Render #${renderCount.current}: ${renderTime.toFixed(2)}ms`
      );
    }
  });
}

/**
 * Batch updates helper
 * Batches multiple state updates into one render
 */
export function batchUpdates<T>(updates: Array<() => void>): void {
  // React 18+ automatically batches updates
  // This is for backwards compatibility
  if (typeof React.startTransition === 'function') {
    React.startTransition(() => {
      updates.forEach(update => update());
    });
  } else {
    updates.forEach(update => update());
  }
}

// Re-export React for convenience
import React from 'react';
