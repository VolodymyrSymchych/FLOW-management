'use client';

import { GanttChartView } from '@/components/GanttChartView';

export default function TimelinePage() {

  return (
    <div className="w-screen h-screen overflow-auto">
      {/* Content Area - Gantt Chart */}
      <div className="w-full min-h-full p-4">
        <GanttChartView />
      </div>
    </div>
  );
}
