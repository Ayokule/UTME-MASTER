# Migration Strategy Guide

Complete migration strategy with rollback procedures and data safety measures.

## Overview

This guide covers:
- Database migrations
- Application version upgrades
- Environment migrations
- Rollback procedures
- Data backup and recovery

## Migration Types

### 1. Database Migrations

**Tool:** Prisma Migrate

**Commands:**
```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Rollback migration
npx prisma migrate resolve --rolled-back "migration_name"
```

### 2. Application Migrations

**Process:**
1. Backup current version
2. Deploy new version
3. Run migrations
4. Verify deployment
5. Monitor for issues

### 3. Environment Migrations

**Process:**
1. Test in staging
2. Deploy to production
3. Monitor metrics
4. Rollback if needed

## Pre-Migration Checklist

### 1. Backup

```bash
# Database backup
docker exec utme-master-db pg_dump -U utme_user utme_master > backups/backup-$(date +%Y%m%d).sql

# Application backup
tar -czf backups/app-backup-$(date +%Y%m%d).tar dist/ node_modules/

# Configuration backup
cp .env .env.backup-$(date +%Y%m%d)
```

### 2. Verify Health

```bash
# Check system health
curl http://localhost:5000/api/health

# Check database connection
docker exec utme-master-db pg_isready

# Check disk space
df -h
```

### 3. Notify Stakeholders

- Send pre-migration notification
- Schedule maintenance window
- Prepare rollback plan

## Migration Process

### Database Migration

```bash
# 1. Create migration
npx prisma migrate dev --name add_new_feature

# 2. Review migration
cat prisma/migrations/20240101000000_add_new_feature/migration.sql

# 3. Apply to staging
npx prisma migrate deploy

# 4. Test in staging
npm test

# 5. Apply to production
docker exec utme-master-backend npx prisma migrate deploy
```

### Application Migration

```bash
# 1. Build new version
npm run build

# 2. Test locally
npm run dev

# 3. Build Docker image
docker build -t utme-master:latest .

# 4. Test Docker image
docker run -p 5000:5000 utme-master:latest

# 5. Deploy to staging
docker-compose -f docker-compose.staging.yml up -d

# 6. Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## Rollback Procedures

### Database Rollback

```bash
# Method 1: Prisma rollback
npx prisma migrate resolve --rolled-back "migration_name"

# Method 2: Manual SQL rollback
docker exec -i utme-master-db psql -U utme_user -d utme_master < backups/backup-20240101.sql

# Method 3: Restore from backup
pg_restore -U utme_user -d utme_master backups/backup-20240101.dump
```

### Application Rollback

```bash
# Method 1: Docker rollback
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Method 2: Manual rollback
# 1. Stop current version
docker-compose -f docker-compose.prod.yml down

# 2. Restore previous version
docker-compose -f docker-compose.prod.yml up -d

# 3. Run rollback migration
npx prisma migrate resolve --rolled-back "migration_name"
```

### Full Rollback

```bash
# 1. Stop all services
docker-compose -f docker-compose.prod.yml down

# 2. Restore database from backup
docker exec -i utme-master-db psql -U utme_user -d utme_master < backups/backup-20240101.sql

# 3. Restore application
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify rollback
curl http://localhost:5000/api/health
```

## Automated Rollback

### GitHub Actions Rollback

```yaml
# .github/workflows/rollback.yml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to rollback'
        required: true
        type: choice
        options:
          - staging
          - production

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /opt/utme-master
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring During Migration

### Health Checks

```bash
# Backend health
curl http://localhost:5000/api/health

# Database health
docker exec utme-master-db pg_isready

# Redis health
docker exec utme-master-redis redis-cli ping
```

### Logs

```bash
# Backend logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Database logs
docker-compose -f docker-compose.prod.yml logs -f db

# Frontend logs
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Metrics

```bash
# Container stats
docker stats

# Database connections
docker exec utme-master-db psql -U utme_user -c "SELECT count(*) FROM pg_stat_activity"

# Memory usage
docker exec utme-master-backend cat /proc/meminfo
```

## Rollback Triggers

### Automatic Rollback

Configure automatic rollback in Docker Compose:

```yaml
deploy:
  restart_policy:
    condition: on-failure
    delay: 5s
    max_attempts: 3
  update_config:
    parallelism: 1
    delay: 10s
    failure_action: rollback
