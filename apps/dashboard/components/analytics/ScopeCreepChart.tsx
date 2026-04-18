'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export interface ScopeCreepChartProps {
    days?: number;
}

// Generate mock data
const generateData = (days: number) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        data.push({
            date: format(date, 'MMM dd'),
            detected: Math.floor(Math.random() * 8) + 2,
            prevented: Math.floor(Math.random() * 6) + 1,
        });
    }
    return data;
};

export function ScopeCreepChart({ days = 30 }: ScopeCreepChartProps) {
    const data = generateData(days);

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Scope Changes Over Time</h3>
                <p className="text-sm text-text-tertiary">Detected and prevented scope creep</p>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            dataKey="date"
                            stroke="rgba(255,255,255,0.5)"
                            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.5)"
                            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(23, 23, 23, 0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#fafafa' }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="detected"
                            stroke="#f97316"
                            strokeWidth={2}
                            dot={{ fill: '#f97316', r: 3 }}
                            name="Detected"
                        />
                        <Line
                            type="monotone"
                            dataKey="prevented"
                            stroke="#22c55e"
                            strokeWidth={2}
                            dot={{ fill: '#22c55e', r: 3 }}
                            name="Prevented"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
