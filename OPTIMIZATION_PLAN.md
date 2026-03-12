# 🚀 Optimization Plan - Best Practice Priorities

**Created:** 2026-02-04  
**Status:** In Progress  
**Priority:** CRITICAL

---

## 📊 Executive Summary

This document outlines critical optimizations needed to bring the application to production-ready standards. The focus is on **security**, **performance**, and **scalability**.

---

## 🔴 Phase 1: Security & Multi-Tenant Isolation (CRITICAL)

### 1.1 Enforce userId for All Data Fetches

**Problem:**
- Current implementation allows fetching ALL tasks/projects when `userId` is optional
- Methods like `getTaskById(taskId, userId?)` allow bypassing user isolation
- This is a **CRITICAL SECURITY VULNERABILITY**

**Solution:**
- Make `userId` **required** for all data fetch methods
- Remove optional `userId` parameters
- Add strict WHERE clauses: `eq(table.userId, userId)`

**Files to modify:**
- ✅ `services/task-service/src/services/task.service.ts`
- ✅ `services/project-service/src/services/project.service.ts`
- ✅ `services/task-service/src/controllers/task.controller.ts`
- ✅ `services/project-service/src/controllers/project.controller.ts`

**Impact:** HIGH - Prevents unauthorized data access

---

### 1.2 Fix Login Error Handling

**Problem:**
- Login returns `success: true` even when validation fails
- OAuth methods (Google/Microsoft) don't properly handle token validation failures

**Current Code (auth.controller.ts:104-178):**
```typescript
async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Email/username and password are required');
    }
    // ... rest of login logic
    res.json({ success: true, ... }); // ❌ Always returns success if no throw
  } catch (error) {
    next(error); // ❌ Error handler might still return success
  }
}
```

**Solution:**
- Ensure all error paths throw proper errors
- Never return `success: true` on validation/authentication failures
- Add explicit error responses for OAuth failures

**Files to modify:**
- ✅ `services/auth-service/src/controllers/auth.controller.ts`

**Impact:** HIGH - Prevents false positive login responses

---

## ⚡ Phase 2: Performance & Scalability

### 2.1 Add Pagination to All List Endpoints

**Problem:**
- All list endpoints return **ALL** records without limits
- `getUserTasks()`, `getUserProjects()` can return thousands of rows
- No cursor-based pagination support

**Current Code:**
```typescript
async getUserTasks(userId: number, projectId?: number): Promise<Task[]> {
  const userTasks = await db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(desc(tasks.createdAt)); // ❌ No LIMIT/OFFSET
  return userTasks.map(this.mapToTask);
}
```

**Solution:**
- Add pagination parameters: `limit`, `offset` (or `cursor`)
- Default limit: **50 items**
- Max limit: **100 items**
- Return pagination metadata: `{ data, total, hasMore, nextCursor }`

**API Changes:**
```typescript
// Before
GET /tasks?projectId=123

// After
GET /tasks?projectId=123&limit=50&offset=0
GET /tasks?projectId=123&limit=50&cursor=abc123

Response:
{
  "data": [...],
  "pagination": {
    "total": 1250,
    "limit": 50,
    "offset": 0,
    "hasMore": true,
    "nextCursor": "xyz789"
  }
}
```

**Files to modify:**
- ✅ `services/task-service/src/services/task.service.ts`
- ✅ `services/project-service/src/services/project.service.ts`
- ✅ `services/task-service/src/controllers/task.controller.ts`
- ✅ `services/project-service/src/controllers/project.controller.ts`
- ✅ `services/task-service/src/routes/tasks.ts`
- ✅ `services/project-service/src/routes/projects.ts`

**Impact:** HIGH - Reduces database load, improves response times

---

### 2.2 Implement Field Selection (Summary vs Detail)

**Problem:**
- All endpoints return full objects with all fields
- List endpoints don't need detailed fields like `analysisData`, `document`

**Solution:**
- Add `fields` query parameter
- Predefined field sets: `summary`, `detail`, `minimal`
- Use Drizzle's `.select()` to fetch only needed columns

