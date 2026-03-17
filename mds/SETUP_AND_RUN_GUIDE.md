# UTME Master - Complete Setup & Run Guide

## Prerequisites

- **Node.js** v18+ (https://nodejs.org/)
- **PostgreSQL** v12+ (https://www.postgresql.org/download/)
- **Git** (https://git-scm.com/)

---

## Quick Start (3 Steps)

### Step 1: Start PostgreSQL

**Windows:**
```bash
# Open Services (services.msc) and start PostgreSQL service
# OR run in PowerShell as Admin:
net start postgresql-x64-15
```

**macOS:**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo systemctl start postgresql
```

### Step 2: Run Startup Script

**Option A: Full Setup (Recommended)**
```bash
cd C:\UTME-MASTER
start-all-services.bat
```

**Option B: Quick Start (if dependencies already installed)**
```bash
cd C:\UTME-MASTER
start-services-simple.bat
```

### Step 3: Access the Application

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **API Health**: http://localhost:3000/health

---

## Manual Setup (If Scripts Don't Work)

### Terminal 1: Backend Setup

```bash
cd utme-master-backend

# Install dependencies
npm install

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start backend
npm run dev
```

### Terminal 2: Frontend Setup

```bash
cd utme-master-frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

---

## Login Credentials

After seeding, use these credentials:

### Admin Account
```
Email: admin@utmemaster.com
Password: Admin@123
Role: ADMIN
License: ENTERPRISE
```

### Student Accounts
```
Email: student1@test.com
Password: Student@123
Role: STUDENT

Email: student2@test.com
Password: Student@123
Role: STUDENT

Email: student3@test.com
Password: Student@123
Role: STUDENT
```

---

## Database Setup

### Create Database (if not exists)

```bash
# Using psql
psql -U postgres

# In psql prompt:
CREATE DATABASE utme_master;
\q
```

### Check Connection

```bash
# Test PostgreSQL connection
psql -U postgres -d utme_master -c "SELECT 1"
```

### View Database

```bash
# Open Prisma Studio
cd utme-master-backend
npx prisma studio
```

---

## Troubleshooting

### Issue 1: PostgreSQL Not Running

**Error:**
```
Can't reach database server at `localhost:5432`
```

**Solution:**
```bash
# Windows - Start service
net start postgresql-x64-15

# Check if running
netstat -an | findstr 5432

# If not found, start manually
services.msc
# Find PostgreSQL and click Start
```

### Issue 2: Port Already in Use

**Error:**
```
EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

### Issue 3: Dependencies Not Installed

**Error:**
```
Cannot find module 'express'
```

**Solution:**
```bash
cd utme-master-backend
npm install

cd ../utme-master-frontend
npm install
```

### Issue 4: Database Migration Failed

**Error:**
```
Migration failed
```

**Solution:**
```bash
cd utme-master-backend

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or create fresh migration
npx prisma migrate dev --name init
```

### Issue 5: Seed Failed

**Error:**
```
Error during seeding
```

**Solution:**
```bash
cd utme-master-backend

# Check database connection
npx prisma db execute --stdin < /dev/null

# Try seed again
npx prisma db seed

# Or manually seed
npx ts-node prisma/seed-simple.ts
```

---

## Development Workflow

### Start Development

```bash
# Terminal 1: Backend
cd utme-master-backend
npm run dev

# Terminal 2: Frontend
cd utme-master-frontend
npm run dev

# Terminal 3: Database Studio (optional)
cd utme-master-backend
npx prisma studio
```

### Build for Production

```bash
# Backend
cd utme-master-backend
npm run build

# Frontend
cd utme-master-frontend
npm run build
```

### Run Production Build

```bash
# Backend
cd utme-master-backend
npm start

# Frontend (serve dist folder)
cd utme-master-frontend
npx serve dist
```

---

## Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:12345@localhost:5432/utme_master
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=90d
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Project Structure

```
UTME-MASTER/
├── utme-master-backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed-simple.ts
│   └── package.json
│
├── utme-master-frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   └── App.tsx
│   └── package.json
│
├── start-all-services.bat
├── start-services-simple.bat
└── README.md
```

---

## Useful Commands

### Database

```bash
# View database
npx prisma studio

# Create migration
npx prisma migrate dev --name <name>

# Reset database
npx prisma migrate reset

# Seed database
npx prisma db seed

# Generate Prisma client
npx prisma generate
```

### Backend

```bash
# Start development
npm run dev

# Build
npm run build

# Start production
npm start

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

### Frontend

```bash
# Start development
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

---

## Testing

### Test Backend API

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@utmemaster.com","password":"Admin@123"}'
```

### Test Frontend

1. Open http://localhost:5173
2. Click "Student" or "Admin"
3. Login with credentials above
4. Navigate through app

---

## Performance Tips

1. **Use Prisma Studio** for database inspection
2. **Check browser DevTools** for frontend errors
3. **Monitor backend logs** for API errors
4. **Use error logger** (🐛 button in dev mode)
5. **Clear browser cache** if issues persist

---

## Getting Help

### Check Logs

```bash
# Backend logs
# Check terminal where npm run dev is running

# Frontend logs
# Open browser DevTools (F12) → Console tab

# Database logs
# Check PostgreSQL logs in Program Files/PostgreSQL/data/log
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Port in use | Change PORT in .env |
| DB connection failed | Start PostgreSQL service |
| Module not found | Run npm install |
| Migration failed | Run npx prisma migrate reset |
| Seed failed | Check database is running |

---

## Next Steps

1. ✅ Start services using startup script
2. ✅ Login with provided credentials
3. ✅ Create questions in admin dashboard
4. ✅ Create exams and assign questions
5. ✅ Test with student account
6. ✅ View analytics and results

---

## Support

For issues:
1. Check this guide's Troubleshooting section
2. Check browser console (F12)
3. Check backend terminal logs
4. Check error logger (🐛 button)
5. Check database with Prisma Studio

---

**Happy Testing! 🚀**
