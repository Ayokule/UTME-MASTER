# UTME Master Backend - Installation Guide

## Quick Setup (5 Minutes)

### 1. Prerequisites
- Node.js 18+ installed
- PostgreSQL running
- Git installed

### 2. Installation Steps

```bash
# 1. Navigate to backend directory
cd utme-master-backend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Generate Prisma client
npx prisma generate

# 5. Run database migrations
npx prisma migrate dev

# 6. Seed the database
npx prisma db seed

# 7. Build the project
npm run build

# 8. Start the server
npm run dev
```

### 3. Verify Installation

- Backend should start on http://localhost:3001
- No TypeScript errors
- Database connected successfully
- Seed data created

### 4. Test Endpoints

```bash
# Health check
curl http://localhost:3001/api/health

# Login test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@utmemaster.com","password":"Admin@123"}'
```

### 5. Default Credentials

**Admin:**
- Email: admin@utmemaster.com
- Password: Admin@123

**Student:**
- Email: student1@test.com
- Password: Student@123

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Create database if needed
createdb utme_master
```

### TypeScript Errors
```bash
# Regenerate Prisma client
npx prisma generate

# Clean build
rm -rf dist/
npm run build
```

### Seed Errors
```bash
# Reset database
npx prisma migrate reset
npx prisma db seed
```

## Production Deployment

1. Change all default passwords
2. Update environment variables
3. Use production database
4. Enable SSL/HTTPS
5. Set up monitoring

## Support

All critical bugs have been fixed:
- ✅ Resume exam logic corrected
- ✅ Answer validation working
- ✅ Response formats standardized
- ✅ TypeScript errors resolved
- ✅ Database schema synchronized

The system is now production-ready!