'use client';

import { useState, useMemo, useCallback, type MouseEvent } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Plus, Layers, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TimesheetCategory = 'development' | 'design' | 'meetings' | 'code-review' | 'admin' | 'break';

interface TimesheetBlock {
  id: string;
  start: number;
  end: number;
  category: TimesheetCategory;
  label: string;
  color: string;
}

interface TimesheetDayRow {
  date: Date;
  dayOfWeek: string;
  dayOfMonth: number;
  isWeekend: boolean;
  isToday: boolean;
  blocks: TimesheetBlock[];
  dailyTotal: number;
}

interface TimesheetCategoryTotal {
  category: TimesheetCategory;
  label: string;
  color: string;
  hours: number;
}

interface TimesheetMonthSummary {
  totalWorked: number;
  targetHours: number;
  difference: number;
  workingDays: number;
  loggedDays: number;
  categories: TimesheetCategoryTotal[];
}

interface TooltipData {
  x: number;
  y: number;
  block: TimesheetBlock;
}

type HourPreset = 'work' | 'extended' | 'full';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HOUR_PRESETS: { key: HourPreset; label: string; start: number; end: number }[] = [
  { key: 'work', label: '8 – 18', start: 8, end: 18 },
  { key: 'extended', label: '6 – 22', start: 6, end: 22 },
  { key: 'full', label: '0 – 24', start: 0, end: 24 },
];

const CATEGORY_META: Record<TimesheetCategory, { label: string; color: string }> = {
  development:   { label: 'Development',  color: '#E8753A' },
  design:        { label: 'Design',       color: '#6941C6' },
  meetings:      { label: 'Meetings',     color: '#2E5DA8' },
  'code-review': { label: 'Code Review',  color: '#3D7A5A' },
  admin:         { label: 'Admin',        color: '#B8870A' },
  break:         { label: 'Break',        color: '#9A9A94' },
};

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const DAY_ABBR = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ---------------------------------------------------------------------------
// Mock data — deterministic per (year, month)
// ---------------------------------------------------------------------------

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateMockBlocks(year: number, month: number): Map<string, TimesheetBlock[]> {
  const rand = seededRandom(year * 100 + month + 7);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const map = new Map<string, TimesheetBlock[]>();

  const templates: { category: TimesheetCategory; label: string; durationRange: [number, number] }[] = [
    { category: 'development', label: 'Feature implementation', durationRange: [1.5, 3.5] },
    { category: 'development', label: 'Bug fixes', durationRange: [1, 2] },
    { category: 'design', label: 'UI mockups', durationRange: [1.5, 3] },
    { category: 'design', label: 'Design system updates', durationRange: [1, 2] },
    { category: 'meetings', label: 'Stand-up', durationRange: [0.25, 0.5] },
    { category: 'meetings', label: 'Sprint planning', durationRange: [1, 2] },
    { category: 'meetings', label: 'Client call', durationRange: [0.5, 1.5] },
    { category: 'code-review', label: 'PR review', durationRange: [0.5, 1.5] },
    { category: 'admin', label: 'Documentation', durationRange: [0.5, 1.5] },
    { category: 'admin', label: 'Email & Slack', durationRange: [0.25, 0.75] },
    { category: 'break', label: 'Lunch', durationRange: [0.5, 1] },
  ];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue;

    const dayBlocks: TimesheetBlock[] = [];
    let cursor = 8.5 + rand() * 0.5;

    const numBlocks = 3 + Math.floor(rand() * 4);
    for (let b = 0; b < numBlocks && cursor < 18; b++) {
      const tmpl = templates[Math.floor(rand() * templates.length)];
      const duration = +(tmpl.durationRange[0] + rand() * (tmpl.durationRange[1] - tmpl.durationRange[0])).toFixed(2);
      const end = Math.min(cursor + duration, 19);

      dayBlocks.push({
        id: `${year}-${month}-${d}-${b}`,
        start: +cursor.toFixed(2),
        end: +end.toFixed(2),
        category: tmpl.category,
        label: tmpl.label,
        color: CATEGORY_META[tmpl.category].color,
      });

      cursor = end + 0.25 + rand() * 0.25;
    }

    map.set(`${year}-${month}-${d}`, dayBlocks);
  }

  return map;
}

