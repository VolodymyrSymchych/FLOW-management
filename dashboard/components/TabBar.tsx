'use client';

import { useTabs } from '@/contexts/TabContext';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function TabBar() {
    const { tabs, activeTabId, closeTab } = useTabs();
    const router = useRouter();

    if (tabs.length === 0) return null;

    return (
        <>
            {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                const Icon = tab.icon;

                return (
                    <div
                        key={tab.id}
                        ref={(el) => {
                            if (el && isActive) {
                                // Scroll into view when this tab becomes active
                                setTimeout(() => {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                }, 100);
                            }
                        }}
                        data-tab-id={tab.id}
                        onClick={() => router.push(tab.href)}
                        className={cn(
                            "group relative flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border select-none flex-shrink-0 max-w-[200px]",
                            isActive
                                ? "bg-primary/10 border-primary/20 text-text-primary shadow-sm"
                                : "glass-subtle border-transparent text-text-secondary hover:glass-light hover:text-text-primary"
                        )}
                        title={tab.label}
                    >
                        {Icon && <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-text-tertiary group-hover:text-text-secondary")} />}
                        <span className="truncate max-w-[120px]">{tab.label}</span>
                        <button
                            onClick={(e) => closeTab(tab.id, e)}
                            className={cn(
                                "p-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ml-1",
                                isActive ? "hover:bg-primary/20 text-text-secondary" : "hover:bg-black/10 text-text-tertiary"
                            )}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                );
            })}
        </>
    );
}
