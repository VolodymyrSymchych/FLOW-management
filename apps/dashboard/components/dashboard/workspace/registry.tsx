'use client';

import dynamic from 'next/dynamic';
import type { DashboardLayoutState, WidgetMeta } from './types';

const KpiMetricsWidget = dynamic(() => import('./widgets/KpiMetricsWidget'), { ssr: false });
const TasksTodayWidget = dynamic(() => import('./widgets/TasksTodayWidget'), { ssr: false });
const DeliveryBoardWidget = dynamic(() => import('./widgets/DeliveryBoardWidget'), { ssr: false });
const BurndownWidget = dynamic(() => import('./widgets/BurndownWidget'), { ssr: false });
const CashFlowWidget = dynamic(() => import('./widgets/CashFlowWidget'), { ssr: false });
const ActivityFeedWidget = dynamic(() => import('./widgets/ActivityFeedWidget'), { ssr: false });
const TeamPulseWidget = dynamic(() => import('./widgets/TeamPulseWidget'), { ssr: false });
const ProjectRunwayWidget = dynamic(() => import('./widgets/ProjectRunwayWidget'), { ssr: false });
const UpcomingWidget = dynamic(() => import('./widgets/UpcomingWidget'), { ssr: false });
const QuickActionsWidget = dynamic(() => import('./widgets/QuickActionsWidget'), { ssr: false });
const RecentInvoicesWidget = dynamic(() => import('./widgets/RecentInvoicesWidget'), { ssr: false });

export const WIDGETS: WidgetMeta[] = [
  {
    id: 'kpi-metrics',
    title: 'Studio metrics',
    description: 'Top-line KPIs: active, completed, total projects and completion rate.',
    tone: 'accent',
    defaultSize: {
      lg: { w: 6, h: 5, minW: 4, minH: 4 },
      md: { w: 8, h: 5, minW: 4, minH: 4 },
      sm: { w: 2, h: 5, minW: 2, minH: 4 },
    },
    component: KpiMetricsWidget,
  },
  {
    id: 'quick-actions',
    title: 'Quick actions',
    description: 'One-click shortcuts to the things you do most.',
    tone: 'neutral',
    defaultSize: {
      lg: { w: 3, h: 5, minW: 3, minH: 4 },
      md: { w: 4, h: 5, minW: 3, minH: 4 },
      sm: { w: 2, h: 5, minW: 2, minH: 4 },
    },
    component: QuickActionsWidget,
  },
  {
    id: 'burndown',
    title: 'Burndown',
    description: '14-day task burndown against the ideal line.',
    tone: 'accent',
    defaultSize: {
      lg: { w: 3, h: 5, minW: 3, minH: 4 },
      md: { w: 4, h: 5, minW: 3, minH: 4 },
      sm: { w: 2, h: 5, minW: 2, minH: 4 },
    },
    component: BurndownWidget,
  },
  {
    id: 'delivery-board',
    title: 'Delivery board',
    description: 'Tasks grouped by Plan / Build / Review / Ship.',
    tone: 'violet',
    defaultSize: {
      lg: { w: 8, h: 7, minW: 6, minH: 5 },
      md: { w: 8, h: 7, minW: 4, minH: 5 },
      sm: { w: 2, h: 8, minW: 2, minH: 5 },
    },
    component: DeliveryBoardWidget,
  },
  {
    id: 'tasks-today',
    title: 'Due today',
    description: 'Tasks due today or already overdue.',
    tone: 'amber',
    defaultSize: {
      lg: { w: 4, h: 7, minW: 3, minH: 4 },
      md: { w: 4, h: 7, minW: 3, minH: 4 },
      sm: { w: 2, h: 7, minW: 2, minH: 4 },
    },
    component: TasksTodayWidget,
  },
  {
    id: 'project-runway',
    title: 'Project runway',
    description: 'Progress and risk across active projects.',
    tone: 'sage',
    defaultSize: {
      lg: { w: 6, h: 6, minW: 4, minH: 4 },
      md: { w: 8, h: 6, minW: 4, minH: 4 },
      sm: { w: 2, h: 6, minW: 2, minH: 4 },
    },
    component: ProjectRunwayWidget,
  },
  {
    id: 'activity-feed',
    title: 'Recent activity',
    description: 'Who moved what, latest first.',
    tone: 'violet',
    defaultSize: {
      lg: { w: 3, h: 6, minW: 3, minH: 4 },
      md: { w: 4, h: 6, minW: 3, minH: 4 },
      sm: { w: 2, h: 6, minW: 2, minH: 4 },
    },
    component: ActivityFeedWidget,
  },
  {
    id: 'upcoming',
    title: 'Upcoming',
    description: 'Next 7 days — tasks with due dates.',
    tone: 'accent',
    defaultSize: {
      lg: { w: 3, h: 6, minW: 3, minH: 4 },
      md: { w: 4, h: 6, minW: 3, minH: 4 },
      sm: { w: 2, h: 6, minW: 2, minH: 4 },
    },
    component: UpcomingWidget,
  },
  {
    id: 'cash-flow',
    title: 'Cash flow',
    description: 'Income vs expense over the last 12 periods.',
    tone: 'sage',
    defaultSize: {
      lg: { w: 6, h: 6, minW: 4, minH: 4 },
      md: { w: 8, h: 6, minW: 4, minH: 4 },
      sm: { w: 2, h: 6, minW: 2, minH: 4 },
    },
    component: CashFlowWidget,
  },
  {
    id: 'recent-invoices',
    title: 'Invoices',
    description: 'Latest invoices and their status.',
    tone: 'amber',
    defaultSize: {
      lg: { w: 3, h: 6, minW: 3, minH: 4 },
      md: { w: 4, h: 6, minW: 3, minH: 4 },
      sm: { w: 2, h: 6, minW: 2, minH: 4 },
    },
    component: RecentInvoicesWidget,
  },
  {
    id: 'team-pulse',
    title: 'Team pulse',
    description: 'Who checked in today and for how long.',
    tone: 'blue',
    defaultSize: {
      lg: { w: 3, h: 6, minW: 3, minH: 4 },
      md: { w: 4, h: 6, minW: 3, minH: 4 },
      sm: { w: 2, h: 6, minW: 2, minH: 4 },
    },
    component: TeamPulseWidget,
  },
];

