# UTME Master - Development Commands & Troubleshooting

## Quick Start (3 Steps)

### Step 1: Start PostgreSQL
```bash
# Windows - Start PostgreSQL service
net start postgresql-x64-15

# Or open Services (services.msc) and start PostgreSQL manually
```

### Step 2: Seed Database (First Time Only)
```bash
cd utme-master-backend
npx prisma db seed
```

### Step 3: Start Both Servers
```bash
# Terminal 1 - Backend (port 3000)
cd utme-master-backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd utme-master-frontend
npm run dev
```

---

## Important: Development vs Production

### ❌ WRONG - This creates a production build
```bash
npm run build
```
Output: `vite v5.4.21 building for production...`

### ✅ CORRECT - This starts development server
```bash
npm run dev
```
Output: `VITE v5.4.21 ready in XXX ms`

---

## Login Credentials (After Seeding)

### Admin Account
- **Email**: admin@utmemaster.com
- **Password**: Admin@123
- **Access**: Admin dashboard, create questions, manage exams

### Student Accounts
- **Email**: student1@test.com, student2@test.com, student3@test.com
- **Password**: Student@123
- **Access**: Take exams, view results, analytics

---

## Common Issues & Solutions

### Issue 1: "Can't reach database server at localhost:5432"

**Cause**: PostgreSQL is not running

**Solution**:
```bash
# Check if PostgreSQL is running
netstat -an | findstr 5432

# If not running, start it
net start postgresql-x64-15

# Or use Services (services.msc)
```

### Issue 2: "Unique constraint failed on the fields: (`name`)"

**Cause**: Subjects already exist in database from previous seed

**Solution**: The seed script now handles this automatically. Just run:
```bash
npx prisma db seed
```

It will skip existing subjects and create new ones.

### Issue 3: Frontend shows "vite building for production"

**Cause**: You ran `npm run build` instead of `npm run dev`

**Solution**:
```bash
# Stop the current process (Ctrl+C)
# Then run:
npm run dev
```

### Issue 4: "Module not found: seed-simple.js"

**Cause**: package.json was trying to run `.js` file instead of `.ts`

**Solution**: Already fixed in package.json. Run:
```bash
npx prisma db seed
```

---

## Database Management

### Reset Database (Delete All Data)
```bash
cd utme-master-backend
npx prisma migrate reset
```

### View Database in GUI
```bash
cd utme-master-backend
npx prisma studio
```

### Run Migrations
```bash
cd utme-master-backend
npx prisma migrate dev
```

---

## Backend Commands

```bash
cd utme-master-backend

# Development server (with auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Open Prisma Studio (GUI)
npm run prisma:studio
```

---

## Frontend Commands

```bash
cd utme-master-frontend

# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

---

## Useful URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Backend Health**: http://localhost:3000/health
- **Prisma Studio**: http://localhost:5555 (when running `npm run prisma:studio`)

---

## Startup Scripts (Windows)

### Full Startup (Installs dependencies + starts everything)
```bash
start-all-services.bat
```

### Quick Startup (Assumes dependencies installed)
```bash
start-services-simple.bat
```

---

## Development Workflow

1. **Start PostgreSQL** (if not already running)
   ```bash
   net start postgresql-x64-15
   ```

2. **Seed database** (first time only)
   ```bash
   cd utme-master-backend
   npx prisma db seed
   ```

3. **Start backend** (Terminal 1)
   ```bash
   cd utme-master-backend
   npm run dev
   ```

4. **Start frontend** (Terminal 2)
   ```bash
   cd utme-master-frontend
   npm run dev
   ```

5. **Open browser**
   - Frontend: http://localhost:5173
   - Login with credentials above

---

## Debugging

### View Errors in Frontend
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls

### View Backend Logs
- Check terminal where backend is running
- Look for error messages and stack traces

### View Database Logs
- Open Prisma Studio: `npm run prisma:studio`
- Browse tables and data directly

---

## Performance Tips

1. **Use `npm run dev` for development** - Hot reload is much faster
2. **Keep PostgreSQL running** - Don't restart it between sessions
3. **Clear browser cache** - If seeing old data, press Ctrl+Shift+Delete
4. **Check network tab** - See which API calls are slow

---

## Need Help?

1. Check the error message carefully
2. Look for solutions in this guide
3. Check browser console (F12)
4. Check backend terminal output
5. Verify PostgreSQL is running
6. Try restarting both servers

