import { useCallback, useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  updateCount: number;
}

export const usePerformance = (componentName: string) => {
  const mountTimeRef = useRef<number>(Date.now());
  const renderTimeRef = useRef<number>(0);
  const updateCountRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(Date.now());

  const logPerformance = useCallback((metrics: PerformanceMetrics) => {
    if (__DEV__) {
      console.log(`[Performance] ${componentName}:`, {
        renderTime: `${metrics.renderTime}ms`,
        mountTime: `${metrics.mountTime}ms`,
        updateCount: metrics.updateCount,
      });
    }
  }, [componentName]);

  useEffect(() => {
    const now = Date.now();
    const renderTime = now - lastRenderTimeRef.current;
    const mountTime = now - mountTimeRef.current;
    updateCountRef.current += 1;

    renderTimeRef.current = renderTime;
    lastRenderTimeRef.current = now;

    logPerformance({
      renderTime,
      mountTime,
      updateCount: updateCountRef.current,
    });
  });

  return {
    renderTime: renderTimeRef.current,
    mountTime: Date.now() - mountTimeRef.current,
    updateCount: updateCountRef.current,
  };
};

// Hook for measuring API call performance
export const useApiPerformance = () => {
  const startTimeRef = useRef<number>(0);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  const endTimer = useCallback((apiName: string) => {
    const duration = Date.now() - startTimeRef.current;
    
    if (__DEV__) {
      console.log(`[API Performance] ${apiName}: ${duration}ms`);
    }

    return duration;
  }, []);

  return {
    startTimer,
    endTimer,
  };
}; 