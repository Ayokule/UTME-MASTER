# Database Setup - Completion Commands

**Status**: Ready to Execute  
**Estimated Time**: 20 minutes  
**Prerequisites**: Node.js, npm, PostgreSQL running

---

## Quick Start

Run these commands in order to complete database setup:

```bash
# Navigate to backend directory
cd utme-master-backend

# 1. Regenerate Prisma client (5 min)
npx prisma generate

# 2. Create and apply migration (5 min)
npx prisma migrate dev --name init_utme_master

# 3. Seed database with test data (5 min)
npx prisma db seed

# 4. Verify database (5 min)
npx prisma studio
```

---

## Detailed Steps

### Step 1: Regenerate Prisma Client
```bash
cd utme-master-backend
npx prisma generate
```

**What it does**:
- Reads the unified `prisma/schema.prisma`
- Generates TypeScript types
- Updates Prisma client
- Fixes the `TopicWhereUniqueInput` error

**Expected Output**:
```
✔ Generated Prisma Client (X.X.X) to ./node_modules/@prisma/client in XXms
```

**Troubleshooting**:
- If error: `schema.prisma not found` → Check file exists at `utme-master-backend/prisma/schema.prisma`
- If error: `Invalid schema` → Check schema syntax in the file
- If error: `Permission denied` → Run with `sudo` or check file permissions

---

### Step 2: Create and Apply Migration
```bash
npx prisma migrate dev --name init_utme_master
```

**What it does**:
- Creates migration file in `prisma/migrations/`
- Applies migration to database
- Creates all tables, indexes, and relationships
- Generates migration SQL

**Expected Output**:
```
✔ Created migration: 20260315XXXXXX_init_utme_master

✔ Generated Prisma Client (X.X.X) in XXms

✔ Database synchronized with schema. Ran X migrations in XXms.
```

**Migration Creates**:
- ✅ User table (with roles, license tier)
- ✅ Subject table
- ✅ Topic table
- ✅ Question table (with all fields)
- ✅ Exam table
- ✅ StudentExam table
- ✅ StudentAnswer table
- ✅ StudentProgress table
- ✅ License table
- ✅ LicenseActivation table
- ✅ All indexes and relationships

**Troubleshooting**:
- If error: `Database connection failed` → Check `.env` DATABASE_URL
- If error: `Migration already exists` → Delete migration folder and retry
- If error: `Syntax error in schema` → Check schema.prisma for errors

---

### Step 3: Seed Database
```bash
npx prisma db seed
```

**What it does**:
- Runs `prisma/seed-simple.ts`
- Creates admin account
- Creates 3 student accounts
- Creates 10 subjects with topics
- Creates TRIAL license
- Optionally creates sample questions

**Expected Output**:
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
... (8 more subjects)

📖 Creating topics for subjects...
✅ Topics created for: English Language
... (9 more subjects)

🔐 Creating default TRIAL license...
✅ License created: UTME-TRIAL-XXXXXXXX

🎉 SEEDING COMPLETED SUCCESSFULLY!
```

**Test Accounts Created**:
```
Admin:
  Email: admin@utmemaster.com
  Password: Admin@123

Students:
  Email: student1@test.com
  Password: Student@123
  
  Email: student2@test.com
  Password: Student@123
  
  Email: student3@test.com
  Password: Student@123
```

**⚠️ IMPORTANT**: Change these passwords in production!

**Troubleshooting**:
- If error: `seed-simple.ts not found` → Check file exists
- If error: `bcryptjs not installed` → Run `npm install bcryptjs`
- If error: `Prisma client not found` → Run `npx prisma generate` first
- If error: `Duplicate key` → Database already seeded, run `npx prisma migrate reset` to clear

---

### Step 4: Verify Database (Optional but Recommended)
```bash
npx prisma studio
```

**What it does**:
- Opens Prisma Studio web interface
- Shows all tables and data
- Allows manual data inspection
- Runs on `http://localhost:5555`

**Verification Checklist**:
- [ ] User table has 4 records (1 admin, 3 students)
- [ ] Subject table has 10 records
- [ ] Topic table has 50+ records (5 per subject)
- [ ] License table has 1 record
- [ ] All relationships are intact

**Troubleshooting**:
- If error: `Port 5555 already in use` → Kill process or use different port
- If error: `Cannot connect to database` → Check DATABASE_URL in .env

---

## Environment Variables

Ensure `.env` file has correct database URL:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/utme_master"

# Or for local development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/utme_master"
```

**Create Database First**:
```bash
# Using psql
psql -U postgres -c "CREATE DATABASE utme_master;"

# Or using pgAdmin
# 1. Right-click Databases
# 2. Create → Database
# 3. Name: utme_master
# 4. Click Create
```

---

## Rollback Procedures

### If Something Goes Wrong

**Reset Everything**:
```bash
# WARNING: This deletes all data!
npx prisma migrate reset

