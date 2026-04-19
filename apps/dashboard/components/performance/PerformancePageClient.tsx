'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Download, Trash2, RefreshCw } from 'lucide-react';
import { AlertDialog, AlertDialogContent, Button } from '@/components/ui';
import { toastSuccess } from '@/lib/toast';

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

export function PerformancePageClient() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);

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
    localStorage.removeItem('performance-metrics');
    setMetrics([]);
    setShowClearDialog(false);
    toastSuccess('Performance metrics cleared');
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
    toastSuccess('Performance metrics exported');
  };

  const getPageMetrics = (pageName: string) => metrics.filter((m) => m.pageName === pageName);

  const getAverageMetrics = (pageMetrics: PerformanceMetrics[]) => {
    if (pageMetrics.length === 0) return null;

    return {
      totalTime: pageMetrics.reduce((sum, m) => sum + m.totalTime, 0) / pageMetrics.length,
      renderTime: pageMetrics.reduce((sum, m) => sum + m.renderTime, 0) / pageMetrics.length,
      totalApiTime: pageMetrics.reduce((sum, m) => sum + m.totalApiTime, 0) / pageMetrics.length,
      apiCallsCount: pageMetrics.reduce((sum, m) => sum + m.apiCalls.length, 0) / pageMetrics.length,
      firstContentfulPaint:
        pageMetrics.filter((m) => m.firstContentfulPaint).reduce((sum, m) => sum + (m.firstContentfulPaint || 0), 0) /
          pageMetrics.filter((m) => m.firstContentfulPaint).length || 0,
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
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-text-primary">
              <BarChart3 className="h-8 w-8 text-primary" />
              Performance Metrics
            </h1>
            <p className="mt-2 text-text-secondary">Monitor page load times and API call performance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" tone="neutral" icon={<RefreshCw className="h-4 w-4" />} onClick={loadMetrics}>
              Refresh
            </Button>
            <Button
              variant="outline"
              tone="neutral"
              icon={<Download className="h-4 w-4" />}
              onClick={exportMetrics}
              disabled={metrics.length === 0}
            >
              Export
            </Button>
            <Button
              variant="outline"
              tone="danger"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => setShowClearDialog(true)}
              disabled={metrics.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>

        {metrics.length === 0 ? (
          <div className="glass-medium rounded-xl p-12 text-center">
            <BarChart3 className="mx-auto mb-4 h-16 w-16 text-text-tertiary" />
            <p className="text-text-secondary">No performance metrics collected yet. Navigate through pages to collect metrics.</p>
            <p className="mt-2 text-sm text-text-tertiary">
              Press <kbd className="rounded glass-subtle px-2 py-1 text-xs">Ctrl+Shift+P</kbd> on any page to view real-time metrics
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {uniquePages.map((pageName) => {
                const pageMetrics = getPageMetrics(pageName);
                const avg = getAverageMetrics(pageMetrics);
                if (!avg) return null;

                return (
                  <div
                    key={pageName}
                    className={`glass-medium cursor-pointer rounded-xl border p-4 transition-transform hover:scale-[1.02] ${getPerformanceBg(avg.totalTime, { good: 1000, ok: 2000 })}`}
                    onClick={() => setSelectedPage(selectedPage === pageName ? null : pageName)}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="truncate font-semibold text-text-primary">{pageName}</h3>
                      <span className="text-xs text-text-tertiary">{pageMetrics.length} measurements</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Avg Total Time:</span>
                        <span className={getPerformanceColor(avg.totalTime, { good: 1000, ok: 2000 })}>{avg.totalTime.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Avg Render:</span>
                        <span className={getPerformanceColor(avg.renderTime, { good: 100, ok: 300 })}>{avg.renderTime.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Avg API Time:</span>
                        <span className={getPerformanceColor(avg.totalApiTime, { good: 500, ok: 1000 })}>{avg.totalApiTime.toFixed(0)}ms</span>
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

            {selectedPage && (
              <div className="glass-medium rounded-xl border border-white/10 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-text-primary">Detailed Metrics: {selectedPage}</h2>
                  <Button variant="ghost" tone="neutral" onClick={() => setSelectedPage(null)}>
                    Close
                  </Button>
                </div>
                <div className="max-h-96 space-y-4 overflow-y-auto">
                  {getPageMetrics(selectedPage)
                    .reverse()
                    .map((metric, index) => (
                      <div key={index} className="glass-subtle rounded-lg border border-white/5 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs text-text-tertiary">{new Date(metric.timestamp).toLocaleString()}</span>
                          <span className={getPerformanceColor(metric.totalTime, { good: 1000, ok: 2000 })}>{metric.totalTime.toFixed(0)}ms total</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                          <div><span className="text-text-secondary">Render:</span> <span className="text-text-primary">{metric.renderTime.toFixed(0)}ms</span></div>
                          <div><span className="text-text-secondary">DOM:</span> <span className="text-text-primary">{metric.domContentLoaded.toFixed(0)}ms</span></div>
                          <div><span className="text-text-secondary">API time:</span> <span className="text-text-primary">{metric.totalApiTime.toFixed(0)}ms</span></div>
                          <div><span className="text-text-secondary">API calls:</span> <span className="text-text-primary">{metric.apiCalls.length}</span></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent
          title="Clear performance metrics?"
          description="This removes locally stored performance samples from the current browser."
          cancelText="Keep data"
          actionText="Clear metrics"
          tone="danger"
          onAction={clearMetrics}
        />
      </AlertDialog>
    </>
  );
}
