# E2E Test Results

**Date:** 2025-12-26
**Status:** Failed

## Summary
- **Passed:** 8
- **Failed:** 5 (Authentication timeouts)
- **Pending/Skipped:** 5

## Details
The tests related to the Landing Page and Authentication UI (Check inputs, links, buttons) PASSED.
The tests requiring actual login (Dashboard checks) FAILED.

### Failure Reason
`TimeoutError: page.waitForURL: Timeout 15000ms exceeded.`
The test waits for a redirect to `/dashboard/` after clicking "Sign In", but the redirect does not happen within 15 seconds. The test logs show the browser staying on `/en/sign-in`.

### Potential Causes
1. **Backend Connectivity**: The dashboard is configured to use Vercel production services (`https://flow-auth-service.vercel.app`). Verify if these services accept requests from `localhost:3001` (CORS).
2. **Port Mismatch**: `.env.local` sets `NEXT_PUBLIC_APP_URL` to port 3000, while tests run on port 3001. This might cause redirect issues in the callback.
3. **Environment**: Ensure the test user credentials in `.env.local` match the Production database if using production services.
