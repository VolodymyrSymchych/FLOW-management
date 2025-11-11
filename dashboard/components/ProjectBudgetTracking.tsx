'use client';

import { useState, useEffect } from 'react';
import { DollarSign, AlertTriangle, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import axios from 'axios';

interface ProjectBudgetProps {
  projectId: number;
  projectBudget?: number | null;
  projectStartDate?: string | null;
  projectEndDate?: string | null;
}

export function ProjectBudgetTracking({ 
  projectId, 
  projectBudget,
  projectStartDate,
  projectEndDate 
}: ProjectBudgetProps) {
  const [metrics, setMetrics] = useState<{
    spent: number;
    utilizationPercentage: number;
    remaining: number;
    forecastSpending: number;
    daysRemaining: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectBudget) {
      loadProjectBudget();
    } else {
      setLoading(false);
    }
  }, [projectId, projectBudget]);

  const loadProjectBudget = async () => {
    try {
      const response = await axios.get(`/api/budget/project/${projectId}`);
      setMetrics(response.data.metrics);
    } catch (error) {
      console.error('Failed to load project budget:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!projectBudget || loading) {
    if (!projectBudget) {
      return (
        <div className="glass-light rounded-xl p-6 border border-white/10">
          <p className="text-text-tertiary text-sm">No budget set for this project</p>
        </div>
      );
    }
    return (
      <div className="glass-light rounded-xl p-6 border border-white/10">
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
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getUtilizationColor = () => {
    if (metrics.utilizationPercentage >= 100) return 'text-danger bg-danger/20 border-danger/30';
    if (metrics.utilizationPercentage >= 80) return 'text-warning bg-warning/20 border-warning/30';
    return 'text-success bg-success/20 border-success/30';
  };

  const getProgressBarColor = () => {
    if (metrics.utilizationPercentage >= 100) return 'bg-danger';
    if (metrics.utilizationPercentage >= 80) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="glass-light rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <span>Budget Tracking</span>
        </h3>
      </div>

      {/* Budget Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-tertiary mb-1">Total Budget</p>
            <p className="text-2xl font-bold text-text-primary">
              {formatCurrency(projectBudget)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-tertiary mb-1">Spent</p>
            <p className="text-2xl font-bold text-text-primary">
              {formatCurrency(metrics.spent)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-text-primary">
              {metrics.utilizationPercentage.toFixed(1)}% Utilized
            </span>
            <span className="text-sm text-text-tertiary">
              {formatCurrency(metrics.remaining)} remaining
            </span>
          </div>
          <div className="h-3 glass-subtle rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full  transition-all duration-500 ${getProgressBarColor()}`}
              style={{ width: `${Math.min(metrics.utilizationPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-xs text-text-tertiary mb-1">Remaining</p>
            <p className="text-lg font-semibold text-text-primary">
              {formatCurrency(metrics.remaining)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary mb-1">30-Day Forecast</p>
            <p className="text-lg font-semibold text-text-primary flex items-center space-x-1">
              <TrendingDown className="w-4 h-4 text-warning" />
              <span>{formatCurrency(metrics.forecastSpending)}</span>
            </p>
          </div>
        </div>

        {/* Timeline Info */}
        {projectStartDate && projectEndDate && (
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center space-x-2 text-sm text-text-tertiary">
              <Calendar className="w-4 h-4" />
              <span>
                {metrics.daysRemaining > 0 
                  ? `${metrics.daysRemaining} days remaining`
                  : 'Project ended'}
              </span>
            </div>
          </div>
        )}

        {/* Warning Messages */}
        {metrics.utilizationPercentage >= 80 && (
          <div className={`mt-4 p-3 rounded-lg ${getUtilizationColor()}`}>
            <p className="text-sm flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>
                {metrics.utilizationPercentage >= 100 
                  ? 'Budget exceeded! Review expenses immediately.'
                  : 'Approaching budget limit. Monitor spending closely.'}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

