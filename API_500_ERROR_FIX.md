# API 500 Error Fix - Deployment Guide

## Problem Summary
The deployed application at `https://flow-managment.vercel.app` was returning 500 Internal Server Errors for multiple API endpoints:
- `/api/teams`
- `/api/budget`
- `/api/tasks`

## Root Cause
The API routes were using relative import paths (`../../../../server/storage`) which failed in Vercel's serverless environment due to different module resolution behavior.

## Solution Applied

### 1. Created Centralized Storage Module
**File**: `dashboard/lib/storage.ts`
```typescript
// Re-export storage from server directory
// This provides a stable import path for API routes
export { storage } from '../../server/storage';
```

### 2. Updated All API Routes
Changed all imports from:
```typescript
import { storage } from '../../../../server/storage';
```

To:
```typescript
import { storage } from '@/lib/storage';
```

### 3. Enhanced Error Logging
Added detailed console logging to API routes for better debugging:
- Request start/end logging
- Session validation logging
- Error stack traces (in development)
- Detailed error information

### 4. Updated Next.js Configuration
Added database packages to external packages list in `next.config.js`:
```javascript
experimental: {
  serverComponentsExternalPackages: [
    '@aws-sdk/client-s3', 
    '@aws-sdk/s3-request-presigner',
    'drizzle-orm',
    '@neondatabase/serverless'
  ],
}
```

### 5. Created Vercel Configuration
**File**: `vercel.json`
- Increased serverless function memory to 1GB
- Set max duration to 10 seconds
- Configured proper build commands

## Files Modified
1. `dashboard/lib/storage.ts` (created)
2. `dashboard/lib/api-error.ts` (created)
3. `dashboard/next.config.js` (updated)
4. `vercel.json` (created)
5. All API route files in `dashboard/app/api/` (updated imports)
   - `teams/route.ts`
   - `budget/route.ts`
   - `tasks/route.ts`
   - And 10+ other routes

## Deployment Steps

### 1. Verify Environment Variables in Vercel
Ensure these are set in your Vercel project settings:

```env
DATABASE_URL=postgresql://neondb_owner:npg_fNrEs4JTxjR9@ep-blue-sunset-abla90wi-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-secure-jwt-secret
JWT_ISSUER=project-scope-analyzer
JWT_EXPIRES_IN=1h
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://flow-managment.vercel.app
NODE_ENV=production
```

### 2. Deploy to Vercel
```bash
# Commit changes
git add .
git commit -m "fix: resolve API 500 errors by fixing import paths for Vercel deployment"
git push origin main
```

Vercel will automatically deploy the changes.

### 3. Verify Deployment
After deployment completes:

1. **Check Build Logs** in Vercel dashboard
2. **Test API Endpoints**:
   ```bash
   # Test teams endpoint
   curl https://flow-managment.vercel.app/api/teams
   
   # Test budget endpoint
   curl https://flow-managment.vercel.app/api/budget
   
   # Test tasks endpoint
   curl https://flow-managment.vercel.app/api/tasks?team_id=1
   ```

3. **Check Function Logs** in Vercel:
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for the detailed console logs we added
   - Verify no errors appear

### 4. Expected Behavior
- **Before**: 500 errors with no useful information
- **After**: 
  - Successful responses with data
  - OR detailed error messages with stack traces (in development)
  - Clear console logs showing request flow

## Monitoring

### Check Logs
In Vercel dashboard, you should now see detailed logs like:
```
[Teams API] Starting request
[Teams API] Session found for user: 123
[Teams API] Fetching teams from storage for user: 123
[Teams API] Found teams: 2
[Teams API] Returning teams: 2
```

### If Errors Persist
1. Check Vercel function logs for the specific error
2. Verify DATABASE_URL is correctly set
3. Ensure database is accessible from Vercel's IP ranges
4. Check if database connection pool is exhausted

## Additional Improvements Made

### Error Handler Utility
Created `dashboard/lib/api-error.ts` for consistent error handling across all API routes.

### Better Logging
All API routes now have:
- Request start/end markers
- Session validation logging
- Detailed error information
- Stack traces in development mode

## Testing Locally

To test these changes locally:

```bash
cd dashboard
npm run build
npm run start
```

Then test the API endpoints:
```bash
curl http://localhost:3000/api/teams
curl http://localhost:3000/api/budget
curl http://localhost:3000/api/tasks?team_id=1
```

## Rollback Plan

If issues occur, you can rollback by:
1. Reverting the commit in Git
2. Pushing to trigger a new deployment
3. Or use Vercel's "Rollback" feature in the dashboard

## Next Steps

1. Monitor the application for 24 hours
2. Check error rates in Vercel analytics
3. Review function execution times
4. Consider adding:
   - Rate limiting
   - Request caching
   - Database connection pooling optimization

## Notes

- Build completed successfully with no errors
- All imports now use TypeScript path aliases (`@/lib/storage`)
- Serverless functions configured with adequate memory (1GB)
- Error logging enhanced for better debugging
