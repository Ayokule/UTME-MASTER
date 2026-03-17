# Troubleshooting: "Start Exam Not Found" Error

## What This Error Means

The frontend is trying to call the API endpoint `/api/exams/practice/start` but getting a 404 (Not Found) error.

---

## Step 1: Verify Backend is Running

### Check if backend is running
```bash
# Open browser and visit:
http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "UTME Master API is running",
  "timestamp": "2026-03-14T...",
  "uptime": 123.45
}
```

**If you get "Connection refused":**
- Backend is NOT running
- Start it: `cd utme-master-backend && npm run dev`

---

## Step 2: Verify Exam Routes are Registered

### Check if exam routes exist
```bash
# Open browser and visit:
http://localhost:3000/api/exams
```

**Expected Response:**
```json
{
  "success": true,
  "data": { "exams": [] }
}
```

**If you get 404:**
- Exam routes are not registered
- Check `utme-master-backend/src/server.ts` line 198
- Make sure this line exists: `app.use(`${API_PREFIX}/exams`, examRoutes)`

---

## Step 3: Check Authentication

The `/api/exams/practice/start` endpoint requires authentication.

### Verify you have a valid token
1. Login first at http://localhost:5173/login
2. Open browser DevTools (F12)
3. Go to **Application** tab
4. Check **Local Storage** for `auth_token`
5. If no token, login again

### Test with curl (if you have the token)
```bash
curl -X POST http://localhost:3000/api/exams/practice/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Biology",
    "examType": "JAMB",
    "difficulty": "EASY",
    "questionCount": 10,
    "duration": 60
  }'
```

---

## Step 4: Check Network Request

### In Browser DevTools
1. Open DevTools (F12)
2. Go to **Network** tab
3. Click **Start Exam** button
4. Look for request to `/api/exams/practice/start`
5. Check the response

**Common Issues:**

| Status | Meaning | Solution |
|--------|---------|----------|
| 404 | Route not found | Backend routes not registered |
| 401 | Unauthorized | No valid token, login again |
| 400 | Bad request | Invalid parameters sent |
| 500 | Server error | Check backend terminal for error |

---

## Step 5: Check Backend Logs

### Look at backend terminal output

When you run `npm run dev`, you should see logs like:

```
🚀 Server running on port 3000
📍 API: http://localhost:3000/api
🏥 Health: http://localhost:3000/health
```

When you click "Start Exam", you should see:

```
Practice exam request: {
  studentId: 'xxx',
  subject: 'Biology',
  examType: 'JAMB',
  difficulty: 'EASY',
  questionCount: 10,
  duration: 60
}
```

**If you don't see this log:**
- Request isn't reaching the backend
- Check network tab in DevTools
- Verify backend URL is correct

---

## Step 6: Verify Database Connection

### Check if database is connected

In backend terminal, you should see:

```
✅ Database connected successfully
```

**If you see database error:**
```
❌ Failed to start server: Error: Can't reach database server
```

**Solution:**
```bash
# Start PostgreSQL
net start postgresql-x64-15

# Then restart backend
npm run dev
```

---

## Step 7: Check Subject Exists

The exam needs questions from the selected subject.

### Verify subjects were created
```bash
cd utme-master-backend
npx prisma studio
```

Then:
1. Click on **Subject** table
2. Verify you see subjects like "Biology", "Chemistry", etc.
3. If empty, run seed: `npx prisma db seed`

---

## Complete Troubleshooting Checklist

- [ ] Backend is running (`npm run dev`)
- [ ] PostgreSQL is running (`net start postgresql-x64-15`)
- [ ] Database is seeded (`npx prisma db seed`)
- [ ] You are logged in (check Local Storage for token)
- [ ] Health check works (`http://localhost:3000/health`)
- [ ] Exam routes exist (`http://localhost:3000/api/exams`)
- [ ] Subjects exist (check Prisma Studio)
- [ ] Network request shows 200 status (check DevTools)
- [ ] Backend logs show the request (check terminal)

---

## If Still Not Working

### Option 1: Restart Everything
```bash
# Stop backend (Ctrl+C)
# Stop frontend (Ctrl+C)

# Restart backend
cd utme-master-backend
npm run dev

# Restart frontend (new terminal)
cd utme-master-frontend
npm run dev
```

### Option 2: Clear Cache
```bash
# Frontend
- Open DevTools (F12)
- Right-click refresh button
- Select "Empty cache and hard refresh"

# Or press: Ctrl+Shift+Delete
```

### Option 3: Check Logs
```bash
# Backend logs
- Check terminal where backend is running
- Look for errors

# Frontend logs
- Open DevTools (F12)
- Go to Console tab
- Look for red errors
```

### Option 4: Verify Routes File

Check `utme-master-backend/src/routes/exam.routes.ts`:

```typescript
// This should exist:
router.post(
  '/practice/start',
  authenticate,
  authorizeRole(['STUDENT']),
  validateBody(startPracticeExamSchema),
  examController.startPracticeExam
)
```

### Option 5: Check Server.ts

Check `utme-master-backend/src/server.ts` around line 198:

```typescript
// This should exist:
app.use(`${API_PREFIX}/exams`, examRoutes)
```

---

## Debug Mode

### Enable detailed logging

Edit `utme-master-backend/src/controllers/exam.controller.ts`:

Add this at the start of `startPracticeExam`:

```typescript
console.log('=== START PRACTICE EXAM DEBUG ===')
console.log('Request body:', req.body)
console.log('User:', (req as any).user)
console.log('=== END DEBUG ===')
```

Then restart backend and try again. Check terminal for debug output.

---

## Still Need Help?

1. Check `DEVELOPMENT_COMMANDS.md` for common commands
2. Check `EXAM_SYSTEM_GUIDE.md` for exam system details
3. Check browser console (F12) for error messages
4. Check backend terminal for logs
5. Verify all services are running