function buildMonthRows(year: number, month: number, blockMap: Map<string, TimesheetBlock[]>): TimesheetDayRow[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const rows: TimesheetDayRow[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    const blocks = blockMap.get(`${year}-${month}-${d}`) ?? [];
    const dailyTotal = blocks.reduce((sum, b) => sum + (b.end - b.start), 0);

    rows.push({
      date,
      dayOfWeek: DAY_ABBR[dow],
      dayOfMonth: d,
      isWeekend: dow === 0 || dow === 6,
      isToday: date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear(),
      blocks,
      dailyTotal: +dailyTotal.toFixed(2),
    });
  }

  return rows;
}

function buildSummary(rows: TimesheetDayRow[]): TimesheetMonthSummary {
  const catMap = new Map<TimesheetCategory, number>();
  let totalWorked = 0;
  let loggedDays = 0;
  const workingDays = rows.filter(r => !r.isWeekend).length;

  for (const row of rows) {
    if (row.dailyTotal > 0) loggedDays++;
    totalWorked += row.dailyTotal;
    for (const b of row.blocks) {
      catMap.set(b.category, (catMap.get(b.category) ?? 0) + (b.end - b.start));
    }
  }

  const categories: TimesheetCategoryTotal[] = [];
  for (const [cat, hours] of catMap.entries()) {
    const meta = CATEGORY_META[cat];
    categories.push({ category: cat, label: meta.label, color: meta.color, hours: +hours.toFixed(1) });
  }
  categories.sort((a, b) => b.hours - a.hours);

  const targetHours = workingDays * 8;

  return {
    totalWorked: +totalWorked.toFixed(1),
    targetHours,
    difference: +(totalWorked - targetHours).toFixed(1),
    workingDays,
    loggedDays,
    categories,
  };
}

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

function fmtHour(h: number): string {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
}