**Example:**
```typescript
// Minimal (for lists)
GET /tasks?fields=minimal
// Returns: { id, title, status, priority, dueDate }

// Summary (default for lists)
GET /tasks?fields=summary
// Returns: { id, title, description, status, priority, assignee, dueDate, progress }

// Detail (for single item)
GET /tasks/123?fields=detail
// Returns: ALL fields including dependsOn, createdAt, updatedAt, etc.
```

**Files to modify:**
- ✅ `services/task-service/src/services/task.service.ts`
- ✅ `services/project-service/src/services/project.service.ts`

**Impact:** MEDIUM - Reduces payload size, improves network performance

---

### 2.3 Remove Auto-Polling, Use Smart Refetch

**Problem:**
- Frontend likely uses 60s polling for heavy lists
- Causes unnecessary database queries

**Solution:**
- **Backend:** Add `Last-Modified` and `ETag` headers
- **Frontend:** Use `refetchOnWindowFocus` instead of interval polling
- **Future:** Implement SSE/WebSocket for real-time updates

**Files to modify:**
- ✅ `services/task-service/src/controllers/task.controller.ts`
- ✅ `services/project-service/src/controllers/project.controller.ts`

**Impact:** HIGH - Reduces database load by 90%+

---

## 🔧 Phase 3: Code Quality & Maintainability

### 3.1 Implement Structured Logging

**Problem:**
- Every method logs detailed info: `logger.error('Error getting user tasks', { error, userId, projectId })`
- Logs contain sensitive data (userId, projectId, etc.)
- No log levels differentiation (dev vs prod)

**Solution:**
- Create structured logger with levels: `debug`, `info`, `warn`, `error`
- Disable `debug` logs in production
- Sanitize sensitive data from logs
- Use correlation IDs for request tracing

**Example:**
```typescript
// Before
logger.error('Error getting user tasks', { error, userId, projectId });

// After
logger.error('Failed to fetch user tasks', {
  correlationId: req.correlationId,
  userId: sanitize(userId),
  errorCode: 'TASK_FETCH_FAILED',
  // No sensitive data
});

// Debug logs (only in dev)
logger.debug('Task query executed', { 
  query: 'SELECT * FROM tasks WHERE userId = ?',
  duration: 45 
});
```

**Files to modify:**
- ✅ Create `shared/src/logger/structured-logger.ts`
- ✅ Update all services to use new logger

**Impact:** MEDIUM - Improves observability, reduces log noise

---

### 3.2 Normalize Query Parameters

**Problem:**
- Inconsistent naming: `project_id` vs `projectId`, `team_id` vs `teamId`

**Solution:**
- Standardize on **camelCase** for all query params
- Document in API spec (Swagger)

**Files to modify:**
- ✅ All route handlers
- ✅ Swagger documentation

**Impact:** LOW - Improves API consistency

---

## 📈 Success Metrics

### Before Optimization
- ❌ Security: Multi-tenant isolation not enforced
- ❌ Performance: No pagination, fetches all records
- ❌ Scalability: 60s polling causes high DB load
- ❌ Logs: Verbose, contains sensitive data

### After Optimization
- ✅ Security: Strict userId enforcement
- ✅ Performance: Paginated responses (50 items default)
- ✅ Scalability: Smart refetch, 90% reduction in queries
- ✅ Logs: Structured, sanitized, production-ready

---

## 🎯 Implementation Order

1. **Phase 1.1** - Enforce userId (CRITICAL) - **2 hours**
2. **Phase 1.2** - Fix login errors (CRITICAL) - **1 hour**
3. **Phase 2.1** - Add pagination (HIGH) - **4 hours**
4. **Phase 2.2** - Field selection (MEDIUM) - **3 hours**
5. **Phase 2.3** - Smart refetch (HIGH) - **2 hours**
6. **Phase 3.1** - Structured logging (MEDIUM) - **3 hours**
7. **Phase 3.2** - Normalize params (LOW) - **1 hour**

**Total Estimated Time:** 16 hours

---

## 🚦 Next Steps

1. Review this plan with the team
2. Get approval for breaking API changes (pagination, required userId)
3. Start with Phase 1.1 (Security)
4. Create migration guide for frontend
5. Update API documentation

---

*Last Updated: 2026-02-04*
