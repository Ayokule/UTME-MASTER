# UTME Master Backend Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v15 or higher)
- **npm** or **yarn**
- **Git**

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd utme-master-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
BACKEND_URL=http://localhost:5000

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/utme_master

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@utmemaster.com

# Logging
LOG_LEVEL=info
```

### 4. Set Up PostgreSQL Database

#### Create Database

```sql
CREATE DATABASE utme_master;
CREATE USER utme_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE utme_master TO utme_user;
```

#### Run Migrations

```bash
npx prisma migrate dev
```

#### Seed Database (Optional)

```bash
npx prisma db seed
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

---

## Production Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Configure Production Environment

Create a `.env.production` file:

```env
NODE_ENV=production
PORT=5000
BACKEND_URL=https://api.utmemaster.com

DATABASE_URL=postgresql://username:password@host:5432/utme_master

JWT_SECRET=your-production-secret-key
JWT_EXPIRES_IN=7d

FRONTEND_URL=https://utmemaster.com

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@utmemaster.com

LOG_LEVEL=warn
```

### 3. Run Migrations in Production

```bash
npx prisma migrate deploy
```

### 4. Start Production Server

```bash
npm start
```

### 5. Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/server.js --name utme-master-backend

# View logs
pm2 logs utme-master-backend

# Monitor application
pm2 monit

# Auto-start on reboot
pm2 startup
pm2 save
```

---

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY dist ./dist
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "dist/server.js"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/utme_master
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=utme_master
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### 3. Build and Run

```bash
docker-compose up --build
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Environment (development/production) |
| `PORT` | Yes | Server port |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `JWT_EXPIRES_IN` | No | Token expiration time (default: 7d) |
| `FRONTEND_URL` | Yes | Frontend application URL |
| `SMTP_HOST` | No | SMTP server host |
| `SMTP_PORT` | No | SMTP server port |
| `SMTP_USERNAME` | No | SMTP username |
| `SMTP_PASSWORD` | No | SMTP password |
| `FROM_EMAIL` | No | Sender email address |
| `LOG_LEVEL` | No | Logging level (debug/info/warn/error) |

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Error:**
```
Error: P1000: Database connection failed
```

**Solution:**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file
- Ensure user has proper permissions

#### 2. JWT Token Errors

**Error:**
```
JsonWebTokenError: invalid token
```

**Solution:**
- Verify JWT_SECRET matches between token creation and verification
- Check token expiration
- Ensure token is sent in Authorization header

#### 3. Port Already in Use

**Error:**
```
EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

#### 4. Prisma Client Generation Failed

**Error:**
```
Error: Failed to generate Prisma Client
```

**Solution:**
```bash
# Clear cache
npx prisma generate --force

# Or reinstall
rm -rf node_modules/.prisma
npm install
```

#### 5. Migration Errors

**Error:**
```
Error: P3006: Migration failed
```

**Solution:**
```bash
# Reset database (development only)
npx prisma migrate reset

# Or fix and reapply
npx prisma migrate dev
```

---

## Monitoring and Logging

### Winston Logger

The application uses Winston for logging. Configure log levels in `.env`:

```env
LOG_LEVEL=debug  # Development
LOG_LEVEL=warn   # Production
```

### Log Files

Logs are written to:
- `logs/app.log` - Application logs
- `logs/error.log` - Error logs

### Health Check Endpoint

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-18T10:00:00Z",
  "uptime": 3600
}
```

---

## Security Best Practices

1. **Never commit .env files** to version control
2. **Use strong JWT_SECRET** in production
3. **Enable HTTPS** in production
4. **Set proper CORS origins**
5. **Use environment-specific configurations**
6. **Regular database backups**
7. **Monitor for suspicious activity**

---

## Performance Optimization

1. **Database Connection Pooling**

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/utme_master?connection_limit=10
```

2. **Caching (Optional)**

Implement Redis caching for frequently accessed data.

3. **Rate Limiting**

The application includes rate limiting. Configure in `server.ts`:

```typescript
app.use(rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
}));
```

---

## Backup and Recovery

### Database Backup

```bash
pg_dump -U username -d utme_master > backup.sql
```

### Database Restore

```bash
psql -U username -d utme_master < backup.sql
```

### Automated Backups

Use cron jobs or cloud provider backup features for automated backups.