function fmtDuration(h: number): string {
  if (h === 0) return '—';
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  if (hh === 0) return `${mm}m`;
  if (mm === 0) return `${hh}h`;
  return `${hh}h${mm}m`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TimesheetsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [refreshKey, setRefreshKey] = useState(0);
  const [hourPreset, setHourPreset] = useState<HourPreset>('work');
  const [editBlock, setEditBlock] = useState<{ block: TimesheetBlock; row: TimesheetDayRow } | null>(null);
  const [tip, setTip] = useState<TooltipData | null>(null);

  const preset = HOUR_PRESETS.find(p => p.key === hourPreset)!;
  const visibleHours = useMemo(
    () => Array.from({ length: preset.end - preset.start }, (_, i) => preset.start + i),
    [preset],
  );

  const goCurrentMonth = useCallback(() => { const t = new Date(); setYear(t.getFullYear()); setMonth(t.getMonth()); }, []);
  const prevMonth = useCallback(() => { setMonth(prev => { if (prev === 0) { setYear(y => y - 1); return 11; } return prev - 1; }); }, []);
  const nextMonth = useCallback(() => { setMonth(prev => { if (prev === 11) { setYear(y => y + 1); return 0; } return prev + 1; }); }, []);

  const blockMap = useMemo(() => generateMockBlocks(year, month), [year, month]);
  const rows = useMemo(() => buildMonthRows(year, month, blockMap), [year, month, blockMap]);
  const summary = useMemo(() => buildSummary(rows), [rows]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = refreshKey;

  const percentUsed = summary.targetHours > 0 ? Math.min((summary.totalWorked / summary.targetHours) * 100, 100) : 0;
  const dayCount = rows.length;

  const handleBlockHover = useCallback((e: MouseEvent, block: TimesheetBlock) => {
    setTip({ x: e.clientX, y: e.clientY, block });
  }, []);

  const handleBlockLeave = useCallback(() => setTip(null), []);

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center gap-2 border-b px-4 py-1.5 flex-shrink-0"
        style={{ borderColor: 'var(--line)', background: 'hsl(var(--surface))' }}
      >
        <div className="flex items-center gap-2 mr-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[0.6rem] font-semibold text-white">AK</div>
          <span className="text-xs font-medium text-text-primary">Artem Kovalenko</span>
        </div>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center">
          <button type="button" onClick={() => setYear(y => y - 1)} className="grid h-6 w-6 place-items-center rounded text-text-secondary hover:bg-surface-muted transition-colors"><ChevronLeft className="h-3 w-3" /></button>
          <span className="w-10 text-center text-xs font-semibold text-text-primary tabular-nums">{year}</span>
          <button type="button" onClick={() => setYear(y => y + 1)} className="grid h-6 w-6 place-items-center rounded text-text-secondary hover:bg-surface-muted transition-colors"><ChevronRight className="h-3 w-3" /></button>
        </div>

        <div className="flex items-center">
          <button type="button" onClick={prevMonth} className="grid h-6 w-6 place-items-center rounded text-text-secondary hover:bg-surface-muted transition-colors"><ChevronLeft className="h-3 w-3" /></button>
          <span className="w-[4.5rem] text-center text-xs font-semibold text-text-primary">{MONTH_NAMES[month]}</span>
          <button type="button" onClick={nextMonth} className="grid h-6 w-6 place-items-center rounded text-text-secondary hover:bg-surface-muted transition-colors"><ChevronRight className="h-3 w-3" /></button>
        </div>

        <button type="button" onClick={goCurrentMonth} className="inline-flex h-6 items-center gap-1 rounded-md border border-border bg-surface-muted px-2 text-[0.625rem] font-medium text-text-primary hover:bg-surface transition-colors">
          <Calendar className="h-3 w-3" />Today
        </button>
        <button type="button" onClick={() => setRefreshKey(k => k + 1)} className="inline-flex h-6 items-center gap-1 rounded-md border border-border bg-surface-muted px-2 text-[0.625rem] font-medium text-text-primary hover:bg-surface transition-colors">
          <RefreshCw className="h-3 w-3" />Refresh
        </button>

        <div className="h-4 w-px bg-border" />

        <div className="inline-flex rounded-md border border-border bg-surface-muted p-0.5">
          {HOUR_PRESETS.map(p => (
            <button
              key={p.key}
              type="button"
              onClick={() => setHourPreset(p.key)}
              className={cn(
                'flex items-center gap-1 rounded px-2 py-0.5 text-[0.6rem] font-medium transition-colors',
                hourPreset === p.key ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary',
              )}
            >
              <Clock className="h-2.5 w-2.5" />{p.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <button type="button" disabled className="inline-flex h-6 items-center gap-1 rounded-md border border-primary-dark bg-primary px-2 text-[0.625rem] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] opacity-50 cursor-not-allowed" title="Coming soon">
          <Plus className="h-3 w-3" />Add
        </button>
        <button type="button" disabled className="inline-flex h-6 items-center gap-1 rounded-md border border-border bg-surface-muted px-2 text-[0.625rem] font-medium text-text-primary opacity-50 cursor-not-allowed" title="Coming soon">
          <Layers className="h-3 w-3" />Bulk
        </button>
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Grid ─────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-x-auto overflow-y-hidden">
          <div
            className="flex flex-col h-full"
            style={{ minWidth: Math.max(600, visibleHours.length * 44 + 82 + 50) }}
          >
            {/* Hour header — fixed height */}
            <div className="flex flex-shrink-0" style={{ background: 'hsl(var(--surface))' }}>
              <div className="flex-shrink-0 border-b border-r px-2 flex items-center" style={{ width: 82, borderColor: 'var(--line)', height: 22 }}>
                <span className="text-[0.55rem] font-medium uppercase tracking-wider text-text-tertiary">Day</span>
              </div>
              <div className="flex flex-1 border-b" style={{ borderColor: 'var(--line)', height: 22 }}>
                {visibleHours.map(h => (
                  <div key={h} className="flex-1 border-r flex items-center justify-center text-[0.55rem] font-medium tabular-nums text-text-secondary" style={{ borderColor: 'var(--line)', minWidth: 28 }}>
                    {h.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
              <div className="flex-shrink-0 border-b border-l flex items-center justify-center" style={{ width: 50, borderColor: 'var(--line)', height: 22 }}>
                <span className="text-[0.55rem] font-medium uppercase tracking-wider text-text-tertiary">Total</span>
              </div>
            </div>

            {/* Day rows — fill remaining height with CSS grid 1fr per day */}
            <div
              className="flex-1 min-h-0 grid"
              style={{ gridTemplateRows: `repeat(${dayCount}, 1fr)` }}
            >
              {rows.map(row => (
                <DayRow
                  key={row.dayOfMonth}
                  row={row}
                  visibleStart={preset.start}
                  visibleEnd={preset.end}
                  visibleHours={visibleHours}
                  onDoubleClickBlock={(block) => setEditBlock({ block, row })}
                  onBlockHover={handleBlockHover}
                  onBlockLeave={handleBlockLeave}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Right rail ────────────────────────────────────── */}
        <aside
          className="hidden lg:flex flex-col flex-shrink-0 border-l overflow-y-auto"
          style={{ width: 250, borderColor: 'var(--line)', background: 'hsl(var(--surface))' }}
        >
          <div className="border-b p-4" style={{ borderColor: 'var(--line)' }}>
            <h3 className="mb-3 text-[0.6rem] font-medium uppercase tracking-wider text-text-tertiary">{MONTH_NAMES[month]} {year}</h3>
            <div className="mb-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold tabular-nums text-text-primary">{summary.totalWorked}h</span>
                <span className="text-[0.65rem] text-text-tertiary">/ {summary.targetHours}h</span>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-surface-muted overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentUsed}%`, background: 'hsl(var(--primary))' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-border p-2">
                <div className="text-[0.55rem] font-medium uppercase tracking-wider text-text-tertiary mb-0.5">Logged days</div>
                <div className="text-base font-bold tabular-nums text-text-primary">{summary.loggedDays}<span className="text-[0.65rem] font-normal text-text-tertiary">/{summary.workingDays}</span></div>
              </div>
              <div className="rounded-md border border-border p-2">
                <div className="text-[0.55rem] font-medium uppercase tracking-wider text-text-tertiary mb-0.5">Difference</div>
                <div className={cn('text-base font-bold tabular-nums', summary.difference >= 0 ? 'text-success' : 'text-danger')}>
                  {summary.difference >= 0 ? '+' : ''}{summary.difference}h
                </div>
              </div>
            </div>
          </div>

          <div className="border-b p-4" style={{ borderColor: 'var(--line)' }}>
            <h3 className="mb-2 text-[0.6rem] font-medium uppercase tracking-wider text-text-tertiary">Categories</h3>
            <div className="space-y-2">
              {summary.categories.map(cat => {
                const pct = summary.totalWorked > 0 ? (cat.hours / summary.totalWorked) * 100 : 0;
                return (
                  <div key={cat.category}>
                    <div className="mb-0.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: cat.color }} />
                        <span className="text-[0.6875rem] font-medium text-text-primary">{cat.label}</span>
                      </div>
                      <span className="text-[0.6875rem] font-semibold tabular-nums text-text-secondary">{cat.hours}h</span>
                    </div>
                    <div className="h-0.5 rounded-full bg-surface-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4">
            <h3 className="mb-2 text-[0.6rem] font-medium uppercase tracking-wider text-text-tertiary">Averages</h3>
            <div className="space-y-1.5">
              {[
                ['Avg / work day', summary.loggedDays > 0 ? `${(summary.totalWorked / summary.loggedDays).toFixed(1)}h` : '—'],
                ['Avg / calendar day', rows.length > 0 ? `${(summary.totalWorked / rows.length).toFixed(1)}h` : '—'],
                ['Billable rate', '83%'],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[0.6875rem] text-text-secondary">{label}</span>
                  <span className="text-[0.8125rem] font-semibold tabular-nums text-text-primary">{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto border-t p-4" style={{ borderColor: 'var(--line)' }}>
            <h3 className="mb-1.5 text-[0.6rem] font-medium uppercase tracking-wider text-text-tertiary">Legend</h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <div key={key} className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: meta.color }} />
                  <span className="text-[0.6rem] text-text-tertiary">{meta.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Floating tooltip (follows cursor) ──────────────── */}
      {tip && (
        <div
          className="pointer-events-none fixed z-[100]"
          style={{ left: tip.x + 12, top: tip.y - 8, transform: 'translateY(-100%)' }}
        >
          <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs shadow-floating text-text-primary" style={{ background: 'hsl(var(--surface-elevated))' }}>
            <div className="font-semibold mb-0.5">{tip.block.label}</div>
            <div className="text-text-secondary">
              {fmtHour(tip.block.start)} – {fmtHour(tip.block.end)}
              <span className="ml-1.5 text-text-tertiary">({fmtDuration(tip.block.end - tip.block.start)})</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-text-tertiary">
              <span className="inline-block h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: tip.block.color }} />
              {CATEGORY_META[tip.block.category].label}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit dialog ───────────────────────────────────── */}
      <Dialog open={editBlock !== null} onOpenChange={(open) => { if (!open) setEditBlock(null); }}>
        <DialogContent className="max-w-md">
          {editBlock && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: editBlock.block.color }} />
                  {editBlock.block.label}
                </DialogTitle>
                <DialogDescription>
                  {editBlock.row.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-[0.6875rem] font-medium text-text-tertiary uppercase tracking-wider">Category</label>
                  <div className="flex items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-text-primary">
                    <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: editBlock.block.color }} />
                    {CATEGORY_META[editBlock.block.category].label}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[0.6875rem] font-medium text-text-tertiary uppercase tracking-wider">Duration</label>
                  <div className="rounded-md border border-border bg-surface-muted px-3 py-2 text-sm font-semibold tabular-nums text-text-primary">
                    {fmtDuration(editBlock.block.end - editBlock.block.start)}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[0.6875rem] font-medium text-text-tertiary uppercase tracking-wider">Start</label>
                  <div className="rounded-md border border-border bg-surface-muted px-3 py-2 text-sm tabular-nums text-text-primary">
                    {fmtHour(editBlock.block.start)}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[0.6875rem] font-medium text-text-tertiary uppercase tracking-wider">End</label>
                  <div className="rounded-md border border-border bg-surface-muted px-3 py-2 text-sm tabular-nums text-text-primary">
                    {fmtHour(editBlock.block.end)}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[0.6875rem] font-medium text-text-tertiary uppercase tracking-wider">Description</label>
                <div className="rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-text-secondary italic">
                  No description added yet.
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" size="sm" onClick={() => setEditBlock(null)}>Close</Button>
                <Button variant="primary" size="sm" disabled title="Coming soon">Save changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DayRow — each row stretches to 1fr of the parent grid
// ---------------------------------------------------------------------------

function DayRow({
  row,
  visibleStart,
  visibleEnd,
  visibleHours,
  onDoubleClickBlock,
  onBlockHover,
  onBlockLeave,
}: {
  row: TimesheetDayRow;
  visibleStart: number;
  visibleEnd: number;
  visibleHours: number[];
  onDoubleClickBlock: (block: TimesheetBlock) => void;
  onBlockHover: (e: MouseEvent, block: TimesheetBlock) => void;
  onBlockLeave: () => void;
}) {
  const range = visibleEnd - visibleStart;

  return (
    <div
      className={cn(
        'flex min-h-0',
        row.isToday && 'bg-accent-soft/40',
        row.isWeekend && !row.isToday && 'bg-surface-muted/30',
      )}
    >
      {/* Day label */}
      <div
        className="flex flex-shrink-0 items-center gap-1 border-b border-r px-1.5"
        style={{ width: 82, borderColor: 'var(--line)' }}
      >
        <span className={cn(
          'grid h-[1.15rem] w-[1.15rem] place-items-center rounded-full text-[0.55rem] font-semibold tabular-nums leading-none',
          row.isToday ? 'bg-primary text-white' : 'text-text-primary',
        )}>
          {row.dayOfMonth}
        </span>
        <span className={cn('text-[0.55rem] font-medium leading-none', row.isWeekend ? 'text-text-tertiary' : 'text-text-secondary')}>
          {row.dayOfWeek}
        </span>
      </div>

      {/* Hour cells + blocks */}
      <div className="relative flex flex-1 border-b min-h-0" style={{ borderColor: 'var(--line)' }}>
        {visibleHours.map(h => (
          <div key={h} className="flex-1 border-r" style={{ borderColor: 'var(--line)', minWidth: 28 }} />
        ))}

        {row.blocks.map(block => {
          const clampStart = Math.max(block.start, visibleStart);
          const clampEnd = Math.min(block.end, visibleEnd);
          if (clampStart >= clampEnd) return null;

          const leftPct = ((clampStart - visibleStart) / range) * 100;
          const widthPct = ((clampEnd - clampStart) / range) * 100;

          return (
            <div
              key={block.id}
              className="absolute top-[2px] bottom-[2px] rounded-[3px] flex items-center overflow-hidden cursor-pointer hover:brightness-110 active:brightness-95 transition-[filter]"
              style={{
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                backgroundColor: block.color,
                minWidth: 3,
              }}
              onMouseEnter={(e) => onBlockHover(e, block)}
              onMouseMove={(e) => onBlockHover(e, block)}
              onMouseLeave={onBlockLeave}
              onDoubleClick={() => onDoubleClickBlock(block)}
            >
              {(clampEnd - clampStart) >= 1.2 && (
                <span className="truncate px-1 text-[0.5rem] font-medium text-white/90 leading-none">
                  {block.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Daily total */}
      <div className="flex flex-shrink-0 items-center justify-center border-b border-l tabular-nums" style={{ width: 50, borderColor: 'var(--line)' }}>
        <span className={cn('text-[0.6rem] font-semibold', row.dailyTotal > 0 ? 'text-text-primary' : 'text-text-tertiary/40')}>
          {fmtDuration(row.dailyTotal)}
        </span>
      </div>
    </div>
  );
}
