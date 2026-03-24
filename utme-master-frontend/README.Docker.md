# Frontend Docker Guide

Docker setup for UTME Master frontend.

## Quick Start

### Build and Run

```bash
# Build image
docker build -t utme-master-frontend .

# Run container
docker run -p 80:80 utme-master-frontend

# Or with docker-compose
docker-compose up -d
```

### Development

```bash
# Mount source code for hot reload
docker run -p 80:80 -v $(pwd):/app utme-master-frontend
```

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=UTME Master
VITE_APP_URL=http://localhost:5173
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PDF_EXPORT=true
```

## Docker Compose

See `../utme-master-backend/docker-compose.all.yml` for full stack setup.

## Build Optimization

The Dockerfile uses multi-stage builds:
1. **Builder stage**: Install dependencies and build
2. **Production stage**: Copy only built assets to nginx

## Health Check

```bash
curl http://localhost:80/health
```

## Production Deployment

```bash
# Build optimized image
docker build -t utme-master-frontend:latest .

# Run with restart policy
docker run -d -p 80:80 --restart unless-stopped utme-master-frontend:latest
```

## Troubleshooting

### Build Fails

```bash
# Clear cache
docker build --no-cache -t utme-master-frontend .

# Check node version (needs Node 18+)
node --version
```

### Port Already in Use

```bash
# Change port mapping
docker run -p 8080:80 utme-master-frontend
```

### CORS Errors

Ensure `VITE_API_URL` points to your backend:

```env
VITE_API_URL=http://your-backend-ip:5000/api
```
