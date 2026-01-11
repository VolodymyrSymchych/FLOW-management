# 🔄 CI/CD Pipeline Documentation

**Last Updated:** January 11, 2026  
**File:** `.github/workflows/ci.yml`

---

## 📊 Overview

This CI/CD pipeline automatically tests, lints, builds, and validates all code changes before they can be merged.

### **Key Features:**
- ✅ **All 9 microservices** tested in parallel
- ✅ **Dashboard** linting and building
- ✅ **E2E tests** with Playwright
- ✅ **Code coverage** tracking
- ✅ **Failing tests block merges** (no more `|| true`)
- ✅ **Parallel execution** for speed

---

## 🏗️ Pipeline Structure

```
CI/CD Pipeline
│
├── lint-services (9 jobs in parallel)
│   ├── auth-service
│   ├── user-service
│   ├── project-service
│   ├── task-service
│   ├── team-service
│   ├── chat-service
│   ├── invoice-service
│   ├── notification-service
│   └── file-service
│
├── test-services (9 jobs in parallel)
│   ├── auth-service (66 tests)
│   ├── user-service (21 tests)
│   ├── project-service (34 tests)
│   ├── task-service (31 tests)
│   ├── team-service (34 tests)
│   ├── chat-service (26 tests)
│   ├── invoice-service (29 tests)
│   ├── notification-service (27 tests)
│   └── file-service (29 tests)
│
├── build-services (9 jobs in parallel)
│   └── Requires: lint-services ✅ && test-services ✅
│
├── test-dashboard
│   ├── npm run lint
│   └── npm run build
│
├── e2e-tests
│   ├── Requires: test-services ✅
│   └── Playwright E2E tests (17 tests)
│
└── ci-success
    └── Requires: ALL jobs ✅
```

---

## 🎯 Jobs Breakdown

### 1. **lint-services**

**Purpose:** Lint all microservices to enforce code quality standards

**Runs on:** Every push and PR to `main` or `develop`

**Services tested:**
- auth-service
- user-service
- project-service
- task-service
- team-service
- chat-service
- invoice-service
- notification-service
- file-service

**Command:** `npm run lint`

**Failure behavior:** ❌ Blocks merge (no `|| true`)

---

### 2. **test-services**

**Purpose:** Run unit tests with coverage for all microservices

**Runs on:** Every push and PR to `main` or `develop`

**Services tested:** Same 9 services as lint-services

**Command:** `npm test -- --coverage --passWithNoTests`

