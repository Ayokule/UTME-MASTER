# Docker Setup Guide

Complete guide for running UTME Master with Docker.

## Prerequisites

- Docker (v20+)
- Docker Compose (v2+)
- Git

## Quick Start

### Option 1: Start All Services (Recommended)

```bash
# From utme-master-backend directory
docker-compose -f docker-compose.all.yml up -d

# View logs
docker-compose -f docker-compose.all.yml logs -f

# Stop all services
docker-compose -f docker-compose.all.yml down
```

### Option 2: Start Backend Only

```bash
# Start backend with database
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: Start Frontend Only

```bash
# From utme-master-frontend directory
docker-compose up -d
```

## Environment Variables

Create a `.env` file in `utme-master-backend`:

```env
# Database
POSTGRES_USER=utme_user
POSTGRES_PASSWORD=utme_password
POSTGRES_DB=utme_master
DATABASE_URL=postgresql://utme_user:utme_password@db:5432/utme_master

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@utmemaster.com

# Rate Limiting
ENABLE_RATE_LIMIT=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
```

## Available Services

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Database |
| Backend API | 5000 | Express API |
| Frontend | 80 | React Application |

## Health Checks

- **Backend**: `http://localhost:5000/api/health`
- **Frontend**: `http://localhost:80/health`
- **Database**: Auto-monitored by Docker

## Common Commands

### View Logs

```bash
# All services
docker-compose -f docker-compose.all.yml logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose -f docker-compose.all.yml logs -f frontend

# Database only
docker-compose logs -f db
```

### Restart Services

```bash
docker-compose -f docker-compose.all.yml restart
docker-compose -f docker-compose.all.yml restart backend
```

### Stop and Remove

```bash
# Stop services (keep data)
docker-compose -f docker-compose.all.yml down

# Stop and remove volumes (deletes data!)
docker-compose -f docker-compose.all.yml down -v
```

### Rebuild Images

```bash
docker-compose -f docker-compose.all.yml build --no-cache
docker-compose -f docker-compose.all.yml up -d --force-recreate
```

## Development

### Hot Reload for Backend

```bash
docker-compose -f docker-compose.local.yml up -d
```

This mounts your source code and restarts the server on changes.

### Running Migrations

```bash
# Enter backend container
docker exec -it utme-master-backend sh

# Run migrations
npx prisma migrate deploy

# Exit
exit
```

### Database Access

```bash
# Connect to database
docker exec -it utme-master-db psql -U utme_user -d utme_master

# Run queries
SELECT * FROM users LIMIT 10;

# Exit
\q
```

## Production Deployment

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.swarm.yml utme-master
```

### Using Kubernetes

See `kubernetes/` directory for manifests.

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 5000
netstat -ano | findstr :5000

# Or change the port in .env
PORT=5001
```

### Database Connection Failed

```bash
# Check if database is healthy
docker ps

# View database logs
docker-compose logs db

# Wait for database to be ready (30-60 seconds)
```

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Rebuild image
docker-compose build --no-cache backend

# Remove and recreate
docker-compose up -d --force-recreate backend
```

### Permission Denied

```bash
# Fix permissions
chmod -R 755 logs uploads
```

## Backup and Restore

### Backup Database

```bash
docker exec utme-master-db pg_dump -U utme_user utme_master > backup.sql
```

### Restore Database

```bash
docker exec -i utme-master-db psql -U utme_user -d utme_master < backup.sql
```

## Docker Compose Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Backend + Database |
| `docker-compose.local.yml` | Development with hot reload |
| `docker-compose.all.yml` | Backend + Frontend + Database |
| `docker-compose.swarm.yml` | Docker Swarm deployment |

## Performance Tuning

### Backend

```env
# Increase memory limit
NODE_OPTIONS=--max-old-space-size=4096

# Enable production mode
NODE_ENV=production
```

### Database

```env
# PostgreSQL settings
POSTGRES_MAX_CONNECTIONS=100
POSTGRES_SHARED_BUFFERS=256MB
```

## Security

1. Change `JWT_SECRET` in production
2. Use strong database passwords
3. Enable HTTPS with reverse proxy
4. Keep images updated
5. Use non-root user (already configured)

## Support

For issues, check:
- Backend logs: `docker-compose logs backend`
- Frontend logs: `docker-compose logs frontend`
- Database logs: `docker-compose logs db`
