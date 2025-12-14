'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import dynamic from 'next/dynamic';
import {
    FolderKanban,
    CheckCircle,
    TrendingUp,
    AlertCircle,
    GripVertical,
    X,
    Save,
    LayoutGrid,
    Undo2,
    BarChart3,
    Calendar as CalendarIcon,
    ListTodo,
    Wallet,
} from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { ProjectCard } from '@/components/ProjectCard';
import { api, Project, Stats } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTeam } from '@/contexts/TeamContext';
import { useSmartDelayedLoading } from '@/hooks/useSmartDelayedLoading';
import { useStats, useProjects } from '@/hooks/useQueries';
import { useDashboardCache } from '@/hooks/useDashboardCache';
import { cn } from '@/lib/utils';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { WidgetGallery, WidgetDefinition } from '@/components/WidgetGallery';

const ResponsiveGridLayout = WidthProvider(Responsive);
import { DashboardSkeleton } from './DashboardSkeleton';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Lazy load heavy components
const CalendarView = dynamic(() => import('@/components/CalendarView').then(m => ({ default: m.CalendarView })), {
    ssr: false,
    loading: () => <div className="glass-medium rounded-2xl p-6 h-full animate-pulse" />
});

const BudgetTracking = dynamic(() => import('@/components/BudgetTracking').then(m => ({ default: m.BudgetTracking })), {
    loading: () => <div className="glass-medium rounded-2xl p-6 h-full animate-pulse" />
});

const ProgressSection = dynamic(() => import('@/components/ProgressSection').then(m => ({ default: m.ProgressSection })), {
    loading: () => <div className="glass-medium rounded-2xl p-6 h-full animate-pulse" />
});

const UpcomingTasks = dynamic(() => import('@/components/UpcomingTasks').then(m => ({ default: m.UpcomingTasks })), {
    loading: () => <div className="glass-medium rounded-2xl p-6 h-full animate-pulse" />
});

// Types
type WidgetRenderContext = {
    stats: Stats;
    projects: Project[];
    refreshKey: number;
    setRefreshKey: Dispatch<SetStateAction<number>>;
    router: ReturnType<typeof useRouter>;
};

type DashboardWidgetDefinition = WidgetDefinition & {
    render: (context: WidgetRenderContext) => ReactNode;
};

// Constants
const LOCAL_STORAGE_KEY = 'psa-dashboard-grid-v3';
const ROW_HEIGHT = 80;
const MARGIN: [number, number] = [16, 16];

const BREAKPOINTS = {
    '3xl': 2400,
    '2xl': 1800,
    'xl': 1200,
    'lg': 996,
    'md': 768,
    'sm': 480,
    'xs': 0
};

const COLS = {
    '3xl': 24,
    '2xl': 18,
    'xl': 12,
    'lg': 10,
    'md': 8,
    'sm': 6,
    'xs': 4
};

