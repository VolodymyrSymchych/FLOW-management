'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Download, Trash2, RefreshCw } from 'lucide-react';

interface PerformanceMetrics {
  pageName: string;
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number | null;
  firstContentfulPaint: number | null;
  timeToInteractive: number | null;
  apiCalls: any[];
  totalApiTime: number;
  renderTime: number;
  totalTime: number;
  timestamp: string;
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = () => {
    try {
      const stored = localStorage.getItem('performance-metrics');
      if (stored) {
        const parsed = JSON.parse(stored);
        setMetrics(parsed);
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const clearMetrics = () => {
    if (confirm('Are you sure you want to clear all performance metrics?')) {
      localStorage.removeItem('performance-metrics');
      setMetrics([]);
    }
  };

  const exportMetrics = () => {
    const dataStr = JSON.stringify(metrics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-metrics-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPageMetrics = (pageName: string) => {
    return metrics.filter((m) => m.pageName === pageName);
  };

  const getAverageMetrics = (pageMetrics: PerformanceMetrics[]) => {
    if (pageMetrics.length === 0) return null;

    return {
      totalTime: pageMetrics.reduce((sum, m) => sum + m.totalTime, 0) / pageMetrics.length,
      renderTime: pageMetrics.reduce((sum, m) => sum + m.renderTime, 0) / pageMetrics.length,
      totalApiTime: pageMetrics.reduce((sum, m) => sum + m.totalApiTime, 0) / pageMetrics.length,
      apiCallsCount: pageMetrics.reduce((sum, m) => sum + m.apiCalls.length, 0) / pageMetrics.length,
      firstContentfulPaint: pageMetrics
        .filter((m) => m.firstContentfulPaint)
        .reduce((sum, m) => sum + (m.firstContentfulPaint || 0), 0) / pageMetrics.filter((m) => m.firstContentfulPaint).length || 0,
    };
  };

  const uniquePages = Array.from(new Set(metrics.map((m) => m.pageName)));

  const getPerformanceColor = (time: number, thresholds: { good: number; ok: number }) => {
    if (time < thresholds.good) return 'text-green-400';
    if (time < thresholds.ok) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceBg = (time: number, thresholds: { good: number; ok: number }) => {
    if (time < thresholds.good) return 'bg-green-500/20 border-green-500/50';
    if (time < thresholds.ok) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Performance Metrics
          </h1>
          <p className="text-text-secondary mt-2">
            Monitor page load times and API call performance
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadMetrics}
            className="px-4 py-2 rounded-lg glass-medium border border-white/10 text-text-primary hover:glass-light transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={exportMetrics}
            disabled={metrics.length === 0}
            className="px-4 py-2 rounded-lg glass-medium border border-white/10 text-text-primary hover:glass-light transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={clearMetrics}
            disabled={metrics.length === 0}
            className="px-4 py-2 rounded-lg glass-medium border border-red-500/50 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {metrics.length === 0 ? (
        <div className="glass-medium rounded-xl p-12 text-center">
          <BarChart3 className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <p className="text-text-secondary">
            No performance metrics collected yet. Navigate through pages to collect metrics.
          </p>
          <p className="text-text-tertiary text-sm mt-2">
            Press <kbd className="px-2 py-1 rounded glass-subtle text-xs">Ctrl+Shift+P</kbd> on any page to view real-time metrics
          </p>
        </div>
      ) : (
        <>
          {/* Summary by Page */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uniquePages.map((pageName) => {
              const pageMetrics = getPageMetrics(pageName);
              const avg = getAverageMetrics(pageMetrics);
              if (!avg) return null;

              return (
                <div
                  key={pageName}
                  className={`glass-medium rounded-xl p-4 border ${getPerformanceBg(avg.totalTime, { good: 1000, ok: 2000 })} cursor-pointer hover:scale-[1.02] transition-transform`}
                  onClick={() => setSelectedPage(selectedPage === pageName ? null : pageName)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-text-primary truncate">{pageName}</h3>
                    <span className="text-xs text-text-tertiary">{pageMetrics.length} measurements</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Avg Total Time:</span>
                      <span className={getPerformanceColor(avg.totalTime, { good: 1000, ok: 2000 })}>
                        {avg.totalTime.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Avg Render:</span>
                      <span className={getPerformanceColor(avg.renderTime, { good: 100, ok: 300 })}>
                        {avg.renderTime.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Avg API Time:</span>
                      <span className={getPerformanceColor(avg.totalApiTime, { good: 500, ok: 1000 })}>
                        {avg.totalApiTime.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Avg API Calls:</span>
                      <span className="text-text-primary">{avg.apiCallsCount.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed View for Selected Page */}
          {selectedPage && (
            <div className="glass-medium rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-primary">
                  Detailed Metrics: {selectedPage}
                </h2>
                <button
                  onClick={() => setSelectedPage(null)}
                  className="text-text-tertiary hover:text-text-primary"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {getPageMetrics(selectedPage)
                  .reverse()
                  .map((metric, index) => (
                    <div key={index} className="glass-subtle rounded-lg p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-text-tertiary">
                          {new Date(metric.timestamp).toLocaleString()}
                        </span>
                        <span className={getPerformanceColor(metric.totalTime, { good: 1000, ok: 2000 })}>
                          {metric.totalTime.toFixed(0)}ms total
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-text-secondary">Render:</span>{' '}
                          <span className="text-text-primary">{metric.renderTime.toFixed(0)}ms</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">API Time:</span>{' '}
                          <span className="text-text-primary">{metric.totalApiTime.toFixed(0)}ms</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">API Calls:</span>{' '}
                          <span className="text-text-primary">{metric.apiCalls.length}</span>
                        </div>
                        {metric.firstContentfulPaint && (
                          <div>
                            <span className="text-text-secondary">FCP:</span>{' '}
                            <span className="text-text-primary">{metric.firstContentfulPaint.toFixed(0)}ms</span>
                          </div>
                        )}
                      </div>
                      {metric.apiCalls.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/5">
                          <div className="text-xs text-text-tertiary mb-1">API Calls:</div>
                          <div className="space-y-1">
                            {metric.apiCalls.map((call: any, callIndex: number) => (
                              <div key={callIndex} className="flex justify-between text-xs">
                                <span className="text-text-tertiary truncate">
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
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

