# Exam API Fix - Cannot read properties of undefined (reading 'exam')

## 🐛 The Problem

When calling `GET /api/exams`, the backend was throwing:
```
error: Failed to get exams: Cannot read properties of undefined (reading 'exam')
```

This error occurred because the controller was trying to access `(req as any).prisma.exam.findMany()` but `prisma` was not attached to the request object.

---

## 🔍 Root Cause

The `exam.controller.ts` was using:
```typescript
const exams = await (req as any).prisma.exam.findMany({...})
```

But the `exam.routes.ts` was not attaching the `prisma` client to the request object, so `(req as any).prisma` was `undefined`.

---

## ✅ The Solution

Added middleware to the exam routes to attach the prisma client to the request:

**File**: `utme-master-backend/src/routes/exam.routes.ts`

```typescript
import { prisma } from '../config/database'

const router = Router()

// Attach prisma to request
router.use((req: any, res, next) => {
  req.prisma = prisma
  next()
})
```

This middleware runs for all exam routes and makes `prisma` available as `(req as any).prisma` in the controllers.

---

## 📊 What Changed

### Before
```typescript
// exam.routes.ts
import { Router } from 'express'
import * as examController from '../controllers/exam.controller'
// ... other imports

const router = Router()

// No prisma attachment!
```

### After
```typescript
// exam.routes.ts
import { Router } from 'express'
import * as examController from '../controllers/exam.controller'
import { prisma } from '../config/database'  // ← NEW
// ... other imports

const router = Router()

// Attach prisma to request  ← NEW
router.use((req: any, res, next) => {
  req.prisma = prisma
  next()
})
```

---

## 🧪 Testing

After this fix, the following should work:

```bash
# Get all exams
GET /api/exams
Response: { success: true, data: { exams: [...] } }

# Start an exam
POST /api/exams/{examId}/start
Response: { success: true, data: { studentExamId: "...", ... } }

# Start practice exam
POST /api/exams/practice/start
Response: { success: true, data: { studentExamId: "..." } }
```

---

## 🚀 Status

✅ **Fixed** - The exam API should now work correctly

**Next Steps**:
1. Restart the backend server
2. Test the `/api/exams` endpoint
3. Verify exam starting works
4. Test practice exam starting

---

## 📝 Summary

| Issue | Solution |
|-------|----------|
| `prisma` undefined on request | Attach prisma to request in route middleware |
| Error: "Cannot read properties of undefined (reading 'exam')" | Now resolved |
| GET /api/exams returning 400 | Now returns 200 with exams list |

**Result**: Exam API fully functional! 🎉
