# Security Remediation Guide

This document describes manual steps required to fully address the security vulnerabilities identified in the 2026-03-06 scan.

## CRITICAL: Session Token Leak (Finding 1)

**Status:** `dashboard/cookies.txt` has been deleted and added to `.gitignore`. Code changes are complete.

### Required manual steps

1. **Revoke all sessions and rotate secrets**
   - Force global logout for all users
   - Rotate `JWT_SECRET` in all environments
   - Invalidate any session tokens issued before the rotation

2. **Purge from git history**
   The file may still exist in git history. To remove it:
   ```bash
   # Install BFG or git-filter-repo if needed
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch dashboard/cookies.txt" \
     --prune-empty --tag-name-filter cat -- --all
   ```
   Or use [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/):
   ```bash
   bfg --delete-files cookies.txt
   git reflog expire --expire=now --all && git gc --prune=now --aggressive
   ```

3. **Secret scanning in CI**
   - A Gitleaks workflow has been added at `.github/workflows/secret-scan.yml`
   - For private repos, you may need a Gitleaks license: set `GITLEAKS_LICENSE` in repo secrets
   - Alternatively, use GitHub's built-in secret scanning (Settings → Security → Secret scanning)

## HIGH: Auth Token in URL/Client (Finding 3)

**Status:** Not fully addressed in this remediation. The report recommends:
- Moving to HttpOnly-only auth (no client-readable token)
- Using one-time WS tickets instead of JWT in WebSocket query params

This requires architectural changes to the WebSocket and Pusher auth flows. Consider as a follow-up task.

## MEDIUM: Next.js Upgrade (Finding 8)

**Status:** Not changed. The dashboard uses `next@^14.2.33`. Consider upgrading to the latest supported line:
```bash
cd dashboard && npm update next
```
Run full regression and E2E tests after upgrading.

## Additional: PII in Logs (Observation)

The report noted extensive logging of user/session objects in `dashboard/app/api/auth/me/route.ts`. Consider redacting or minimizing PII in logs.
