'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area, Legend } from 'recharts';
import { Wallet } from 'lucide-react';
import { WidgetShell } from '../WidgetShell';
import { useWidgetContext } from '../widget-context';
import { WIDGETS } from '../registry';

interface CashFlowPoint {
  period?: string;
  label?: string;
  income?: number;
  expense?: number;
  net?: number;
}

export default function CashFlowWidget() {
  const { editMode, onHide, onResetSize } = useWidgetContext();
  const meta = WIDGETS.find((w) => w.id === 'cash-flow')!;
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cashflow', 'dashboard-widget'],
    queryFn: async () => {
      const res = await axios.get('/api/cashflow');
      const d = res.data;
      const arr: CashFlowPoint[] = Array.isArray(d) ? d : d.series ?? d.points ?? d.data ?? [];
      return arr;
    },
    staleTime: 5 * 60 * 1000,
  });

  const points = (data ?? []).slice(-12);
  const empty = !isLoading && points.length === 0;

  return (
    <WidgetShell
      meta={meta}
      editMode={editMode}
      loading={isLoading}
      error={isError || undefined}
      isEmpty={empty}
      emptyIcon={<Wallet className="h-5 w-5" />}
      emptyTitle="No cash flow data"
      emptyDescription="Record income and expenses to see the flow."
      onHide={onHide}
      onResetSize={onResetSize}
      onRetry={() => refetch()}
    >
      <div className="flex-1 px-1 pb-1 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="cf-income" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cf-expense" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--danger))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--danger))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey={(p: CashFlowPoint) => p.label ?? p.period ?? ''}
              tick={{ fontSize: 10, fill: 'hsl(var(--text-tertiary))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--text-tertiary))' }} axisLine={false} tickLine={false} width={32} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--surface-elevated))',
                border: '1px solid var(--line-strong)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="income" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#cf-income)" isAnimationActive={false} />
            <Area type="monotone" dataKey="expense" stroke="hsl(var(--danger))" strokeWidth={2} fill="url(#cf-expense)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </WidgetShell>
  );
}
