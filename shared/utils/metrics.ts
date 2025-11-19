import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// Create a registry
export const register = new Registry();

// Collect default metrics (CPU, memory, etc.)
// Disabled for serverless environments to prevent timeouts
if (process.env.ENABLE_DEFAULT_METRICS === 'true') {
  collectDefaultMetrics({ register });
}

// Common metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestErrors = new Counter({
  name: 'http_request_errors_total',
  help: 'Total number of HTTP request errors',
  labelNames: ['method', 'route', 'error_type'],
  registers: [register],
});

export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [register],
});

export const databaseConnections = new Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections',
  labelNames: ['state'],
  registers: [register],
});

export const eventPublished = new Counter({
  name: 'events_published_total',
  help: 'Total number of events published',
  labelNames: ['event_type'],
  registers: [register],
});

export const eventProcessed = new Counter({
  name: 'events_processed_total',
  help: 'Total number of events processed',
  labelNames: ['event_type', 'status'],
  registers: [register],
});

export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type'],
  registers: [register],
});

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type'],
  registers: [register],
});

// Helper to record HTTP request metrics
export function recordHttpRequest(
  method: string,
  route: string,
  statusCode: number,
  duration: number
) {
  httpRequestDuration.observe({ method, route, status_code: statusCode.toString() }, duration);
  httpRequestTotal.inc({ method, route, status_code: statusCode.toString() });

  if (statusCode >= 400) {
    httpRequestErrors.inc({ method, route, error_type: statusCode >= 500 ? 'server' : 'client' });
  }
}

// Helper to record database query metrics
export function recordDatabaseQuery(operation: string, table: string, duration: number) {
  databaseQueryDuration.observe({ operation, table }, duration);
}

// Helper to record event metrics
export function recordEventPublished(eventType: string) {
  eventPublished.inc({ event_type: eventType });
}

export function recordEventProcessed(eventType: string, status: 'success' | 'error') {
  eventProcessed.inc({ event_type: eventType, status });
}

// Helper to record cache metrics
export function recordCacheHit(cacheType: string) {
  cacheHits.inc({ cache_type: cacheType });
}

export function recordCacheMiss(cacheType: string) {
  cacheMisses.inc({ cache_type: cacheType });
}

