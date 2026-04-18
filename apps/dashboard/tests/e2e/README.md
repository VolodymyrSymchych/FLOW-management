# E2E Tests

## Setup

1. Ensure test credentials are set in `.env.local`:
   ```
   TEST_USER_EMAIL=your-test@email.com
   TEST_USER_PASSWORD=your-test-password
   ```

2. Make sure the test user exists in the Vercel database and is not locked.

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run with UI
npm run test:e2e:ui
```

## Common Issues

### Account Locked
If you see "Account temporarily locked" errors, the test account has been rate-limited due to too many failed login attempts. Wait 15-20 minutes before running tests again, or use a different test account.

### Login Timeouts
If login times out, check:
1. Vercel services are accessible
2. Test credentials are correct
3. Account is not locked
4. Network connectivity

### Vercel Service Delays
Tests include extended timeouts (90-120 seconds) to account for Vercel cold starts and network latency.

## Test Structure

- `helpers/login.ts` - Reusable login function with error handling
- `auth.setup.ts` - Creates authenticated state for tests that use `storageState`
- Individual test files test specific features
