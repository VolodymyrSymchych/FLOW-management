'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { AddTaskModal } from '@/components/AddTaskModal';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type CalEvent = {
  id: string;
  title: string;
  date: Date;
  color: string;
  type?: string;
};

// Demo events
const DEMO_EVENTS: CalEvent[] = [
  { id: '1', title: 'Design review', date: new Date(2026, 2, 2), color: '#E8753A', type: 'Meeting' },
  { id: '2', title: 'Sprint planning', date: new Date(2026, 2, 2), color: '#2E5DA8', type: 'Sprint' },
  { id: '3', title: 'Client call', date: new Date(2026, 2, 3), color: '#3D7A5A', type: 'Call' },
  { id: '4', title: 'Brand Identity deadline', date: new Date(2026, 2, 5), color: '#E8753A', type: 'Deadline' },
  { id: '5', title: 'Design System review', date: new Date(2026, 2, 8), color: '#6941C6', type: 'Review' },
];

export default function CalendarPage() {
  const [viewDate, setViewDate] = useState(new Date(2026, 2, 1)); // March 2026
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedDateForNewTask, setSelectedDateForNewTask] = useState<Date | undefined>(undefined);

  const handleAddTask = (date?: Date) => {
    setSelectedDateForNewTask(date);
    setIsAddTaskModalOpen(true);
  };

  const getWeekNum = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const { weeks, monthName, year } = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const startOffset = (first.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = last.getDate();
    const prevMonthDays = new Date(y, m, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];
    for (let i = 0; i < startOffset; i++) {
      const d = prevMonthDays - startOffset + i + 1;
      days.push({ date: new Date(y, m - 1, d), isCurrentMonth: false, isToday: false });
    }
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: today.getDate() === d && today.getMonth() === m && today.getFullYear() === y,
      });
    }
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(y, m + 1, d), isCurrentMonth: false, isToday: false });
    }

    const weeks: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

    return {
      weeks,
      monthName: viewDate.toLocaleString('en-US', { month: 'long' }),
      year: y,
    };
  }, [viewDate]);

  const todayEvents = useMemo(() => {
    const today = new Date();
    return DEMO_EVENTS.filter(
      (e) =>
        e.date.getDate() === today.getDate() &&
        e.date.getMonth() === today.getMonth() &&
        e.date.getFullYear() === today.getFullYear()
    );
  }, []);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return [...DEMO_EVENTS]
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 10);
  }, []);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    DEMO_EVENTS.forEach((e) => {
      const key = `${e.date.getFullYear()}-${e.date.getMonth()}-${e.date.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, []);

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));
  const goToday = () => setViewDate(new Date());

  const today = new Date();
  const dayNum = today.getDate();
  const dayName = today.toLocaleString('en-US', { weekday: 'long', month: 'long', year: 'numeric' });

  return (
    <div className="scr-inner" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--line)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={prevMonth} className="ib" style={{ width: 32, height: 32 }}>
            <ChevronLeft style={{ width: 14, height: 14 }} />
          </button>
          <button type="button" onClick={nextMonth} className="ib" style={{ width: 32, height: 32 }}>
            <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
          <span style={{ fontFamily: 'var(--font-inter), Inter', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>
            {monthName} {year}
          </span>
          <button type="button" onClick={goToday} className="btn btn-ghost" style={{ marginLeft: 8, padding: '4px 10px', fontSize: 13 }}>
            Today
          </button>
          <button
            type="button"
            onClick={() => handleAddTask()}
            className="flex items-center space-x-1 px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all active:scale-95 ml-4"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>
      <div className="cal-wrap" style={{ flex: 1, minHeight: 0 }}>
        <div className="cal-main">
          <div className="cal-hd-row">
            <div className="cal-wk-hd">W</div>
            {DAYS.map((d) => (
              <div key={d} className={`cal-day-hd ${d === 'Sat' || d === 'Sun' ? 'weekend' : ''}`}>
                {d}
              </div>
            ))}
          </div>
          <div className="cal-grid">
            {weeks.flatMap((week, wi) => [
              <div key={`wn-${wi}`} className="cal-wk-num">
                {getWeekNum(week[0].date)}
              </div>,
              ...week.map((cell, di) => {
                const key = `${wi}-${di}`;
                const dateKey = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;
                const events = cell.isCurrentMonth ? (eventsByDate.get(dateKey) || []) : [];
                const isWeekend = di >= 5;
                return (
                  <div
                    key={key}
                    className={`cal-cell ${cell.isToday ? 'today-col' : ''} ${isWeekend ? 'weekend-col' : ''} ${!cell.isCurrentMonth ? 'other-month' : ''}`}
                  >
                    <div
                      className={`cal-day-num ${cell.isToday ? 'today' : ''} ${!cell.isCurrentMonth ? 'other-month' : ''}`}
                    >
                      {cell.date.getDate()}
                    </div>
                    {events.slice(0, 3).map((e) => (
                      <div
                        key={e.id}
                        className="cal-event"
                        style={{ color: e.color }}
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    ))}
                    {events.length > 3 && (
                      <div className="cal-more">+{events.length - 3} more</div>
                    )}
                  </div>
                );
              }),
            ])}
          </div>
        </div>

        <aside className="cal-sb">
          <div className="cal-sb-today">
            <div className="cal-sb-day-big" id="calSbDay">
              {dayNum}
            </div>
            <div className="cal-sb-day-name" id="calSbDayName">
              {dayName}
            </div>
            <div className="cal-sb-today-evts" id="calSbTodayEvts">
              {todayEvents.length > 0 ? (
                todayEvents.map((e) => (
                  <div key={e.id} className="cal-sb-evt">
                    <div className="cal-sb-evt-dot" style={{ background: e.color }} />
                    <div>
                      <div className="cal-sb-evt-name">{e.title}</div>
                      {e.type && (
                        <div className="cal-sb-evt-type">{e.type}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="cal-sb-today-lbl">No events today</div>
              )}
            </div>
          </div>
          <div className="cal-sb-upcoming">
            <div className="cal-sb-up-lbl">Upcoming</div>
            <div id="agendaList">
              {upcomingEvents.map((e) => (
                <div key={e.id} className="cal-sb-row">
                  <div className="cal-sb-row-dot" style={{ background: e.color }} />
                  <div>
                    <div className="cal-sb-row-text">{e.title}</div>
                    <span className="cal-sb-row-tag" style={{ background: 'var(--bg2)', color: 'var(--faint)' }}>
                      {e.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {e.type ? ` · ${e.type}` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSave={() => {
          // Trigger refresh logic here if needed for real data integration
        }}
        initialDate={selectedDateForNewTask}
      />
    </div>
  );
}
