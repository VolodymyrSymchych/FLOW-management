/**
 * Performance monitoring utilities for measuring page load times
 */

export interface PerformanceMetrics {
  pageName: string;
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number | null;
  firstContentfulPaint: number | null;
  timeToInteractive: number | null;
  apiCalls: APICallMetrics[];
  totalApiTime: number;
  renderTime: number;
  totalTime: number;
}

export interface APICallMetrics {
  url: string;
  method: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: number | null;
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics | null = null;
  private apiCalls: APICallMetrics[] = [];
  private pageStartTime: number = 0;
  private renderStartTime: number = 0;
  private renderEndTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    // Mark page start
    this.pageStartTime = performance.now();
    this.renderStartTime = performance.now();

    // Intercept fetch calls
    this.interceptFetch();

    // Measure paint metrics
    this.measurePaintMetrics();

    // Measure when page is interactive
    this.measureTimeToInteractive();
  }

  private interceptFetch() {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;
    const self = this;

    window.fetch = async function (...args) {
      const requestInfo = args[0];
      let url: string;

      if (typeof requestInfo === 'string') {
        url = requestInfo;
      } else if (requestInfo instanceof Request) {
        url = requestInfo.url;
      } else if (requestInfo instanceof URL) {
        url = requestInfo.toString();
      } else {
        url = String(requestInfo);
      }
      const method = (args[1]?.method || 'GET').toUpperCase();
      const startTime = performance.now();

      try {
        const response = await originalFetch.apply(this, args);
        const endTime = performance.now();

        self.apiCalls.push({
          url: url.toString(),
          method,
          startTime,
          endTime,
          duration: endTime - startTime,
          status: response.status,
        });

        return response;
      } catch (error: any) {
        const endTime = performance.now();
        self.apiCalls.push({
          url: url.toString(),
          method,
          startTime,
          endTime,
          duration: endTime - startTime,
          status: null,
          error: error.message,
        });
        throw error;
      }
    };
  }

  private measurePaintMetrics() {
    if (typeof window === 'undefined' || !window.performance) return;

    try {
      const paintEntries = performance.getEntriesByType('paint') as PerformancePaintTiming[];
      
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-paint') {
          this.metrics = {
            ...this.metrics!,
            firstPaint: entry.startTime,
          };
        }
        if (entry.name === 'first-contentful-paint') {
          this.metrics = {
            ...this.metrics!,
            firstContentfulPaint: entry.startTime,
          };
        }
      });
    } catch (error) {
      console.warn('Could not measure paint metrics:', error);
    }
  }

  private measureTimeToInteractive() {
    if (typeof window === 'undefined') return;

    // Simple TTI approximation: when all API calls are complete and page is idle
    setTimeout(() => {
      const now = performance.now();
      const allApiCallsComplete = this.apiCalls.every(
        (call) => call.endTime < now - 100
      );

      if (allApiCallsComplete && this.metrics) {
        this.metrics.timeToInteractive = now - this.pageStartTime;
      }
    }, 1000);
  }

  startPageLoad(pageName: string) {
    this.pageStartTime = performance.now();
    this.renderStartTime = performance.now();
    this.apiCalls = [];
    this.metrics = {
      pageName,
      navigationStart: this.pageStartTime,
      domContentLoaded: 0,
      loadComplete: 0,
      firstPaint: null,
      firstContentfulPaint: null,
      timeToInteractive: null,
      apiCalls: [],
      totalApiTime: 0,
      renderTime: 0,
      totalTime: 0,
    };

    // Measure DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (this.metrics) {
          this.metrics.domContentLoaded = performance.now() - this.pageStartTime;
        }
      });
    } else {
      if (this.metrics) {
        this.metrics.domContentLoaded = performance.now() - this.pageStartTime;
      }
    }

    // Measure window load
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => {
        if (this.metrics) {
          this.metrics.loadComplete = performance.now() - this.pageStartTime;
        }
      });
    } else {
      if (this.metrics) {
        this.metrics.loadComplete = performance.now() - this.pageStartTime;
      }
    }
  }

  markRenderComplete() {
    this.renderEndTime = performance.now();
    if (this.metrics) {
      this.metrics.renderTime = this.renderEndTime - this.renderStartTime;
    }
  }

  getMetrics(): PerformanceMetrics | null {
    if (!this.metrics) return null;

    const totalApiTime = this.apiCalls.reduce((sum, call) => sum + call.duration, 0);
    const totalTime = performance.now() - this.pageStartTime;

    return {
      ...this.metrics,
      apiCalls: [...this.apiCalls],
      totalApiTime,
      totalTime,
    };
  }

  logMetrics() {
    const metrics = this.getMetrics();
    if (!metrics) {
      console.log('No performance metrics available');
      return;
    }

    console.group(`📊 Performance Metrics: ${metrics.pageName}`);
    console.log(`⏱️  Total Time: ${metrics.totalTime.toFixed(2)}ms`);
    console.log(`🎨 Render Time: ${metrics.renderTime.toFixed(2)}ms`);
    console.log(`📡 API Calls: ${metrics.apiCalls.length}`);
    console.log(`⏳ Total API Time: ${metrics.totalApiTime.toFixed(2)}ms`);
    
    if (metrics.firstPaint) {
      console.log(`🖌️  First Paint: ${metrics.firstPaint.toFixed(2)}ms`);
    }
    if (metrics.firstContentfulPaint) {
      console.log(`✨ First Contentful Paint: ${metrics.firstContentfulPaint.toFixed(2)}ms`);
    }
    if (metrics.timeToInteractive) {
      console.log(`🔄 Time to Interactive: ${metrics.timeToInteractive.toFixed(2)}ms`);
    }

    if (metrics.apiCalls.length > 0) {
      console.group('📡 API Calls:');
      metrics.apiCalls.forEach((call) => {
        const status = call.status ? `✅ ${call.status}` : `❌ Error: ${call.error}`;
        console.log(`${call.method} ${call.url}: ${call.duration.toFixed(2)}ms ${status}`);
      });
      console.groupEnd();
    }

    console.groupEnd();

    // Store in localStorage for analysis
    try {
      const stored = localStorage.getItem('performance-metrics');
      const allMetrics = stored ? JSON.parse(stored) : [];
      allMetrics.push({
        ...metrics,
        timestamp: new Date().toISOString(),
      });
      // Keep only last 50 measurements
      localStorage.setItem('performance-metrics', JSON.stringify(allMetrics.slice(-50)));
    } catch (error) {
      console.warn('Could not store performance metrics:', error);
    }
  }

  exportMetrics(): string {
    const metrics = this.getMetrics();
    return JSON.stringify(metrics, null, 2);
  }
}

// Singleton instance
export const performanceMonitor = typeof window !== 'undefined' 
  ? new PerformanceMonitor()
  : null;

/**
 * Hook for measuring page performance
 */
export function usePerformanceMonitor(pageName: string) {
  if (typeof window === 'undefined') {
    return {
      startPageLoad: () => {},
      markRenderComplete: () => {},
      getMetrics: () => null,
      logMetrics: () => {},
    };
  }

  return {
    startPageLoad: () => performanceMonitor?.startPageLoad(pageName),
    markRenderComplete: () => performanceMonitor?.markRenderComplete(),
    getMetrics: () => performanceMonitor?.getMetrics(),
    logMetrics: () => performanceMonitor?.logMetrics(),
  };
}

