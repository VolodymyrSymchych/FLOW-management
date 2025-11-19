# GitHub Actions Workflows

## CI Workflow (`ci.yml`)

### Overview
This workflow runs on every push to `main` or `develop` branches and on pull requests.

### Jobs

#### 1. `lint-and-test`
Tests the `shared` TypeScript library:
- Installs Node.js 20
- Runs linting
- Builds TypeScript
- Runs tests

#### 2. `docker-build`
Builds Docker images for microservices:
- **Services**: `auth-service`, `user-service`, `project-service`, `task-service`
- **Note**: Does NOT build `shared` (it's a library, not a containerized service)
- Checks if Dockerfile exists before building
- Only pushes images if Docker Hub credentials are configured

### Docker Hub Credentials (Optional)

The workflow works **without** Docker Hub credentials:
- ✅ Builds Docker images locally
- ❌ Doesn't push to Docker Hub

To enable pushing to Docker Hub, add these secrets:
1. Go to repository Settings → Secrets and variables → Actions
2. Add:
   - `DOCKER_USERNAME` - Your Docker Hub username
   - `DOCKER_PASSWORD` - Your Docker Hub password or access token

### Build Process

**Without credentials:**
```
Build locally → Cache locally → No push
```

**With credentials:**
```
Login → Build → Push to Docker Hub → Cache in registry
```

### Service Structure

```
services/
├── auth-service/         ✅ Has Dockerfile
├── user-service/         ✅ Has Dockerfile
├── project-service/      ✅ Has Dockerfile
├── task-service/         ✅ Has Dockerfile
└── _template/            ⚠️  Template only

shared/                   ❌ No Dockerfile (TypeScript library)
```

### Troubleshooting

#### Error: "Cannot find module '../lib/tsc.js'"
**Fixed** - This was caused by trying to build the `shared` library as a Docker image. The workflow now only builds actual microservices.

#### Error: "Username and password required"
**Optional** - Docker Hub credentials are optional. The workflow builds images locally if credentials aren't provided.

#### Error: "failed to read dockerfile: open Dockerfile: no such file or directory"
**Fixed** - The workflow now checks if a Dockerfile exists before attempting to build.

### Manual Trigger

To manually trigger the workflow:
```bash
# Push to main or develop
git push origin main

# Or create a pull request
```

### Local Testing

To test the Docker build locally:
```bash
cd services/auth-service
docker build -t auth-service:local .

cd ../user-service
docker build -t user-service:local .
```

### Future Improvements

- [ ] Add integration tests
- [ ] Add security scanning with Trivy
- [ ] Add automated versioning
- [ ] Add deployment to staging/production

