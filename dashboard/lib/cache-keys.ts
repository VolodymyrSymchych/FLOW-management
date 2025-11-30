/**
 * Centralized cache key generation
 *
 * This module provides type-safe functions for generating Redis cache keys.
 * All cache keys should be generated using these functions to ensure consistency.
 */

export const CacheKeys = {
  // ===== PROJECTS =====

  /**
   * Cache key for a single project
   * @example "project:123"
   */
  project: (id: number) => `project:${id}` as const,

  /**
   * Cache key for project progress/stats
   * @example "project:123:progress"
   */
  projectProgress: (id: number) => `project:${id}:progress` as const,

  /**
   * Cache key for all projects of a user
   * @example "projects:user:456"
   */
  projectsByUser: (userId: number) => `projects:user:${userId}` as const,

  /**
   * Cache key for all projects of a team
   * @example "projects:team:789"
   */
  projectsByTeam: (teamId: number) => `projects:team:${teamId}` as const,

  // ===== TASKS =====

  /**
   * Cache key for a single task
   * @example "task:123"
   */
  task: (id: number) => `task:${id}` as const,

  /**
   * Cache key for task worked hours
   * @example "task:123:hours"
   */
  taskHours: (id: number) => `task:${id}:hours` as const,

  /**
   * Cache key for all tasks of a user
   * @example "tasks:user:456"
   */
  tasksByUser: (userId: number) => `tasks:user:${userId}` as const,

  /**
   * Cache key for all tasks in a project
   * @example "tasks:project:123"
   */
  tasksByProject: (projectId: number) => `tasks:project:${projectId}` as const,

  /**
   * Cache key for all tasks of a team
   * @example "tasks:team:789"
   */
  tasksByTeam: (teamId: number) => `tasks:team:${teamId}` as const,

  /**
   * Cache key for tasks by user and project
   * @example "tasks:user:456:project:123"
   */
  tasksByUserAndProject: (userId: number, projectId: number) =>
    `tasks:user:${userId}:project:${projectId}` as const,

  // ===== STATS =====

  /**
   * Cache key for user statistics
   * @example "stats:user:456"
   */
  statsByUser: (userId: number) => `stats:user:${userId}` as const,

  /**
   * Cache key for team statistics
   * @example "stats:team:789"
   */
  statsByTeam: (teamId: number) => `stats:team:${teamId}` as const,

  /**
   * Cache key for project statistics
   * @example "stats:project:123"
   */
  statsByProject: (projectId: number) => `stats:project:${projectId}` as const,

  // ===== TEAMS =====

  /**
   * Cache key for a single team
   * @example "team:789"
   */
  team: (id: number) => `team:${id}` as const,

  /**
   * Cache key for team members
   * @example "team:789:members"
   */
  teamMembers: (id: number) => `team:${id}:members` as const,

  /**
   * Cache key for all teams of a user
   * @example "teams:user:456"
   */
  teamsByUser: (userId: number) => `teams:user:${userId}` as const,

  // ===== INVOICES =====

  /**
   * Cache key for a single invoice
   * @example "invoice:123"
   */
  invoice: (id: number) => `invoice:${id}` as const,

  /**
   * Cache key for invoices by project
   * @example "invoices:project:123"
   */
  invoicesByProject: (projectId: number) => `invoices:project:${projectId}` as const,

  /**
   * Cache key for invoices by user
   * @example "invoices:user:456"
   */
  invoicesByUser: (userId: number) => `invoices:user:${userId}` as const,

  /**
   * Cache key for invoices by team
   * @example "invoices:team:789"
   */
  invoicesByTeam: (teamId: number) => `invoices:team:${teamId}` as const,

  // ===== EXPENSES =====

  /**
   * Cache key for a single expense
   * @example "expense:123"
   */
  expense: (id: number) => `expense:${id}` as const,

  /**
   * Cache key for expenses by project
   * @example "expenses:project:123"
   */
  expensesByProject: (projectId: number) => `expenses:project:${projectId}` as const,

  /**
   * Cache key for expenses by user
   * @example "expenses:user:456"
   */
  expensesByUser: (userId: number) => `expenses:user:${userId}` as const,

  // ===== CHAT =====

  /**
   * Cache key for a single chat
   * @example "chat:123"
   */
  chat: (id: number) => `chat:${id}` as const,

  /**
   * Cache key for chat messages
   * @example "chat:123:messages"
   */
  chatMessages: (id: number) => `chat:${id}:messages` as const,

  /**
   * Cache key for all chats of a user
   * @example "chats:user:456"
   */
  chatsByUser: (userId: number) => `chats:user:${userId}` as const,

  // ===== NOTIFICATIONS =====

  /**
   * Cache key for user notifications
   * @example "notifications:user:456"
   */
  notificationsByUser: (userId: number) => `notifications:user:${userId}` as const,

  // ===== FILES =====

  /**
   * Cache key for a single file
   * @example "file:123"
   */
  file: (id: number) => `file:${id}` as const,

  /**
   * Cache key for files by project
   * @example "files:project:123"
   */
  filesByProject: (projectId: number) => `files:project:${projectId}` as const,

  /**
   * Cache key for files by task
   * @example "files:task:456"
   */
  filesByTask: (taskId: number) => `files:task:${taskId}` as const,

  // ===== REPORTS =====

  /**
   * Cache key for a single report
   * @example "report:123"
   */
  report: (id: number) => `report:${id}` as const,

  /**
   * Cache key for reports by user
   * @example "reports:user:456"
   */
  reportsByUser: (userId: number) => `reports:user:${userId}` as const,

  /**
   * Cache key for reports by project
   * @example "reports:project:123"
   */
  reportsByProject: (projectId: number) => `reports:project:${projectId}` as const,

  // ===== PROJECT TEMPLATES =====

  /**
   * Cache key for a single project template
   * @example "template:123"
   */
  projectTemplate: (id: number) => `template:${id}` as const,

  /**
   * Cache key for all project templates
   * @example "templates:all"
   */
  projectTemplates: () => 'templates:all' as const,

  /**
   * Cache key for project templates by category
   * @example "templates:category:web"
   */
  projectTemplatesByCategory: (category: string) =>
    `templates:category:${category}` as const,

  // ===== USERS =====

  /**
   * Cache key for a single user
   * @example "user:456"
   */
  user: (id: number) => `user:${id}` as const,

  /**
   * Cache key for user by email
   * @example "user:email:john@example.com"
   */
  userByEmail: (email: string) => `user:email:${email}` as const,

  // ===== CASHFLOW =====

  /**
   * Cache key for cashflow data
   * @example "cashflow:user:456"
   */
  cashflowByUser: (userId: number) => `cashflow:user:${userId}` as const,

  /**
   * Cache key for cashflow forecast
   * @example "cashflow:forecast:user:456"
   */
  cashflowForecast: (userId: number) => `cashflow:forecast:user:${userId}` as const,

  /**
   * Cache key for cashflow by category
   * @example "cashflow:categories:user:456"
   */
  cashflowCategories: (userId: number) => `cashflow:categories:user:${userId}` as const,

  // ===== TIME ENTRIES =====

  /**
   * Cache key for time entries by user
   * @example "timeentries:user:456"
   */
  timeEntriesByUser: (userId: number) => `timeentries:user:${userId}` as const,

  /**
   * Cache key for time entries by task
   * @example "timeentries:task:123"
   */
  timeEntriesByTask: (taskId: number) => `timeentries:task:${taskId}` as const,

  /**
   * Cache key for time entries by team
   * @example "timeentries:team:789"
   */
  timeEntriesByTeam: (teamId: number) => `timeentries:team:${teamId}` as const,
} as const;