# Then re-seed
npx prisma db seed
```

**Rollback Last Migration**:
```bash
# List migrations
npx prisma migrate status

# Rollback (if supported by database)
npx prisma migrate resolve --rolled-back 20260315XXXXXX_init_utme_master
```

**Delete and Recreate Database**:
```bash
# Drop database
psql -U postgres -c "DROP DATABASE utme_master;"

# Create new database
psql -U postgres -c "CREATE DATABASE utme_master;"

# Run migrations again
npx prisma migrate dev --name init_utme_master

# Seed data
npx prisma db seed
```

---

## Verification Checklist

After completing all steps:

- [ ] Prisma client generated successfully
- [ ] Migration created and applied
- [ ] Database tables created
- [ ] Seed data loaded
- [ ] Admin account created
- [ ] Student accounts created
- [ ] Subjects and topics created
- [ ] License created
- [ ] No errors in console
- [ ] Can connect to database with Prisma Studio

---

## Next Steps After Database Setup

### 1. Test Backend API
```bash
# Start backend server
npm run dev

# Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/subjects
```

### 2. Test Frontend Integration
```bash
# In another terminal, start frontend
cd ../utme-master-frontend
npm run dev

# Test login with:
# Email: admin@utmemaster.com
# Password: Admin@123
```

### 3. Test Question Management
1. Login as admin
2. Navigate to `/admin/questions`
3. Create a new question
4. Verify it saves to database
5. Edit the question
6. Delete the question

### 4. Test Exam Flow
1. Login as student
2. Navigate to `/student/exams`
3. Start an exam
4. Answer questions
5. Submit exam
6. View results

---

## Common Issues & Solutions

### Issue: "TopicWhereUniqueInput" Error
**Cause**: Prisma client not regenerated  
**Solution**: Run `npx prisma generate`

### Issue: "Database connection failed"
**Cause**: DATABASE_URL incorrect or PostgreSQL not running  
**Solution**: 
1. Check `.env` file
2. Verify PostgreSQL is running
3. Test connection: `psql -U postgres -d utme_master`

### Issue: "Migration already exists"
**Cause**: Migration file already created  
**Solution**: Delete `prisma/migrations/` folder and retry

### Issue: "Duplicate key value violates unique constraint"
**Cause**: Data already exists in database  
**Solution**: Run `npx prisma migrate reset` to clear and reseed

### Issue: "Port 5555 already in use"
**Cause**: Prisma Studio already running  
**Solution**: Kill process or use different port: `npx prisma studio --port 5556`

### Issue: "Cannot find module 'bcryptjs'"
**Cause**: Dependency not installed  
**Solution**: Run `npm install bcryptjs`

---

## Performance Optimization

After database setup, consider:

### 1. Add Indexes
Already included in schema:
- ✅ User email index
- ✅ Question subject index
- ✅ StudentExam studentId index
- ✅ StudentAnswer studentExamId index

### 2. Enable Query Logging
```env
# In .env
DATABASE_URL="postgresql://user:password@localhost:5432/utme_master?schema=public"
DEBUG="prisma:*"
```

### 3. Monitor Performance
```bash
# Check slow queries
psql -U postgres -d utme_master -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

---

## Backup Strategy

### Daily Backup
```bash
# Backup database
pg_dump -U postgres utme_master > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U postgres utme_master < backup_20260315.sql
```

### Automated Backup (Linux/Mac)
```bash
# Add to crontab
0 2 * * * pg_dump -U postgres utme_master > /backups/utme_master_$(date +\%Y\%m\%d).sql
```

---

## Production Checklist

Before deploying to production:

- [ ] Database backed up
- [ ] Passwords changed (admin and students)
- [ ] License tier updated to BASIC/PREMIUM
- [ ] Test users removed
- [ ] Email notifications configured
- [ ] Monitoring set up
- [ ] Logging configured
- [ ] SSL/TLS enabled
- [ ] Firewall configured
- [ ] Database replicated/clustered

---

## Support

If you encounter issues:

1. Check this guide
2. Review error message carefully
3. Check Prisma documentation: https://www.prisma.io/docs
4. Check PostgreSQL logs: `psql -U postgres -d utme_master -c "SELECT * FROM pg_stat_statements;"`
5. Check application logs

---

## Summary

**Total Time**: ~20 minutes  
**Commands**: 4 main commands  
**Result**: Fully seeded production-ready database

After completing these steps, your UTME Master database will be:
- ✅ Fully migrated
- ✅ Properly indexed
- ✅ Seeded with test data
- ✅ Ready for development/testing
- ✅ Ready for production deployment

**Next**: Deploy backend and frontend, then run end-to-end tests.
