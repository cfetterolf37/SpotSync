interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private readonly MAX_METRICS = 100;

  startTimer(name: string, metadata?: Record<string, any>): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    });

    // Cleanup old metrics if we have too many
    if (this.metrics.size > this.MAX_METRICS) {
      const oldestKey = this.metrics.keys().next().value;
      this.metrics.delete(oldestKey);
    }
  }

  endTimer(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric '${name}' not found`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    console.log(`Performance: ${name} took ${metric.duration.toFixed(2)}ms`, metric.metadata);
    return metric.duration;
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  // Monitor API call performance
  async monitorApiCall<T>(
    name: string,
    apiCall: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTimer(name, metadata);
    try {
      const result = await apiCall();
      this.endTimer(name);
      return result;
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }
}

export const performanceMonitor = new PerformanceMonitor(); 