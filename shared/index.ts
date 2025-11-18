// Export all shared types
export * from './types/user';
export * from './types/project';
export * from './types/task';

// Export events
export * from './events/events';
export * from './events/event-bus';

// Export utilities
export * from './utils/logger';
export * from './utils/validator';
export * from './utils/errors';
export * from './utils/metrics';

// Export database
export * from './database/connection';

// Export Redis utilities (if they exist in dashboard/lib/redis.ts, we need to add them to shared)
// For now, services can use ioredis directly

