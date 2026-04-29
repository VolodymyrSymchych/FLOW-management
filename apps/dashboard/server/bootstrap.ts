import { getCachedUser } from '@/lib/user-cache';
import { cached, getFromCacheOnly } from '@/lib/redis';
import { CacheKeys } from '@/lib/cache-keys';
import { storage } from '@/server/storage';

function getCurrentMonthRange() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
}

export interface BootstrapResult {
  user: any;
  teams: any[];
  selectedTeam: { type: 'all' } | { type: 'single'; teamId: number };
  navigation: {
    projects: Array<{ id: number; name: string; status?: string | null }>;
    counts: {
      teams: number;
      projects: number;
      tasks: number;
      invoices: number;
      notifications: number;
    };
  };
  dashboard: {
    stats: any | null;
    projects: any[];
    cached: boolean;
  };
  preload: {
    projects: any[];
    tasks: any[];
    invoices: any[];
    attendance: any[];
    cashFlow: any[];
  };
}

async function fetchCoreData(userId: number, effectiveTeamId: number | 'all') {
  const { startDate, endDate } = getCurrentMonthRange();

  const [projects, tasks, notifications, stats, attendance, cashFlowData] = await Promise.all([
    cached(
      effectiveTeamId === 'all' ? CacheKeys.projectsByUser(userId) : CacheKeys.projectsByTeam(effectiveTeamId as number),
      () => effectiveTeamId === 'all' ? storage.getUserProjects(userId) : storage.getProjectsByTeam(effectiveTeamId as number),
      { ttl: 60 }
    ),
    cached(
      effectiveTeamId === 'all' ? CacheKeys.tasksByUser(userId) : CacheKeys.tasksByTeam(effectiveTeamId as number),
      () => effectiveTeamId === 'all' ? storage.getTasks(userId) : storage.getTasksByTeam(effectiveTeamId as number),
      { ttl: 60 }
    ),
    cached(CacheKeys.notificationsByUser(userId), () => storage.getNotifications(userId), { ttl: 60 }),
    getFromCacheOnly<any>(CacheKeys.statsByUser(userId)),
    cached(
      effectiveTeamId === 'all' ? `attendance:user:${userId}` : `attendance:team:${effectiveTeamId}`,
      () => effectiveTeamId === 'all' ? storage.getTimeEntries(userId) : storage.getTimeEntriesByTeam(effectiveTeamId as number),
      { ttl: 60 }
    ),
    cached(`cashflow:user:${userId}:month`, async () => {
      return storage.getCashFlowData(userId, startDate, endDate);
    }, { ttl: 60 }),
  ]);

  // Navigation is derived in-memory with no extra DB call.
  const navigationProjects = projects.slice(0, 6).map((p: any) => ({
    id: p.id,
    name: p.name,
    status: p.status ?? null,
  }));

  // Invoices need project IDs, so fetch them after projects resolve.
  const invoices = await cached(
    effectiveTeamId === 'all' ? CacheKeys.invoicesByUser(userId) : CacheKeys.invoicesByTeam(effectiveTeamId as number),
    () => effectiveTeamId === 'all'
      ? storage.getInvoicesByProjectIds(projects.map((p: any) => p.id))
      : storage.getInvoicesByTeam(effectiveTeamId as number),
    { ttl: 60 }
  );

  return { projects, tasks, invoices, notifications, stats, attendance, cashFlowData, navigationProjects };
}

/**
 * Fetches all bootstrap data for a user.
 *
 * For the 'all' case (most common): user, teams, and all core data are fetched
 * in a single parallel round. Invoices are fetched in a second mini-round because
 * they require project IDs.
 *
 * For the specific-team case: teams are fetched first (security validation), then
 * core data in parallel.
 */
export async function getBootstrapData(
  userId: number,
  requestedTeamId: number | 'all' = 'all'
): Promise<BootstrapResult> {
  if (requestedTeamId === 'all') {
    // Single parallel round for user + teams + all core data
    const [user, teams, core] = await Promise.all([
      getCachedUser(userId),
      cached(CacheKeys.teamsByUser(userId), () => storage.getUserTeams(userId), { ttl: 120 }),
      fetchCoreData(userId, 'all'),
    ]);

    const { projects, tasks, invoices, notifications, stats, attendance, cashFlowData, navigationProjects } = core;

    return buildResult({
      user, teams,
      selectedTeam: { type: 'all' },
      projects, tasks, invoices, notifications, stats, attendance, cashFlowData, navigationProjects,
    });
  }

  // Team-specific: validate membership first, then fetch in parallel
  const [user, teams] = await Promise.all([
    getCachedUser(userId),
    cached(CacheKeys.teamsByUser(userId), () => storage.getUserTeams(userId), { ttl: 120 }),
  ]);

  const isValidTeam = teams.some((t: any) => t.id === requestedTeamId);
  const effectiveTeamId = isValidTeam ? requestedTeamId : 'all';
  const selectedTeam = isValidTeam
    ? { type: 'single' as const, teamId: requestedTeamId }
    : { type: 'all' as const };

  const { projects, tasks, invoices, notifications, stats, attendance, cashFlowData, navigationProjects } =
    await fetchCoreData(userId, effectiveTeamId);

  return buildResult({
    user, teams, selectedTeam,
    projects, tasks, invoices, notifications, stats, attendance, cashFlowData, navigationProjects,
  });
}

function buildResult({
  user, teams, selectedTeam,
  projects, tasks, invoices, notifications, stats, attendance, cashFlowData, navigationProjects,
}: {
  user: any;
  teams: any[];
  selectedTeam: { type: 'all' } | { type: 'single'; teamId: number };
  projects: any[];
  tasks: any[];
  invoices: any[];
  notifications: any[];
  stats: any;
  attendance: any[];
  cashFlowData: any[];
  navigationProjects: Array<{ id: number; name: string; status?: string | null }>;
}): BootstrapResult {
  return {
    user,
    teams,
    selectedTeam,
    navigation: {
      projects: navigationProjects,
      counts: {
        teams: teams.length,
        projects: projects.length,
        tasks: tasks.length,
        invoices: invoices.length,
        notifications: notifications.length,
      },
    },
    dashboard: {
      stats: stats ?? null,
      projects,
      cached: stats !== null,
    },
    preload: {
      projects,
      tasks,
      invoices,
      attendance,
      cashFlow: cashFlowData,
    },
  };
}
