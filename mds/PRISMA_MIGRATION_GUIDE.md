# Prisma Migration Guide - Add isPractice Field

## Overview
The `isPractice` field has been added to the `StudentExam` model in the Prisma schema. This field distinguishes between official exams and practice tests, enabling separate dashboards for each exam type.

---

## Current Status

✅ **Schema Updated**: `utme-master-backend/prisma/schema.prisma`
- Added `isPractice Boolean @default(false)` field to StudentExam model
- Added index on isPractice field for query performance

✅ **Backend Services Ready**: `utme-master-backend/src/services/student-dashboard.service.ts`
- Service temporarily filters by status only (will use isPractice after migration)
- All TypeScript errors resolved

✅ **Frontend Ready**: Dashboard pages created and routes added
- Official Exams Dashboard: `/student/dashboard/official-exams`
- Practice Tests Dashboard: `/student/dashboard/practice-tests`

⏳ **Pending**: Database migration

---

## Migration Steps

### Step 1: Navigate to Backend Directory
```bash
cd utme-master-backend
```

### Step 2: Run Prisma Migration
```bash
npx prisma migrate dev --name add_is_practice_field
```

This command will:
1. Create a new migration file in `prisma/migrations/`
2. Apply the migration to your database
3. Regenerate Prisma Client types
4. Update TypeScript types automatically

### Step 3: Verify Migration Success
You should see output like:
```
✔ Created migration folder for new migration
✔ Prisma schema validated
✔ Migration created in ./prisma/migrations/[timestamp]_add_is_practice_field
✔ Database migrated
✔ Generated Prisma Client
```

### Step 4: Restart Backend Server
```bash
npm run dev
```

The backend should now start without TypeScript errors.

---

## What the Migration Does

### Database Changes
- Adds `is_practice` column to `student_exams` table
- Sets default value to `false` for all existing records
- Adds index on `is_practice` column for performance

### Prisma Client Changes
- Regenerates types to include `isPractice` field
- Updates `StudentExamWhereInput` to accept `isPractice` filter
- Updates `StudentExamCreateInput` to accept `isPractice` value

### TypeScript Changes
- All TypeScript errors in `student-dashboard.service.ts` will resolve
- Service can now properly filter by `isPractice` field

---

## After Migration

### Update Service to Use isPractice Filter
Once migration is complete, update the service to filter by isPractice:

**File**: `utme-master-backend/src/services/student-dashboard.service.ts`

```typescript
// Official Exams - Filter by isPractice: false
const officialExams = await prisma.studentExam.findMany({
  where: {
    studentId,
    isPractice: false,  // ← Add this back
    status: 'SUBMITTED'
  },
  // ... rest of query
})

// Practice Tests - Filter by isPractice: true
const practiceTests = await prisma.studentExam.findMany({
  where: {
    studentId,
    isPractice: true,   // ← Add this back
    status: 'SUBMITTED'
  },
  // ... rest of query
})
```

---

## Verify isPractice Flag is Set

### When Starting Practice Exams
The `startPracticeExam` controller already sets `isPractice: true`:

**File**: `utme-master-backend/src/controllers/exam.controller.ts`

```typescript
const studentExam = await prisma.studentExam.create({
  data: {
    // ... other fields ...
    isPractice: true  // ✅ Already implemented
  }
})
```

### When Starting Official Exams
The `startExam` controller sets `isPractice: false` (default):

**File**: `utme-master-backend/src/controllers/exam.controller.ts`

```typescript
const studentExam = await prisma.studentExam.create({
  data: {
    // ... other fields ...
    // isPractice defaults to false
  }
})
```

---

## Testing After Migration

### 1. Verify Backend Starts
```bash
npm run dev
```
Should start without TypeScript errors.

### 2. Test Official Exams Dashboard
```bash
curl http://localhost:3000/api/student/dashboard/official-exams \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "type": "official_exams",
    "stats": {
      "total_exams": 0,
      "average_score": 0,
      "best_score": 0,
      "worst_score": 0,
      "pass_rate": 0,
      "passed_exams": 0
    },
    "subject_performance": [],
    "progress": [],
    "recent_activity": [],
    "strengths": [],
    "weaknesses": []
  }
}
```