/**
 * Generate wildcard pattern for invalidating all related keys
 * @example invalidatePattern('projects:user:*')
 */
export function getCachePattern(baseKey: string): string {
  return `${baseKey}*`;
}

/**
 * Get all cache keys that should be invalidated when a project is updated
 */
export function getProjectInvalidationKeys(projectId: number, userId?: number, teamId?: number): string[] {
  const keys = [
    CacheKeys.project(projectId),
    getCachePattern(`project:${projectId}:`), // project:123:*
  ];

  if (userId) {
    keys.push(
      CacheKeys.projectsByUser(userId),
      CacheKeys.statsByUser(userId)
    );
  }

  if (teamId) {
    keys.push(
      CacheKeys.projectsByTeam(teamId),
      CacheKeys.statsByTeam(teamId)
    );
  }

  return keys;
}

/**
 * Get all cache keys that should be invalidated when a task is updated
 */
export function getTaskInvalidationKeys(
  taskId: number,
  userId?: number,
  projectId?: number,
  teamId?: number
): string[] {
  const keys = [
    CacheKeys.task(taskId),
    getCachePattern(`task:${taskId}:`), // task:123:*
  ];

  if (userId) {
    keys.push(
      CacheKeys.tasksByUser(userId),
      CacheKeys.statsByUser(userId)
    );
  }

  if (projectId) {
    keys.push(
      CacheKeys.tasksByProject(projectId),
      CacheKeys.projectProgress(projectId),
      CacheKeys.statsByProject(projectId)
    );
  }

  if (teamId) {
    keys.push(
      CacheKeys.tasksByTeam(teamId),
      CacheKeys.statsByTeam(teamId)
    );
  }

  return keys;
}

/**
 * Get all cache keys that should be invalidated when a team is updated
 */
export function getTeamInvalidationKeys(teamId: number, userId?: number): string[] {
  const keys = [
    CacheKeys.team(teamId),
    getCachePattern(`team:${teamId}:`), // team:789:*
    CacheKeys.projectsByTeam(teamId),
    CacheKeys.tasksByTeam(teamId),
    CacheKeys.statsByTeam(teamId),
  ];

  if (userId) {
    keys.push(CacheKeys.teamsByUser(userId));
  }

  return keys;
}
