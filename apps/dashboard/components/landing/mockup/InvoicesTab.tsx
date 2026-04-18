'use client';

import { Search, Plus, Download } from "lucide-react";
import { TabShell, TabHeader, MiniStat, Card } from "./shared";
import { mockInvoices, type MockInvoice } from "../landingAiMocks";

const tabs: Array<MockInvoice['status'] | 'All'> = ['All', 'Paid', 'Pending', 'Overdue', 'Draft'];

const statusBadge: Record<MockInvoice['status'], string> = {
    Paid:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    Overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    Draft:   'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/70',
};

export function InvoicesTab() {
    const total = mockInvoices.reduce((s, i) => s + i.amount, 0);
    const paid = mockInvoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
    const pending = mockInvoices.filter((i) => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);
    const overdue = mockInvoices.filter((i) => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);

    return (
        <TabShell>
            <TabHeader
                title="Invoices"
                subtitle={`${mockInvoices.length} invoices · $${total.toLocaleString()} tracked`}
                right={
                    <>
                        <button className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-semibold text-gray-700 dark:border-white/10 dark:bg-[#1C1C1C] dark:text-white/80">
                            <Download className="h-3 w-3" /> Export
                        </button>
                        <button className="flex items-center gap-1 rounded-lg bg-gray-900 px-2.5 py-1.5 text-[10px] font-semibold text-white dark:bg-white dark:text-gray-900">
                            <Plus className="h-3 w-3" /> New invoice
                        </button>
                    </>
                }
            />

            <div className="mb-4 grid grid-cols-4 gap-2.5">
                <MiniStat label="Total billed" value={`$${total.toLocaleString()}`} hint={`${mockInvoices.length} invoices`} />
                <MiniStat label="Paid" value={`$${paid.toLocaleString()}`} hint="on time" tone="positive" />
                <MiniStat label="Pending" value={`$${pending.toLocaleString()}`} hint="due this month" tone="warn" />
                <MiniStat label="Overdue" value={`$${overdue.toLocaleString()}`} hint="needs follow-up" tone="negative" />
            </div>

            <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex gap-1">
                    {tabs.map((t, i) => (
                        <button
                            key={t}
                            className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition ${
                                i === 0
                                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-white/70 dark:hover:bg-white/10'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 dark:border-white/10 dark:bg-[#1C1C1C]">
                    <Search className="h-3 w-3 text-gray-400" />
                    <span className="text-[10px] text-gray-400">Search invoices…</span>
                </div>
            </div>

            <Card>
                <div className="grid grid-cols-[1fr_1.2fr_1.3fr_0.7fr_0.8fr_0.7fr] gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                    <span>Invoice</span>
                    <span>Client</span>
                    <span>Project</span>
                    <span className="text-right">Amount</span>
                    <span>Status</span>
                    <span className="text-right">Due</span>
                </div>
                {mockInvoices.map((inv, i) => (
                    <div
                        key={inv.id}
                        className={`grid grid-cols-[1fr_1.2fr_1.3fr_0.7fr_0.8fr_0.7fr] items-center gap-2 px-3 py-2 text-[10px] ${i > 0 ? 'border-t border-gray-100 dark:border-white/5' : ''}`}
                    >
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">{inv.number}</span>
                        <span className="truncate text-gray-700 dark:text-white/80">{inv.client}</span>
                        <span className="truncate text-gray-600 dark:text-white/60">{inv.projectName}</span>
                        <span className="text-right font-bold text-gray-900 dark:text-white">${inv.amount.toLocaleString()}</span>
                        <span><span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${statusBadge[inv.status]}`}>{inv.status}</span></span>
                        <span className="text-right text-gray-500 dark:text-white/60">{inv.due}</span>
                    </div>
                ))}
            </Card>
        </TabShell>
    );
}
