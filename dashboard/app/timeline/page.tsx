'use client';

import { GanttChartView } from '@/components/GanttChartView';

export default function TimelinePage() {

  return (
    <div className="w-full h-full overflow-hidden">
      {/* Content Area - Gantt Chart */}
      <div className="w-full h-full p-4 overflow-hidden">
        <GanttChartView />
      </div>
    </div>
  );
}
