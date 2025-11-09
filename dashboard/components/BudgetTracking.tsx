'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, TrendingDown } from 'lucide-react';
import axios from 'axios';

interface BudgetMetrics {
  totalBudget: number;
  totalSpent: number;
  utilizationPercentage: number;
  remainingBudget: number;
  forecastSpending: number;
  projectsAtRisk: number;
}

export function BudgetTracking() {
  const [metrics, setMetrics] = useState<BudgetMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBudgetMetrics();
  }, []);

  const loadBudgetMetrics = async () => {
    try {
      const response = await axios.get('/api/budget');
      setMetrics(response.data.metrics);
    } catch (error) {
      console.error('Failed to load budget metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-medium glass-hover rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const formatCurrency = (cents: number) => {
    if (cents >= 1000000) {
      return `$${(cents / 1000000).toFixed(1)}M`;
    }
    if (cents >= 1000) {
      return `$${(cents / 1000).toFixed(0)}k`;
    }
    return `$${(cents / 100).toFixed(0)}`;
  };

  const getUtilizationColor = () => {
    if (metrics.utilizationPercentage >= 100) return 'bg-red-500';
    if (metrics.utilizationPercentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUtilizationIcon = () => {
    if (metrics.utilizationPercentage >= 100) return AlertTriangle;
    if (metrics.utilizationPercentage >= 80) return AlertTriangle;
    return TrendingUp;
  };

  const UtilizationIcon = getUtilizationIcon();

  return (
    <div className="glass-medium glass-hover rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-text-tertiary mb-2 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full shadow-[0_0_8px] bg-purple-500"></span>
            <span>Budget vs Actual</span>
          </p>
          <h3 className="text-2xl font-bold text-text-primary">
            {formatCurrency(metrics.totalSpent)} / {formatCurrency(metrics.totalBudget)}
          </h3>
          <p className="text-sm text-text-tertiary mt-1">
            {metrics.utilizationPercentage.toFixed(1)}% utilized
          </p>
        </div>
        <div className={`p-3 rounded-xl glass-light shadow-[0_0_15px] ${getUtilizationColor()}`}>
          <UtilizationIcon className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-2 glass-subtle rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full shadow-[0_0_10px] transition-all duration-500 ${getUtilizationColor()}`}
          style={{ width: `${Math.min(metrics.utilizationPercentage, 100)}%` }}
        ></div>
      </div>

      {/* Additional Metrics */}
      <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
        <div>
          <p className="text-xs text-text-tertiary mb-1">Remaining</p>
          <p className="text-lg font-semibold text-text-primary">
            {formatCurrency(metrics.remainingBudget)}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-tertiary mb-1">Forecast</p>
          <p className="text-lg font-semibold text-text-primary flex items-center space-x-1">
            <TrendingDown className="w-4 h-4 text-yellow-500" />
            <span>{formatCurrency(metrics.forecastSpending)}</span>
          </p>
        </div>
      </div>

      {/* Warning Messages */}
      {metrics.utilizationPercentage >= 80 && (
        <div className={`mt-4 p-3 rounded-lg ${
          metrics.utilizationPercentage >= 100 
            ? 'bg-red-500/20 border border-red-500/30' 
            : 'bg-yellow-500/20 border border-yellow-500/30'
        }`}>
          <p className="text-sm flex items-center space-x-2">
            <AlertTriangle className={`w-4 h-4 ${
              metrics.utilizationPercentage >= 100 ? 'text-red-400' : 'text-yellow-400'
            }`} />
            <span className={metrics.utilizationPercentage >= 100 ? 'text-red-400' : 'text-yellow-400'}>
              {metrics.utilizationPercentage >= 100 
                ? 'Budget exceeded! Review expenses immediately.'
                : 'Approaching budget limit. Monitor spending closely.'}
            </span>
          </p>
        </div>
      )}

      {metrics.projectsAtRisk > 0 && (
        <div className="mt-2 p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
          <p className="text-xs text-orange-400">
            {metrics.projectsAtRisk} project{metrics.projectsAtRisk > 1 ? 's' : ''} at risk
          </p>
        </div>
      )}
    </div>
  );
}

