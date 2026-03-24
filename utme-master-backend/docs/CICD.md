# CI/CD Pipeline Documentation

Complete guide to UTME Master's continuous integration and deployment pipeline.

## Overview

Our CI/CD pipeline automates:
- Code linting and type checking
- Unit and integration testing
- E2E testing
- Docker image building
- Security scanning
- Automated deployment

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      GitHub Repository                       │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────▼───────────┐
         │   CI/CD Pipeline      │
         │   (.github/workflows) │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │   Lint & Type Check   │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │   Backend Tests       │
         │   + Coverage          │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │   Frontend Tests      │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │   E2E Tests           │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │   Docker Build        │
         │   + Security Scan     │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │   Deploy to Staging   │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │   Deploy to Production│
         └───────────────────────┘
```

## Workflows

### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**
- `lint` - ESLint and TypeScript type checking
- `backend-tests` - Jest unit and integration tests
- `frontend-tests` - Vitest component tests
- `e2e-tests` - Playwright end-to-end tests
- `build-docker` - Build and push Docker images
- `deploy-production` - Deploy to production (manual)
- `deploy-staging` - Deploy to staging (auto on develop)

### 2. Dependabot (`.github/workflows/dependabot.yml`)

**Triggers:**
- Weekly on Monday at 9 AM UTC

**Updates:**
- npm dependencies (backend and frontend)
- Docker images
- GitHub Actions

### 3. CodeQL Security Analysis (`.github/workflows/codeql.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests
- Weekly on Sunday

**Scans:**
- JavaScript/TypeScript code
- Python code (if any)

### 4. Docker Image Scan (`.github/workflows/docker-scan.yml`)

**Triggers:**
- Dockerfile changes
- Manual workflow dispatch

**Scans:**
- Backend Docker image
- Frontend Docker image
- Uses Trivy for vulnerability scanning

### 5. SonarQube Analysis (`.github/workflows/sonarqube.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests

**Features:**
- Code quality metrics
- Technical debt analysis
- Code coverage tracking

### 6. Stale Issue Handler (`.github/workflows/stale.yml`)

**Triggers:**
- Daily at 9 AM UTC (Monday-Friday)

**Actions:**
- Marks issues/PRs as stale after 30 days
- Closes after 7 days of inactivity
- Exempts pinned issues

## Deployment

### Automatic Deployment

**Staging:**
- Automatically deploys on push to `develop` branch
- Uses `docker-compose.staging.yml`

**Production:**
- Manually triggered via GitHub Actions
- Requires approval from maintainers
- Uses `docker-compose.prod.yml`

### Manual Deployment

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production

# Deploy specific version
./scripts/deploy.sh production v1.2.3
```

### Rollback

```bash
# Rollback to previous version
# Use the Rollback workflow in GitHub Actions
```

## Environment Variables

### GitHub Secrets

| Secret | Description |
|--------|-------------|
| `PRODUCTION_HOST` | Production server hostname |
| `PRODUCTION_USER` | Production server username |
| `PRODUCTION_SSH_KEY` | SSH key for production |
| `STAGING_HOST` | Staging server hostname |
| `STAGING_USER` | Staging server username |
| `STAGING_SSH_KEY` | SSH key for staging |
| `SLACK_WEBHOOK_URL` | Slack notification webhook |
| `SONAR_HOST_URL` | SonarQube server URL |
| `SONAR_TOKEN` | SonarQube authentication token |

### Docker Compose

| Variable | Description |
|----------|-------------|
| `POSTGRES_USER` | Database username |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DB` | Database name |
| `DATABASE_URL` | Database connection string |
| `JWT_SECRET` | JWT signing secret |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USERNAME` | SMTP username |
| `SMTP_PASSWORD` | SMTP password |

## Testing

### Run Tests Locally

```bash
# Backend tests
npm test

# Frontend tests
npm test -- --run

# E2E tests
npm run test:e2e

# With coverage
npm run coverage
```

### Test Coverage

- Backend: 80%+ coverage
- Frontend: 70%+ coverage
- E2E: Critical user flows

## Security

### Automated Security Checks

1. **CodeQL** - Static code analysis
2. **Trivy** - Docker image scanning
3. **Dependabot** - Dependency updates
4. **Audit** - npm audit checks

### Security Best Practices

- Never commit secrets
- Use environment variables
- Keep dependencies updated
- Run security scans regularly
- Review PRs before merging

## Monitoring

### Health Checks

- Backend: `/api/health`
- Frontend: `/health`
- Database: `pg_isready`

### Logs

```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# Database logs
docker-compose logs db
```

## Troubleshooting

### Pipeline Fails

1. Check workflow logs in GitHub
2. Verify environment variables
3. Check Docker image build logs
4. Review test output

### Deployment Fails

1. Check server SSH access
2. Verify Docker images exist
3. Review deployment logs
4. Check database migrations

### Tests Fail

1. Run tests locally
2. Check test environment setup
3. Review test output
4. Verify test data

## Best Practices

1. **Commit Small Changes** - Easier to review and debug
2. **Write Tests** - Test new features and bug fixes
3. **Update Documentation** - Keep docs in sync
4. **Review PRs** - Get peer review before merging
5. **Monitor CI/CD** - Watch for failures
6. **Update Dependencies** - Keep up with security patches

## Support

For CI/CD issues:
1. Check workflow logs
2. Review documentation
3. Contact DevOps team
4. Open GitHub issue
