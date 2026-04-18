'use client';

import { Search } from "lucide-react";
import { mockIntegrations, type MockIntegration } from "../landingAiMocks";
import { Card, TabHeader, TabShell } from "./shared";

const categories: Array<MockIntegration['category'] | 'All'> = ['All', 'Project', 'Version Control', 'Communication', 'Billing'];

const statusTone: Record<MockIntegration['status'], string> = {
    Connected: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    'Not Connected': 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/70',
    'Coming Soon': 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
};

export function IntegrationsTab() {
    const connected = mockIntegrations.filter((item) => item.status === 'Connected').length;

    return (
        <TabShell>
            <TabHeader
                title="Integrations"
                subtitle={`${connected} connected · ${mockIntegrations.length - connected} available`}
                right={
                    <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 dark:border-white/10 dark:bg-[#1C1C1C]">
                        <Search className="h-3 w-3 text-gray-400" />
                        <span className="text-[10px] text-gray-400">Search integrations…</span>
                    </div>
                }
            />

            <div className="mb-3 flex gap-1.5">
                {categories.map((category, index) => (
                    <button
                        key={category}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            index === 0
                                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                                : 'border border-gray-200 bg-white text-gray-700 dark:border-white/10 dark:bg-[#1C1C1C] dark:text-white/70'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
                {mockIntegrations.map((integration) => (
                    <Card key={integration.id} className="p-3">
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white ${integration.iconBg}`}>
                                {integration.iconChar}
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${statusTone[integration.status]}`}>
                                {integration.status}
                            </span>
                        </div>
                        <p className="text-[12px] font-bold text-gray-900 dark:text-white">{integration.name}</p>
                        <p className="mt-1 text-[10px] leading-snug text-gray-600 dark:text-white/65">{integration.description}</p>
                        <div className="mt-3 flex items-center justify-between text-[9px] text-gray-500 dark:text-white/55">
                            <span>{integration.category}</span>
                            <span>{integration.lastSync}</span>
                        </div>
                        <button className="mt-3 w-full rounded-lg bg-gray-100 px-2.5 py-1.5 text-[10px] font-semibold text-gray-700 dark:bg-white/10 dark:text-white/80">
                            {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                        </button>
                    </Card>
                ))}
            </div>
        </TabShell>
    );
}