// Default layouts for each widget
const DEFAULT_LAYOUTS: Layout[] = [
    { i: 'stats-overview', x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
    { i: 'budget-tracking', x: 0, y: 2, w: 4, h: 3, minW: 3, minH: 2 },
    { i: 'recent-projects', x: 4, y: 2, w: 8, h: 3, minW: 4, minH: 2 },
    { i: 'calendar', x: 0, y: 5, w: 8, h: 5, minW: 6, minH: 4 },
    { i: 'progress', x: 8, y: 5, w: 4, h: 3, minW: 3, minH: 2 },
    { i: 'upcoming-tasks', x: 8, y: 8, w: 4, h: 4, minW: 3, minH: 3 },
];

// Widget Components
const StatsOverviewWidget = memo(function StatsOverviewWidget({ stats, projects }: { stats: Stats; projects: Project[] }) {
    const highRiskCount = projects.filter(
        (project) => project.risk_level === 'HIGH' || project.risk_level === 'CRITICAL'
    ).length;

    return (
        <div className="h-full glass-medium rounded-2xl p-4 overflow-hidden">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 h-full">
                <StatsCard
                    title="Projects In Progress"
                    value={stats.projects_in_progress}
                    icon={FolderKanban}
                    iconBgColor="bg-red-500"
                    trend={stats.trends?.projects_in_progress}
                />
                <StatsCard
                    title="Completion Rate"
                    value={`${stats.completion_rate}%`}
                    icon={TrendingUp}
                    iconBgColor="bg-orange-500"
                />
                <StatsCard
                    title="Total Projects"
                    value={stats.total_projects}
                    icon={CheckCircle}
                    iconBgColor="bg-blue-500"
                    trend={stats.trends?.total_projects}
                />
                <StatsCard
                    title="High Risk Projects"
                    value={highRiskCount}
                    icon={AlertCircle}
                    iconBgColor="bg-yellow-500"
                />
            </div>
        </div>
    );
});

const RecentProjectsWidget = memo(function RecentProjectsWidget({
    projects,
    router,
}: {
    projects: Project[];
    router: ReturnType<typeof useRouter>;
}) {
    const displayedProjects = projects.slice(0, 4);

    return (
        <div className="h-full glass-medium rounded-2xl p-4 overflow-hidden flex flex-col">
            <div className="mb-4 flex items-center justify-between shrink-0">
                <h3 className="text-lg font-bold text-text-primary">Recent Projects</h3>
                <button
                    onClick={() => router.push('/dashboard/projects')}
                    className="text-sm text-[#8098F9] transition-colors hover:text-[#a0b0fc]"
                >
                    View All
                </button>
            </div>
            {displayedProjects.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 flex-1 overflow-auto">
                    {displayedProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            {...project}
                            team={['JD', 'SK', 'MR', 'AR', 'TC', 'LM']}
                            onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                    <FolderKanban className="mx-auto mb-3 h-12 w-12 text-text-tertiary" />
                    <p className="text-text-secondary">No projects yet. Start by analyzing your first project!</p>
                    <button
                        onClick={() => router.push('/dashboard/projects/new')}
                        className="glass-button mt-4 rounded-lg px-4 py-2 text-white"
                    >
                        New Analysis
                    </button>
                </div>
            )}
        </div>
    );
});

// Available widgets configuration
const AVAILABLE_WIDGETS: DashboardWidgetDefinition[] = [
    {
        id: 'stats-overview',
        label: 'Project Stats Overview',
        description: 'Key metrics for ongoing projects and completion trends.',
        icon: BarChart3,
        defaultW: 12,
        defaultH: 2,
        minW: 6,
        minH: 2,
        render: ({ stats, projects }) => <StatsOverviewWidget stats={stats} projects={projects} />,
    },
    {
        id: 'budget-tracking',
        label: 'Budget Tracking',
        description: 'Monitor spend, remaining budget, and forecast insights.',
        icon: Wallet,
        defaultW: 4,
        defaultH: 3,
        minW: 3,
        minH: 2,
        render: () => (
            <div className="h-full">
                <BudgetTracking />
            </div>
        ),
    },
    {
        id: 'recent-projects',
        label: 'Recent Projects',
        description: 'Quick access to the projects you worked on most recently.',
        icon: FolderKanban,
        defaultW: 8,
        defaultH: 3,
        minW: 4,
        minH: 2,
        render: ({ projects, router }) => <RecentProjectsWidget projects={projects} router={router} />,
    },
    {
        id: 'calendar',
        label: 'Calendar',
        description: 'Plan tasks across the calendar and drag tasks onto dates.',
        icon: CalendarIcon,
        defaultW: 8,
        defaultH: 5,
        minW: 6,
        minH: 4,
        render: ({ refreshKey }) => (
            <div className="h-full glass-medium rounded-2xl overflow-hidden">
                <CalendarView refreshKey={refreshKey} />
            </div>
        ),
    },
    {
        id: 'progress',
        label: 'Progress Overview',
        description: 'See task completion and time tracking progress.',
        icon: TrendingUp,
        defaultW: 4,
        defaultH: 3,
        minW: 3,
        minH: 2,
        render: () => (
            <div className="h-full">
                <ProgressSection />
            </div>
        ),
    },
    {
        id: 'upcoming-tasks',
        label: 'Upcoming Tasks',
        description: "Prioritize what's next and drag tasks onto the calendar.",
        icon: ListTodo,
        defaultW: 4,
        defaultH: 4,
        minW: 3,
        minH: 3,
        render: ({ refreshKey }) => (
            <div className="h-full">
                <UpcomingTasks key={refreshKey} />
            </div>
        ),
    },
];

// Widget container with drag handle and remove button
const WidgetWrapper = memo(function WidgetWrapper({
    children,
    widgetId,
    widgetLabel,
    onRemove,
    isCustomizing,
}: {
    children: ReactNode;
    widgetId: string;
    widgetLabel: string;
    onRemove: (id: string) => void;
    isCustomizing: boolean;
}) {
    return (
        <div className="relative h-full group">
            {/* Controls overlay */}
            <div
                className={cn(
                    'absolute right-2 top-2 z-20 flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-sm px-2 py-1 transition-opacity',
                    isCustomizing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                )}
            >
                {/* Drag handle */}
                <div
                    className="widget-drag-handle cursor-grab rounded p-1 transition-colors hover:bg-white/20 active:cursor-grabbing"
                    title="Drag to move"
                >
                    <GripVertical className="h-4 w-4 text-white" />
                </div>

                {/* Widget label */}
                <span className="text-[10px] font-medium text-white/70 px-1">{widgetLabel}</span>

                {/* Remove button */}
                <button
                    type="button"
                    onClick={() => onRemove(widgetId)}
                    className="rounded p-1 transition-colors hover:bg-red-500/30 hover:text-red-300"
                    title="Remove widget"
                >
                    <X className="h-3.5 w-3.5 text-white" />
                </button>
            </div>

            {/* Widget content */}
            <div className="h-full">{children}</div>
        </div>
    );
});

export default function DashboardView() {
    const router = useRouter();
    const { selectedTeam, isLoading: teamsLoading } = useTeam();
    // Container ref no longer needed for width calculation as WidthProvider handles it, 
    // but kept for pattern background calculation if needed (though pattern might need update)
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(1200);
    const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('xl');

    // React Query for data - з fallback на БД якщо Redis порожній
    const teamId = selectedTeam.type === 'all' ? 'all' : selectedTeam.teamId;
    const {
        data: stats,
        isLoading: statsLoading,
        isFetching: statsFetching,
        isPlaceholderData: statsPlaceholder
    } = useStats();
    const {
        data: projects,
        isLoading: projectsLoading,
        isFetching: projectsFetching,
        isPlaceholderData: projectsPlaceholder
    } = useProjects(teamId);

    const cacheManager = useDashboardCache();

    // isLoading = true тільки при першому завантаженні (немає кешу)
    // isFetching = true при будь-якому запиті (включаючи refetch)
    const isLoading = statsLoading || projectsLoading;
    const isBackgroundFetching = (statsFetching && !statsLoading) || (projectsFetching && !projectsLoading);

    // hasData = true якщо є будь-які дані (навіть старі/placeholder)
    // Це запобігає показу skeleton при переключенні команд
    const hasData = stats !== undefined || projects !== undefined;

    const [refreshKey, setRefreshKey] = useState(0);
    const shouldShowLoading = useSmartDelayedLoading(isLoading || teamsLoading, hasData, 300);

    // Grid layout state - now objects keyed by breakpoint
    const [layouts, setLayouts] = useState<Record<string, Layout[]>>({
        '3xl': DEFAULT_LAYOUTS,
        '2xl': DEFAULT_LAYOUTS,
        'xl': DEFAULT_LAYOUTS,
        'lg': DEFAULT_LAYOUTS,
        'md': DEFAULT_LAYOUTS.map(l => ({ ...l, w: Math.min(l.w, 8) })),
        'sm': DEFAULT_LAYOUTS.map(l => ({ ...l, w: Math.min(l.w, 6) })),
        'xs': DEFAULT_LAYOUTS.map(l => ({ ...l, w: Math.min(l.w, 4) }))
    });
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const hasLoadedFromStorage = useRef(false);

    // Ensure client-side only rendering for grid layout
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Get active widget IDs from current breakpoint layout
    const activeWidgetIds = useMemo(() => {
        const currentLayout = layouts[currentBreakpoint] || [];
        return currentLayout.map((l) => l.i);
    }, [layouts, currentBreakpoint]);

    // Create widget map for quick lookup
    const widgetMap = useMemo(() => {
        const map = new Map<string, DashboardWidgetDefinition>();
        AVAILABLE_WIDGETS.forEach((w) => map.set(w.id, w));
        return map;
    }, []);

    // Load layout from localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!stored) {
            hasLoadedFromStorage.current = true;
            return;
        }

        try {
            const parsed = JSON.parse(stored);
            if (parsed.layouts && typeof parsed.layouts === 'object' && !Array.isArray(parsed.layouts)) {
                setLayouts(parsed.layouts);
            }
            hasLoadedFromStorage.current = true;
        } catch (error) {
            console.warn('Failed to parse dashboard layout:', error);
            hasLoadedFromStorage.current = true;
        }
    }, []);

    // Track container width for responsive grid
    useEffect(() => {
        if (!containerRef.current) return;

        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };

        updateWidth();

        const resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    // Track unsaved changes
    useEffect(() => {
        if (!hasLoadedFromStorage.current) return;
        setHasUnsavedChanges(true);
    }, [layouts]);

    // Handle layout changes
    const handleLayoutChange = useCallback((currentLayout: Layout[], allLayouts: Record<string, Layout[]>) => {
        setLayouts(allLayouts);
        // Note: we don't save to storage here to avoid excessive writes, 
        // we heavily rely on the explicit Save button based on user preference from previous tasks
    }, []);

    // Handle breakpoint change
    const handleBreakpointChange = useCallback((newBreakpoint: string) => {
        setCurrentBreakpoint(newBreakpoint);
    }, []);

    // Add widget to grid
    const handleAddWidget = useCallback((widgetId: string, w: number, h: number) => {
        const widget = AVAILABLE_WIDGETS.find((ww) => ww.id === widgetId);
        if (!widget) return;

        // Add to all breakpoints to ensure consistency
        setLayouts((prevLayouts) => {
            const nextLayouts: Record<string, Layout[]> = { ...prevLayouts };

            Object.keys(COLS).forEach((bkpt) => {
                const layout = nextLayouts[bkpt] || [];
                // Find next available position (simple approximation: bottom of grid)
                const maxY = layout.reduce((max, l) => Math.max(max, l.y + l.h), 0);

                const newLayoutItem: Layout = {
                    i: widgetId,
                    x: 0,
                    y: maxY,
                    w: w,
                    h: h,
                    minW: widget.minW,
                    minH: widget.minH,
                    maxW: widget.maxW,
                    maxH: widget.maxH,
                };

                // Adjust width for smaller breakpoints if needed
                const maxCols = COLS[bkpt as keyof typeof COLS];
                if (newLayoutItem.w > maxCols) {
                    newLayoutItem.w = maxCols;
                }

                nextLayouts[bkpt] = [...layout, newLayoutItem];
            });

            return nextLayouts;
        });

        toast.success(`Added ${widget.label} to dashboard`);
    }, []);

    // Remove widget from grid
    const handleRemoveWidget = useCallback((widgetId: string) => {
        const widget = widgetMap.get(widgetId);
        setLayouts((prev) => {
            const next: Record<string, Layout[]> = {};
            Object.keys(prev).forEach(bp => {
                next[bp] = prev[bp].filter(l => l.i !== widgetId);
            });
            return next;
        });
        toast.success(`Removed ${widget?.label || 'widget'} from dashboard`);
    }, [widgetMap]);

    // Reset to default layout
    const handleResetLayout = useCallback(() => {
        setLayouts({
            '3xl': DEFAULT_LAYOUTS,
            '2xl': DEFAULT_LAYOUTS,
            'xl': DEFAULT_LAYOUTS,
            'lg': DEFAULT_LAYOUTS,
            'md': DEFAULT_LAYOUTS.map(l => ({ ...l, w: Math.min(l.w, 8) })),
            'sm': DEFAULT_LAYOUTS.map(l => ({ ...l, w: Math.min(l.w, 6) })),
            'xs': DEFAULT_LAYOUTS.map(l => ({ ...l, w: Math.min(l.w, 4) }))
        });
        toast.success('Dashboard reset to default layout');
    }, []);

    // Save layout
    const handleSaveLayout = useCallback(async () => {
        setIsSaving(true);
        try {
            const config = {
                layouts,
                updatedAt: new Date().toISOString(),
            };

            // Save to localStorage
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
            }

            setHasUnsavedChanges(false);
            toast.success('Dashboard layout saved successfully');
        } catch (error: any) {
            console.error('Failed to save dashboard layout:', error);
            toast.error('Failed to save dashboard layout');
        } finally {
            setIsSaving(false);
        }
    }, [layouts]);

    // Render context for widgets
    const renderContext: WidgetRenderContext = useMemo(
        () => ({
            stats: stats || {
                projects_in_progress: 0,
                total_projects: 0,
                completion_rate: 0,
                projects_completed: 0,
                trends: {},
            },
            projects: projects || [],
            refreshKey,
            setRefreshKey,
            router,
        }),
        [stats, projects, refreshKey, router]
    );

    // Show skeleton loading state
    // FIX: Also show loading state if not mounted to prevent hydration errors
    if (!isMounted || shouldShowLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6" suppressHydrationWarning>
            {/* Header */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-text-primary">Dashboard overview</h1>
                        {isMounted && isBackgroundFetching && (
                            <div className="flex items-center gap-2 text-xs text-text-tertiary">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <span>Updating...</span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-text-tertiary">
                        Drag widgets anywhere on the grid to customize your workspace.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Gallery button */}
                    <button
                        type="button"
                        onClick={() => setIsGalleryOpen((prev) => !prev)}
                        className={cn(
                            'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all',
                            isGalleryOpen
                                ? 'border-primary/40 bg-primary/10 text-primary'
                                : 'border-white/10 text-text-secondary hover:border-primary/60 hover:text-text-primary'
                        )}
                    >
                        <LayoutGrid className="h-4 w-4" />
                        {isGalleryOpen ? 'Close Gallery' : 'Widget Gallery'}
                    </button>

                    {/* Customize toggle */}
                    <button
                        type="button"
                        onClick={() => setIsCustomizing((prev) => !prev)}
                        className={cn(
                            'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all',
                            isCustomizing
                                ? 'border-primary/40 bg-primary/10 text-primary'
                                : 'border-white/10 text-text-secondary hover:border-primary/60 hover:text-text-primary'
                        )}
                    >
                        {isCustomizing ? 'Done Editing' : 'Edit Layout'}
                    </button>

                    {/* Reset button */}
                    {isCustomizing && (
                        <button
                            type="button"
                            onClick={handleResetLayout}
                            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-text-secondary transition-all hover:border-primary/60 hover:text-text-primary"
                        >
                            <Undo2 className="h-3.5 w-3.5" />
                            Reset
                        </button>
                    )}

                    {/* Save button */}
                    {hasUnsavedChanges && (
                        <button
                            type="button"
                            onClick={handleSaveLayout}
                            disabled={isSaving}
                            className={cn(
                                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                                'bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30',
                                isSaving && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <Save className="h-4 w-4" />
                            {isSaving ? 'Saving...' : 'Save Layout'}
                        </button>
                    )}
                </div>
            </div>

            {/* Widget Gallery */}
            <WidgetGallery
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                availableWidgets={AVAILABLE_WIDGETS}
                activeWidgetIds={activeWidgetIds}
                onAddWidget={handleAddWidget}
                onRemoveWidget={handleRemoveWidget}
            />

            {/* Customize Mode Indicator */}
            {isCustomizing && (
                <div className="glass-medium rounded-xl border border-primary/30 p-4 flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <div>
                            <p className="text-sm font-semibold text-text-primary">Edit Mode Active</p>
                            <p className="text-xs text-text-tertiary">
                                Drag widgets anywhere • Resize by grabbing corners • Remove with X button
                            </p>
                        </div>
                    </div>
                    {hasUnsavedChanges && (
                        <span className="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning border border-warning/30">
                            Unsaved Changes
                        </span>
                    )}
                </div>
            )}

            {/* Grid Layout Container */}
            <div
                ref={containerRef}
                className={cn(
                    'relative rounded-3xl border p-4 transition-all duration-300',
                    isCustomizing
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-white/5 bg-white/0 hover:border-white/10'
                )}
            >
                {/* Grid background pattern */}
                {isCustomizing && (
                    <div
                        className="pointer-events-none absolute inset-0 rounded-[22px] opacity-60"
                        style={{
                            backgroundImage:
                                'linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                            backgroundSize: `${(containerWidth - 32) / COLS[currentBreakpoint as keyof typeof COLS]}px ${ROW_HEIGHT}px`,
                            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.35))',
                        }}
                    />
                )}

                {!isMounted ? (
                    <div className="animate-pulse rounded-2xl bg-white/5 min-h-[400px]" />
                ) : (layouts['xl']?.length > 0 || Object.values(layouts).some(l => l.length > 0)) ? (
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={layouts}
                        breakpoints={BREAKPOINTS}
                        cols={COLS}
                        rowHeight={ROW_HEIGHT}
                        // width={containerWidth - 32} // Handled by WidthProvider
                        onLayoutChange={handleLayoutChange}
                        onBreakpointChange={handleBreakpointChange}
                        isDraggable={true}
                        isResizable={true}
                        compactType={null}
                        preventCollision={true}
                        margin={MARGIN}
                        draggableHandle=".widget-drag-handle"
                        useCSSTransforms={true}
                    >
                        {(layouts[currentBreakpoint] || []).map((layoutItem) => {
                            const widget = widgetMap.get(layoutItem.i);
                            if (!widget) return null;

                            return (
                                <div key={layoutItem.i} className="widget-item">
                                    <WidgetWrapper
                                        widgetId={widget.id}
                                        widgetLabel={widget.label}
                                        onRemove={handleRemoveWidget}
                                        isCustomizing={isCustomizing}
                                    >
                                        {widget.render(renderContext)}
                                    </WidgetWrapper>
                                </div>
                            );
                        })}
                    </ResponsiveGridLayout>
                ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
                        <LayoutGrid className="mx-auto mb-3 h-12 w-12 text-text-tertiary" />
                        <p className="text-lg font-semibold text-text-primary">Your dashboard is empty</p>
                        <p className="mt-2 text-sm text-text-tertiary">
                            Open the Widget Gallery to add widgets to your dashboard.
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsGalleryOpen(true)}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary/20 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/30"
                        >
                            <LayoutGrid className="h-4 w-4" />
                            Open Widget Gallery
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
