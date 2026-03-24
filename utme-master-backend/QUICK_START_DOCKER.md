# Quick Start - Docker

## Windows
```cmd
cd utme-master-backend
START_DOCKER.bat
```

## Linux/Mac
```bash
cd utme-master-backend
./docker-setup.sh
```

## Manual Commands

### Start All Services
```bash
docker-compose -f docker-compose.all.yml up -d
```

### View Logs
```bash
docker-compose -f docker-compose.all.yml logs -f
```

### Stop Services
```bash
docker-compose -f docker-compose.all.yml down
```

### Stop and Remove Data
```bash
docker-compose -f docker-compose.all.yml down -v
```

## Access Points

| Service | URL |
|---------|-----|
| Backend API | http://localhost:5000 |
| Frontend | http://localhost:80 |
| API Health | http://localhost:5000/api/health |
| Adminer (DB UI) | http://localhost:8080 |

## Development Mode

```bash
# Start with hot-reload
docker-compose -f docker-compose.local.yml up -d

# Access backend at http://localhost:5000
# Changes to code will auto-reload
```

## Common Tasks

### Run Migrations
```bash
docker exec utme-master-backend npx prisma migrate deploy
```

### Database Backup
```bash
docker exec utme-master-db pg_dump -U utme_user utme_master > backup.sql
```

### Database Restore
```bash
docker exec -i utme-master-db psql -U utme_user -d utme_master < backup.sql
```

### Enter Container
```bash
docker exec -it utme-master-backend sh
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Edit `.env` with your settings
3. Run `docker-compose -f docker-compose.all.yml up -d`

## Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=5001
```

### Database Connection Failed
```bash
# Wait 30-60 seconds for database to initialize
# Check logs: docker-compose logs db
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose build backend
docker-compose up backend
```

## Documentation

- `README.Docker.md` - Full Docker guide
- `docs/DOCKER.md` - Deployment guide
- `docs/SETUP.md` - Environment setup
- `docs/DEPLOYMENT.md` - Production deployment
