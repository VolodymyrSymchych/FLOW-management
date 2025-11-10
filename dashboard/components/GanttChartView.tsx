'use client';

import { useEffect, useState, useRef } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import axios from 'axios';
import { Calendar } from 'lucide-react';

interface TaskData {
  id: number;
  title: string;
  startDate: string | null;
  dueDate: string | null;
  endDate: string | null;
  status: string;
  progress: number;
  dependsOn: string | null;
  projectId: number | null;
}

interface GanttChartViewProps {
  projectId?: number;
}

export function GanttChartView({ projectId }: GanttChartViewProps) {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Format dates to DD.MM format after Gantt renders
  useEffect(() => {
    const formatDates = () => {
      // Find all calendar text elements (dates) - but not month names
      const calendarTexts = document.querySelectorAll('g.calendar text:not(g.calendarTop text)');
      const monthMap: { [key: string]: number } = {
        'january': 1, 'february': 2, 'march': 3, 'april': 4,
        'may': 5, 'june': 6, 'july': 7, 'august': 8,
        'september': 9, 'october': 10, 'november': 11, 'december': 12
      };
      
      // Get current month from calendarTop
      let currentMonth = new Date().getMonth() + 1;
      const calendarTop = document.querySelector('g.calendarTop text');
      if (calendarTop) {
        const monthText = (calendarTop.textContent || '').toLowerCase();
        for (const [monthName, monthNum] of Object.entries(monthMap)) {
          if (monthText.includes(monthName)) {
            currentMonth = monthNum;
            break;
          }
        }
      }
      
      calendarTexts.forEach((textEl) => {
        const text = textEl.textContent || '';
        // Skip if already formatted or empty
        if (!text || text.includes('.')) return;
        
        // Parse formats like "Mon, 25" or "25"
        const dateMatch = text.match(/(\w+),\s*(\d+)/);
        if (dateMatch) {
          const day = parseInt(dateMatch[2]);
          // Format as DD.MM
          const formatted = `${day.toString().padStart(2, '0')}.${currentMonth.toString().padStart(2, '0')}`;
          textEl.textContent = formatted;
        } else {
          const dayMatch = text.match(/^(\d+)$/);
          if (dayMatch) {
            const day = parseInt(dayMatch[1]);
            // Format as DD.MM
            const formatted = `${day.toString().padStart(2, '0')}.${currentMonth.toString().padStart(2, '0')}`;
            textEl.textContent = formatted;
          }
        }
      });
    };

    // Use MutationObserver to catch when Gantt updates
    const observer = new MutationObserver(() => {
      formatDates();
    });

    // Observe changes in the Gantt container
    const ganttContainer = document.querySelector('.gantt-container');
    if (ganttContainer) {
      observer.observe(ganttContainer, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    // Also run immediately after a delay
    const timer = setTimeout(formatDates, 200);
    
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [ganttTasks, viewMode]);

  const loadTasks = async () => {
    try {
      const url = projectId ? `/api/tasks?project_id=${projectId}` : '/api/tasks';
      const response = await axios.get(url);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertToGanttTasks = (tasks: TaskData[]): Task[] => {
    return tasks
      .filter(task => task.startDate && task.dueDate)
      .map(task => {
        const start = new Date(task.startDate!);
        const end = new Date(task.dueDate!);
        const dependsOn = task.dependsOn ? JSON.parse(task.dependsOn) : [];
        
        // Determine colors based on status with glassmorphism theme
        let progressColor = 'rgba(107, 114, 128, 0.8)'; // gray for todo
        let backgroundColor = 'rgba(107, 114, 128, 0.7)';
        
        if (task.status === 'done') {
          progressColor = 'rgba(16, 185, 129, 0.85)'; // green with transparency
          backgroundColor = 'rgba(16, 185, 129, 0.75)';
        } else if (task.status === 'in_progress') {
          progressColor = 'rgba(128, 152, 249, 0.85)'; // primary blue with transparency
          backgroundColor = 'rgba(128, 152, 249, 0.75)';
        }
        
        return {
          start: start,
          end: end,
          name: task.title,
          id: `task-${task.id}`,
          type: 'task',
          progress: task.progress,
          styles: {
            progressColor: progressColor,
            progressSelectedColor: progressColor,
            backgroundColor: backgroundColor,
            backgroundSelectedColor: backgroundColor,
            progressBottomColor: progressColor,
            progressTopColor: progressColor,
          },
          dependencies: dependsOn.map((depId: number) => `task-${depId}`),
        };
      });
  };

  const handleTaskChange = async (task: Task) => {
    const taskId = parseInt(task.id.replace('task-', ''));
    const originalTask = tasks.find(t => t.id === taskId);
    
    if (!originalTask) return;

    try {
      await axios.put(`/api/tasks/${taskId}`, {
        start_date: task.start.toISOString().split('T')[0],
        due_date: task.end.toISOString().split('T')[0],
        progress: task.progress,
      });
      loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const ganttTasks = convertToGanttTasks(tasks);

  if (ganttTasks.length === 0) {
    return (
      <div className="glass-medium rounded-2xl p-12 border border-white/10 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-text-tertiary opacity-50" />
        <p className="text-text-tertiary text-lg font-medium mb-2">No tasks with dates available</p>
        <p className="text-text-tertiary text-sm">Add start and due dates to tasks to view them in the Gantt chart</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full min-w-full max-w-full">
      {/* Controls */}
      <div className="glass-medium rounded-2xl p-4 border border-white/10 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">View Mode</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(ViewMode.Day)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === ViewMode.Day
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(128,152,249,0.5)]'
                  : 'glass-light text-text-secondary hover:glass-medium hover:text-text-primary'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode(ViewMode.Week)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === ViewMode.Week
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(128,152,249,0.5)]'
                  : 'glass-light text-text-secondary hover:glass-medium hover:text-text-primary'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode(ViewMode.Month)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === ViewMode.Month
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(128,152,249,0.5)]'
                  : 'glass-light text-text-secondary hover:glass-medium hover:text-text-primary'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>
      
      {/* Gantt Chart Container */}
      <div className="glass-medium rounded-2xl p-6 border border-white/10 w-full max-w-full overflow-hidden">
        <div ref={containerRef} className="w-full overflow-x-auto overflow-y-visible custom-scrollbar" style={{ maxWidth: '100%' }}>
        <style jsx global>{`
          /* Main container - prevent page scroll */
          .gantt-container {
            background: transparent !important;
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            display: block !important;
            box-sizing: border-box !important;
            overflow-x: visible !important;
          }
          
          /* Prevent horizontal scroll on page */
          body {
            overflow-x: hidden !important;
          }

          /* Gantt wrapper - allow horizontal scroll only inside */
          .gantt-container > div {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            display: flex !important;
          }
          
          /* Root Gantt element */
          .gantt-container,
          .gantt-container * {
            box-sizing: border-box !important;
          }
          
          /* Calendar header background */
          g.calendar rect {
            fill: rgba(255, 255, 255, 0.05) !important;
            stroke: rgba(255, 255, 255, 0.1) !important;
            stroke-width: 1px !important;
            height: 24px !important;
          }
          
          /* Calendar text (dates) - format as DD.MM */
          g.calendar text {
            fill: rgba(255, 255, 255, 0.8) !important;
            font-family: inherit !important;
            font-size: 10px !important;
            font-weight: 500 !important;
          }
          
          /* Format date text to show only day.month */
          g.calendar text:not([class*="calendarTop"]) {
            font-size: 10px !important;
          }

          /* Calendar top (month name) - shorter format */
          g.calendarTop text {
            fill: rgba(255, 255, 255, 0.9) !important;
            font-weight: 600 !important;
            font-size: 11px !important;
            text-transform: uppercase !important;
          }
          
          g.calendarTop line {
            stroke: rgba(255, 255, 255, 0.15) !important;
            stroke-width: 1px !important;
          }
          
          /* Grid background */
          g.gridBody rect {
            fill: rgba(255, 255, 255, 0.02) !important;
          }
          
          /* Grid lines */
          g.rowLines line,
          g.ticks line {
            stroke: rgba(255, 255, 255, 0.08) !important;
            stroke-width: 1px !important;
          }
          
          /* Today highlight */
          g.today rect {
            fill: rgba(128, 152, 249, 0.15) !important;
            stroke: rgba(128, 152, 255, 0.3) !important;
            stroke-width: 1px !important;
          }
          
          /* Task bars */
          g.bar rect {
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)) !important;
            transition: all 0.2s ease !important;
          }
          
          g.bar rect:hover {
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4)) !important;
            opacity: 0.9 !important;
          }
          
          /* Task bar handles */
          g.handleGroup rect,
          g.handleGroup polygon {
            fill: rgba(255, 255, 255, 0.3) !important;
            stroke: rgba(255, 255, 255, 0.5) !important;
            stroke-width: 1px !important;
            cursor: ew-resize !important;
          }
          
          g.handleGroup rect:hover,
          g.handleGroup polygon:hover {
            fill: rgba(255, 255, 255, 0.5) !important;
            stroke: rgba(255, 255, 255, 0.8) !important;
          }
          
          /* Task text */
          g.bar text {
            fill: rgba(255, 255, 255, 0.95) !important;
            font-weight: 500 !important;
            font-size: 12px !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
          }
          
          /* Dependency arrows */
          g.arrows path,
          g.arrows line {
            stroke: rgba(128, 152, 249, 0.6) !important;
            fill: rgba(128, 152, 249, 0.6) !important;
            stroke-width: 2px !important;
          }
          
          /* Table headers */
          .gantt-table-header {
            background: rgba(255, 255, 255, 0.05) !important;
            backdrop-filter: blur(4px) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          .gantt-table-header-cell {
            color: rgba(255, 255, 255, 0.8) !important;
            font-weight: 500 !important;
            border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          .gantt-table-body-row {
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          }
          .gantt-table-body-cell {
            color: rgba(255, 255, 255, 0.9) !important;
            border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
            background: transparent !important;
          }
          .gantt-task-list-header {
            background: rgba(255, 255, 255, 0.05) !important;
            backdrop-filter: blur(4px) !important;
            border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          .gantt-task-list-header-cell {
            color: rgba(255, 255, 255, 0.8) !important;
            font-weight: 500 !important;
          }
          .gantt-task-list-item {
            background: transparent !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          }
          .gantt-task-list-item-name {
            color: rgba(255, 255, 255, 0.9) !important;
          }
          .gantt-calendar-header {
            background: rgba(255, 255, 255, 0.05) !important;
            backdrop-filter: blur(4px) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            height: 28px !important;
            min-height: 28px !important;
          }
          .gantt-calendar-header-cell {
            color: rgba(255, 255, 255, 0.8) !important;
            border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding: 4px 6px !important;
            font-size: 11px !important;
          }
          .gantt-calendar-top {
            background: rgba(255, 255, 255, 0.03) !important;
            backdrop-filter: blur(2px) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            height: 24px !important;
            min-height: 24px !important;
          }
          .gantt-calendar-top-cell {
            color: rgba(255, 255, 255, 0.7) !important;
            border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding: 3px 6px !important;
            font-size: 11px !important;
          }
          .gantt-calendar-bottom {
            background: transparent !important;
            height: 24px !important;
            min-height: 24px !important;
          }
          .gantt-calendar-bottom-cell {
            color: rgba(255, 255, 255, 0.8) !important;
            border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding: 3px 4px !important;
            font-size: 10px !important;
          }
          .gantt-task-bar {
            border-radius: 4px !important;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset !important;
            transition: all 0.2s ease !important;
          }
          .gantt-task-bar:hover {
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2) inset !important;
            transform: translateY(-1px) !important;
          }
          .gantt-task-bar-progress {
            border-radius: 4px !important;
            opacity: 0.9 !important;
          }
          
          /* Selected task */
          .gantt-task-bar-selected {
            box-shadow: 0 0 0 2px rgba(128, 152, 249, 0.6), 0 4px 12px rgba(128, 152, 249, 0.3) !important;
          }
          
          /* Custom scrollbar for Gantt container */
          .custom-scrollbar::-webkit-scrollbar {
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(128, 152, 249, 0.5);
          }
          
          /* SVG container improvements - allow horizontal expansion */
          .gantt-container svg {
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
            width: auto !important;
            min-width: 100% !important;
            max-width: none !important;
            height: auto !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            box-sizing: border-box !important;
          }

          /* Make SVG viewBox responsive */
          .gantt-container svg[viewBox] {
            width: auto !important;
            min-width: 100% !important;
            height: auto !important;
            preserveAspectRatio: none !important;
            display: block !important;
            visibility: visible !important;
          }
          
          /* Ensure SVG content scales properly */
          .gantt-container svg g {
            transform-origin: 0 0;
            display: block !important;
            visibility: visible !important;
          }
          
          /* Make sure grid and bars are visible */
          .gantt-container svg g.grid,
          .gantt-container svg g.gridBody,
          .gantt-container svg g.bar,
          .gantt-container svg g.content {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          
          /* Ensure task bars are visible */
          .gantt-container svg g.bar rect {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          
          /* Ensure Gantt chart takes full width */
          .gantt-container table {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            table-layout: fixed !important;
          }
          
          /* Make calendar header full width */
          .gantt-container .gantt-calendar-header,
          .gantt-container .gantt-calendar-top,
          .gantt-container .gantt-calendar-bottom {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Gantt content area should expand */
          .gantt-container .gantt-table-body {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Hide task list on the left - first table with Name, From, To */
          .gantt-container .gantt-task-list,
          .gantt-container .gantt-task-list-header,
          .gantt-container .gantt-task-list-item,
          div[class*="_3_ygE"],
          div[class*="_1nBOt"],
          div[class*="_WuQ0f"],
          div[class*="_2B2zv"]:has(div[class*="_3ZbQT"]),
          div[class*="_3ZbQT"],
          div[class*="_34SS0"],
          div[class*="_3lLk3"] {
            display: none !important;
            width: 0 !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
          
          /* Hide the first column/table that contains task names */
          .gantt-container > div > div:first-child {
            display: none !important;
            width: 0 !important;
            visibility: hidden !important;
          }
          
          /* Make the chart (second div with _CZjuD) take full width */
          .gantt-container > div > div:last-child,
          .gantt-container > div > div:nth-child(2),
          div[class*="_CZjuD"] {
            display: block !important;
            width: 100% !important;
            min-width: 100% !important;
            max-width: none !important;
            visibility: visible !important;
            opacity: 1 !important;
            flex: 1 !important;
          }

          /* Make SVG inside chart take full width */
          div[class*="_CZjuD"] svg {
            width: auto !important;
            min-width: 100% !important;
            max-width: none !important;
          }

          /* Remove width restrictions - allow natural expansion */
          .gantt-container svg,
          .gantt-container > div,
          div[class*="_CZjuD"] {
            overflow: visible !important;
          }
          
          .gantt-container .gantt-calendar {
            width: 100% !important;
            margin-left: 0 !important;
          }
          
          /* Chart container - allow horizontal scroll */
          div[class*="_CZjuD"] {
            min-width: max-content !important;
            width: auto !important;
            flex: 1 1 auto !important;
            overflow-x: auto !important;
          }
          
          /* SVG should expand based on content */
          div[class*="_CZjuD"] svg {
            width: auto !important;
            min-width: max-content !important;
          }

          /* Make wrapper divs responsive */
          .gantt-container > div > div {
            box-sizing: border-box !important;
          }

          /* Make sure the inner scrollable area can expand */
          .gantt-container .gantt-table-wrapper,
          .gantt-container .gantt-table {
            width: auto !important;
            min-width: max-content !important;
            max-width: none !important;
          }
          
          /* Calculate column width based on screen size */
          .gantt-container svg {
            min-width: max-content !important;
          }
        `}</style>
        <Gantt
          key={`gantt-${viewMode}`}
          tasks={ganttTasks}
          viewMode={viewMode}
          onDateChange={handleTaskChange}
          onProgressChange={handleTaskChange}
          locale="en"
          listCellWidth="0"
          columnWidth={
            containerWidth > 0
              ? viewMode === ViewMode.Day
                ? Math.max(40, Math.floor(containerWidth / 30))
                : viewMode === ViewMode.Week
                ? Math.max(60, Math.floor(containerWidth / 20))
                : Math.max(80, Math.floor(containerWidth / 15))
              : viewMode === ViewMode.Day
              ? 50
              : viewMode === ViewMode.Week
              ? 80
              : 120
          }
          rowHeight={36}
          headerHeight={50}
          ganttHeight={Math.min(600, ganttTasks.length * 36 + 80)}
        />
        </div>
      </div>

      {/* Legend */}
      <div className="glass-medium rounded-2xl p-4 border border-white/10">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(107, 114, 128, 0.8)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}></div>
            <span className="text-text-secondary">To Do</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(128, 152, 249, 0.85)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}></div>
            <span className="text-text-secondary">In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(16, 185, 129, 0.85)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}></div>
            <span className="text-text-secondary">Done</span>
          </div>
        </div>
      </div>
    </div>
  );
}

