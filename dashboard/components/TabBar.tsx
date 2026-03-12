'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useTabs } from '@/contexts/TabContext';
import { cn } from '@/lib/utils';

export function TabBar() {
  const { tabs, activeTabId, closeTab } = useTabs();

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar" data-testid="tab-bar">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            prefetch
            data-tab-id={tab.id}
            className={cn(
              'inline-flex max-w-[220px] items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              isActive
                ? 'border-accent/20 bg-accent-soft text-primary'
                : 'border-border bg-surface text-text-secondary hover:bg-surface-muted hover:text-text-primary'
            )}
            title={tab.label}
          >
            {Icon ? <Icon className="h-3.5 w-3.5 flex-shrink-0" /> : null}
            <span className="truncate">{tab.label}</span>
            <button
              type="button"
              onClick={(event) => closeTab(tab.id, event)}
              className={cn(
                'ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full',
                isActive ? 'hover:bg-accent/10' : 'hover:bg-surface-muted'
              )}
            >
              <X className="h-3 w-3" />
            </button>
          </Link>
        );
      })}
    </div>
  );
}
