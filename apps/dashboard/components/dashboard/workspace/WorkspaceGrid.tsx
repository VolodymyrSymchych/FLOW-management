'use client';

import { useMemo } from 'react';
import { Responsive, WidthProvider, type Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { WIDGETS } from './registry';
import { WidgetContext } from './widget-context';
import type { LayoutMap, WidgetId } from './types';

const ResponsiveGridLayout = WidthProvider(Responsive);

const BREAKPOINTS = { lg: 1200, md: 768, sm: 0 };
const COLS = { lg: 12, md: 8, sm: 2 };

export interface WorkspaceGridProps {
  layouts: LayoutMap;
  editMode: boolean;
  density: 'compact' | 'cozy';
  hiddenWidgetIds: WidgetId[];
  onLayoutChange: (all: LayoutMap) => void;
  onHide: (id: WidgetId) => void;
  onResetSize: (id: WidgetId) => void;
}

export function WorkspaceGrid({
  layouts,
  editMode,
  density,
  hiddenWidgetIds,
  onLayoutChange,
  onHide,
  onResetSize,
}: WorkspaceGridProps) {
  const visibleWidgets = useMemo(
    () => WIDGETS.filter((w) => !hiddenWidgetIds.includes(w.id)),
    [hiddenWidgetIds],
  );

  const rowHeight = density === 'compact' ? 40 : 48;
  const margin: [number, number] = density === 'compact' ? [12, 12] : [16, 16];

  return (
    <ResponsiveGridLayout
      className="workspace-grid"
      data-density={density}
      layouts={layouts as unknown as Record<string, Layout[]>}
      breakpoints={BREAKPOINTS}
      cols={COLS}
      rowHeight={rowHeight}
      margin={margin}
      isDraggable={editMode}
      isResizable={editMode}
      draggableHandle=".widget-drag-handle"
      useCSSTransforms
      compactType="vertical"
      preventCollision={false}
      onLayoutChange={(_current, all) => {
        onLayoutChange({
          lg: all.lg ?? layouts.lg,
          md: all.md ?? layouts.md,
          sm: all.sm ?? layouts.sm,
        });
      }}
    >
      {visibleWidgets.map((meta) => {
        const Widget = meta.component;
        return (
          <div key={meta.id} className="widget-item">
            <WidgetContext.Provider value={{ editMode, onHide, onResetSize }}>
              <Widget editMode={editMode} />
            </WidgetContext.Provider>
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
}
