'use client';

export type ProjectType = 'Retainer' | 'Fixed fee' | 'Hourly';
export type EmailTone = 'Diplomatic' | 'Firm' | 'Agency-polished' | 'Dead-simple';

export interface ScopeSignal {
    label: string;
    detail: string;
    weight: number;
    highlight: string;
}

export interface ScopeDemoResult {
    verdict: 'Out of scope' | 'Needs clarification' | 'Likely in scope';
    confidence: number;
    effortLow: number;
    effortHigh: number;
    costLow: number;
    costHigh: number;
    riskLevel: 'High' | 'Medium' | 'Low';
    signals: ScopeSignal[];
    suggestedAction: string;
    explanation: string;
    response: string;
    lineItems: Array<{ label: string; hours: string; amount: string }>;
}

interface ScopeAnalysisCore {
    verdict: ScopeDemoResult['verdict'];
    confidence: number;
    effortLow: number;
    effortHigh: number;
    costLow: number;
    costHigh: number;
    riskLevel: ScopeDemoResult['riskLevel'];
    signals: ScopeSignal[];
    suggestedAction: string;
    explanation: string;
    lineItems: ScopeDemoResult['lineItems'];
}

const CATEGORY_LIBRARY = [
    {
        test: /(mobile|responsive|tablet)/i,
        signal: 'Responsive updates added',
        detail: 'Extra QA and layout passes show up as new production work.',
        highlight: 'mobile',
        hours: [1.5, 2.5] as const,
        label: 'Responsive QA',
    },
    {
        test: /(testimonial|case stud)/i,
        signal: 'Content updates slipped in',
        detail: 'Swapping social proof usually means review, QA, and layout cleanup.',
        highlight: 'testimonial',
        hours: [1, 2] as const,
        label: 'Content implementation',
    },
    {
        test: /(pricing|copy|rewrite|email sequence|case study|write)/i,
        signal: 'Copywriting requested',
        detail: 'Messaging and writing are separate deliverables from implementation.',
        highlight: 'copy',
        hours: [2, 4] as const,
        label: 'Copywriting',
    },
    {
        test: /(sales call|investor call|client review|meeting|join friday|strategy)/i,
        signal: 'Live consulting added',
        detail: 'Calls and strategy time introduce delivery risk and non-build work.',
        highlight: 'call',
        hours: [1.5, 3] as const,
        label: 'Meeting support',
    },
    {
        test: /(deck|presentation|premium)/i,
        signal: 'Presentation work added',
        detail: 'Deck polish is a new output, not a tweak to an existing asset.',
        highlight: 'deck',
        hours: [2, 3.5] as const,
        label: 'Presentation design',
    },
    {
        test: /(also|plus|and join|can you also|while you'?re in there)/i,
        signal: 'Bundled add-ons',
        detail: 'The client is stacking multiple asks into one message.',
        highlight: 'also',
        hours: [1, 2] as const,
        label: 'Coordination overhead',
    },
    {
        test: /(quick|small|should be small|small tweak|real quick)/i,
        signal: 'Minimizing language',
        detail: '“Quick” framing is often a cue that real effort is being downplayed.',
        highlight: 'quick',
        hours: [0.5, 1] as const,
        label: 'Planning overhead',
    },
    {
        test: /(avoid paperwork|rather not complicate|already know the brand|since you'?re already|shouldn'?t take long)/i,
        signal: 'Boundary pressure',
        detail: 'The message tries to remove process before scope is agreed.',
        highlight: 'already',
        hours: [0.5, 1] as const,
        label: 'Change management',
    },
];

const heroSampleMessage =
    "Hey — quick one. Since you're already in the landing page, can you also update the mobile version, swap in the new testimonials, write copy for the pricing section, and join Friday’s client review to explain the strategy? Should be small since you already know the brand.";

const awkwardSampleMessage =
    "Could you also make the deck look more premium, rewrite the case studies, and sit in on the investor call? We’re trying to move quickly so I’d rather not complicate this with extra paperwork.";

export const sampleMessages = {
    hero: heroSampleMessage,
    awkward: awkwardSampleMessage,
};

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function currency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value);
}

function roundHours(value: number) {
    return Math.round(value * 2) / 2;
}

