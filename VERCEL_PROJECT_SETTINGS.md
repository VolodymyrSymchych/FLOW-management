# Vercel Project Configuration Guide

## The Issue
The build is failing because Vercel needs to know that your Next.js app is in the `dashboard` subdirectory, not the root.

## Solution: Configure Vercel Project Settings

You need to update your Vercel project settings in the dashboard. Here's how:

### Step 1: Go to Vercel Project Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **flow-managment**
3. Click on **Settings**

### Step 2: Update Build & Development Settings

In the **Settings** → **General** section, configure:

#### Root Directory
```
dashboard
```
**Important**: Set this to `dashboard` (not empty, not `.`)

#### Build Command
```
npm run build
```
(Leave as default or set explicitly)

#### Output Directory
```
.next
```
(This is relative to the root directory, so it will be `dashboard/.next`)

#### Install Command
```
npm install --legacy-peer-deps
```

### Step 3: Environment Variables

Make sure these are set in **Settings** → **Environment Variables**:

```env
DATABASE_URL=postgresql://neondb_owner:npg_fNrEs4JTxjR9@ep-blue-sunset-abla90wi-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-secure-jwt-secret-here
JWT_ISSUER=project-scope-analyzer
JWT_EXPIRES_IN=1h
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://flow-managment.vercel.app
NODE_ENV=production
```

### Step 4: Redeploy

After saving the settings:
1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**
4. OR push a new commit to trigger deployment

## Alternative: Use vercel.json (Current Approach)

If you prefer to keep configuration in code, you can use `vercel.json` at the root:

```json
{
  "buildCommand": "cd dashboard && npm run build",
  "outputDirectory": "dashboard/.next",
  "installCommand": "cd dashboard && npm install --legacy-peer-deps",
  "framework": "nextjs"
}
```

**However**, the Vercel dashboard settings approach is more reliable for monorepos.

## Verification

After configuration, the build should:
1. ✅ Install dependencies in the `dashboard` directory
2. ✅ Build the Next.js app
3. ✅ Deploy successfully
4. ✅ API routes work without 500 errors

## Expected Build Output

You should see:
```
Running "install" command: `npm install --legacy-peer-deps`...
✓ Dependencies installed

Running "build" command: `npm run build`...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build

✓ Build completed
```

## Troubleshooting

### If build still fails with "No such file or directory"
- Double-check the **Root Directory** is set to `dashboard` in Vercel settings
- Make sure you saved the settings
- Try redeploying

### If API routes still return 500
- Check the Function Logs in Vercel
- Verify environment variables are set
- Look for import errors in the logs

## Current Status

The code changes are complete and pushed:
- ✅ Fixed import paths in all API routes
- ✅ Created centralized storage module
- ✅ Enhanced error logging
- ✅ Updated Next.js configuration

**Next step**: Configure Vercel project settings as described above.
