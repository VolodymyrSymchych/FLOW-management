'use client';

import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    ComposedChart,
    ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';

export interface BurndownDataPoint {
    date: string;
    remainingPoints: number;
    idealPoints: number;
    scopeChange?: number;
}

export interface BurndownChartProps {
    data: BurndownDataPoint[];
    sprintName?: string;
    className?: string;
}

export function BurndownChart({ data, sprintName, className = '' }: BurndownChartProps) {
    const chartData = useMemo(() => {
        return data.map(point => ({
            ...point,
            formattedDate: format(parseISO(point.date), 'MMM dd'),
        }));
    }, [data]);

    const maxPoints = useMemo(() => {
        if (data.length === 0) return 100;
        return Math.max(...data.map(d => Math.max(d.remainingPoints, d.idealPoints))) * 1.1;
    }, [data]);

    return (
        <div className={`h-full flex flex-col ${className}`}>
            {sprintName && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">{sprintName}</h3>
                    <p className="text-sm text-text-tertiary">Sprint Burndown Chart</p>
                </div>
            )}

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="scopeChangeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />

                        <XAxis
                            dataKey="formattedDate"
                            stroke="rgba(255,255,255,0.5)"
                            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                        />

                        <YAxis
                            stroke="rgba(255,255,255,0.5)"
                            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                            domain={[0, maxPoints]}
                            label={{
                                value: 'Story Points',
                                angle: -90,
                                position: 'insideLeft',
                                style: { fill: 'rgba(255,255,255,0.7)', fontSize: 12 }
                            }}
                        />

                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(23, 23, 23, 0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                padding: '12px',
                            }}
                            labelStyle={{ color: '#fafafa', fontWeight: 600, marginBottom: '8px' }}
                            itemStyle={{ color: '#d4d4d4', fontSize: '13px' }}
                        />

                        <Legend
                            wrapperStyle={{
                                paddingTop: '20px',
                                fontSize: '13px',
                            }}
                            iconType="line"
                        />

                        {/* Scope change area (if any) */}
                        <Area
                            type="monotone"
                            dataKey="scopeChange"
                            fill="url(#scopeChangeGradient)"
                            stroke="none"
                            name="Scope Change"
                        />

                        {/* Ideal burndown line */}
                        <Line
                            type="linear"
                            dataKey="idealPoints"
                            stroke="#a3a3a3"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Ideal Burndown"
                        />

                        {/* Actual burndown line */}
                        <Line
                            type="monotone"
                            dataKey="remainingPoints"
                            stroke="#0ea5e9"
                            strokeWidth={3}
                            dot={{ fill: '#0ea5e9', r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Actual Burndown"
                        />

                        {/* Zero line */}
                        <ReferenceLine
                            y={0}
                            stroke="rgba(34, 197, 94, 0.5)"
                            strokeDasharray="3 3"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
