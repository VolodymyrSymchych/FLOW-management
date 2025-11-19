# Vercel Environment Variables Setup

## Required Environment Variables

Each service deployed on Vercel needs these environment variables configured in the Vercel dashboard.

### Database Configuration

You have two options:

#### Option 1: Use DATABASE_URL (Recommended for Neon)
```
DATABASE_URL=postgresql://neondb_owner:npg_fNrEs4JTxjR9@ep-blue-sunset-abla90wi-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

#### Option 2: Use Individual Database Config
```
DB_HOST=your-host.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=your_password
```

### JWT Configuration (Required)
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ISSUER=project-scope-analyzer
JWT_EXPIRES_IN=1h
```

### Redis Configuration (Optional)
```
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

Or for Upstash Redis:
```
UPSTASH_REDIS_URL=your-upstash-url
UPSTASH_REDIS_TOKEN=your-upstash-token
```

### Service Configuration
```
NODE_ENV=production
SERVICE_NAME=project-service  # Change per service
PORT=3000
LOG_LEVEL=info
```

## How to Add Environment Variables in Vercel

### For Each Service Project:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your service project (e.g., `project-service`)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: The value
   - **Environments**: Select `Production`, `Preview`, and `Development`
5. Click **Save**

### Quick Setup Commands

You can also use Vercel CLI:

```bash
# Set DATABASE_URL for project-service
vercel env add DATABASE_URL production

# Set JWT_SECRET for all services
vercel env add JWT_SECRET production

# Pull environment variables to local
vercel env pull
```

## Environment Variables by Service

### auth-service
```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key
JWT_ISSUER=project-scope-analyzer
JWT_EXPIRES_IN=1h

# Redis (optional)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
```

### user-service
```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key  # Must match auth-service
JWT_ISSUER=project-scope-analyzer

# Redis (optional)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
```

### project-service
```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key  # Must match auth-service
JWT_ISSUER=project-scope-analyzer

# Redis (optional)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
```

### task-service
```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key  # Must match auth-service
JWT_ISSUER=project-scope-analyzer

# Redis (optional)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
```

## Important Notes

1. **Same JWT_SECRET**: All services must use the same `JWT_SECRET` for authentication to work
2. **Same DATABASE_URL**: All services should connect to the same database
3. **Production vs Development**: Set different values for different environments if needed
4. **Security**: Never commit these values to Git. They're only in Vercel dashboard

## Verification

After adding environment variables:

1. Redeploy your service
2. Check the deployment logs
3. Look for successful startup messages
4. Test API endpoints

### Expected Success Logs:
```
✓ Database connected
✓ Service started on port 3000
✓ Health check passed
```

### Common Errors:

**"Database configuration is incomplete"**
- Add `DATABASE_URL` environment variable

**"JWT_SECRET is not set"**
- Add `JWT_SECRET` environment variable

**"Connection timeout"**
- Check `DATABASE_URL` is correct
- Verify database accepts connections from Vercel IPs

## Your Current Setup

You mentioned you have:
```
DATABASE_URL=postgresql://neondb_owner:npg_fNrEs4JTxjR9@ep-blue-sunset-abla90wi-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

✅ This is correct! Make sure it's set for all 4 services.

Still needed:
- `JWT_SECRET` - Generate a secure random string
- `REDIS_HOST` and `REDIS_PORT` (if using Redis)

## Generating JWT_SECRET

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Or use this online: https://randomkeygen.com/

## Next Steps

1. Add `JWT_SECRET` to all 4 services
2. Redeploy
3. Test the health endpoint: `https://your-service.vercel.app/health`

