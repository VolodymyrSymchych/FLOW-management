'use client';

import { useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

const CAT = {
    d: { label: 'Design',      color: 'bg-violet-500' },
    v: { label: 'Development', color: 'bg-orange-500' },
    m: { label: 'Meetings',    color: 'bg-blue-500'   },
    a: { label: 'Admin',       color: 'bg-yellow-500' },
    r: { label: 'Code Review', color: 'bg-emerald-500'},
    b: { label: 'Break',       color: 'bg-gray-400'   },
} as const;
type C = keyof typeof CAT;

type Block = { col: number; span: number; c: C; t?: string };
type Row   = { n: string; lbl: string; total: string; blocks: Block[] };

const COLS = 10;

const ROWS: Row[] = [
    { n:'1',  lbl:'Wed', total:'7h52m', blocks:[{col:0,span:3,c:'d',t:'UI mockups'},{col:3,span:4,c:'v',t:'Design system updates'},{col:7,span:2,c:'d',t:'UI mockups'},{col:9,span:1,c:'a'}]},
    { n:'2',  lbl:'Thu', total:'3h29m', blocks:[{col:0,span:2,c:'m',t:'Client call'},{col:3,span:3,c:'v',t:'Feature implementation'},{col:6,span:2,c:'d',t:'UI mockups'}]},
    { n:'3',  lbl:'Fri', total:'6h26m', blocks:[{col:0,span:2,c:'d',t:'UI mockups'},{col:3,span:5,c:'d',t:'UI mockups'},{col:8,span:2,c:'a'}]},
    { n:'4',  lbl:'Sat', total:'—',     blocks:[]},
    { n:'5',  lbl:'Sun', total:'—',     blocks:[]},
    { n:'6',  lbl:'Mon', total:'3h50m', blocks:[{col:0,span:2,c:'a',t:'Sprint planning'},{col:2,span:4,c:'v'},{col:6,span:2,c:'b'}]},
    { n:'7',  lbl:'Tue', total:'3h41m', blocks:[{col:3,span:3,c:'d',t:'UI mockups'},{col:6,span:2,c:'a'}]},
    { n:'8',  lbl:'Wed', total:'5h34m', blocks:[{col:0,span:1,c:'a'},{col:1,span:3,c:'v',t:'Design system updates'},{col:4,span:2,c:'m',t:'Client call'},{col:6,span:2,c:'r'},{col:8,span:2,c:'m',t:'Client call'}]},
    { n:'9',  lbl:'Thu', total:'8h47m', blocks:[{col:0,span:3,c:'v',t:'Design system updates'},{col:3,span:1,c:'a'},{col:4,span:2,c:'d'},{col:6,span:2,c:'d',t:'UI mockups'},{col:8,span:2,c:'v',t:'Feature implementation'}]},
    { n:'10', lbl:'Fri', total:'5h35m', blocks:[{col:0,span:3,c:'d',t:'UI mockups'},{col:3,span:3,c:'v'},{col:6,span:3,c:'v',t:'Design system updates'},{col:9,span:1,c:'a'}]},
    { n:'11', lbl:'Sat', total:'—',     blocks:[]},
    { n:'12', lbl:'Sun', total:'—',     blocks:[]},
    { n:'13', lbl:'Mon', total:'3h55m', blocks:[{col:0,span:2,c:'b'},{col:2,span:1,c:'a'},{col:3,span:3,c:'v',t:'Feature implementation'},{col:6,span:2,c:'d'},{col:8,span:1,c:'a'}]},
    { n:'14', lbl:'Tue', total:'8h25m', blocks:[{col:0,span:2,c:'b'},{col:2,span:2,c:'v'},{col:4,span:2,c:'m',t:'Bug fixes'},{col:6,span:2,c:'d',t:'UI mockups'},{col:8,span:2,c:'d',t:'UI mockups'}]},
    { n:'15', lbl:'Wed', total:'7h24m', blocks:[{col:0,span:2,c:'b'},{col:2,span:2,c:'r',t:'PR review'},{col:4,span:1,c:'d'},{col:5,span:3,c:'v',t:'Design system updates'},{col:8,span:2,c:'r',t:'PR review'}]},
    { n:'16', lbl:'Thu', total:'4h35m', blocks:[{col:1,span:2,c:'d',t:'UI mockups'},{col:3,span:4,c:'v'},{col:7,span:2,c:'a'}]},
    { n:'17', lbl:'Fri', total:'7h57m', blocks:[{col:0,span:3,c:'d',t:'UI mockups'},{col:3,span:1,c:'a'},{col:4,span:3,c:'v',t:'Feature implementation'},{col:7,span:3,c:'v',t:'Design system updates'}]},
    { n:'18', lbl:'Sat', total:'—',     blocks:[]},
    { n:'19', lbl:'Sun', total:'—',     blocks:[]},
    { n:'20', lbl:'Mon', total:'3h33m', blocks:[{col:0,span:2,c:'a',t:'Sprint planning'},{col:3,span:4,c:'v',t:'Documentation'},{col:7,span:2,c:'d'}]},
    { n:'21', lbl:'Tue', total:'3h8m',  blocks:[{col:1,span:2,c:'v'},{col:3,span:2,c:'d'},{col:5,span:2,c:'b'},{col:7,span:2,c:'a'}]},
    { n:'22', lbl:'Wed', total:'7h7m',  blocks:[{col:0,span:2,c:'m',t:'Bug fixes'},{col:2,span:4,c:'d',t:'UI mockups'},{col:6,span:1,c:'a'},{col:7,span:3,c:'m',t:'Bug fixes'}]},
    { n:'23', lbl:'Thu', total:'5h50m', blocks:[{col:0,span:2,c:'m',t:'Bug fixes'},{col:2,span:3,c:'v',t:'Feature implementation'},{col:5,span:3,c:'a',t:'Sprint planning'},{col:8,span:2,c:'b'}]},
    { n:'24', lbl:'Fri', total:'6h29m', blocks:[{col:0,span:2,c:'r',t:'PR review'},{col:2,span:3,c:'v',t:'Feature implementation'},{col:5,span:3,c:'d',t:'Documentation'},{col:8,span:2,c:'m',t:'Client call'}]},
    { n:'25', lbl:'Sat', total:'—',     blocks:[]},
    { n:'26', lbl:'Sun', total:'—',     blocks:[]},
    { n:'27', lbl:'Mon', total:'2h55m', blocks:[{col:0,span:3,c:'d',t:'UI mockups'},{col:3,span:2,c:'b'},{col:5,span:2,c:'a'},{col:7,span:1,c:'v'}]},
    { n:'28', lbl:'Tue', total:'4h55m', blocks:[{col:0,span:3,c:'v',t:'Feature implementation'},{col:3,span:4,c:'d',t:'UI mockups'},{col:7,span:1,c:'b'}]},
    { n:'29', lbl:'Wed', total:'2h56m', blocks:[{col:0,span:2,c:'a'},{col:2,span:3,c:'b'},{col:5,span:2,c:'d'},{col:7,span:2,c:'r'}]},
    { n:'30', lbl:'Thu', total:'5h34m', blocks:[{col:0,span:4,c:'d',t:'UI mockups'},{col:4,span:3,c:'v',t:'Documentation'},{col:7,span:3,c:'v',t:'Feature implementation'}]},
];

const HOURS = ['08','09','10','11','12','13','14','15','16','17'];

const PRICING_MODELS = ['Fixed fee', 'Retainer', 'Hourly'] as const;
type PricingModel = typeof PRICING_MODELS[number];

export function TimesheetsTab() {
    const [hoveredCol, setHoveredCol] = useState<number | null>(null);
    const [pricingModel, setPricingModel] = useState<PricingModel>('Hourly');
    const [pricingOpen, setPricingOpen] = useState(false);
    return (
        <div className="flex h-full overflow-hidden bg-gray-50 dark:bg-[#111111]">
            {/* Main timeline */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-[#1A1A1A]">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">AK</div>
                    <span className="text-[10px] font-semibold text-gray-800 dark:text-white">Artem Kovalenko</span>
                    <div className="flex items-center gap-0.5 ml-1">
                        <ChevronLeft className="h-2.5 w-2.5 text-gray-400 dark:text-white/40" />
                        <span className="text-[10px] font-bold text-gray-800 dark:text-white">2026</span>
                        <ChevronRight className="h-2.5 w-2.5 text-gray-400 dark:text-white/40" />
                    </div>
                    <div className="flex items-center gap-0.5">
                        <ChevronLeft className="h-2.5 w-2.5 text-gray-400 dark:text-white/40" />
                        <span className="text-[10px] text-gray-600 dark:text-white/70">April</span>
                        <ChevronRight className="h-2.5 w-2.5 text-gray-400 dark:text-white/40" />
                    </div>
                    <button type="button" className="rounded-full border border-orange-500 px-2 py-0.5 text-[9px] font-semibold text-orange-500 dark:text-orange-400">
                        Today
                    </button>
                    <RefreshCw className="h-2.5 w-2.5 text-gray-300 dark:text-white/30" />
                    <div className="ml-auto relative">
                        <button
                            type="button"
                            onClick={() => setPricingOpen(o => !o)}
                            className="flex items-center gap-1 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold text-gray-600 dark:text-white/60 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                        >
                            <span>{pricingModel}</span>
                            <ChevronRight className={`h-2 w-2 text-gray-400 dark:text-white/30 transition-transform duration-150 ${pricingOpen ? 'rotate-90' : ''}`} />
                        </button>
                        {pricingOpen && (
                            <div className="absolute right-0 top-full mt-1 z-50 w-[88px] rounded-lg border border-gray-100 dark:border-white/10 bg-white dark:bg-[#222] shadow-lg overflow-hidden">
                                {PRICING_MODELS.map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => { setPricingModel(m); setPricingOpen(false); }}
                                        className={`w-full px-2.5 py-1.5 text-left text-[9px] font-medium flex items-center justify-between transition-colors ${
                                            m === pricingModel
                                                ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400'
                                                : 'text-gray-600 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        {m}
                                        {m === pricingModel && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 dark:bg-orange-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Column headers */}
                <div className="flex flex-shrink-0 border-b border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-[#1A1A1A] overflow-visible">
                    <div className="w-14 flex-shrink-0 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-gray-400 dark:text-white/40">DAY</div>
                    <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
                        {HOURS.map((d, i) => (
                            <div
                                key={d}
                                className="relative py-1 text-center cursor-pointer select-none group"
                                onMouseEnter={() => setHoveredCol(i)}
                                onMouseLeave={() => setHoveredCol(null)}
                            >
                                <span className={`text-[9px] font-bold transition-colors duration-100 ${hoveredCol === i ? 'text-orange-500 dark:text-orange-400' : 'text-gray-500 dark:text-white/40'}`}>{d}</span>
                                {/* Tooltip */}
                                <div className="pointer-events-none absolute top-full left-1/2 z-50 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                    <div className="bg-gray-900 dark:bg-gray-700 text-white text-[7px] font-semibold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap">
                                        {d}:00 – {String(parseInt(d) + 1).padStart(2, '0')}:00
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="w-11 flex-shrink-0 py-1 pr-1 text-right text-[8px] font-bold uppercase tracking-wider text-gray-400 dark:text-white/40">TOTAL</div>
                </div>

                {/* Scrollable rows */}
                <div className="flex-1 overflow-y-auto">
                    {ROWS.map((row) => {
                        const isWeekend = row.lbl === 'Sat' || row.lbl === 'Sun';
                        return (
                            <div
                                key={row.n}
                                className={`flex items-center border-b border-gray-100 dark:border-white/[0.06] ${isWeekend ? 'bg-gray-100/60 dark:bg-white/[0.02]' : ''}`}
                                style={{ height: 20 }}
                            >
                                {/* Day */}
                                <div className="flex w-14 flex-shrink-0 items-center gap-1.5 px-2">
                                    <span className={`w-3.5 text-right text-[9px] font-bold ${row.n === '22' ? 'text-orange-500' : 'text-gray-700 dark:text-white/70'}`}>{row.n}</span>
                                    <span className="text-[8px] text-gray-400 dark:text-white/30">{row.lbl}</span>
                                </div>

                                {/* Gantt area */}
                                <div className="relative flex-1" style={{ height: 14 }}>
                                    {/* Grid lines */}
                                    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
                                        {Array.from({ length: COLS }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`border-l border-gray-100 dark:border-white/[0.04] transition-colors duration-100 ${hoveredCol === i ? 'bg-orange-500/[0.06] dark:bg-orange-400/[0.08]' : ''}`}
                                            />
                                        ))}
                                    </div>
                                    {/* Blocks */}
                                    {row.blocks.map((b, bi) => (
                                        <div
                                            key={bi}
                                            className={`absolute inset-y-0 flex items-center overflow-hidden rounded-[2px] ${CAT[b.c].color}`}
                                            style={{
                                                left: `calc(${(b.col / COLS) * 100}% + 1px)`,
                                                width: `calc(${(b.span / COLS) * 100}% - 2px)`,
                                            }}
                                        >
                                            {b.t && (
                                                <span className="truncate px-1 text-[7px] font-semibold leading-none text-white">{b.t}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <div className="w-11 flex-shrink-0 pr-1.5 text-right">
                                    <span className={`text-[8px] font-semibold ${row.total === '—' ? 'text-gray-300 dark:text-white/20' : 'text-gray-600 dark:text-white/60'}`}>{row.total}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right panel */}
            <div className="flex w-[128px] flex-shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-white dark:border-white/10 dark:bg-[#1A1A1A]">
                {/* Header block */}
                <div className="px-3 pt-3 pb-2.5 border-b border-gray-100 dark:border-white/[0.06]">
                    <p className="text-[7.5px] font-semibold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-1">April 2026</p>
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-[15px] font-black leading-none text-gray-900 dark:text-white">120h</span>
                        <span className="text-[10px] font-medium leading-none text-gray-400 dark:text-white/25 ml-0.5">/ 176h</span>
                    </div>
                    <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                        <div className="h-full rounded-full bg-orange-500" style={{ width: '68%' }} />
                    </div>
                </div>

                {/* Logged / Diff */}
                <div className="grid grid-cols-2 border-b border-gray-100 dark:border-white/[0.06]">
                    <div className="px-3 py-2 border-r border-gray-100 dark:border-white/[0.06]">
                        <p className="text-[7px] font-medium text-gray-400 dark:text-white/30 mb-0.5">Logged</p>
                        <p className="text-[11px] font-black leading-none text-gray-800 dark:text-white">
                            22<span className="text-[7.5px] font-medium text-gray-400 dark:text-white/25">/22</span>
                        </p>
                    </div>
                    <div className="px-3 py-2">
                        <p className="text-[7px] font-medium text-gray-400 dark:text-white/30 mb-0.5">Diff</p>
                        <p className="text-[11px] font-black leading-none text-rose-500 dark:text-rose-400">-56h</p>
                    </div>
                </div>

                {/* Categories */}
                <div className="px-3 pt-2.5 pb-2 border-b border-gray-100 dark:border-white/[0.06]">
                    <p className="mb-1.5 text-[7px] font-semibold uppercase tracking-widest text-gray-400 dark:text-white/30">Categories</p>
                    <div className="space-y-[5px]">
                        {([
                            ['d','43.8h',43.8],['v','27.3h',27.3],['m','18.8h',18.8],
                            ['a','16.4h',16.4],['r','8h',8],['b','5.6h',5.6],
                        ] as [C,string,number][]).map(([c, h, pct]) => (
                            <div key={c}>
                                <div className="flex items-center justify-between mb-[2px]">
                                    <div className="flex items-center gap-1 min-w-0">
                                        <span className={`h-[5px] w-[5px] flex-shrink-0 rounded-full ${CAT[c].color}`} />
                                        <span className="truncate text-[7.5px] text-gray-500 dark:text-white/45">{CAT[c].label}</span>
                                    </div>
                                    <span className="text-[7.5px] font-semibold text-gray-600 dark:text-white/60 ml-1 flex-shrink-0">{h}</span>
                                </div>
                                <div className="h-[2px] w-full rounded-full bg-gray-100 dark:bg-white/[0.07]">
                                    <div className={`h-full rounded-full ${CAT[c].color} opacity-70`} style={{ width: `${(pct / 43.8) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Averages */}
                <div className="px-3 pt-2.5 pb-3">
                    <p className="mb-1.5 text-[7px] font-semibold uppercase tracking-widest text-gray-400 dark:text-white/30">Averages</p>
                    <div className="space-y-[5px]">
                        {[['Avg / work day','5.5h'],['Avg / cal. day','4.0h'],['Billable rate','83%']].map(([l,v]) => (
                            <div key={l} className="flex items-center justify-between">
                                <span className="text-[7px] text-gray-400 dark:text-white/35">{l}</span>
                                <span className="text-[7.5px] font-bold text-gray-700 dark:text-white/65">{v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
