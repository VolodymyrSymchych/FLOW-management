# 🚀 Quick Start Commands

## Testing

### Run all tests
```bash
# Quick test all services
./scripts/test-all.sh

# Manual test individual service
cd services/auth-service && npm test
cd services/user-service && npm test
cd services/project-service && npm test
# ... etc

# Dashboard E2E tests
cd dashboard && npm run test:e2e

# Dashboard E2E with UI
cd dashboard && npm run test:e2e:ui
```

### Run tests with coverage
```bash
cd services/auth-service && npm test -- --coverage
```

---

## Development

### Start dashboard
```bash
cd dashboard && npm run dev
# Opens at http://localhost:3001
```

### Start individual service
```bash
cd services/auth-service && npm run dev
cd services/user-service && npm run dev
# ... etc
```

### Start mobile app
```bash
cd mobile && npm start
```

---

## Building

### Build dashboard
```bash
cd dashboard && npm run build
```

### Build service
```bash
cd services/auth-service && npm run build
```

---

## Database

### Generate migration
```bash
cd services/auth-service && npm run db:generate
```

### Run migration
```bash
cd services/auth-service && npm run db:migrate
```

### Open Drizzle Studio
```bash
cd services/auth-service && npm run db:studio
```

---

## Linting

### Lint dashboard
```bash
cd dashboard && npm run lint
```

### Lint service
```bash
cd services/auth-service && npm run lint
cd services/auth-service && npm run lint:fix
```

---

## CI/CD

### Trigger CI manually
```bash
git push origin main
# or
git push origin develop
```

### Check CI status
Go to: https://github.com/YOUR_USERNAME/PROJECT_NAME/actions

---

## Production

### Deploy to Vercel (dashboard)
```bash
cd dashboard
vercel --prod
```

### Check deployment
```bash
vercel ls
```

---

## Monitoring

### View Sentry errors (after setup)
Go to: https://sentry.io/organizations/YOUR_ORG/

### View logs
```bash
# Vercel logs
vercel logs

# Railway logs (if using Railway)
railway logs
```

---

## Useful Commands

### Install all dependencies
```bash
# Root
npm install

# Dashboard
cd dashboard && npm install

# Each service
cd services/auth-service && npm install
```

### Clean install
```bash
# Remove all node_modules
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Reinstall
npm install
cd dashboard && npm install
cd ../services/auth-service && npm install
# ... etc
```

### Check for updates
```bash
npm outdated
```

### Update dependencies
```bash
npm update
```

---

## Git Workflow

### Feature branch
```bash
git checkout -b feature/your-feature-name
# work work work
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Create PR
```

### Hotfix
```bash
git checkout -b hotfix/your-fix-name
# fix fix fix
git add .
git commit -m "fix: fix the bug"
git push origin hotfix/your-fix-name
# Create PR to main
```

---

## Next Steps (This Week)

### Day 1: Fix Tests
```bash
# Fix invoice-service
cd services/invoice-service
npm test -- --verbose

# Fix any failing tests
# Run all tests
./scripts/test-all.sh
```

### Day 2: Update CI/CD
```bash
# Edit .github/workflows/ci.yml
# Update matrix to include all services
# Remove ||true from test and lint commands
# Commit and push
git add .github/workflows/ci.yml
git commit -m "fix: update CI/CD pipeline"
git push
```

### Day 3-4: Security
```bash
# Read WEEK_1_ACTION_PLAN.md for detailed steps
cat WEEK_1_ACTION_PLAN.md
```

### Day 5: Monitoring
```bash
# Setup Sentry (see WEEK_1_ACTION_PLAN.md)
```

### Day 6-7: Documentation
```bash
# Add Swagger to services (see WEEK_1_ACTION_PLAN.md)
```

---

## Environment Setup

### Required .env variables

**Dashboard (.env.local):**
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NEXT_PUBLIC_API_URL=http://localhost:3000
PUSHER_APP_ID=...
PUSHER_SECRET=...
STRIPE_SECRET_KEY=...
# ... etc
```

**Services (.env):**
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=http://localhost:3001
# ... etc
```

---

## Troubleshooting

### Tests failing?
```bash
# Clear Jest cache
cd services/auth-service
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Build errors?
```bash
# Clean build
cd dashboard
rm -rf .next
npm run build
```

### Database issues?
```bash
# Reset database (CAUTION: will delete data)
# Drop all tables and re-run migrations
```

### Redis issues?
```bash
# Check Redis connection
node test-redis.js
```

---

## Documentation

- 📖 **Project Status:** Read `PROJECT_STATUS_REPORT.md`
- 📅 **Action Plan:** Read `WEEK_1_ACTION_PLAN.md`
- 🏗️ **Architecture:** Read `ARCHITECTURE.md`
- 📝 **This File:** Quick reference commands

---

## Support

Need help? Check:
1. Project documentation files
2. Service README files
3. GitHub Issues
4. Stack Overflow

---

**Last Updated:** 11 January 2026