```

### Manual Rollback

```bash
# Trigger rollback via GitHub Actions
# Or use manual rollback script
./scripts/rollback.sh
```

## Rollback Script

### Linux/Mac

```bash
#!/bin/bash
# scripts/rollback.sh

set -e

ENVIRONMENT="${1:-production}"

echo "Rolling back to previous version..."
echo "Environment: $ENVIRONMENT"

# Stop current services
docker-compose -f docker-compose.prod.yml down

# Restore database from latest backup
LATEST_BACKUP=$(ls -t backups/*.sql | head -1)
echo "Restoring from: $LATEST_BACKUP"
docker exec -i utme-master-db psql -U utme_user -d utme_master < $LATEST_BACKUP

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Verify rollback
curl http://localhost:5000/api/health
```

### Windows

```batch
@echo off
REM scripts/rollback.bat

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

echo Rolling back to previous version...
echo Environment: %ENVIRONMENT%

docker-compose -f docker-compose.prod.yml down

for /f "tokens=*" %%i in ('dir /b /od backups\*.sql ^| findstr /v "^$"') do set LATEST=%%i
echo Restoring from: %LATEST%
docker exec -i utme-master-db psql -U utme_user -d utme_master < backups\%LATEST%

docker-compose -f docker-compose.prod.yml up -d

curl http://localhost:5000/api/health
```

## Data Safety Measures

### 1. Backup Strategy

| Frequency | Retention | Method |
|-----------|-----------|--------|
| Daily | 30 days | Automated |
| Weekly | 90 days | Automated |
| Monthly | 1 year | Automated |
| Pre-migration | Indefinite | Manual |

### 2. Backup Verification

```bash
# Verify backup integrity
pg_restore --list backups/backup-20240101.dump

# Test restore in staging
docker exec -i utme-master-db psql -U utme_user -d utme_master_test < backups/backup-20240101.sql
```

### 3. Data Validation

```bash
# Verify record counts
docker exec utme-master-db psql -U utme_user -d utme_master -c "SELECT count(*) FROM users"
docker exec utme-master-db psql -U utme_user -d utme_master -c "SELECT count(*) FROM exams"
docker exec utme-master-db psql -U utme_user -d utme_master -c "SELECT count(*) FROM questions"
```

## Migration Testing

### 1. Staging Testing

```bash
# Deploy to staging
docker-compose -f docker-compose.staging.yml up -d

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Manual testing
# Test all features manually
```

### 2. Smoke Tests

```bash
# Test basic functionality
curl http://localhost:5000/api/health
curl http://localhost:5000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"password"}'
curl http://localhost:5000/api/subjects
```

## Rollback Documentation

### Rollback Checklist

- [ ] Backup current state
- [ ] Stop services
- [ ] Restore database from backup
- [ ] Restore application
- [ ] Start services
- [ ] Verify health
- [ ] Run smoke tests
- [ ] Notify stakeholders
- [ ] Document rollback
- [ ] Post-rollback review

### Rollback Report Template

```
Rollback Report
===============

Date: YYYY-MM-DD
Environment: production
Reason: [reason]
Duration: [duration]

Steps Taken:
1. [step 1]
2. [step 2]
3. [step 3]

Verification:
- [ ] Database restored
- [ ] Application running
- [ ] Health checks passing
- [ ] Smoke tests passing

Issues Encountered:
- [issue 1]
- [issue 2]

Next Steps:
- [action 1]
- [action 2]
```

## Best Practices

1. **Always backup before migration**
2. **Test in staging first**
3. **Have rollback plan ready**
4. **Monitor during migration**
5. **Verify after migration**
6. **Document everything**
7. **Communicate with team**
8. **Schedule maintenance windows**

## Troubleshooting

### Migration Fails

1. Check migration logs
2. Review error messages
3. Check database connection
4. Verify migration file
5. Manual rollback if needed

### Rollback Fails

1. Check backup integrity
2. Verify database is running
3. Check disk space
4. Manual restore from backup
5. Contact support if needed

### Data Corruption

1. Stop all services
2. Restore from backup
3. Verify data integrity
4. Investigate root cause
5. Implement preventive measures

## Support

For migration issues:
1. Check documentation
2. Review logs
3. Contact DevOps team
4. Open GitHub issue
