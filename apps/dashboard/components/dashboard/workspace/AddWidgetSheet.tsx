'use client';

import { Plus } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { WIDGETS } from './registry';
import type { WidgetId } from './types';

export interface AddWidgetSheetProps {
  hiddenWidgetIds: WidgetId[];
  onAdd: (id: WidgetId) => void;
}

export function AddWidgetSheet({ hiddenWidgetIds, onAdd }: AddWidgetSheetProps) {
  const hiddenSet = new Set<WidgetId>(hiddenWidgetIds);
  const addable = WIDGETS.filter((w) => hiddenSet.has(w.id));

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="soft" tone="primary" size="sm" icon={<Plus className="h-4 w-4" />}>
          Add widget
        </Button>
      </DrawerTrigger>
      <DrawerContent side="right" className="w-full max-w-md">
        <div className="flex h-full flex-col">
          <div className="border-b border-[var(--line)] px-5 py-4">
            <h2 className="text-lg font-semibold text-text-primary">Add a widget</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Pick from widgets you&rsquo;ve hidden. Your layout is saved locally.
            </p>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {addable.length === 0 ? (
              <div className="rounded-[10px] border border-dashed border-[var(--line-strong)] bg-[hsl(var(--surface-muted))] p-6 text-center text-sm text-text-tertiary">
                Every widget is already on your dashboard.
              </div>
            ) : (
              addable.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => onAdd(w.id)}
                  className="group flex w-full items-start gap-3 rounded-[12px] border border-[var(--line)] bg-[hsl(var(--surface))] p-3 text-left transition-colors hover:border-accent/40 hover:bg-accent-soft/40"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-primary">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-text-primary">{w.title}</div>
                    <div className="text-[12px] text-text-secondary">{w.description}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