export function highlightMessage(message: string, signals: ScopeSignal[]) {
    const uniqueHighlights = Array.from(
        new Set(signals.map((signal) => signal.highlight).filter(Boolean)),
    ).sort((a, b) => b.length - a.length);

    if (!uniqueHighlights.length) {
        return [{ text: message, highlighted: false }];
    }

    const pattern = new RegExp(`(${uniqueHighlights.map(escapeForRegExp).join('|')})`, 'gi');
    return message.split(pattern).filter(Boolean).map((part) => ({
        text: part,
        highlighted: uniqueHighlights.some((phrase) => phrase.toLowerCase() === part.toLowerCase()),
    }));
}

function escapeForRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function midpoint(low: number, high: number) {
    return (low + high) / 2;
}

function computeScopeAnalysis(message: string, rate: number, projectType: ProjectType, hasApprovedScope: boolean): ScopeAnalysisCore {
    const normalized = message.trim();
    const signals = CATEGORY_LIBRARY
        .filter((category) => category.test.test(normalized))
        .map((category) => ({
            label: category.signal,
            detail: category.detail,
            highlight: category.highlight,
            weight: midpoint(category.hours[0], category.hours[1]),
            hours: category.hours,
            lineLabel: category.label,
        }));

    if (!signals.length) {
        signals.push({
            label: 'Request needs a scope check',
            detail: 'The ask is ambiguous enough that Flow would still recommend clarifying deliverables.',
            highlight: normalized.split(' ').slice(0, 2).join(' '),
            weight: 1.25,
            hours: [1, 2] as const,
            lineLabel: 'Clarification buffer',
        });
    }

    let effortLow = signals.reduce((sum, signal) => sum + signal.hours[0], 0);
    let effortHigh = signals.reduce((sum, signal) => sum + signal.hours[1], 0);

    if (projectType === 'Retainer') {
        effortLow *= 0.95;
        effortHigh *= 0.95;
    }

    if (projectType === 'Hourly') {
        effortLow *= 0.9;
        effortHigh *= 0.9;
    }

    if (hasApprovedScope) {
        effortLow += 0.5;
        effortHigh += 1;
    }

    effortLow = roundHours(effortLow);
    effortHigh = roundHours(Math.max(effortHigh, effortLow + 0.5));

    const confidenceBase = 58 + signals.length * 7 + (hasApprovedScope ? 8 : 0) + (projectType === 'Fixed fee' ? 6 : 0);
    const confidence = clamp(Math.round(confidenceBase), 68, 97);

    const weightedSignals = signals.length >= 4 || confidence >= 85;
    const verdict: ScopeDemoResult['verdict'] = weightedSignals ? 'Out of scope' : confidence >= 76 ? 'Needs clarification' : 'Likely in scope';

    const riskLevel: ScopeDemoResult['riskLevel'] =
        verdict === 'Out of scope' ? 'High' : verdict === 'Needs clarification' ? 'Medium' : 'Low';

    const suggestedAction =
        verdict === 'Out of scope'
            ? 'Send a paid change order before work starts.'
            : verdict === 'Needs clarification'
              ? 'Clarify deliverables and confirm billable ownership.'
              : 'Proceed, but log the request against the original scope.';

    const costLow = Math.round(effortLow * rate);
    const costHigh = Math.round(effortHigh * rate);

    const explanation =
        verdict === 'Out of scope'
            ? 'This request mixes new deliverables, review overhead, and consulting time into one “small” ask.'
            : verdict === 'Needs clarification'
              ? 'The message is partly adjacent to the original project, but it still introduces unpriced work.'
              : 'The request looks close to executional follow-up, but Flow would still keep a paper trail.';

    const lineItems = signals.slice(0, 4).map((signal) => ({
        label: signal.lineLabel,
        hours: `${roundHours(signal.hours[0])}-${roundHours(signal.hours[1])}h`,
        amount: currency(midpoint(signal.hours[0], signal.hours[1]) * rate),
    }));

    return {
        verdict,
        confidence,
        effortLow,
        effortHigh,
        costLow,
        costHigh,
        riskLevel,
        signals: signals.map(({ label, detail, weight, highlight }) => ({ label, detail, weight, highlight })),
        suggestedAction,
        explanation,
        lineItems,
    };
}

