# Deployment Guide

Complete deployment guide for UTME Master.

## Overview

This guide covers:
- Deployment strategies
- Environment setup
- Rollback procedures
- Monitoring and maintenance

## Deployment Strategies

### 1. Blue-Green Deployment

**Process:**
1. Deploy new version alongside current version
2. Test new version
3. Switch traffic to new version
4. Keep old version for rollback

**Advantages:**
- Zero downtime
- Easy rollback
- Safe testing

**Commands:**
```bash
# Deploy new version
docker-compose -f docker-compose.prod.yml up -d

# Switch traffic (update DNS or load balancer)
# Rollback if needed
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Rolling Deployment

**Process:**
1. Deploy new version to one instance
2. Test instance
3. Deploy to remaining instances
4. Monitor for issues

**Advantages:**
- Gradual rollout
- Easy to detect issues
- Minimal downtime

**Commands:**
```bash
# Deploy with rolling update
docker-compose -f docker-compose.prod.yml up -d --scale backend=2
```

### 3. Canary Deployment

**Process:**
1. Deploy new version to small subset
2. Monitor metrics
3. Gradually increase traffic
4. Full rollout if successful

**Advantages:**
- Minimal risk
- Gradual rollout
- Easy rollback

**Commands:**
```bash
# Deploy to 10% of instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=1
```

## Environment Setup

### Development

```bash
# Start development environment
docker-compose -f docker-compose.local.yml up -d

# Access:
# Backend: http://localhost:5000
# Frontend: http://localhost:5173
```

### Staging

```bash
# Start staging environment
docker-compose -f docker-compose.staging.yml up -d

# Access:
# Backend: http://staging.utmemaster.com
# Frontend: http://staging.utmemaster.com
```

### Production

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Access:
# Backend: https://api.utmemaster.com
# Frontend: https://utmemaster.com
```

## Deployment Commands

### Quick Deploy

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

### Manual Deploy

```bash
# Pull latest code
git pull origin main

# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### Docker Deploy

```bash
# Build and push images
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml push

# Deploy
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Rollback Procedures

### Database Rollback

```bash
# Rollback to previous version
./scripts/rollback.sh production

# Or manually
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml exec db psql -U utme_user -d utme_master < backups/backup-20240101.sql
docker-compose -f docker-compose.prod.yml up -d
```

### Application Rollback

```bash
# Rollback to previous version
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend health
curl http://localhost:80/health

# Database health
docker exec utme-master-db pg_isready
```

### Logs

```bash
# All logs
docker-compose -f docker-compose.prod.yml logs -f

# Backend logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Frontend logs
docker-compose -f docker-compose.prod.yml logs -f frontend

# Database logs
docker-compose -f docker-compose.prod.yml logs -f db
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

## Maintenance

### Database Maintenance

```bash
# Vacuum database
docker exec utme-master-db pg_dump -U utme_user utme_master | gzip > backups/vacuum-$(date +%Y%m%d).sql.gz

# Analyze tables
docker exec utme-master-db psql -U utme_user -d utme_master -c "ANALYZE"
```

### Application Maintenance

```bash
# Clear cache
docker exec utme-master-backend npm run cache:clear

# Clear logs
docker exec utme-master-backend npm run logs:clear
```

### Security Updates

```bash
# Update dependencies
npm audit fix

# Update Docker images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Deployment Fails

1. Check logs: `docker-compose logs`
2. Verify Docker is running
3. Check disk space
4. Review error messages

### Rollback Fails

1. Check backup integrity
2. Verify database is running
3. Check disk space
4. Manual restore from backup

### Services Not Starting

1. Check logs: `docker-compose logs`
2. Verify configuration
3. Check ports are available
4. Review error messages

## Best Practices

1. **Always backup before deployment**
2. **Test in staging first**
3. **Have rollback plan ready**
4. **Monitor during deployment**
5. **Verify after deployment**
6. **Document everything**
7. **Communicate with team**
8. **Schedule maintenance windows**

## Support

For deployment issues:
1. Check documentation
2. Review logs
3. Contact DevOps team
4. Open GitHub issue
