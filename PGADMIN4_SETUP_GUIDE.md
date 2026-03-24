# pgAdmin 4 Setup Guide - UTME Master

## PART 1: CREATE ADMIN ACCOUNT DIRECTLY IN pgADMIN 4

### Step 1: Open pgAdmin 4
```
http://localhost:5050
```
Login with default credentials (or your configured ones):
- Email: `postgres@pgadmin.com` (default)
- Password: `admin` (default)

---

### Step 2: Generate Password Hash in Terminal

Before inserting into database, you need bcryptjs hash. Run this in terminal:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin@123', 10, (err, hash) => { if(err) console.error(err); else console.log(hash); })"
```

**Output** (example):
```
$2a$10$1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJK
```

Copy this hash - you'll need it.

---

### Step 3: Navigate to "User" Table in pgAdmin 4

1. Left sidebar → Expand your server (localhost)
2. Expand **Databases**
3. Click your database (e.g., `utme_master`)
4. Expand **Schemas** → **public** → **Tables**
5. Right-click **"User"** table → **View/Edit Data** → **All Rows**

---

### Step 4: Insert Admin Account

In pgAdmin 4 query editor, run:

```sql
INSERT INTO "User" (
  id,
  email,
  password,
  "firstName",
  "lastName",
  role,
  "licenseTier",
  "isActive",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'admin@utmemaster.com',
  '$2a$10$1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJK',  -- Replace with your hash
  'Admin',
  'User',
  'ADMIN',
  'ENTERPRISE',
  true,
  NOW(),
  NOW()
);
```

**Steps in pgAdmin 4**:
1. Tools → Query Tool (or press Alt+Shift+Q)
2. Paste the SQL above (replace hash with your generated one)
3. Click **Execute** (Play button)
4. Should see: "Query returned successfully with no result"

---

### Step 5: Create Student Accounts (Optional)

```sql
-- Student 1
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "licenseTier", "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'student1@test.com', '$2a$10$YOUR_HASH_HERE', 'Student', '1', 'STUDENT', 'TRIAL', true, NOW(), NOW());

