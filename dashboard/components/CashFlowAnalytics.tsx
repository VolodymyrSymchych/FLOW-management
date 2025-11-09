'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import axios from 'axios';

interface CashFlowDataPoint {
  date: string;
  income: number;
  expenses: number;
  netCashFlow: number;
}

interface ForecastDataPoint {
  date: string;
  forecastedIncome: number;
}

interface CategoryData {
  category: string;
  income: number;
  expenses: number;
}

interface ComparisonData {
  current: { income: number; expenses: number; netCashFlow: number };
  previous: { income: number; expenses: number; netCashFlow: number };
}

interface CashFlowAnalyticsProps {
  projectId?: number;
}

const COLORS = ['#00e5ff', '#ff6b4a', '#ffa500', '#00D66B', '#8098F9', '#ff4757'];

export function CashFlowAnalytics({ projectId }: CashFlowAnalyticsProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [cashFlowData, setCashFlowData] = useState<CashFlowDataPoint[]>([]);
  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    loadCashFlowData();
  }, [period, projectId]);

  const loadCashFlowData = async () => {
    try {
      setLoading(true);
      const baseUrl = projectId 
        ? `/api/cashflow?period=${period}&project_id=${projectId}` 
        : `/api/cashflow?period=${period}`;
      
      const [cashFlowRes, forecastRes, categoriesRes, comparisonRes] = await Promise.all([
        axios.get(baseUrl),
        axios.get('/api/cashflow/forecast'),
        axios.get(`/api/cashflow/categories?period=${period}${projectId ? `&project_id=${projectId}` : ''}`),
        axios.get(`/api/cashflow/compare?period=${period}&compareTo=previous`),
      ]);

      setCashFlowData(cashFlowRes.data.cashFlowData || []);
      setForecastData(forecastRes.data.forecast || []);
      setCategoryData(categoriesRes.data.categories || []);
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
    if (period === 'week') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (period === 'month') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short' });
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-medium rounded-lg p-3 border border-white/10">
          <p className="text-text-primary font-semibold mb-2">{payload[0].payload.date ? formatDate(payload[0].payload.date) : ''}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = cashFlowData.map(d => ({
    ...d,
    date: formatDate(d.date),
  }));

  const combinedChartData: Array<CashFlowDataPoint & { forecastedIncome?: number }> = [...chartData];
  forecastData.forEach(forecast => {
    const existing = combinedChartData.find(d => d.date === formatDate(forecast.date));
    if (existing) {
      (existing as any).forecastedIncome = forecast.forecastedIncome;
    } else {
      combinedChartData.push({
        date: formatDate(forecast.date),
        income: 0,
        expenses: 0,
        netCashFlow: 0,
        forecastedIncome: forecast.forecastedIncome,
      });
    }
  });
  combinedChartData.sort((a, b) => {
    const dateA = cashFlowData.find(d => formatDate(d.date) === a.date)?.date || '';
    const dateB = cashFlowData.find(d => formatDate(d.date) === b.date)?.date || '';
    return dateA.localeCompare(dateB);
  });

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-text-secondary" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'year')}
            className="px-4 py-2 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="week">1 Week</option>
            <option value="month">1 Month</option>
            <option value="year">1 Year</option>
          </select>
        </div>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="px-4 py-2 rounded-lg glass-medium border border-white/10 text-text-primary hover:glass-light transition-colors text-sm"
        >
          {showComparison ? 'Hide' : 'Show'} Comparison
        </button>
      </div>

      {/* Comparison Summary */}
      {showComparison && comparisonData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-medium rounded-xl p-4 border border-white/10">
            <p className="text-sm text-text-tertiary mb-2">Income</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-text-primary">
                {formatCurrency(comparisonData.current.income)}
              </p>
              {comparisonData.previous.income > 0 && (
                <span className={`text-sm flex items-center space-x-1 ${
                  comparisonData.current.income >= comparisonData.previous.income 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {comparisonData.current.income >= comparisonData.previous.income ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>
                    {Math.abs(
                      ((comparisonData.current.income - comparisonData.previous.income) / comparisonData.previous.income) * 100
                    ).toFixed(1)}%
                  </span>
                </span>
              )}
            </div>
            <p className="text-xs text-text-tertiary mt-1">
              Previous: {formatCurrency(comparisonData.previous.income)}
            </p>
          </div>
          <div className="glass-medium rounded-xl p-4 border border-white/10">
            <p className="text-sm text-text-tertiary mb-2">Expenses</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-text-primary">
                {formatCurrency(comparisonData.current.expenses)}
              </p>
              {comparisonData.previous.expenses > 0 && (
                <span className={`text-sm flex items-center space-x-1 ${
                  comparisonData.current.expenses <= comparisonData.previous.expenses 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {comparisonData.current.expenses <= comparisonData.previous.expenses ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  <span>
                    {Math.abs(
                      ((comparisonData.current.expenses - comparisonData.previous.expenses) / comparisonData.previous.expenses) * 100
                    ).toFixed(1)}%
                  </span>
                </span>
              )}
            </div>
            <p className="text-xs text-text-tertiary mt-1">
              Previous: {formatCurrency(comparisonData.previous.expenses)}
            </p>
          </div>
          <div className="glass-medium rounded-xl p-4 border border-white/10">
            <p className="text-sm text-text-tertiary mb-2">Net Cash Flow</p>
            <div className="flex items-center space-x-2">
              <p className={`text-2xl font-bold ${
                comparisonData.current.netCashFlow >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatCurrency(comparisonData.current.netCashFlow)}
              </p>
              {comparisonData.previous.netCashFlow !== 0 && (
                <span className={`text-sm flex items-center space-x-1 ${
                  comparisonData.current.netCashFlow >= comparisonData.previous.netCashFlow 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {comparisonData.current.netCashFlow >= comparisonData.previous.netCashFlow ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>
                    {Math.abs(
                      ((comparisonData.current.netCashFlow - comparisonData.previous.netCashFlow) / Math.abs(comparisonData.previous.netCashFlow)) * 100
                    ).toFixed(1)}%
                  </span>
                </span>
              )}
            </div>
            <p className="text-xs text-text-tertiary mt-1">
              Previous: {formatCurrency(comparisonData.previous.netCashFlow)}
            </p>
          </div>
        </div>
      )}

      {/* Cash Flow Line Chart */}
      <div className="glass-medium rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-text-primary mb-4">Cash Flow Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="#999"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#999"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#00e5ff" 
              strokeWidth={2}
              name="Income"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#ff6b4a" 
              strokeWidth={2}
              name="Expenses"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="netCashFlow" 
              stroke="#00D66B" 
              strokeWidth={2}
              name="Net Cash Flow"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Income vs Expenses Bar Chart */}
      <div className="glass-medium rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-text-primary mb-4">Income vs Expenses</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="#999"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#999"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" fill="#00e5ff" name="Income" />
            <Bar dataKey="expenses" fill="#ff6b4a" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Area Chart */}
      {forecastData.length > 0 && (
        <div className="glass-medium rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-text-primary mb-4">Forecasted Income</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={combinedChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#999"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#999"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="forecastedIncome" 
                stroke="#ffa500" 
                fill="#ffa500"
                fillOpacity={0.3}
                name="Forecasted Income"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Breakdown Pie Chart */}
      {categoryData.length > 0 && (
        <div className="glass-medium rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-text-primary mb-4">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData.filter(c => c.expenses > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="expenses"
              >
                {categoryData.filter(c => c.expenses > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

