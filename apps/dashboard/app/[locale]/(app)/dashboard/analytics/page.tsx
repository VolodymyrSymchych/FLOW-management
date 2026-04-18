'use client';

import { useState } from 'react';
import { BarChart3, Calendar, Download } from 'lucide-react';
import { ScopeCreepChart } from '@/components/analytics/ScopeCreepChart';
import { VelocityChart } from '@/components/analytics/VelocityChart';
import { RiskDistribution } from '@/components/analytics/RiskDistribution';
import toast from 'react-hot-toast';

type DateRange = '7' | '30' | '90' | 'custom';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30');

  const handleExport = () => {
    toast.success('Analytics exported successfully!');
  };

  return (
    <div className="scr-inner" data-testid="analytics-screen">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 28px 14px', borderBottom: '1px solid var(--line)', background: 'var(--white)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.02em', margin: 0 }}>
              Analytics
            </h1>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>
              Comprehensive insights into your project performance
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="chip" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar style={{ width: 13, height: 13 }} />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                style={{ background: 'transparent', border: 'none', fontSize: 14, color: 'var(--ink)', cursor: 'pointer', outline: 'none' }}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            <button type="button" className="btn btn-acc" onClick={handleExport}>
              <Download style={{ width: 12, height: 12 }} />
              Export
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <div className="stat-card">
              <div className="stat-lbl">Total Projects</div>
              <div className="stat-val">48</div>
              <div className="stat-hint" style={{ color: 'var(--sage)' }}>+12% from last period</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">Scope Changes</div>
              <div className="stat-val">127</div>
              <div className="stat-hint" style={{ color: 'var(--amber)' }}>+8% from last period</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">Avg Velocity</div>
              <div className="stat-val">52.3</div>
              <div className="stat-hint" style={{ color: 'var(--sage)' }}>+5% from last period</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">Budget Saved</div>
              <div className="stat-val">$2.1M</div>
              <div className="stat-hint" style={{ color: 'var(--sage)' }}>+18% from last period</div>
            </div>
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="surface-panel" style={{ borderRadius: 12, padding: 24, border: '1px solid var(--line)', minHeight: 400 }}>
              <ScopeCreepChart days={parseInt(dateRange) || 30} />
            </div>
            <div className="surface-panel" style={{ borderRadius: 12, padding: 24, border: '1px solid var(--line)', minHeight: 400 }}>
              <VelocityChart />
            </div>
            <div className="surface-panel" style={{ borderRadius: 12, padding: 24, border: '1px solid var(--line)', minHeight: 400 }}>
              <RiskDistribution />
            </div>
            <div className="surface-panel" style={{ borderRadius: 12, padding: 24, border: '1px solid var(--line)', minHeight: 400 }}>
              <div style={{ fontFamily: 'var(--font-inter), Inter', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>Budget Analysis</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Spend vs budget by category</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { category: 'Development', spent: 450000, budget: 500000, color: 'var(--blue)' },
                  { category: 'Design', spent: 180000, budget: 200000, color: 'var(--violet)' },
                  { category: 'Marketing', spent: 95000, budget: 100000, color: 'var(--sage)' },
                  { category: 'Infrastructure', spent: 120000, budget: 150000, color: 'var(--accent)' },
                ].map((item) => {
                  const percentage = (item.spent / item.budget) * 100;
                  return (
                    <div key={item.category}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{item.category}</span>
                        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                          ${(item.spent / 1000).toFixed(0)}K / ${(item.budget / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden' }}>
                        <div
                          style={{ width: `${percentage}%`, height: '100%', background: item.color, borderRadius: 99, transition: 'width 0.3s' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="surface-panel" style={{ borderRadius: 12, padding: 24, border: '1px solid var(--line)' }}>
            <h3 style={{ fontFamily: 'var(--font-inter), Inter', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Key Insights</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {[
                { title: 'Positive Trend', color: 'var(--sage)', bg: 'var(--sage-bg)', text: 'Team velocity has increased by 15% over the last 3 sprints.' },
                { title: 'Attention Needed', color: 'var(--amber)', bg: 'var(--amber-bg)', text: 'Scope changes have increased by 8%. Consider tightening requirements.' },
                { title: 'Budget Performance', color: 'var(--blue)', bg: 'var(--blue-bg)', text: 'All projects tracking within 10% of budget, avg savings 5%.' },
                { title: 'Risk Management', color: 'var(--violet)', bg: 'var(--violet-bg)', text: '75% of projects in low-medium risk categories.' },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: item.bg,
                    border: `1px solid ${item.color}33`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: item.color, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