function estimateScope(message: string, rate: number, projectType: ProjectType, hasApprovedScope: boolean): ScopeDemoResult {
    const normalized = message.trim();
    const analysis = computeScopeAnalysis(normalized, rate, projectType, hasApprovedScope);
    const response = buildClientReply({
        message: normalized,
        scopeContext: hasApprovedScope
            ? 'Original agreement already approved. Keep additions separate from the signed scope.'
            : '',
        rate,
        tone: 'Diplomatic',
        includePricing: true,
        projectType,
        analysisOverride: analysis,
    }).body;

    return {
        ...analysis,
        response,
    };
}

export function analyzeScopeDemo(params: {
    message: string;
    rate: number;
    projectType: ProjectType;
    hasApprovedScope: boolean;
}) {
    return estimateScope(params.message, params.rate, params.projectType, params.hasApprovedScope);
}

function extractRequestedWork(message: string) {
    const matches = [
        { test: /(deck|presentation)/i, label: 'deck polish' },
        { test: /(case stud)/i, label: 'case study rewrites' },
        { test: /(investor call|sales call|client review|meeting)/i, label: 'live meeting support' },
        { test: /(mobile|responsive)/i, label: 'responsive updates' },
        { test: /(testimonial)/i, label: 'testimonial updates' },
        { test: /(pricing|copy|rewrite|email sequence|write)/i, label: 'copywriting' },
    ];

    return matches.filter((item) => item.test.test(message)).map((item) => item.label);
}

function toneLead(tone: EmailTone) {
    switch (tone) {
        case 'Firm':
            return 'Those additions sit outside the current scope, so I do not want to roll them into the existing project by default.';
        case 'Agency-polished':
            return 'Happy to support the added requests, but they should be scoped as a separate change so the current delivery plan stays clean.';
        case 'Dead-simple':
            return 'Those asks are outside the current scope, so I’d treat them as extra work.';
        default:
            return 'Happy to help with those additions. They fall outside the current scope, so I’d handle them as a separate change request.';
    }
}

function pricingSentence(projectType: ProjectType, costLow: number, costHigh: number, rate: number) {
    if (projectType === 'Fixed fee') {
        return `I’d price the added work at roughly ${currency(costLow)}-${currency(costHigh)} as a separate change order.`;
    }

    if (projectType === 'Retainer') {
        return `That would use roughly ${currency(costLow)}-${currency(costHigh)} of additional retainer capacity, or I can break it out as an overage.`;
    }

    return `At ${currency(rate)}/hr, that puts the extra work at roughly ${currency(costLow)}-${currency(costHigh)}.`;
}

export function buildClientReply(params: {
    message: string;
    scopeContext: string;
    rate: number;
    tone: EmailTone;
    includePricing: boolean;
    projectType?: ProjectType;
    analysisOverride?: ScopeAnalysisCore;
}) {
    const projectType = params.projectType ?? 'Fixed fee';
    const analysis = params.analysisOverride ?? computeScopeAnalysis(params.message, params.rate, projectType, Boolean(params.scopeContext));
    const requestedWork = extractRequestedWork(params.message);
    const workList = requestedWork.length
        ? requestedWork.join(', ').replace(/, ([^,]*)$/, ', and $1')
        : 'the added requests';
    const boundaryLead = toneLead(params.tone);
    const subject = `Re: Additional requests for the current project`;
    const estimateList = analysis.lineItems
        .map((item) => `• ${item.label}: ${item.hours}`)
        .join('\n');

    const intro = [
        boundaryLead,
        params.scopeContext
            ? `Based on the current scope, ${workList} are not covered by the approved work.`
            : `From what you sent over, ${workList} read as added deliverables rather than small follow-up tweaks.`,
    ];

    const pricingBlock = params.includePricing
        ? [
            'For planning purposes, I’d estimate:',
            estimateList,
            pricingSentence(projectType, analysis.costLow, analysis.costHigh, params.rate),
        ]
        : ['I can scope the extra work separately and confirm effort before starting.'];

    const closing =
        params.tone === 'Dead-simple'
            ? 'If you want to move ahead, I can send the change order today.'
            : 'If you want to move ahead, I can send over a simple change order today and start once it’s approved.';

    const body = [...intro, '', ...pricingBlock, '', closing].join('\n');

    const diagnostics = {
        scopeIssue: analysis.riskLevel === 'High' ? 'High confidence' : analysis.riskLevel === 'Medium' ? 'Worth clarifying' : 'Low risk',
        boundaryStrength:
            params.tone === 'Firm' ? '9/10' : params.tone === 'Agency-polished' ? '8/10' : params.tone === 'Dead-simple' ? '7/10' : '8/10',
        toneLabel:
            params.tone === 'Agency-polished'
                ? 'Professional, operator-grade'
                : params.tone === 'Dead-simple'
                  ? 'Direct and compact'
                  : params.tone === 'Firm'
                    ? 'Clear and non-negotiable'
                    : 'Calm and diplomatic',
        revenueProtected: analysis.verdict === 'Out of scope' ? 'Likely' : 'Partial',
        watchout: /paperwork|quick|already/i.test(params.message)
            ? 'Client is signaling that they want the work without the process.'
            : 'No explicit pressure phrase detected.',
        analysis,
    };

    return { subject, body, diagnostics };
}