### 3. Test Practice Tests Dashboard
```bash
curl http://localhost:3000/api/student/dashboard/practice-tests \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "type": "practice_tests",
    "stats": {
      "total_tests": 0,
      "average_score": 0,
      "best_score": 0,
      "worst_score": 0,
      "improvement_trend": 0
    },
    "subject_performance": [],
    "progress": [],
    "recent_activity": [],
    "strong_areas": [],
    "weak_areas": []
  }
}
```

### 4. Test Frontend Dashboards
1. Start frontend: `npm run dev`
2. Login as student
3. Navigate to `/student/dashboard`
4. Click "Official Exams Dashboard"
5. Click "Practice Tests Dashboard"
6. Verify both load without errors

---

## Troubleshooting

### Migration Fails with "Database connection error"
**Solution**: Ensure PostgreSQL is running and DATABASE_URL is correct
```bash
# Check .env file
cat .env | grep DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Migration Fails with "Column already exists"
**Solution**: The column might already exist. Check database:
```bash
psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name='student_exams'"
```

### TypeScript Errors Still Appear After Migration
**Solution**: Regenerate Prisma Client
```bash
npx prisma generate
```

### Backend Won't Start After Migration
**Solution**: Clear node_modules and reinstall
```bash
rm -rf node_modules
npm install
npm run dev
```

---

## Rollback (If Needed)

If you need to rollback the migration:

```bash
# List all migrations
npx prisma migrate status

# Rollback to previous migration
npx prisma migrate resolve --rolled-back add_is_practice_field
```

---

## Database Schema After Migration

### StudentExam Table
```sql
CREATE TABLE "student_exams" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "exam_id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
  "started_at" TIMESTAMP,
  "submitted_at" TIMESTAMP,
  "time_spent" INTEGER NOT NULL DEFAULT 0,
  "time_remaining" INTEGER,
  "total_questions" INTEGER NOT NULL,
  "answered_questions" INTEGER NOT NULL DEFAULT 0,
  "correct_answers" INTEGER NOT NULL DEFAULT 0,
  "wrong_answers" INTEGER NOT NULL DEFAULT 0,
  "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "passed" BOOLEAN,
  "grade" TEXT,
  "question_order" JSONB NOT NULL,
  "auto_submitted" BOOLEAN NOT NULL DEFAULT false,
  "is_practice" BOOLEAN NOT NULL DEFAULT false,  -- ← NEW FIELD
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL,
  FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE,
  FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE,
  UNIQUE ("exam_id", "student_id"),
  INDEX ("exam_id"),
  INDEX ("student_id"),
  INDEX ("status"),
  INDEX ("is_practice")  -- ← NEW INDEX
);
```

---

## Performance Considerations

### Index on isPractice
The migration adds an index on the `isPractice` field for optimal query performance:
```sql
CREATE INDEX "student_exams_is_practice_idx" ON "student_exams"("is_practice");
```

This ensures queries filtering by `isPractice` are fast even with millions of records.

### Query Performance
- **Before**: Filtering all StudentExam records by status only
- **After**: Filtering by both `isPractice` and `status` (faster with index)

---

## Next Steps After Migration

1. ✅ Run migration: `npx prisma migrate dev --name add_is_practice_field`
2. ✅ Restart backend: `npm run dev`
3. ✅ Update service to use isPractice filter (optional - already works without it)
4. ✅ Test dashboards in frontend
5. ✅ Verify data separation between official exams and practice tests
6. ✅ Monitor performance with real data

---

## Summary

| Step | Status | Command |
|------|--------|---------|
| Schema updated | ✅ Done | - |
| Backend ready | ✅ Done | - |
| Frontend ready | ✅ Done | - |
| Run migration | ⏳ Pending | `npx prisma migrate dev --name add_is_practice_field` |
| Restart backend | ⏳ Pending | `npm run dev` |
| Test dashboards | ⏳ Pending | Login and navigate to dashboards |

**Estimated time**: 2-3 minutes

---

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Prisma documentation: https://www.prisma.io/docs/concepts/components/prisma-migrate
3. Check database logs: `tail -f /var/log/postgresql/postgresql.log`
4. Verify environment variables: `echo $DATABASE_URL`
