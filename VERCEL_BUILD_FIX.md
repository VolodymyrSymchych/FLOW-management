# Vercel Build Fix for TypeScript Issues

## Problem

The Vercel build was failing with the error:
```
Error: Cannot find module '../lib/tsc.js'
```

This occurred because:
1. Using `npm install` in a custom install command attempts to merge dependencies rather than clean them
2. This leads to broken `tsc` binary links where the binary exists but can't find its internal files
3. The corrupted TypeScript installation causes build failures

## Root Cause

When using `npm install` in Vercel's `installCommand`, npm attempts to merge dependencies with existing `node_modules` rather than doing a clean install. This can result in:
- Partially installed packages
- Broken symlinks
- Mismatched versions between `package-lock.json` and installed packages
- Corrupted TypeScript installation where `bin/tsc` exists but `../lib/tsc.js` is missing

## Solution

**Use `npm ci` (Clean Install) instead of `npm install`**

`npm ci`:
- Deletes existing `node_modules` folder
- Installs dependencies exactly as specified in `package-lock.json`
- Guarantees that binaries and their internal files match perfectly
- Prevents dependency corruption

### Updated Configuration

**Before:**
```json
{
  "installCommand": "cd ../.. && npm install --include=dev",
  "buildCommand": "cd ../.. && npm run build:shared && cd services/project-service && npm run build"
}
```

**After:**
```json
{
  "installCommand": "cd ../.. && npm ci --include=dev",
  "buildCommand": "npm run build"
}
```

### What Changed

1. **`npm install` → `npm ci`**: Clean install prevents dependency corruption
2. **Simplified build command**: Service's build script already handles building shared
3. **`--include=dev` flag**: Ensures devDependencies (like TypeScript) are installed even in production mode

## Files Updated

- `services/project-service/vercel.json`
- `services/auth-service/vercel.json`
- `services/user-service/vercel.json`
- `services/task-service/vercel.json`

## Build Process Flow

1. **Install Command**: Runs from service directory, navigates to root (`cd ../..`)
2. **Clean Install**: `npm ci --include=dev` deletes `node_modules` and installs fresh dependencies
3. **Build Command**: Runs from service directory, executes `npm run build`
4. **Service Build**: Service's build script automatically builds shared package first, then compiles TypeScript

## Testing

To test locally:
```bash
# From root directory
npm ci --include=dev

# From service directory
cd services/auth-service
npm run build
```

## Why `npm ci` Works

- **Deterministic**: Installs exact versions from `package-lock.json`
- **Clean**: Removes existing `node_modules` before installing
- **Fast**: Optimized for CI/CD environments
- **Reliable**: Prevents version mismatches and corruption

## Alternative Solutions Considered

1. **Using `npm install`**: Causes dependency merging and corruption
2. **Installing TypeScript globally**: Not recommended for Vercel serverless environment
3. **Using `npx tsc`**: Could work but adds overhead and doesn't solve the root cause
4. **Manual cleanup**: Too hacky and unreliable

## Prevention

To avoid this issue in the future:
- **Always use `npm ci` in CI/CD environments** instead of `npm install`
- Keep `package-lock.json` committed to version control
- Use `--include=dev` flag when devDependencies are needed (like TypeScript)
- Test builds in a clean environment before deploying
- Ensure each workspace has all required devDependencies listed

## Requirements

- `package-lock.json` must exist in the root directory (required for `npm ci`)
- All workspace packages must have their dependencies properly listed
- TypeScript must be in `devDependencies` of both root and shared packages

## Related Issues

- GitHub Actions workflow: Fixed by removing `rm -rf node_modules/typescript` command
- Local development: Works fine because dependencies are properly hoisted in workspace mode
- Vercel environment: Required `npm ci` for clean, deterministic installs