function buildDefaultLayouts() {
  const lg: DashboardLayoutState['layouts']['lg'] = [];
  const md: DashboardLayoutState['layouts']['md'] = [];
  const sm: DashboardLayoutState['layouts']['sm'] = [];

  let lgX = 0, lgY = 0;
  let mdX = 0, mdY = 0;
  let smY = 0;

  for (const w of WIDGETS) {
    if (lgX + w.defaultSize.lg.w > 12) {
      lgX = 0;
      lgY += w.defaultSize.lg.h;
    }
    lg.push({ i: w.id, x: lgX, y: lgY, w: w.defaultSize.lg.w, h: w.defaultSize.lg.h, minW: w.defaultSize.lg.minW, minH: w.defaultSize.lg.minH });
    lgX += w.defaultSize.lg.w;

    if (mdX + w.defaultSize.md.w > 8) {
      mdX = 0;
      mdY += w.defaultSize.md.h;
    }
    md.push({ i: w.id, x: mdX, y: mdY, w: w.defaultSize.md.w, h: w.defaultSize.md.h, minW: w.defaultSize.md.minW, minH: w.defaultSize.md.minH });
    mdX += w.defaultSize.md.w;

    sm.push({ i: w.id, x: 0, y: smY, w: 2, h: w.defaultSize.sm.h, minW: 2, minH: w.defaultSize.sm.minH });
    smY += w.defaultSize.sm.h;
  }
  return { lg, md, sm };
}

export const DEFAULT_LAYOUT: DashboardLayoutState = {
  version: 1,
  layouts: buildDefaultLayouts(),
  hiddenWidgetIds: [],
  density: 'cozy',
};
