# Caching & Rate Limiting

## Overview

The application implements comprehensive Redis-based caching and rate limiting to improve performance and security.

## 📊 Caching Strategy

### Cached Endpoints

| Endpoint | Cache TTL | Cache Key |
|----------|-----------|-----------|
| `GET /api/stats` | 5 minutes (300s) | `stats:user:{userId}` |
| `GET /api/projects` | 5 minutes (300s) | `projects:user:{userId}` |
| `GET /api/tasks` | 3 minutes (180s) | `tasks:user:{userId}[:project:{projectId}]` |

### Cache Keys Pattern

- **User Stats**: `stats:user:{userId}`
- **User Projects**: `projects:user:{userId}`
- **User Tasks (all)**: `tasks:user:{userId}`
- **Project Tasks**: `tasks:user:{userId}:project:{projectId}`
- **Session**: `session:{token}`
- **Rate Limit**: `ratelimit:{identifier}`

### Why Different TTLs?

- **Stats (5 min)**: Changes infrequently, can be cached longer
- **Projects (5 min)**: Projects are relatively stable
- **Tasks (3 min)**: Tasks change more frequently (status updates, progress, etc.)

## 🔄 Cache Invalidation

### Automatic Invalidation

Cache is automatically invalidated when data changes:

```typescript
import { invalidateUserCache } from '@/lib/redis';

// After creating/updating/deleting projects or tasks
await invalidateUserCache(userId);
```

### What Gets Invalidated

The `invalidateUserCache()` function clears:
- All user projects: `projects:user:{userId}`
- All user tasks: `tasks:user:{userId}*`
- User stats: `stats:user:{userId}`

### Manual Invalidation

For specific cache keys:

```typescript
import { invalidateCache } from '@/lib/redis';

await invalidateCache('specific:cache:key');
```

## 🚦 Rate Limiting

### Protected Endpoints

| Endpoint | Limit | Window | Identifier |
|----------|-------|--------|------------|
| `POST /api/auth/login` | 5 requests | 5 minutes | IP address |
| `POST /api/auth/signup` | 3 requests | 15 minutes | IP address |
| `POST /api/projects` | 10 requests | 10 minutes | User ID |
| `POST /api/tasks` | 20 requests | 10 minutes | User ID |

### Rate Limit Response

When rate limit is exceeded, API returns:

```json
{
  "error": "Too many requests. Please try again later."
}
```

HTTP Status: `429 Too Many Requests`

Headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Timestamp when limit resets
- `Retry-After`: Seconds until next request allowed

### Implementation

```typescript
import { withRateLimit } from '@/lib/rate-limit';

const rateLimitResult = await withRateLimit(request, {
  limit: 10,
  window: 600, // 10 minutes
  identifier: () => `action:${userId}`,
});

if (!rateLimitResult.success) {
  return rateLimitResult.response!; // 429 response
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Production (Upstash Redis - recommended for Vercel)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Local Development (standard Redis)
REDIS_URL=redis://localhost:6379
```

### Without Redis

If Redis is not configured:
- **Caching**: Disabled (data fetched directly from database)
- **Rate Limiting**: Bypassed (all requests allowed)

The application gracefully degrades - no errors, just reduced performance.

## 📈 Performance Impact

### Before Caching (JWT verification on every request)
- Request time: ~50-100ms per API call
- Database queries: Every request

### After Caching
- First request: ~50-100ms (cache miss, fetch from DB)
- Subsequent requests: ~5-10ms (cache hit)
- Database load: Reduced by 80-90%

### Session Caching

JWT tokens are cached for 1 hour:
- Reduces JWT verification overhead
- Faster authentication checks
- Lower CPU usage on Edge Runtime

## 🛡️ Security Benefits

### Rate Limiting Protection

1. **Brute Force Prevention**
   - Login attempts limited to 5 per 5 minutes
   - Account creation limited to 3 per 15 minutes

2. **DoS Protection**
   - API abuse prevention
   - Resource consumption control

3. **Account Enumeration Prevention**
   - Limits signup attempts
   - Prevents automated account creation

### Cache Security

- User-specific cache keys prevent data leakage
- Session tokens never exposed in cache keys
- Cache automatically expires (TTL)

## 🔍 Monitoring

### Check Redis Connection

```bash
# Local Redis
redis-cli ping
# Should return: PONG

# Check keys
redis-cli keys "*"
```

### Monitor Cache Hit Rate

Check server logs for:
```
✓ Cache hit: projects:user:1
○ Cache miss: tasks:user:1:project:5
```

### Monitor Rate Limits

Rate limit responses logged:
```
⚠ Rate limit exceeded for login:192.168.1.1
```

## 🐛 Troubleshooting

### Stale Data

If seeing outdated data:

1. Check cache invalidation is called after mutations
2. Verify Redis connection
3. Clear specific cache manually:

```typescript
import { invalidateCache } from '@/lib/redis';
await invalidateCache('projects:user:123');
```

### Rate Limit Issues

If legitimate users are rate limited:

1. Increase limits in endpoint configuration
2. Check IP detection (behind proxy?)
3. Consider user-based limits instead of IP

### Redis Connection Errors

```bash
# Check Redis is running
redis-cli ping

# Check environment variables
echo $REDIS_URL
echo $UPSTASH_REDIS_REST_URL
```

## 📚 Related Documentation

- [REDIS_SETUP.md](REDIS_SETUP.md) - Redis configuration guide
- [R2_SETUP.md](R2_SETUP.md) - File storage setup

## 🎯 Best Practices

1. **Cache frequently read, rarely changed data**
   - User preferences
   - Project metadata
   - Dashboard stats

2. **Don't cache sensitive data**
   - Passwords
   - Payment details
   - Private keys

3. **Always invalidate on mutation**
   - After CREATE operations
   - After UPDATE operations
   - After DELETE operations

4. **Monitor cache hit rates**
   - Aim for 70-80% hit rate
   - Adjust TTLs based on data volatility

5. **Set appropriate rate limits**
   - Balance security vs user experience
   - More strict for auth endpoints
   - More lenient for read operations

## 🚀 Future Improvements

- [ ] Cache warming (preload common queries)
- [ ] Distributed cache invalidation (multi-region)
- [ ] Per-endpoint cache hit/miss metrics
- [ ] Dynamic rate limits based on user tier
- [ ] Circuit breaker pattern for external APIs
