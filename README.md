# Flow

Monorepo with dashboard, mobile app, and 9 backend microservices.

## Structure

```
Flow/
├── apps/
│   ├── dashboard/        Next.js frontend (Railway + Vercel serverless APIs)
│   └── mobile/           Expo React Native app
├── packages/
│   └── shared/           Shared schema, middleware, types, utilities
├── services/             9 microservices (auth, user, team, project, task,
│                         chat, file, invoice, notification) + _template
├── infrastructure/
│   └── database/
│       └── migrations/   Drizzle-managed SQL migrations
├── scripts/              Dev/deploy helper shell scripts
└── docs/                 Architecture, deployment, a11y
```

All JS packages (`apps/*`, `packages/*`, `services/*`) are npm workspaces, wired
through the root `package.json`.

## Quick start

```bash
npm install                       # installs all workspaces
npm run build                     # builds dashboard (Railway entrypoint)
cd apps/dashboard && npm run dev  # dashboard dev server on :3001
bash scripts/start-dev.sh         # brings up services + dashboard
```

Each service runs independently on its own port (see `services/<svc>/.env.example`).

## Database

Drizzle is configured at the repo root (`drizzle.config.ts`):
- schema: `packages/shared/schema.ts`
- migrations: `infrastructure/database/migrations/`

```bash
npm run db:push       # push schema
npm run db:studio     # Drizzle Studio
```

> `services/chat-service` keeps its own Drizzle config and schema for its
> dedicated database — it is intentionally separate.

## Deploy

- **Railway** deploys `apps/dashboard` (see `railway.json` / `railway.toml`).
- **Vercel** deploys `apps/dashboard/app/api/**` as serverless functions (see
  `vercel.json`) and each `services/<svc>` as a separate Vercel project.

See [`docs/deployment-railway.md`](docs/deployment-railway.md) and
[`docs/deployment-checklist.md`](docs/deployment-checklist.md).

## Docs

- [Architecture overview](docs/architecture.md)
- [Deployment — Railway](docs/deployment-railway.md)
- [Deployment checklist](docs/deployment-checklist.md)
- [Production checklist](docs/production-checklist.md)
- [Accessibility](docs/a11y/)
