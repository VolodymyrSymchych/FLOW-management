'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

interface CashFlowDataPoint {
  date: string;
  income: number;
  expenses: number;
  netCashFlow: number;
}

interface ComparisonData {
  current: { income: number; expenses: number; netCashFlow: number };
  previous: { income: number; expenses: number; netCashFlow: number };
}

interface CashFlowSummaryProps {
  projectId: number;
}

export function CashFlowSummary({ projectId }: CashFlowSummaryProps) {
  const [cashFlowData, setCashFlowData] = useState<CashFlowDataPoint[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCashFlowData();
  }, [projectId]);

  const loadCashFlowData = async () => {
    try {
      setLoading(true);
      const [cashFlowRes, comparisonRes] = await Promise.all([
        axios.get(`/api/cashflow?period=month&project_id=${projectId}`),
        axios.get(`/api/cashflow/compare?period=month&compareTo=previous`),
      ]);

      setCashFlowData(cashFlowRes.data.cashFlowData || []);
      setComparisonData(comparisonRes.data.comparison || null);
    } catch (error) {
      console.error('Failed to load cash flow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    if (cents >= 1000000) {
      return `$${(cents / 1000000).toFixed(1)}M`;
    }
    if (cents >= 1000) {
      return `$${(cents / 1000).toFixed(0)}k`;
    }
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-medium rounded-lg p-3 border border-white/10">
          <p className="text-text-primary font-semibold mb-2 text-xs">
            {payload[0].payload.date ? formatDate(payload[0].payload.date) : ''}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="glass-light rounded-xl p-5 border border-white/10">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/5 rounded w-1/3"></div>
          <div className="h-40 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  const chartData = cashFlowData.map(d => ({
    ...d,
    date: formatDate(d.date),
  }));

  return (
    <div className="glass-light rounded-xl p-5 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-text-primary flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <span>Cash Flow (30 days)</span>
        </h3>
      </div>

      {/* Summary Stats */}
      {comparisonData && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="glass-subtle rounded-lg p-3">
            <p className="text-[10px] text-text-tertiary mb-1 uppercase tracking-wider">Income</p>
            <div className="flex items-center space-x-1.5">
              <p className="text-base font-bold text-text-primary">
                {formatCurrency(comparisonData.current.income)}
              </p>
              {comparisonData.previous.income > 0 && (
                <span className={cn(
                  'text-[10px] flex items-center space-x-0.5',
                  comparisonData.current.income >= comparisonData.previous.income
                    ? 'text-success'
                    : 'text-danger'
                )}>
                  {comparisonData.current.income >= comparisonData.previous.income ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {Math.abs(
                      ((comparisonData.current.income - comparisonData.previous.income) / comparisonData.previous.income) * 100
                    ).toFixed(0)}%
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="glass-subtle rounded-lg p-3">
            <p className="text-[10px] text-text-tertiary mb-1 uppercase tracking-wider">Expenses</p>
            <div className="flex items-center space-x-1.5">
              <p className="text-base font-bold text-text-primary">
                {formatCurrency(comparisonData.current.expenses)}
              </p>
              {comparisonData.previous.expenses > 0 && (
                <span className={cn(
                  'text-[10px] flex items-center space-x-0.5',
                  comparisonData.current.expenses <= comparisonData.previous.expenses
                    ? 'text-success'
                    : 'text-danger'
                )}>
                  {comparisonData.current.expenses <= comparisonData.previous.expenses ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <TrendingUp className="w-3 h-3" />
                  )}
                  <span>
                    {Math.abs(
                      ((comparisonData.current.expenses - comparisonData.previous.expenses) / comparisonData.previous.expenses) * 100
                    ).toFixed(0)}%
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="glass-subtle rounded-lg p-3">
            <p className="text-[10px] text-text-tertiary mb-1 uppercase tracking-wider">Net</p>
            <div className="flex items-center space-x-1.5">
              <p className={cn(
                'text-base font-bold',
                comparisonData.current.netCashFlow >= 0 ? 'text-success' : 'text-danger'
              )}>
                {formatCurrency(comparisonData.current.netCashFlow)}
              </p>
              {comparisonData.previous.netCashFlow !== 0 && (
                <span className={cn(
                  'text-[10px] flex items-center space-x-0.5',
                  comparisonData.current.netCashFlow >= comparisonData.previous.netCashFlow
                    ? 'text-success'
                    : 'text-danger'
                )}>
                  {comparisonData.current.netCashFlow >= comparisonData.previous.netCashFlow ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {Math.abs(
                      ((comparisonData.current.netCashFlow - comparisonData.previous.netCashFlow) / Math.abs(comparisonData.previous.netCashFlow)) * 100
                    ).toFixed(0)}%
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              stroke="#666"
              style={{ fontSize: '10px' }}
              tickMargin={8}
            />
            <YAxis
              stroke="#666"
              style={{ fontSize: '10px' }}
              tickFormatter={(value) => formatCurrency(value)}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="income"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Income"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="hsl(var(--danger))"
              strokeWidth={2}
              name="Expenses"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="netCashFlow"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              name="Net"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-40">
          <p className="text-text-tertiary text-sm">No cash flow data available</p>
        </div>
      )}
    </div>
  );
}
