import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderOpen,
  Sparkles,
  Target,
  Users,
  Zap,
} from 'lucide-react';

const metricCards = [
  { label: 'Focus rate', value: '84%', note: 'deep work blocks protected this week', tone: 'var(--accent)', bg: 'var(--acc-bg)', icon: Target },
  { label: 'Delivery rhythm', value: '12', note: 'client-facing milestones moving on time', tone: 'var(--sage)', bg: 'var(--sage-bg)', icon: CheckCircle2 },
  { label: 'Active rooms', value: '07', note: 'parallel workstreams with live updates', tone: 'var(--violet)', bg: 'var(--violet-bg)', icon: Users },
  { label: 'Signal health', value: '+19%', note: 'less drift, faster decisions, clearer owners', tone: 'var(--amber)', bg: 'var(--amber-bg)', icon: Activity },
];

const studioPulse = [
  { title: 'Launch sprint', progress: 78, tone: 'var(--accent)' },
  { title: 'Client handoff', progress: 61, tone: 'var(--sage)' },
  { title: 'Ops cleanup', progress: 42, tone: 'var(--violet)' },
];

const activityFeed = [
  { name: 'Nika', action: 'approved the kickoff deck', time: '5 min ago', tone: 'var(--accent)' },
  { name: 'Roman', action: 'moved onboarding to review', time: '18 min ago', tone: 'var(--sage)' },
  { name: 'Dasha', action: 'flagged budget drift in mobile', time: '43 min ago', tone: 'var(--amber)' },
  { name: 'Ira', action: 'closed four QA notes', time: '1 hr ago', tone: 'var(--violet)' },
];

const deliveryColumns = [
  {
    label: 'Plan',
    tone: 'var(--amber)',
    cards: ['Scope interview for Bloom', 'Pricing refresh outline', 'New workspace taxonomy'],
  },
  {
    label: 'Build',
    tone: 'var(--accent)',
    cards: ['Dashboard narrative mockup', 'Invoice automation states', 'Task timeline interactions'],
  },
  {
    label: 'Review',
    tone: 'var(--violet)',
    cards: ['Mobile nav polish', 'Team roles permissions', 'Portfolio case-study copy'],
  },
  {
    label: 'Ship',
    tone: 'var(--sage)',
    cards: ['Sprint summary export', 'Client approvals digest', 'Payments confirmation flow'],
  },
];