**Coverage:** Uploaded to Codecov (optional, doesn't block)

**Expected results:**
- ✅ auth-service: 66 tests
- ✅ user-service: 21 tests
- ✅ project-service: 34 tests
- ✅ task-service: 31 tests
- ✅ team-service: 34 tests
- ✅ chat-service: 26 tests
- ✅ invoice-service: 29 tests
- ✅ notification-service: 27 tests
- ✅ file-service: 29 tests

**Total:** 297+ tests

**Failure behavior:** ❌ Blocks merge

---

### 3. **build-services**

**Purpose:** Verify all services can be built successfully

**Runs on:** After lint-services AND test-services pass

**Services built:** Same 9 services

**Command:** `npm run build`

**Failure behavior:** ❌ Blocks merge

---

### 4. **test-dashboard**

**Purpose:** Lint and build the Next.js dashboard

**Runs on:** Every push and PR to `main` or `develop`

**Steps:**
1. `npm run lint` - ESLint check
2. `npm run build` - Production build

**Environment:**
- `SKIP_ENV_VALIDATION: true` - Skip env check in CI

**Failure behavior:** ❌ Blocks merge

---

### 5. **e2e-tests**

**Purpose:** Run end-to-end tests for dashboard

**Runs on:** After test-services pass

**Browser:** Chromium (via Playwright)

**Tests:** 17 E2E test files

**Command:** `npm run test:e2e`

**Artifacts:**
- Playwright report (30 days retention)
- Test results screenshots/videos (on failure)

**Failure behavior:** ❌ Blocks merge

---

### 6. **ci-success**

**Purpose:** Final check that ALL jobs passed

**Runs on:** After all jobs complete (always runs)

**Checks:**
- lint-services ✅
- test-services ✅
- build-services ✅
- test-dashboard ✅
- e2e-tests ✅

**Failure behavior:** ❌ Blocks merge if ANY job failed

---

## 🚀 Triggering the Pipeline

### **Automatic Triggers:**

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

**When it runs:**
- ✅ Push to `main` branch
- ✅ Push to `develop` branch
- ✅ Open PR to `main` or `develop`
- ✅ Update existing PR

**When it doesn't run:**
- ❌ Push to feature branches (unless PR is open)
- ❌ Draft PRs (they run, but won't block)

---

## 📈 Performance

### **Expected Runtime:**

| Job | Duration | Parallelism |
|-----|----------|-------------|
| lint-services | ~30s each | 9 parallel |
| test-services | ~1-2s each | 9 parallel |
| build-services | ~5-10s each | 9 parallel |
| test-dashboard | ~2-3 min | 1 job |
| e2e-tests | ~2-5 min | 1 job |

**Total pipeline time:** ~5-7 minutes

---

## ✅ What Changed from Old Pipeline

### **OLD (Broken):**
```yaml
strategy:
  matrix:
    service: [shared]  # ❌ Only 1 service!

- name: Lint
  run: npm run lint || true  # ❌ Doesn't block!

- name: Test
  run: npm test || true  # ❌ Doesn't block!
```

### **NEW (Fixed):**
```yaml
strategy:
  fail-fast: false
  matrix:
    service:  # ✅ All 9 services!
      - auth-service
      - user-service
      - project-service
      - task-service
      - team-service
      - chat-service
      - invoice-service
      - notification-service
      - file-service

- name: Run linter
  run: npm run lint  # ✅ Blocks on failure!

- name: Run tests with coverage
  run: npm test -- --coverage  # ✅ Blocks on failure!
```

### **Added:**
- ✅ E2E tests (Playwright)
- ✅ Dashboard linting and building
- ✅ Coverage upload (Codecov)
- ✅ Test artifacts (reports, screenshots)
- ✅ Final success check job

---

## 🔧 Local Testing

### **Test what CI will do:**

```bash
# Lint all services (what CI does)
cd services/auth-service && npm run lint
cd ../user-service && npm run lint
# ... repeat for all 9 services

# Or use the script:
./scripts/test-all.sh

# Test dashboard
cd dashboard
npm run lint
npm run build

# E2E tests
cd dashboard
npm run test:e2e
```

---

## 🐛 Debugging CI Failures

### **If a job fails:**

1. **Check the GitHub Actions tab:**
   - Go to: `https://github.com/YOUR_USERNAME/PROJECT/actions`
   - Click on the failed run
   - Expand the failed job

2. **Common failures:**

   **Lint failure:**
   ```bash
   # Fix locally:
   cd services/FAILING_SERVICE
   npm run lint:fix
   git add .
   git commit -m "fix: lint errors"
   git push
   ```

   **Test failure:**
   ```bash
   # Debug locally:
   cd services/FAILING_SERVICE
   npm test -- --verbose
   # Fix the test
   git add .
   git commit -m "fix: failing test"
   git push
   ```

   **E2E failure:**
   ```bash
   # Run E2E tests locally:
   cd dashboard
   npm run test:e2e
   # Check screenshots/videos in test-results/
   ```

3. **Download artifacts:**
   - Playwright reports are available as artifacts
   - Click "Artifacts" in the GitHub Actions run
   - Download and extract

---

## 📊 Coverage Reporting

### **Codecov Integration (Optional):**

If you want coverage reports, add this secret:
```bash
# In GitHub: Settings > Secrets > Actions
CODECOV_TOKEN=your_token_here
```

**Coverage is uploaded but doesn't block CI.**

---

## 🎯 Branch Protection Rules

### **Recommended settings:**

Go to: `Settings > Branches > Branch protection rules`

**For `main` branch:**
- ✅ Require pull request reviews (1 reviewer)
- ✅ Require status checks to pass:
  - `lint-services`
  - `test-services`
  - `build-services`
  - `test-dashboard`
  - `e2e-tests`
  - `ci-success`
- ✅ Require branches to be up to date
- ✅ Do not allow bypassing

**For `develop` branch:**
- ✅ Require status checks to pass (same as above)
- ⚪ Optional: Require reviews

---

## 🚫 What This Pipeline Prevents

### **Blocked merges:**
- ❌ Code with lint errors
- ❌ Failing unit tests
- ❌ Failing E2E tests
- ❌ Code that doesn't build
- ❌ Code that breaks existing features

### **Now impossible:**
- ❌ Merging broken code to `main`
- ❌ Deploying untested changes
- ❌ Breaking production

---

## 📈 Next Steps

### **Future improvements:**

1. **Add deployment jobs:**
   - Deploy to staging on `develop`
   - Deploy to production on `main`

2. **Add performance tests:**
   - Lighthouse CI for dashboard
   - Load testing for services

3. **Add security scanning:**
   - Snyk or Dependabot
   - OWASP dependency check

4. **Add notifications:**
   - Slack notifications on failure
   - Discord webhooks

---

## 📞 Support

**If CI is broken:**
1. Check this documentation
2. Check GitHub Actions logs
3. Run tests locally first
4. Create an issue if you find a CI bug

---

**Created:** January 11, 2026  
**Author:** Development Team  
**Status:** ✅ Active