/* ------------------------------------------------------------------ */
/* Landing mockup data — mirrors the real dashboard pages, scaled down */
/* ------------------------------------------------------------------ */

export type ProjectHealth = 'Healthy' | 'On Track' | 'At Risk' | 'Delayed' | 'Completed';

export interface MockTeammate {
    id: string;
    initials: string;
    name: string;
    role: string;
    email: string;
    avatarBg: string;          // tailwind bg class for avatar circle
    hoursToday: number;
    hoursWeek: number;
}

export interface MockProject {
    id: string;
    name: string;
    client: string;
    type: ProjectType;
    budget: number;            // in USD
    progress: number;          // 0-100
    health: ProjectHealth;
    openTasks: number;
    overdue: number;
    deadline: string;          // "Apr 30"
    team: string[];            // teammate ids
    colorDot: string;          // tailwind bg class e.g. "bg-orange-500"
}

export interface MockTask {
    id: string;
    title: string;
    project: string;           // project id
    projectName: string;
    assignee: string;          // teammate id
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'todo' | 'in-progress' | 'review' | 'done';
    dueBucket: 'Overdue' | 'Today' | 'This week' | 'Upcoming' | 'Done';
    points: number;
    due: string;               // "Apr 18"
}

export interface MockInvoice {
    id: string;
    number: string;
    client: string;
    projectName: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
    issued: string;            // "Mar 28"
    due: string;               // "Apr 28"
}

export interface MockEvent {
    id: string;
    title: string;
    day: number;               // day-of-month
    type: 'Meeting' | 'Sprint' | 'Call' | 'Deadline' | 'Review';
    time: string;              // "10:00"
    color: string;             // tailwind bg class for event pill
}

export interface MockTimeBlock {
    day: number;               // 0 = Mon … 4 = Fri
    startHour: number;         // 0-23, half-hour granularity allowed via 0.5 increments
    hours: number;             // duration in hours
    category: 'Development' | 'Design' | 'Meetings' | 'Review' | 'Admin';
    project: string;           // project name
}

export interface MockSprintPoint {
    day: number;               // 0-13 (two weeks)
    ideal: number;
    actual: number | null;     // null once we pass "today"
}

export interface MockSprint {
    name: string;
    status: 'Active' | 'Planned' | 'Completed';
    startDate: string;
    endDate: string;
    daysRemaining: number;
    totalPoints: number;
    completedPoints: number;
    velocity: number;          // pts/day
    curve: MockSprintPoint[];
    projectedOverrun: boolean;
    projectedCompletion: string;
}

export interface MockIntegration {
    id: string;
    name: string;
    description: string;
    category: 'Project' | 'Version Control' | 'Communication' | 'Analytics' | 'Billing';
    status: 'Connected' | 'Not Connected' | 'Coming Soon';
    lastSync: string;
    iconChar: string;          // single glyph for the tile
    iconBg: string;            // tailwind bg class
}

export interface MockChat {
    id: string;
    name: string;
    type: 'Direct' | 'Group';
    last: string;
    time: string;
    unread: number;
    avatarInitials: string;
    avatarBg: string;
    messages: Array<{ from: string; text: string; isMe?: boolean }>;
}

export interface MockInsight {
    title: string;
    detail: string;
    tone: 'positive' | 'attention' | 'neutral' | 'alert';
}

/* -- Team -- */

