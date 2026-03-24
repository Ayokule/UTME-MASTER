# Migration Checklist

Pre-migration and post-migration checklist for safe deployments.

## Pre-Migration Checklist

### 1. Planning

- [ ] Define migration scope
- [ ] Identify affected components
- [ ] Estimate migration time
- [ ] Schedule maintenance window
- [ ] Notify stakeholders
- [ ] Prepare rollback plan

### 2. Backup

- [ ] Database backup created
- [ ] Application backup created
- [ ] Configuration backup created
- [ ] Backup verified
- [ ] Backup stored securely

### 3. Environment

- [ ] Staging environment ready
- [ ] Test data prepared
- [ ] Monitoring configured
- [ ] Alerting configured
- [ ] Rollback resources available

### 4. Testing

- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Manual testing completed
- [ ] Performance testing completed

### 5. Documentation

- [ ] Migration plan documented
- [ ] Rollback procedures documented
- [ ] Known issues documented
- [ ] Contact list updated

## Migration Execution Checklist

### 1. Pre-Migration

- [ ] Stop all services
- [ ] Verify backup exists
- [ ] Notify users of maintenance
- [ ] Enable maintenance mode
- [ ] Disable non-essential features

### 2. Database Migration

- [ ] Apply database migrations
- [ ] Verify migration success
- [ ] Run data validation queries
- [ ] Check record counts

### 3. Application Deployment

- [ ] Build new version
- [ ] Test locally
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Deploy to production

### 4. Post-Migration

- [ ] Verify health checks
- [ ] Run smoke tests
- [ ] Monitor logs
- [ ] Verify data integrity
- [ ] Disable maintenance mode

## Post-Migration Checklist

### 1. Verification

- [ ] Backend health check passing
- [ ] Frontend health check passing
- [ ] Database connection working
- [ ] All endpoints responding
- [ ] Data integrity verified

### 2. Monitoring

- [ ] Error logs monitored
- [ ] Performance metrics reviewed
- [ ] User activity monitored
- [ ] Alerting configured

### 3. Documentation

- [ ] Migration log updated
- [ ] Rollback procedures documented
- [ ] Known issues documented
- [ ] Lessons learned recorded

### 4. Communication

- [ ] Stakeholders notified
- [ ] Users notified
- [ ] Documentation updated
- [ ] Post-mortem scheduled (if needed)

## Rollback Checklist

### 1. Pre-Rollback

- [ ] Identify rollback reason
- [ ] Verify backup integrity
- [ ] Notify stakeholders
- [ ] Prepare rollback plan
- [ ] Assemble rollback team

### 2. Rollback Execution

- [ ] Stop all services
- [ ] Restore database from backup
- [ ] Restore application from backup
- [ ] Start services
- [ ] Verify rollback success

### 3. Post-Rollback

- [ ] Verify health checks
- [ ] Run smoke tests
- [ ] Monitor logs
- [ ] Document rollback
- [ ] Schedule post-mortem

## Emergency Rollback Checklist

### 1. Immediate Actions

- [ ] Stop all services
- [ ] Notify emergency team
- [ ] Identify root cause
- [ ] Prepare emergency rollback
- [ ] Execute rollback

### 2. Recovery

- [ ] Verify system stability
- [ ] Monitor for issues
- [ ] Document incident
- [ ] Schedule post-mortem
- [ ] Implement preventive measures

## Quick Reference

### Database Backup
```bash
./scripts/backup.sh production
```

### Database Restore
```bash
./scripts/restore.sh production backup-name
```

### Rollback
```bash
./scripts/rollback.sh production
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Logs
```bash
docker-compose logs -f
```

## Contact Information

| Role | Name | Email | Phone |
|------|------|-------|-------|
| DevOps | [Name] | [Email] | [Phone] |
| Backend | [Name] | [Email] | [Phone] |
| Frontend | [Name] | [Email] | [Phone] |
| DBA | [Name] | [Email] | [Phone] |

## Emergency Contacts

| Service | Contact | Phone |
|---------|---------|-------|
| DevOps On-Call | [Email] | [Phone] |
| Backend Lead | [Email] | [Phone] |
| Frontend Lead | [Email] | [Phone] |
| DBA On-Call | [Email] | [Phone] |
