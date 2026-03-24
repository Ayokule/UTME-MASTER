# Docker Deployment Guide

Complete guide for deploying UTME Master with Docker.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                             │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────▼───────────┐
         │       Nginx (80)      │
         │   (Optional Proxy)    │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │   Frontend (80)       │
         │   React App           │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │   Backend (5000)      │
         │   Express API         │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │   PostgreSQL (5432)   │
         │   Database            │
         └───────────────────────┘
```

## Prerequisites

- Docker Engine 20+ or Docker Desktop
- Docker Compose 2+
- 4GB+ RAM recommended
- 20GB+ disk space

## Deployment Options

### Option 1: Single Server (Recommended)

```bash
# Clone repository
git clone <repo-url>
cd utme-master-backend

# Create environment file
cp .env.example .env
# Edit .env with your settings

# Start all services
docker-compose -f docker-compose.all.yml up -d

# Check status
docker-compose -f docker-compose.all.yml ps
```

### Option 2: Docker Compose Local

```bash
# Backend only (for development)
docker-compose up -d

# Frontend only
cd ../utme-master-frontend
docker-compose up -d
```

### Option 3: Docker Swarm (High Availability)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.swarm.yml utme-master

# Check services
docker stack services utme-master
```

### Option 4: Kubernetes

See `kubernetes/` directory for manifests (if available).

## Environment Configuration

### Backend (.env)

```env
# Production settings
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@db:5432/dbname

# JWT (use strong secret in production)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Email (configure SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@utmemaster.com

# Security
CORS_ORIGINS=https://your-domain.com
ENABLE_RATE_LIMIT=true
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
```

### Frontend (.env)

```env
VITE_API_URL=https://api.your-domain.com/api
VITE_APP_NAME=UTME Master
VITE_APP_URL=https://your-domain.com
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PDF_EXPORT=true
```

## SSL/TLS Configuration

### Using Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Proxy to frontend
    location / {
        proxy_pass http://frontend:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy to backend
    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Using Let's Encrypt

```bash
# Install certbot
docker run -it --rm --name certbot \
  -v "/etc/letsencrypt:/etc/letsencrypt" \
  -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
  certbot/certbot certonly --standalone

# Configure nginx to use certificates
# See nginx.conf example above
```

## Monitoring

### Health Checks

```bash
# Backend
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:80/health

# Database
docker exec utme-master-db pg_isready
```

### Logs

```bash
# All services
docker-compose -f docker-compose.all.yml logs -f

# Backend
docker-compose -f docker-compose.all.yml logs -f backend

# Frontend
docker-compose -f docker-compose.all.yml logs -f frontend

# Database
docker-compose -f docker-compose.all.yml logs -f db
```

### Metrics

```bash
# Container stats
docker stats

# Backend metrics
docker exec utme-master-backend cat /proc/meminfo
```

## Backup and Recovery

### Database Backup

```bash
# Backup
docker exec utme-master-db pg_dump -U utme_user utme_master > backup.sql

# Restore
docker exec -i utme-master-db psql -U utme_user -d utme_master < backup.sql
```

### Full Backup

```bash
# Create backup directory
mkdir -p backups

# Backup database
docker exec utme-master-db pg_dump -U utme_user utme_master > backups/backup-$(date +%Y%m%d).sql

# Backup uploads
docker cp utme-master-backend:/app/uploads backups/uploads-$(date +%Y%m%d).tar
tar -czf backups/uploads-$(date +%Y%m%d).tar -C /app uploads
```

### Automated Backup

Create `scripts/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker exec utme-master-db pg_dump -U utme_user utme_master > $BACKUP_DIR/db-$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "db-*.sql" -mtime +30 -delete
```

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/scripts/backup.sh
```

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  backend:
    deploy:
      replicas: 3
    depends_on:
      - db
```

```bash
docker-compose -f docker-compose.scale.yml up -d
```

### Load Balancing

Nginx handles load balancing in the reverse proxy setup.

## Security

### Best Practices

1. **Use strong secrets**
   ```env
   JWT_SECRET=$(openssl rand -base64 32)
   ```

2. **Enable HTTPS**
   - Use Let's Encrypt or cloud provider SSL

3. **Restrict database access**
   ```env
   # Don't expose database port
   # ports:
   #   - "5432:5432"  # Comment this out
   ```

4. **Use non-root user**
   - Already configured in Dockerfile

5. **Keep images updated**
   ```bash
   docker-compose -f docker-compose.all.yml pull
   docker-compose -f docker-compose.all.yml up -d --build
   ```

### Security Checklist

- [ ] Change default passwords
- [ ] Enable HTTPS
- [ ] Restrict database ports
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Update dependencies regularly
- [ ] Enable logging and monitoring
- [ ] Configure firewall rules

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :5000

# Or change port in .env
PORT=5001
```

#### Database Connection Failed

```bash
# Check if database is running
docker-compose ps

# View database logs
docker-compose logs db

# Wait for database to be ready
sleep 30
```

#### Container Exits Immediately

```bash
# Check logs
docker-compose logs backend

# Rebuild image
docker-compose build backend
docker-compose up backend
```

#### Permission Denied

```bash
# Fix permissions
chmod -R 755 logs uploads
```

#### Out of Memory

```env
# Increase Docker memory (Docker Desktop settings)
# Or limit container memory
deploy:
  resources:
    limits:
      memory: 2G
```

### Debug Mode

```bash
# Start with debug logging
docker-compose -f docker-compose.all.yml up --build

# Enter container
docker exec -it utme-master-backend sh

# Run server manually
npm run dev
```

## Performance Tuning

### Backend

```env
# Node.js options
NODE_OPTIONS=--max-old-space-size=4096

# Database connection pool
DATABASE_URL=postgresql://user:pass@db:5432/db?connection_limit=10
```

### Database

```env
# PostgreSQL settings
POSTGRES_SHARED_BUFFERS=256MB
POSTGRES_MAX_CONNECTIONS=100
```

### Nginx

```nginx
# Optimize for production
worker_processes auto;
events {
    worker_connections 1024;
}
```

## Updates

### Update Images

```bash
# Pull latest images
docker-compose -f docker-compose.all.yml pull

# Rebuild and restart
docker-compose -f docker-compose.all.yml up -d --build
```

### Update Database Schema

```bash
# Run migrations
docker exec utme-master-backend npx prisma migrate deploy
```

## Support

For issues:
1. Check logs: `docker-compose logs`
2. Check health: `curl http://localhost:5000/api/health`
3. Review documentation
4. Open GitHub issue
