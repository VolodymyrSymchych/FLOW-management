'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { usePerformanceMonitor, PerformanceMetrics } from '@/lib/performance';

export function PerformanceMonitor() {
  const pathname = usePathname();
  const { startPageLoad, markRenderComplete, getMetrics, logMetrics } = usePerformanceMonitor(pathname);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Start measuring when route changes
    startPageLoad();

    // Mark render complete after a short delay to allow React to render
    const timer = setTimeout(() => {
      markRenderComplete();
      const currentMetrics = getMetrics();
      setMetrics(currentMetrics);
      logMetrics();
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, startPageLoad, markRenderComplete, getMetrics, logMetrics]);

  // Keyboard shortcut to toggle panel (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowPanel((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!showPanel || !metrics) return null;

  const getPerformanceColor = (time: number, thresholds: { good: number; ok: number }) => {
    if (time < thresholds.good) return 'text-green-400';
    if (time < thresholds.ok) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="glass-medium rounded-xl p-4 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">Performance Metrics</h3>
          <button
            onClick={() => setShowPanel(false)}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-text-secondary">Page:</span>
            <span className="text-text-primary font-medium">{metrics.pageName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-text-secondary">Total Time:</span>
            <span className={getPerformanceColor(metrics.totalTime, { good: 1000, ok: 2000 })}>
              {metrics.totalTime.toFixed(0)}ms
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-text-secondary">Render Time:</span>
            <span className={getPerformanceColor(metrics.renderTime, { good: 100, ok: 300 })}>
              {metrics.renderTime.toFixed(0)}ms
            </span>
          </div>

          {metrics.firstContentfulPaint && (
            <div className="flex justify-between">
              <span className="text-text-secondary">First Contentful Paint:</span>
              <span className={getPerformanceColor(metrics.firstContentfulPaint, { good: 1000, ok: 2000 })}>
                {metrics.firstContentfulPaint.toFixed(0)}ms
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-text-secondary">API Calls:</span>
            <span className="text-text-primary">{metrics.apiCalls.length}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-text-secondary">Total API Time:</span>
            <span className={getPerformanceColor(metrics.totalApiTime, { good: 500, ok: 1000 })}>
              {metrics.totalApiTime.toFixed(0)}ms
            </span>
          </div>

          {metrics.apiCalls.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-text-secondary mb-2 font-medium">API Calls:</div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {metrics.apiCalls.map((call, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-text-tertiary truncate flex-1 mr-2">
                      {call.method} {call.url.split('?')[0].split('/').pop()}
                    </span>
                    <span className={getPerformanceColor(call.duration, { good: 200, ok: 500 })}>
                      {call.duration.toFixed(0)}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-white/10">
            <button
              onClick={() => {
                const data = JSON.stringify(metrics, null, 2);
                navigator.clipboard.writeText(data);
                alert('Metrics copied to clipboard!');
              }}
              className="w-full px-3 py-1.5 text-xs rounded-lg glass-light hover:glass-medium text-text-primary transition-colors"
            >
              Copy Metrics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