export const mockTeam: MockTeammate[] = [
    { id: 'sj', initials: 'SJ', name: 'Sara Jensen',   role: 'Senior Designer',  email: 'sara@flow.app',   avatarBg: 'bg-orange-500',  hoursToday: 6.2, hoursWeek: 32.4 },
    { id: 'mc', initials: 'MC', name: 'Marco Chen',    role: 'Full-stack Eng.',  email: 'marco@flow.app',  avatarBg: 'bg-sky-500',     hoursToday: 7.1, hoursWeek: 36.0 },
    { id: 'er', initials: 'ER', name: 'Elena Ruiz',    role: 'Backend Engineer', email: 'elena@flow.app',  avatarBg: 'bg-emerald-500', hoursToday: 5.5, hoursWeek: 28.5 },
    { id: 'al', initials: 'AL', name: 'Aisha Lambert', role: 'Product Manager',  email: 'aisha@flow.app',  avatarBg: 'bg-violet-500',  hoursToday: 4.8, hoursWeek: 26.0 },
    { id: 'jd', initials: 'JD', name: 'John Doe',      role: 'Founder · You',    email: 'john@flow.app',   avatarBg: 'bg-rose-500',    hoursToday: 7.8, hoursWeek: 38.2 },
    { id: 'tk', initials: 'TK', name: 'Tomás Kowal',   role: 'QA Lead',          email: 'tomas@flow.app',  avatarBg: 'bg-amber-500',   hoursToday: 3.2, hoursWeek: 18.4 },
];

/* -- Projects (6 realistic, shared across tabs) -- */

export const mockProjects: MockProject[] = [
    { id: 'acme',   name: 'Acme Client Portal Redesign',   client: 'Acme Corp',       type: 'Fixed fee', budget: 12000, progress: 68,  health: 'Healthy',   openTasks: 14, overdue: 1, deadline: 'May 02', team: ['sj','mc','er'],       colorDot: 'bg-orange-500'  },
    { id: 'north',  name: 'Northwind Mobile API Migration',client: 'Northwind Traders',type: 'Retainer', budget: 8500,  progress: 42,  health: 'At Risk',   openTasks: 9,  overdue: 3, deadline: 'Apr 25', team: ['mc','er'],            colorDot: 'bg-sky-500'     },
    { id: 'hatch',  name: 'Hatch HR Onboarding Flow',      client: 'Hatch.io',        type: 'Fixed fee', budget: 6200,  progress: 91,  health: 'On Track',  openTasks: 3,  overdue: 0, deadline: 'Apr 21', team: ['sj','al'],            colorDot: 'bg-emerald-500' },
    { id: 'merid',  name: 'Meridian Billing Automation',   client: 'Meridian Labs',   type: 'Hourly',    budget: 14400, progress: 24,  health: 'Delayed',   openTasks: 18, overdue: 5, deadline: 'May 14', team: ['er','mc','jd'],       colorDot: 'bg-rose-500'    },
    { id: 'lumen',  name: 'Lumen Brand Site Refresh',      client: 'Lumen & Co.',     type: 'Fixed fee', budget: 9800,  progress: 100, health: 'Completed', openTasks: 0,  overdue: 0, deadline: 'Apr 04', team: ['sj','al'],            colorDot: 'bg-violet-500'  },
    { id: 'orbit',  name: 'Orbital Analytics Dashboard',   client: 'Orbital AI',      type: 'Retainer', budget: 11300, progress: 55,  health: 'Healthy',   openTasks: 7,  overdue: 0, deadline: 'May 08', team: ['mc','jd'],            colorDot: 'bg-amber-500'   },
];

/* -- Tasks (12 across buckets) -- */