export default function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[1440px] h-full" data-testid="dashboard-mockup" style={{ padding: '20px 24px 32px', overflowY: 'auto' }}>
      <section className="surface-panel rounded-[24px] border p-5 md:p-6" style={{ background: 'var(--white)' }}>
        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ borderColor: 'var(--line)', background: 'var(--bg2)', color: 'var(--muted)' }}>
                <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                Dashboard preview
              </div>

              <div className="max-w-2xl space-y-3">
                <h1 className="app-display text-3xl font-semibold leading-[0.96] tracking-[-0.045em] md:text-5xl" style={{ color: 'var(--ink)' }}>
                  Dashboard in the same calm Flow style as the rest of the product.
                </h1>
                <p className="max-w-xl text-sm" style={{ color: 'var(--muted)' }}>
                  No visual noise, no landing-page gradients. Just the same warm surfaces, clear hierarchy, and lightweight overview blocks used across the app.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard/tasks" className="glass-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium">
                  Open tasks hub
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/dashboard/projects" className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium" style={{ borderColor: 'var(--line)', color: 'var(--ink)', background: 'var(--white)' }}>
                  Review projects
                  <FolderOpen className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MockPill label="Studio tempo" value="3 launches" hint="scheduled for the next 10 days" />
              <MockPill label="Protected focus" value="26 hrs" hint="without calendar collisions" />
              <MockPill label="Client confidence" value="9.4/10" hint="from the last review loop" />
            </div>
          </div>

          <div className="relative min-h-[320px]">
            <div className="surface-elevated h-full rounded-[22px] p-4" style={{ background: 'var(--white)' }}>
              <div className="flex h-full flex-col gap-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="app-eyebrow">Team snapshot</div>
                    <div className="mt-1.5 text-lg font-semibold" style={{ color: 'var(--ink)' }}>
                      Flow Overview Board
                    </div>
                  </div>
                  <div className="surface-accent rounded-2xl px-3 py-2 text-right">
                    <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>today</div>
                    <div className="text-lg font-semibold" style={{ color: 'var(--accent)' }}>08:45</div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[18px] border p-3.5" style={{ borderColor: 'var(--line)', background: 'var(--bg2)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="app-eyebrow">Sprint pulse</div>
                        <div className="mt-1.5 text-[1.75rem] font-semibold" style={{ color: 'var(--ink)' }}>76%</div>
                      </div>
                      <div className="animate-float rounded-[16px] px-2.5 py-2" style={{ background: 'var(--acc-bg)', color: 'var(--accent)' }}>
                        <BarChart3 className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2.5">
                      {studioPulse.map((item) => (
                        <div key={item.title}>
                          <div className="mb-1.5 flex items-center justify-between text-sm">
                            <span style={{ color: 'var(--text-secondary)' }}>{item.title}</span>
                            <span className="font-semibold" style={{ color: item.tone }}>{item.progress}%</span>
                          </div>
                          <div className="h-2.5 rounded-full" style={{ background: 'var(--bg2)' }}>
                            <div className="h-full rounded-full" style={{ width: `${item.progress}%`, background: item.tone }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="rounded-[18px] p-3.5" style={{ background: 'var(--sage-bg)', border: '1px solid rgba(61,122,90,0.14)' }}>
                      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--sage)' }}>
                        <CalendarDays className="h-4 w-4" />
                        Review cycle
                      </div>
                      <div className="mt-2.5 text-xl font-semibold" style={{ color: 'var(--ink)' }}>4 checkpoints</div>
                      <div className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>Clear visibility from brief to handoff.</div>
                    </div>

                    <div className="rounded-[18px] p-3.5" style={{ background: 'var(--violet-bg)', border: '1px solid rgba(105,65,198,0.14)' }}>
                      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--violet)' }}>
                        <Zap className="h-4 w-4" />
                        Automation lane
                      </div>
                      <div className="mt-3 flex items-end justify-between">
                        <div className="text-xl font-semibold" style={{ color: 'var(--ink)' }}>19 flows</div>
                        <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: 'var(--white)', color: 'var(--violet)' }}>
                          +6 this week
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {['Strategy', 'Delivery', 'Finance'].map((chip, index) => (
                    <div
                      key={chip}
                      className="rounded-2xl border px-4 py-3"
                      style={{
                        borderColor: 'var(--line)',
                        background: index === 0 ? 'var(--acc-bg)' : index === 1 ? 'var(--sage-bg)' : 'var(--violet-bg)',
                      }}
                    >
                      <div className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--muted)' }}>{chip}</div>
                      <div className="mt-2 text-sm font-medium" style={{ color: 'var(--ink)' }}>
                        {index === 0 ? 'Sharper prioritization' : index === 1 ? 'Cleaner handoffs' : 'Less invoice chasing'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-3 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="surface-panel rounded-[18px] p-4">
              <div className="flex items-center justify-between">
                <div className="app-eyebrow">{card.label}</div>
                <div className="rounded-2xl p-2.5" style={{ background: card.bg, color: card.tone }}>
                  <Icon className="h-[18px] w-[18px]" />
                </div>
              </div>
              <div className="mt-3 text-[1.7rem] font-semibold leading-none tracking-[-0.04em]" style={{ color: card.tone }}>
                {card.value}
              </div>
              <p className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>
                {card.note}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mt-5 grid gap-3 xl:grid-cols-[0.95fr_1.05fr_0.8fr]">
        <div className="surface-panel rounded-[20px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="app-eyebrow">Today spotlight</div>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]" style={{ color: 'var(--ink)' }}>Three signals worth opening first</h2>
            </div>
            <div className="rounded-2xl p-2.5" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}>
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ['Client handoff is ahead of plan', 'All blockers cleared, asset pack ready to ship.'],
              ['Budget drift surfaced early', 'The warning card is visible before it turns into cleanup work.'],
              ['Review cadence feels intentional', 'Design, build, and finance status sit in one visual layer.'],
            ].map(([title, body], index) => (
              <div key={title} className="rounded-[18px] border p-3.5" style={{ borderColor: 'var(--line)', background: index === 1 ? 'var(--acc-bg)' : 'var(--white)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-semibold" style={{ background: index === 0 ? 'var(--sage-bg)' : index === 1 ? 'var(--acc-bg)' : 'var(--violet-bg)', color: index === 0 ? 'var(--sage)' : index === 1 ? 'var(--accent)' : 'var(--violet)' }}>
                    0{index + 1}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{title}</div>
                </div>
                <p className="mt-3 text-sm leading-6" style={{ color: 'var(--muted)' }}>{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel rounded-[20px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="app-eyebrow">Project runway</div>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]" style={{ color: 'var(--ink)' }}>Editorial cards instead of a cold dashboard table</h2>
            </div>
            <div className="rounded-2xl p-2.5" style={{ background: 'var(--info-bg, rgba(59,130,246,0.08))', color: 'var(--info, #3b82f6)' }}>
              <Clock3 className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {studioPulse.map((item, index) => (
              <div key={item.title} className="rounded-[18px] border p-3.5" style={{ borderColor: 'var(--line)', background: 'var(--white)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{item.title}</div>
                    <div className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
                      {index === 0 ? 'New narrative layer for dashboard landing.' : index === 1 ? 'Approval sequence with less operational drag.' : 'Internal systems cleanup with visible ownership.'}
                    </div>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: 'var(--bg2)', color: item.tone }}>
                    Phase {index + 2}
                  </span>
                </div>
                <div className="mt-4 h-2.5 rounded-full" style={{ background: 'var(--bg2)' }}>
                  <div className="h-full rounded-full" style={{ width: `${item.progress}%`, background: item.tone }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs" style={{ color: 'var(--muted)' }}>
                  <span>Owner alignment</span>
                  <span>{item.progress}% locked</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel rounded-[20px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="app-eyebrow">Studio feed</div>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]" style={{ color: 'var(--ink)' }}>Human activity, not just numbers</h2>
            </div>
            <div className="rounded-2xl p-2.5" style={{ background: 'var(--violet-bg)', color: 'var(--violet)' }}>
              <Users className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {activityFeed.map((item) => (
              <div key={`${item.name}-${item.time}`} className="flex gap-3 rounded-[18px] border p-3.5" style={{ borderColor: 'var(--line)', background: 'var(--white)' }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold text-white" style={{ background: item.tone }}>
                  {item.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{item.name}</div>
                  <div className="mt-1 text-sm leading-5" style={{ color: 'var(--muted)' }}>{item.action}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--faint)' }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-panel mt-5 rounded-[22px] p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="app-eyebrow">Delivery lane</div>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]" style={{ color: 'var(--ink)' }}>A mock workflow strip that still feels native to the rest of the product</h2>
          </div>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>
            Warm neutrals, orange emphasis, green confirmations, violet structure.
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-4">
          {deliveryColumns.map((column) => (
            <div key={column.label} className="rounded-[18px] border p-3.5" style={{ borderColor: 'var(--line)', background: 'var(--white)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: column.tone }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: column.tone }} />
                  {column.label}
                </div>
                <span className="text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--faint)' }}>{column.cards.length} items</span>
              </div>
              <div className="mt-4 space-y-3">
                {column.cards.map((card) => (
                  <div key={card} className="rounded-[18px] border px-3.5 py-3 text-sm" style={{ borderColor: 'var(--line)', background: 'var(--bg2)', color: 'var(--ink)' }}>
                    {card}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MockPill({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[20px] border px-4 py-4" style={{ borderColor: 'var(--line)', background: 'rgba(255,255,255,0.66)' }}>
      <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>{label}</div>
      <div className="mt-2 text-xl font-semibold" style={{ color: 'var(--ink)' }}>{value}</div>
      <div className="mt-1 text-xs leading-5" style={{ color: 'var(--faint)' }}>{hint}</div>
    </div>
  );
}
