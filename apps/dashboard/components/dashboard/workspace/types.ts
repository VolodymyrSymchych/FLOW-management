import type { ComponentType } from 'react';
import type { Layout } from 'react-grid-layout';

export type WidgetId =
  | 'kpi-metrics'
  | 'tasks-today'
  | 'delivery-board'
  | 'burndown'
  | 'cash-flow'
  | 'activity-feed'
  | 'team-pulse'
  | 'project-runway'
  | 'upcoming'
  | 'quick-actions'
  | 'recent-invoices';

export type Density = 'compact' | 'cozy';
export type Breakpoint = 'lg' | 'md' | 'sm';

export interface WidgetMeta {
  id: WidgetId;
  title: string;
  description: string;
  tone: 'accent' | 'sage' | 'amber' | 'violet' | 'blue' | 'neutral';
  defaultSize: Record<Breakpoint, { w: number; h: number; minW?: number; minH?: number }>;
  component: ComponentType<{ editMode?: boolean }>;
}

export type LayoutMap = Record<Breakpoint, Layout[]>;

export interface DashboardLayoutState {
  version: 1;
  layouts: LayoutMap;
  hiddenWidgetIds: WidgetId[];
  density: Density;
}
