---
description: How to run end-to-end (e2e) tests with Playwright
---

# Running E2E Tests

This workflow explains how to run the end-to-end tests for the Project Scope Analyzer dashboard using Playwright.

## Prerequisites

1. **Environment Variables**: Create a `.env.local` file in the `dashboard` directory with test credentials:
   ```bash
   TEST_USER_EMAIL=your-test-email@example.com
   TEST_USER_PASSWORD=your-test-password
   TEST_BASE_URL=http://localhost:3001  # Optional, defaults to this
   ```

2. **Test User**: Ensure the test user exists in your database with the credentials above.

3. **Dependencies**: Make sure all dependencies are installed:
   ```bash
   cd dashboard
   npm install
   ```

## Running Tests

### 1. Run All Tests (Headless Mode)
This runs all tests in the background without opening a browser window:
```bash
cd dashboard
npm run test:e2e
```

### 2. Run Tests with UI Mode (Recommended for Development)
This opens Playwright's interactive UI where you can see tests running, debug, and inspect:
// turbo
```bash
cd dashboard
npm run test:e2e:ui
```

### 3. Run Tests in Headed Mode
This runs tests with the browser visible so you can watch them execute:
```bash
cd dashboard
npm run test:e2e:headed
```

### 4. Run Specific Test File
To run a specific test suite:
```bash
cd dashboard
npm run test:e2e -- auth.spec.ts
npm run test:e2e -- dashboard-detailed.spec.ts
npm run test:e2e -- projects-detailed.spec.ts
```

### 5. Run Tests in Debug Mode
This allows you to debug tests step-by-step:
```bash
cd dashboard
npm run test:e2e -- --debug
```

### 6. Run Tests with Specific Browser
```bash
cd dashboard
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Reports

After running tests, view the HTML report:
```bash
cd dashboard
npx playwright show-report
```

## Available Test Suites

The project includes the following test files:
- `auth.spec.ts` - Authentication flow tests
- `dashboard.spec.ts` - Dashboard page tests
- `dashboard-detailed.spec.ts` - Detailed dashboard tests (13 tests)
- `projects.spec.ts` - Projects page tests
- `projects-detailed.spec.ts` - Detailed projects tests (23 tests)
- `tasks.spec.ts` - Tasks page tests
- `tasks-detailed.spec.ts` - Detailed tasks tests (30 tests)
- `settings-detailed.spec.ts` - Settings page tests (37 tests)
- `chat-detailed.spec.ts` - Chat page tests (19 tests)
- `invoices-detailed.spec.ts` - Invoices page tests (29 tests)
- `team-detailed.spec.ts` - Team page tests (28 tests)
- `documentation-detailed.spec.ts` - Documentation page tests (21 tests)
- `navigation.spec.ts` - Navigation tests
- `profile.spec.ts` - Profile page tests
- `landing.spec.ts` - Landing page tests
- `localization.spec.ts` - Localization tests
- `performance.spec.ts` - Performance tests

**Total**: 200+ test cases across 17 test files

## Tips

- **UI Mode** (`npm run test:e2e:ui`) is the best way to develop and debug tests
- Tests automatically start the dev server if it's not already running
- Use `--headed` flag to watch tests execute in real-time
- Check `playwright-report` folder for detailed HTML reports
- Tests use defensive patterns to handle optional UI elements gracefully
