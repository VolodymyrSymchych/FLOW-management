# Vercel Build Fix for TypeScript Issues

## Problem

The Vercel build was failing with the error:
```
Error: Cannot find module '../lib/tsc.js'
```

This occurred because:
1. Using npm workspaces with `npm install --include=dev` at the root level
2. TypeScript was installed but its internal files were corrupted or not properly linked
3. The workspace-based installation didn't properly install dependencies in each package

## Root Cause

When using npm workspaces, running `npm install` at the root doesn't always properly install devDependencies in workspace packages. This caused TypeScript to be partially installed, where the `bin/tsc` script existed but couldn't find the actual compiler code at `../lib/tsc.js`.

## Solution

Changed the build approach to:
1. Install dependencies directly in each workspace package
2. Build the shared package first (with its own TypeScript installation)
3. Then build the service package (with its own dependencies)

### Updated Build Command

**Before:**
```json
"buildCommand": "cd ../.. && npm install --include=dev && npm run build:shared && cd services/project-service && npm run build"
```

**After:**
```json
"buildCommand": "cd ../../shared && npm install && npm run build && cd ../services/project-service && npm install && npm run build"
```

### What Changed

1. **Removed workspace dependency**: Instead of using `npm run build:shared` from root, we directly run the build in the shared package
2. **Direct npm install**: Each package installs its own dependencies, ensuring TypeScript is properly installed
3. **Isolated builds**: Each workspace builds independently, avoiding cross-workspace dependency issues

## Files Updated

- `services/project-service/vercel.json`
- `services/auth-service/vercel.json`
- `services/user-service/vercel.json`
- `services/task-service/vercel.json`

## Build Process Flow

1. Navigate to `shared/` directory
2. Install dependencies (including TypeScript)
3. Build the shared package
4. Navigate to specific service directory
5. Install service dependencies
6. Build the service

## Testing

To test locally:
```bash
cd shared
npm install
npm run build

cd ../services/project-service
npm install
npm run build
```

## Alternative Solutions Considered

1. **Using `npm ci`**: Didn't work because workspaces require flexible dependency resolution
2. **Installing TypeScript globally**: Not recommended for Vercel serverless environment
3. **Using `npx tsc`**: Could work but adds overhead and doesn't solve the root cause
4. **Removing TypeScript then reinstalling**: Too hacky and unreliable

## Prevention

To avoid this issue in the future:
- Keep workspace packages self-contained with their own dependencies
- Test builds in a clean environment (e.g., Docker) before deploying
- Consider using `npm ci` only when you have a stable package-lock.json
- Ensure each workspace has all required devDependencies listed

## Related Issues

- GitHub Actions workflow: Fixed by removing `rm -rf node_modules/typescript` command
- Local development: Works fine because dependencies are properly hoisted in workspace mode
- Vercel environment: Required explicit per-package installation to work correctly