-- Student 2
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "licenseTier", "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'student2@test.com', '$2a$10$YOUR_HASH_HERE', 'Student', '2', 'STUDENT', 'TRIAL', true, NOW(), NOW());
```

---

### Step 6: Verify Users Created

```sql
SELECT id, email, role, "licenseTier", "isActive" FROM "User" ORDER BY "createdAt" DESC;
```

Should show:
```
id                                    | email                  | role    | licenseTier | isActive
--------------------------------------|------------------------|---------|-------------|----------
550e8400-e29b-41d4-a716-446655440000 | admin@utmemaster.com   | ADMIN   | ENTERPRISE  | true
550e8400-e29b-41d4-a716-446655440001 | student1@test.com      | STUDENT | TRIAL       | true
550e8400-e29b-41d4-a716-446655440002 | student2@test.com      | STUDENT | TRIAL       | true
```

---

### Step 7: Create Subjects (Required for Exams)

```sql
INSERT INTO "Subject" (id, name, code, description, "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'English Language', 'ENG', 'Use of English', true, NOW(), NOW()),
  (gen_random_uuid(), 'Mathematics', 'MTH', 'Arithmetic, Algebra, Geometry', true, NOW(), NOW()),
  (gen_random_uuid(), 'Physics', 'PHY', 'Mechanics, Electricity, Waves', true, NOW(), NOW()),
  (gen_random_uuid(), 'Chemistry', 'CHM', 'Organic, Inorganic Chemistry', true, NOW(), NOW()),
  (gen_random_uuid(), 'Biology', 'BIO', 'Botany, Zoology, Ecology', true, NOW(), NOW());
```

Verify:
```sql
SELECT id, name, code FROM "Subject" ORDER BY name;
```

---

### Step 8: Test Login

1. Go to frontend: `http://localhost:5173`
2. Click "Sign In"
3. Enter:
   - Email: `admin@utmemaster.com`
   - Password: `Admin@123`
4. Click "Sign In"

If successful: ✅ You're logged in as admin
If fails: ❌ Check backend logs for auth errors

---

## PART 2: COMMON pgAdmin 4 FATAL ERRORS & FIXES

### Error 1: "Connection refused" or "Server connection failed"

**Cause**: PostgreSQL service not running

**Fix**:
```bash
# Windows
net start postgresql-x64-15
# or use Services app: Search → Services → Find PostgreSQL → Right-click → Start

# Mac
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

Verify:
```bash
psql -U postgres -c "SELECT version();"
```

---

### Error 2: "could not connect to server: No such file or directory"

**Cause**: pgAdmin can't find PostgreSQL socket

**Fix in pgAdmin 4**:
1. Right-click Server (localhost) → Properties
2. Connection tab:
   - **Host name/address**: `localhost` (or `127.0.0.1`)
   - **Port**: `5432` (default)
   - **Username**: `postgres`
   - **Password**: Your postgres password
3. Click **Save**

---

### Error 3: "FATAL: remaining connection slots are reserved for non-replication superuser connections"

**Cause**: Too many connections open

**Fix**:
```sql
-- Close idle connections
SELECT pid, usename, state FROM pg_stat_activity 
WHERE datname = 'utme_master' AND state = 'idle';

-- Kill idle connections (be careful!)
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'utme_master' AND state = 'idle' AND pid <> pg_backend_pid();
```

---

### Error 4: "relation does not exist" when running SQL

**Cause**: Schema/table names case-sensitive or wrong schema

**Fix**: Use double quotes for exact casing:
```sql
-- ❌ WRONG
SELECT * FROM user;

-- ✅ CORRECT (with double quotes for PostgreSQL case-sensitivity)
SELECT * FROM "User";
```

All table names in UTME Master use **PascalCase** with quotes.

---

### Error 5: "permission denied for schema public"

**Cause**: User doesn't have schema access

**Fix**:
```sql
-- Run as superuser (postgres)
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

---

### Error 6: "pgAdmin server could not start, error code 3"

**Cause**: Port 5050 already in use or pgAdmin config corrupted

**Fix**:
```bash
# Option A: Use different port
# Windows: Start → Services → pgAdmin 4 → Properties → Advanced tab
# Add to startup command: --serverport 5051

# Option B: Clear pgAdmin cache
# Windows: Delete %APPDATA%\pgAdmin\
# Mac: rm -rf ~/.pgadmin/
# Linux: rm -rf ~/.pgadmin/

# Restart pgAdmin
```

---

### Error 7: "could not create temporary file" or "permission denied"

**Cause**: pgAdmin doesn't have write permissions

**Fix**:
```bash
# Windows - Run pgAdmin as Administrator
# Right-click pgAdmin → Run as administrator

# Linux - Fix permissions
sudo chown -R $USER:$USER ~/.pgadmin/
chmod -R 755 ~/.pgadmin/

# Mac
chmod -R 755 ~/.pgadmin/
```

---

### Error 8: "Query timed out"

**Cause**: Query taking too long (connection timeout)

**Fix in pgAdmin 4**:
1. File → Preferences
2. Query Tool → Query execution options
3. Increase **Statement timeout (ms)** to `300000` (5 minutes)
4. Click **Save**

Or use SQL comment:
```sql
SET statement_timeout TO '5min';
SELECT ... your long query ...
```

---

### Error 9: "Column does not exist" after schema update

**Cause**: Prisma migrations not applied

**Fix**:
```bash
# Apply pending migrations
npx prisma migrate deploy

# Or create new migration
npx prisma migrate dev --name add_missing_columns
```

Then refresh pgAdmin:
1. Right-click table → Refresh
2. Or disconnect and reconnect to server

---

### Error 10: "User already exists" when inserting

**Cause**: Email already in database (unique constraint)

**Fix**:
```sql
-- Check for existing user
SELECT * FROM "User" WHERE email = 'admin@utmemaster.com';

-- Delete if needed (careful!)
DELETE FROM "User" WHERE email = 'admin@utmemaster.com';

-- Then insert
INSERT INTO "User" (...) VALUES (...);
```

---

## PART 3: DATABASE HEALTH CHECK

Run this query to verify everything is set up:

```sql
-- Check user count
SELECT COUNT(*) as user_count FROM "User";

-- Check subject count
SELECT COUNT(*) as subject_count FROM "Subject";

-- Check topics
SELECT COUNT(*) as topic_count FROM "Topic";

-- Check for data integrity
SELECT 
  (SELECT COUNT(*) FROM "User") as users,
  (SELECT COUNT(*) FROM "Subject") as subjects,
  (SELECT COUNT(*) FROM "Topic") as topics,
  (SELECT COUNT(*) FROM "Question") as questions,
  (SELECT COUNT(*) FROM "License") as licenses;
```

Expected output:
```
users | subjects | topics | questions | licenses
------|----------|--------|-----------|----------
  3   |    5     |   20   |    0      |    0
```

---

## PART 4: RESET DATABASE (If corrupted)

⚠️ **WARNING: This deletes everything!**

```bash
# Option 1: Full reset with Prisma
npx prisma migrate reset
# Confirms: Are you sure? (y/n) → YES
# This: Drops DB → Recreates schema → Runs seed

# Option 2: Manual reset in pgAdmin
# 1. Right-click database → Maintenance → Analyze
# 2. Go to Extensions → Drop all objects
# 3. Re-run: npx prisma migrate deploy
```

---

## PART 5: HELPFUL pgAdmin 4 SHORTCUTS

| Shortcut | Action |
|----------|--------|
| `Alt+Shift+Q` | Open Query Tool |
| `Ctrl+Enter` | Execute query |
| `Ctrl+/` | Toggle comment |
| `Ctrl+Shift+F` | Format query |
| `Ctrl+L` | Clear query |
| `F7` | Show/hide output panel |

---

## TROUBLESHOOTING CHECKLIST

- [ ] PostgreSQL service is running (`psql` works in terminal)
- [ ] pgAdmin 4 can connect to database (test connection passes)
- [ ] Admin user exists in "User" table
- [ ] Admin password hash is valid (test with bcrypt.compare)
- [ ] Subjects exist in "Subject" table
- [ ] Backend can connect to database (check logs)
- [ ] Frontend loads (no CORS errors in browser console)
- [ ] Login with admin account works

---

## NEXT STEPS

1. ✅ Create admin account in pgAdmin 4
2. ✅ Create subjects
3. Go to frontend → Login as admin
4. Go to `/admin/questions` → Create questions
5. Go to `/admin/exams` → Create exam
6. Assign questions to exam
7. Student login → Take exam

