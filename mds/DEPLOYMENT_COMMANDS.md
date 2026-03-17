# DEPLOYMENT COMMANDS - PHASE 1 COMPLETE

**Date**: March 14, 2026  
**Status**: Ready for Deployment

---

## QUICK START (5 minutes)

### Option 1: Using Batch Scripts (Windows)

```batch
# Start all services
start-all-services.bat

# Or quick start
start-services-simple.bat
```

### Option 2: Manual Commands

#### Terminal 1 - Backend
```bash
cd utme-master-backend

# Install dependencies (if needed)
npm install

# Start backend (CRITICAL - applies validation schema changes)
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd utme-master-frontend

# Install dependencies (if needed)
npm install

# Start frontend
npm run dev
```

#### Terminal 3 - Database Setup (if needed)
```bash
cd utme-master-backend

# Seed database with test data
npx prisma db seed
```

---

## DETAILED DEPLOYMENT STEPS

### Step 1: Verify Prerequisites

```bash
# Check Node.js version (should be 16+)
node --version

# Check npm version (should be 8+)
npm --version

# Check PostgreSQL is running
# Windows: Services > PostgreSQL
# Mac: brew services list
# Linux: systemctl status postgresql
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd utme-master-backend

# Install dependencies
npm install

# Create/update .env file
# Verify DATABASE_URL is set correctly
cat .env

# Run database migrations
npx prisma migrate deploy

# Seed database with test data
npx prisma db seed

# Start backend server
npm run dev
```

**Expected Output**:
```
✓ Prisma schema loaded
✓ Database connected
✓ Server running on http://localhost:3000
✓ API ready at http://localhost:3000/api
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend
cd utme-master-frontend

# Install dependencies
npm install

# Create/update .env file
# Verify VITE_API_URL is set correctly
cat .env

# Start frontend development server
npm run dev
```

**Expected Output**:
```
✓ Vite dev server running at http://localhost:5173
✓ Ready for development
```

### Step 4: Verify Deployment

```bash
# Test backend API
curl http://localhost:3000/api/exams

# Test frontend
# Open browser: http://localhost:5173
# Login with test credentials:
# - Email: student1@test.com
# - Password: Student@123
```

---

## CRITICAL STEPS

### ⚠️ Backend Restart (MUST DO)

The validation schema has been updated. Backend must be restarted to apply changes.

```bash
# If backend is running, stop it (Ctrl+C)

# Restart backend
npm run dev

# Verify no compilation errors
# Look for: "Server running on http://localhost:3000"
```

### ⚠️ Database Seed (MUST DO)

Test data is required for verification.

```bash
cd utme-master-backend

# Seed database
npx prisma db seed

# Verify seed completed
# Look for: "Seed completed successfully"
```

---

## TESTING COMMANDS

### Test Backend API

```bash
# Get all exams
curl http://localhost:3000/api/exams

# Get exam statistics (requires auth)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/exams/<exam-id>/statistics

# Check API health
curl http://localhost:3000/api/health
```

### Test Frontend

```bash
# Open browser
# URL: http://localhost:5173

# Login with test account
# Email: student1@test.com
# Password: Student@123

# Test exam flow:
# 1. Click "Start Exam"
# 2. Select a subject
# 3. Answer questions
# 4. Submit exam
# 5. View results
# 6. Click "Review Answers"
```

---

## BUILD COMMANDS

### Build for Production

#### Backend
```bash
cd utme-master-backend

# Build TypeScript
npm run build

# Start production server
npm start
```

#### Frontend
```bash
cd utme-master-frontend

# Build for production
npm run build

# Output: dist/ folder
# Deploy dist/ to web server
```

---

## TROUBLESHOOTING

### Backend Won't Start

```bash
# Check if port 3000 is in use
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000

# Kill process using port 3000
# Windows
taskkill /PID <PID> /F

# Mac/Linux
kill -9 <PID>

# Try starting again
npm run dev
```

### Database Connection Error

```bash
# Check PostgreSQL is running
# Windows: Services > PostgreSQL
# Mac: brew services list | grep postgres
# Linux: systemctl status postgresql

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test connection
npx prisma db push

# If still failing, reset database
npx prisma migrate reset
```

### Frontend Won't Start

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear cache
npm cache clean --force

# Try starting again
npm run dev
```

### 422 Validation Errors

```bash
# This means backend wasn't restarted after schema changes

# Stop backend (Ctrl+C)

# Restart backend
npm run dev

# Verify no compilation errors

# Test answer submission again
```

---

## ENVIRONMENT VARIABLES

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/utme_master"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

### Frontend (.env)

```env
# API
VITE_API_URL=http://localhost:3000/api

# Environment
VITE_ENV=development
```

---

## MONITORING

### Check Backend Logs

```bash
# Real-time logs
npm run dev

# Or check log files
tail -f logs/app.log
```

### Check Frontend Console

```bash
# Open browser DevTools (F12)
# Go to Console tab
# Look for errors or warnings
```

### Check Database

```bash
# Connect to PostgreSQL
psql -U postgres -d utme_master

# Check tables
\dt

# Check data
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Exam";
SELECT COUNT(*) FROM "Question";
```

---

## PERFORMANCE CHECKS

### Backend Performance

```bash
# Check API response time
time curl http://localhost:3000/api/exams

# Monitor memory usage
# Windows: Task Manager > Performance
# Mac: Activity Monitor
# Linux: top
```

### Database Performance

```bash
# Check slow queries
# In PostgreSQL:
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

---

## ROLLBACK PROCEDURE

If deployment fails:

```bash
# Stop services
# Ctrl+C in all terminals

# Revert code changes
git revert HEAD

# Or reset to previous commit
git reset --hard <commit-hash>

# Restart services
npm run dev
```

---

## POST-DEPLOYMENT CHECKLIST

- [ ] Backend running without errors
- [ ] Frontend accessible at http://localhost:5173
- [ ] Can login with test account
- [ ] Can start exam
- [ ] Can answer questions
- [ ] Can submit exam
- [ ] Can view results
- [ ] Can review answers
- [ ] No 422 validation errors
- [ ] Real-time analytics displaying
- [ ] Error logs clean

---

## SUPPORT CONTACTS

For deployment issues:
- Backend: Check `utme-master-backend/` logs
- Frontend: Check browser console (F12)
- Database: Check PostgreSQL logs
- General: Review TROUBLESHOOTING section above

---

## NEXT STEPS

After successful deployment:

1. **Verify all features work**
   - Test exam flow end-to-end
   - Check error handling
   - Verify analytics display

2. **Monitor for issues**
   - Check error logs
   - Monitor performance
   - Gather user feedback

3. **Plan Phase 2**
   - Review IMPLEMENTATION_GUIDE.md Phase 2
   - Prioritize next features
   - Schedule development

---

## QUICK REFERENCE

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npx prisma db seed` | Seed database |
| `npx prisma migrate dev` | Create migration |
| `npx prisma studio` | Open Prisma Studio |

---

**Status**: ✅ Ready for Deployment

