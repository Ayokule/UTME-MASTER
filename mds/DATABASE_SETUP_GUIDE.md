# Database Setup Guide - UTME Master

**Status**: ✅ Production Ready  
**Last Updated**: 2026-03-14  
**Schema Version**: 1.0 (Unified)

---

## Overview

This guide covers setting up the unified Prisma schema for UTME Master. All 10 critical schema issues have been fixed:

- ✅ Single unified schema.prisma (no duplicates)
- ✅ Consistent CUID ID generation across all models
- ✅ Fixed relationship names (no conflicts)
- ✅ All foreign keys with proper cascade deletes
- ✅ Performance indexes on frequently queried fields
- ✅ Production-safe seed script with warnings
- ✅ Proper enum definitions (no duplication)
- ✅ StudentProgress now

**Linux:**
```bash
sudo systemctl start postgresql
```

### Step 2: Verify Database Connection
Check your `.env` file in `utme-master-backend/`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/utme_master"
```

Make sure:
- Username: `postgres` (or your PostgreSQL user)
- Password: matches your PostgreSQL password
- Database name: `utme_master`
- Host: `localhost`
- Port: `5432`

### Step 3: Create Database (if not exists)
```bash
cd utme-master-backend

# Create the database
createdb utme_master
```

### Step 4: Run Prisma Migrations
```bash
cd utme-master-backend

# Generate Prisma client
npm run prisma:generate

# Run migrations to create tables
npm run prisma:migrate
```

### Step 5: Seed the Database
```bash
cd utme-master-backend

# Run the seed script
npx prisma db seed
```

Or use the npm script:
```bash
npm run prisma:seed
```

### Step 6: Verify Seeding
You should see output like:
```
🌱 Starting database seed...

👤 Creating admin account...
✅ Admin created: admin@utmemaster.com

👤 Creating student accounts...
✅ Student created: student1@test.com
✅ Student created: student2@test.com
✅ Student created: student3@test.com

📚 Creating subjects...
✅ Subject created/found: English Language
✅ Subject created/found: Mathematics
... (more subjects)

🎉 SEEDING COMPLETED SUCCESSFULLY!
```

### Step 7: Start Backend
```bash
cd utme-master-backend
npm run dev
```

### Step 8: Start Frontend
```bash
cd utme-master-frontend
npm run dev
```

### Step 9: Login and Test
1. Go to `http://localhost:5173`
2. Login with admin account:
   - Email: `admin@utmemaster.com`
   - Password: `Admin@123`
3. Navigate to `/admin/dashboard` - should now show data
4. Or login with student:
   - Email: `student1@test.com`
   - Password: `Student@123`
5. Navigate to `/student/dashboard` - should now show data

## Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL is not running
- Solution: Start PostgreSQL service

### Error: "database does not exist"
- Database hasn't been created
- Solution: Run `createdb utme_master`

### Error: "relation does not exist"
- Tables haven't been created
- Solution: Run `npm run prisma:migrate`

### Error: "no data showing in dashboard"
- Database hasn't been seeded
- Solution: Run `npx prisma db seed`

### Error: "P2002: Unique constraint failed"
- Data already exists in database
- Solution: This is normal on second run, data is upserted

## Quick Setup Command (All-in-One)
```bash
cd utme-master-backend

# 1. Generate Prisma client
npm run prisma:generate

# 2. Run migrations
npm run prisma:migrate

# 3. Seed database
npx prisma db seed

# 4. Start backend
npm run dev
```

## Default Credentials After Seeding

### Admin Account
- Email: `admin@utmemaster.com`
- Password: `Admin@123`
- Role: ADMIN

### Student Accounts
- Email: `student1@test.com` / `student2@test.com` / `student3@test.com`
- Password: `Student@123`
- Role: STUDENT

## What Gets Seeded

1. **1 Admin Account** - Full system access
2. **3 Student Accounts** - For testing
3. **10 Subjects** - English, Math, Physics, Chemistry, Biology, Economics, Government, Commerce, Literature, CRK/IRK
4. **0 Questions** - Create via admin dashboard (bulk import or manual creation)
5. **0 Exams** - Create via admin dashboard

## Next Steps

1. **Create Questions** - Go to Admin Dashboard > Questions > Create Question
2. **Bulk Import** - Go to Admin Dashboard > Bulk Import to import CSV of questions
3. **Create Exams** - Go to Admin Dashboard > Create Exam
4. **Assign Questions** - Assign questions to exams
5. **Students Take Exams** - Students can login and take exams

## Database Schema
The database includes tables for:
- Users (students, teachers, admins)
- Subjects
- Questions
- Exams
- StudentExams (exam attempts)
- StudentAnswers (answers submitted)
- Licenses
- And more...

See `utme-master-backend/prisma/schema.prisma` for full schema.