export const mockTasks: MockTask[] = [
    { id: 'FL-214', title: 'Fix OAuth callback on Safari',           project: 'north',  projectName: 'Northwind Mobile API Migration', assignee: 'mc', priority: 'Critical', status: 'in-progress', dueBucket: 'Overdue',   points: 5, due: 'Apr 16' },
    { id: 'FL-213', title: 'Migrate legacy user table schema',       project: 'merid',  projectName: 'Meridian Billing Automation',    assignee: 'er', priority: 'High',     status: 'todo',        dueBucket: 'Overdue',   points: 8, due: 'Apr 17' },
    { id: 'FL-212', title: 'Client portal — nav redesign',           project: 'acme',   projectName: 'Acme Client Portal Redesign',   assignee: 'sj', priority: 'High',     status: 'in-progress', dueBucket: 'Today',     points: 5, due: 'Apr 18' },
    { id: 'FL-211', title: 'Draft change order for Q2 scope',        project: 'north',  projectName: 'Northwind Mobile API Migration', assignee: 'jd', priority: 'Medium',   status: 'review',      dueBucket: 'Today',     points: 3, due: 'Apr 18' },
    { id: 'FL-210', title: 'Review onboarding empty states',         project: 'hatch',  projectName: 'Hatch HR Onboarding Flow',      assignee: 'al', priority: 'Medium',   status: 'review',      dueBucket: 'This week', points: 3, due: 'Apr 19' },
    { id: 'FL-209', title: 'Wire Stripe webhook for retainer',       project: 'merid',  projectName: 'Meridian Billing Automation',    assignee: 'er', priority: 'High',     status: 'in-progress', dueBucket: 'This week', points: 5, due: 'Apr 20' },
    { id: 'FL-208', title: 'Build burndown chart export',            project: 'orbit',  projectName: 'Orbital Analytics Dashboard',   assignee: 'mc', priority: 'Medium',   status: 'todo',        dueBucket: 'This week', points: 3, due: 'Apr 22' },
    { id: 'FL-207', title: 'Figma handoff — invoice table',          project: 'acme',   projectName: 'Acme Client Portal Redesign',   assignee: 'sj', priority: 'Low',      status: 'todo',        dueBucket: 'Upcoming',  points: 2, due: 'Apr 24' },
    { id: 'FL-206', title: 'Audit missing alt text across marketing',project: 'lumen',  projectName: 'Lumen Brand Site Refresh',      assignee: 'sj', priority: 'Low',      status: 'todo',        dueBucket: 'Upcoming',  points: 2, due: 'Apr 25' },
    { id: 'FL-204', title: 'Implement change-order API endpoint',    project: 'north',  projectName: 'Northwind Mobile API Migration', assignee: 'er', priority: 'High',     status: 'done',        dueBucket: 'Done',      points: 8, due: 'Apr 12' },
    { id: 'FL-203', title: 'Timeline gantt prototype',               project: 'orbit',  projectName: 'Orbital Analytics Dashboard',   assignee: 'mc', priority: 'Medium',   status: 'done',        dueBucket: 'Done',      points: 5, due: 'Apr 10' },
    { id: 'FL-201', title: 'Client kickoff presentation',            project: 'acme',   projectName: 'Acme Client Portal Redesign',   assignee: 'al', priority: 'Medium',   status: 'done',        dueBucket: 'Done',      points: 3, due: 'Apr 08' },
];

/* -- Invoices -- */

export const mockInvoices: MockInvoice[] = [
    { id: 'i1', number: 'INV-2026-014', client: 'Acme Corp',        projectName: 'Acme Client Portal Redesign',   amount: 6000,  status: 'Paid',    issued: 'Apr 02', due: 'Apr 16' },
    { id: 'i2', number: 'INV-2026-013', client: 'Northwind Traders',projectName: 'Northwind Mobile API Migration', amount: 4250,  status: 'Overdue', issued: 'Mar 20', due: 'Apr 03' },
    { id: 'i3', number: 'INV-2026-012', client: 'Hatch.io',         projectName: 'Hatch HR Onboarding Flow',      amount: 3100,  status: 'Pending', issued: 'Apr 10', due: 'Apr 24' },
    { id: 'i4', number: 'INV-2026-011', client: 'Meridian Labs',    projectName: 'Meridian Billing Automation',   amount: 7200,  status: 'Pending', issued: 'Apr 12', due: 'Apr 26' },
    { id: 'i5', number: 'INV-2026-010', client: 'Lumen & Co.',      projectName: 'Lumen Brand Site Refresh',      amount: 9800,  status: 'Paid',    issued: 'Mar 28', due: 'Apr 11' },
    { id: 'i6', number: 'INV-2026-015', client: 'Orbital AI',       projectName: 'Orbital Analytics Dashboard',   amount: 5650,  status: 'Draft',   issued: '—',      due: '—'      },
];

/* -- Calendar events (April 2026) -- */

