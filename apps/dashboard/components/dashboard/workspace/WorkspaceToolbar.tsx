'use client';

import { Check, RotateCcw, Settings2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { AddWidgetSheet } from './AddWidgetSheet';
import type { Density, WidgetId } from './types';

export interface WorkspaceToolbarProps {
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  density: Density;
  setDensity: (d: Density) => void;
  hiddenWidgetIds: WidgetId[];
  onAddWidget: (id: WidgetId) => void;
  onReset: () => void;
}

export function WorkspaceToolbar({
  editMode,
  setEditMode,
  density,
  setDensity,
  hiddenWidgetIds,
  onAddWidget,
  onReset,
}: WorkspaceToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-[hsl(var(--surface))] px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-8 items-center gap-2 rounded-full border border-[var(--line)] bg-[hsl(var(--surface-muted))] px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Workspace
        </div>
        <h1 className="app-display text-lg font-semibold tracking-tight text-text-primary md:text-xl">
          Your dashboard
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl<Density>
          value={density}
          onValueChange={setDensity}
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'cozy', label: 'Cozy' },
          ]}
        />
        {editMode ? (
          <>
            <AddWidgetSheet hiddenWidgetIds={hiddenWidgetIds} onAdd={onAddWidget} />
            <Button
              variant="ghost"
              tone="neutral"
              size="sm"
              icon={<RotateCcw className="h-4 w-4" />}
              onClick={onReset}
            >
              Reset
            </Button>
            <Button
              variant="solid"
              tone="primary"
              size="sm"
              icon={<Check className="h-4 w-4" />}
              onClick={() => setEditMode(false)}
            >
              Done
            </Button>
          </>
        ) : (
          <Button
            variant="soft"
            tone="neutral"
            size="sm"
            icon={<Settings2 className="h-4 w-4" />}
            onClick={() => setEditMode(true)}
          >
            Customize
          </Button>
        )}
      </div>
    </div>
  );
}
