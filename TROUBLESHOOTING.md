# Flow Dashboard – Troubleshooting

## "Nothing is working"

The dashboard depends on several backend services. If pages are blank, APIs fail, or you see "Service Unavailable", check the following.

### 1. Services that must be running

| Service | Port | Required for |
|---------|------|--------------|
| **Dashboard** | 3001 | The app itself |
| **Auth** | 3002 | Login, signup, session |
| **User** | 3003 | User profile |
| **Project** | 3004 | Projects list, create project |
| **Task** | 3005 | Tasks, board view |
| **Team** | 3006 | Teams, workspace switcher |

Start each in its own terminal:

```bash
# Terminal 1 – Auth
cd services/auth-service && PORT=3002 npm run dev

# Terminal 2 – User
cd services/user-service && PORT=3003 npm run dev

# Terminal 3 – Project
cd services/project-service && PORT=3004 npm run dev

# Terminal 4 – Task
cd services/task-service && PORT=3005 npm run dev

# Terminal 5 – Team
cd services/team-service && PORT=3006 npm run dev

# Terminal 6 – Dashboard
cd dashboard && npm run dev
```

### 2. Environment variables

Copy and configure:

```bash
cp dashboard/.env.example dashboard/.env
```

Required:

- `DATABASE_URL` – PostgreSQL connection string
- `JWT_SECRET` – At least 32 characters (e.g. `openssl rand -base64 32`)

Optional (for caching):

- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### 3. Database

All services use the same PostgreSQL database. Ensure:

1. PostgreSQL is running
2. `DATABASE_URL` is correct
3. Migrations have been applied (e.g. `npm run db:push` from project root)

### 4. Port conflicts

If you see `EADDRINUSE`:

```bash
# Find process on port 3001
lsof -i :3001 -P -n

# Kill it (replace PID with actual process ID)
kill -9 <PID>
```

### 5. Blank dashboard page

- Open DevTools (F12) → Network tab and check for failed API calls (401, 500)
- Open Console for JavaScript errors
- Confirm you are logged in (session cookie)
- Confirm auth, project, task, and team services are running

### 6. API errors

- 401 Unauthorized: Not logged in or session expired → sign in again
- 500 / "Service Unavailable": Backend service not running or misconfigured
- CORS errors: Ensure dashboard URL (e.g. `http://localhost:3001`) is in the service’s allowed origins

### 7. Quick health check

```bash
# Dashboard
curl -s http://localhost:3001/api/health

# Auth (if running)
curl -s http://localhost:3002/health
```
