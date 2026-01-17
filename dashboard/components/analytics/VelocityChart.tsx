'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Sprint 1', planned: 45, actual: 42 },
    { name: 'Sprint 2', planned: 50, actual: 55 },
    { name: 'Sprint 3', planned: 48, actual: 48 },
    { name: 'Sprint 4', planned: 52, actual: 58 },
    { name: 'Sprint 5', planned: 55, actual: 52 },
    { name: 'Sprint 6', planned: 50, actual: 54 },
];

export function VelocityChart() {
    return (
        <div className="h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Team Velocity</h3>
                <p className="text-sm text-text-tertiary">Story points per sprint</p>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            dataKey="name"
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
                        <Bar dataKey="planned" fill="#a3a3a3" name="Planned" />
                        <Bar dataKey="actual" fill="#0ea5e9" name="Actual" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
