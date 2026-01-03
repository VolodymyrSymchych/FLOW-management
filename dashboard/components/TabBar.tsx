'use client';

import { useTabs } from '@/contexts/TabContext';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
                    <Link
                        key={tab.id}
                        href={tab.href}
                        prefetch={true}
                        ref={(el) => {
                            if (el && isActive) {
                                // Scroll into view when this tab becomes active
                                setTimeout(() => {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                }, 100);
                            }
                        }}
                        data-tab-id={tab.id}
                        className={cn(
                            "group relative flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ease-out cursor-pointer border select-none flex-shrink-0 max-w-[200px]",
                            isActive
                                ? "bg-primary/20 border-primary/30 text-text-primary shadow-md ring-1 ring-primary/10"
                                : "bg-white/5 border-white/5 text-text-secondary hover:bg-white/10 hover:border-white/10 hover:text-text-primary"
                        )}
                        title={tab.label}
                    >
                        {Icon && <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-text-tertiary group-hover:text-text-primary")} />}
                        <span className="truncate max-w-[120px]">{tab.label}</span>
                        <button
                            onClick={(e) => closeTab(tab.id, e)}
                            className={cn(
                                "p-0.5 rounded-md opacity-60 group-hover:opacity-100 transition-all duration-200 ml-1",
                                isActive ? "hover:bg-primary/20 text-text-secondary" : "hover:bg-white/20 text-text-tertiary"
                            )}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </Link>
                );
            })}
        </>
    );
}