export const mockEvents: MockEvent[] = [
    { id: 'e1',  day: 3,  title: 'Sprint 14 planning',     type: 'Sprint',   time: '10:00', color: 'bg-sky-500'     },
    { id: 'e2',  day: 7,  title: 'Acme design review',     type: 'Review',   time: '14:00', color: 'bg-orange-500'  },
    { id: 'e3',  day: 9,  title: 'Client call · Meridian', type: 'Call',     time: '11:30', color: 'bg-violet-500'  },
    { id: 'e4',  day: 12, title: 'Standup',                 type: 'Meeting',  time: '09:00', color: 'bg-slate-400'   },
    { id: 'e5',  day: 15, title: 'Northwind demo',          type: 'Call',     time: '15:00', color: 'bg-violet-500'  },
    { id: 'e6',  day: 18, title: 'Portal deadline',         type: 'Deadline', time: '17:00', color: 'bg-rose-500'    },
    { id: 'e7',  day: 21, title: 'Hatch launch prep',       type: 'Review',   time: '13:00', color: 'bg-emerald-500' },
    { id: 'e8',  day: 22, title: 'Team retro',              type: 'Meeting',  time: '16:00', color: 'bg-slate-400'   },
    { id: 'e9',  day: 25, title: 'Northwind milestone',     type: 'Deadline', time: '17:00', color: 'bg-rose-500'    },
    { id: 'e10', day: 28, title: 'Sprint 15 kickoff',       type: 'Sprint',   time: '10:00', color: 'bg-sky-500'     },
];

/* -- Timesheet — one week of blocks -- */

export const mockTimesheet: MockTimeBlock[] = [
    // Monday
    { day: 0, startHour: 9,    hours: 2,   category: 'Meetings',    project: 'Acme Client Portal Redesign'      },
    { day: 0, startHour: 11,   hours: 3,   category: 'Development', project: 'Northwind Mobile API Migration'    },
    { day: 0, startHour: 14.5, hours: 2.5, category: 'Design',      project: 'Acme Client Portal Redesign'      },
    // Tuesday
    { day: 1, startHour: 9,    hours: 4,   category: 'Development', project: 'Meridian Billing Automation'        },
    { day: 1, startHour: 13.5, hours: 1.5, category: 'Review',      project: 'Hatch HR Onboarding Flow'          },
    { day: 1, startHour: 15.5, hours: 2,   category: 'Admin',       project: 'Internal'                },
    // Wednesday
    { day: 2, startHour: 9,    hours: 1,   category: 'Meetings',    project: 'Sprint planning'         },
    { day: 2, startHour: 10.5, hours: 3.5, category: 'Design',      project: 'Lumen Brand Site Refresh'          },
    { day: 2, startHour: 14.5, hours: 2.5, category: 'Development', project: 'Orbital Analytics Dashboard'       },
    // Thursday
    { day: 3, startHour: 9,    hours: 2,   category: 'Review',      project: 'Acme Client Portal Redesign'      },
    { day: 3, startHour: 11.5, hours: 3,   category: 'Development', project: 'Northwind Mobile API Migration'    },
    { day: 3, startHour: 15,   hours: 2,   category: 'Meetings',    project: 'Meridian Billing Automation'       },
    // Friday
    { day: 4, startHour: 9,    hours: 4,   category: 'Development', project: 'Meridian Billing Automation'        },
    { day: 4, startHour: 14,   hours: 1.5, category: 'Admin',       project: 'Timesheets · Invoicing'  },
    { day: 4, startHour: 16,   hours: 1,   category: 'Meetings',    project: 'Team retro'              },
];

/* -- Sprint / burndown data — 14 days, 60 pts starting -- */

export const mockSprint: MockSprint = {
    name: 'Sprint 14 · Portal hardening',
    status: 'Active',
    startDate: 'Apr 08',
    endDate: 'Apr 22',
    daysRemaining: 4,
    totalPoints: 60,
    completedPoints: 43,
    velocity: 4.3,
    projectedOverrun: true,
    projectedCompletion: 'Apr 25',
    curve: [
        { day: 0,  ideal: 60, actual: 60 },
        { day: 1,  ideal: 55.7, actual: 57 },
        { day: 2,  ideal: 51.4, actual: 54 },
        { day: 3,  ideal: 47.1, actual: 52 },
        { day: 4,  ideal: 42.9, actual: 48 },
        { day: 5,  ideal: 38.6, actual: 44 },
        { day: 6,  ideal: 34.3, actual: 39 },
        { day: 7,  ideal: 30,   actual: 33 },
        { day: 8,  ideal: 25.7, actual: 28 },
        { day: 9,  ideal: 21.4, actual: 22 },
        { day: 10, ideal: 17.1, actual: 17 },
        { day: 11, ideal: 12.9, actual: null },
        { day: 12, ideal: 8.6,  actual: null },
        { day: 13, ideal: 4.3,  actual: null },
        { day: 14, ideal: 0,    actual: null },
    ],
};

