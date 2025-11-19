# Docker Hub Setup for GitHub Actions

## Problem
The GitHub Actions workflow uses `docker/login-action@v3` which requires Docker Hub credentials. If these secrets are not configured, you'll see the error:
```
Error: Username and password required
```

## Solution

### Option 1: Add Docker Hub Secrets (Recommended for pushing images)

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:
   - **Name**: `DOCKER_USERNAME`
     - **Value**: Your Docker Hub username
   - **Name**: `DOCKER_PASSWORD`
     - **Value**: Your Docker Hub password or access token (recommended)

#### Using Docker Hub Access Token (Recommended)

Instead of using your password, create an access token:

1. Go to [Docker Hub](https://hub.docker.com/)
2. Navigate to **Account Settings** → **Security** → **New Access Token**
3. Create a token with read/write permissions
4. Copy the token and use it as the `DOCKER_PASSWORD` secret

### Option 2: Workflow Behavior Without Secrets

The workflow has been updated to handle missing secrets gracefully:

- **If secrets are missing**: The workflow will still build Docker images locally (without pushing)
- **If secrets are present**: The workflow will build and push images to Docker Hub

This allows the CI pipeline to run successfully even without Docker Hub credentials, which is useful for:
- Testing the build process
- Pull requests from forks (which don't have access to secrets)
- Development workflows

## Current Workflow Behavior

The `docker-build` job will:
1. **Always build** the Docker image
2. **Only login and push** if `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets are configured
3. **Skip push on pull requests** (even with secrets configured)

## Verification

After adding the secrets, push a commit to trigger the workflow. You should see:
- ✅ Docker login succeeds
- ✅ Images are pushed to Docker Hub (on push events, not PRs)
- ✅ Images tagged as: `your-username/service-name:latest` and `your-username/service-name:commit-sha`