/* -- Integrations -- */

export const mockIntegrations: MockIntegration[] = [
    { id: 'fig',   name: 'Figma',          description: 'Sync design files and prototypes.',        category: 'Project',        status: 'Connected',     lastSync: '2 min ago', iconChar: 'F', iconBg: 'bg-violet-500' },
    { id: 'gh',    name: 'GitHub',         description: 'Link commits and PRs to tasks.',           category: 'Version Control', status: 'Connected',     lastSync: '12 min ago', iconChar: 'G', iconBg: 'bg-slate-800' },
    { id: 'slack', name: 'Slack',          description: 'Ping channels on scope-guard flags.',      category: 'Communication',  status: 'Connected',     lastSync: 'Just now',   iconChar: 'S', iconBg: 'bg-fuchsia-500' },
    { id: 'lin',   name: 'Linear',         description: 'Two-way issue sync with Linear.',          category: 'Project',        status: 'Not Connected', lastSync: '—',          iconChar: 'L', iconBg: 'bg-indigo-500' },
    { id: 'gcal',  name: 'Google Calendar',description: 'Pull events and deadlines automatically.', category: 'Project',        status: 'Connected',     lastSync: '5 min ago',  iconChar: 'C', iconBg: 'bg-sky-500' },
    { id: 'stripe',name: 'Stripe',         description: 'Charge invoices and retainers.',           category: 'Billing',        status: 'Not Connected', lastSync: '—',          iconChar: '$', iconBg: 'bg-emerald-500' },
];

/* -- Inbox / chats -- */

export const mockChats: MockChat[] = [
    {
        id: 'c1', name: 'Sara Jensen', type: 'Direct', last: 'Pushed the new nav — take a look whenever.', time: '14:02', unread: 2,
        avatarInitials: 'SJ', avatarBg: 'bg-orange-500',
        messages: [
            { from: 'Sara', text: 'Pushed the new nav — take a look whenever.' },
            { from: 'Sara', text: 'I kept the orange accent but dropped the dropdown shadow.' },
            { from: 'You',  text: 'Nice. Will review after standup.', isMe: true },
        ],
    },
    {
        id: 'c2', name: '#acme-portal', type: 'Group', last: 'Flow flagged multi-language as out of scope.', time: '13:48', unread: 1,
        avatarInitials: 'AP', avatarBg: 'bg-sky-500',
        messages: [
            { from: 'Flow AI', text: 'Flow flagged multi-language as out of scope. Draft change order ready.' },
            { from: 'Marco',   text: 'Confirmed with the client — they want it priced.' },
        ],
    },
    {
        id: 'c3', name: 'Elena Ruiz', type: 'Direct', last: 'Stripe webhook is live on staging.', time: '11:10', unread: 0,
        avatarInitials: 'ER', avatarBg: 'bg-emerald-500',
        messages: [
            { from: 'Elena', text: 'Stripe webhook is live on staging. Test events coming through.' },
        ],
    },
    {
        id: 'c4', name: '#sprint-14', type: 'Group', last: 'Burndown is 5 pts behind ideal.', time: 'Yesterday', unread: 0,
        avatarInitials: 'S1', avatarBg: 'bg-violet-500',
        messages: [
            { from: 'Aisha', text: 'Burndown is 5 pts behind ideal. Let\'s retro on the OAuth ticket.' },
        ],
    },
];

/* -- Analytics insights -- */

export const mockInsights: MockInsight[] = [
    { title: 'Revenue saved this month',    detail: '$4,260 recovered across 3 flagged requests.',       tone: 'positive'  },
    { title: 'Scope risk climbing',         detail: 'Meridian has 5 unreviewed asks — schedule a sync.', tone: 'attention' },
    { title: 'Budget performance',          detail: '94% of projects under budget. Best month yet.',     tone: 'positive'  },
    { title: 'At-risk project',             detail: 'Northwind Mobile API slipping 8% on velocity.',     tone: 'alert'     },
];
