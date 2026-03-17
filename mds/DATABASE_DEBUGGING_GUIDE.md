# Database Debugging Guide

## Overview
This guide helps you identify and fix database-related issues in the UTME Master system.

---

## 1. Check System Health

### Endpoint
```
GET /api/health
```

### What It Shows
- ✅ Database connection status
- ✅ Database response time
- ✅ Memory usage
- ✅ System uptime
- ✅ Operation statistics

### How to Check
**Browser:**
```
http://localhost:3000/api/health
```

**cURL:**
```bash
curl http://localhost:3000/api/health
```

### Response Example
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": {
      "status": "healthy",
      "connected": true,
      "responseTime": 45,
      "error": null
    },
    "memory": {
      "used": 256,
      "total": 512
    }
  }
}
```

---

## 2. Check Database Diagnostics

### Endpoint
```
GET /api/health/database
```

### What It Shows
- ✅ Record count in each table
- ✅ Recent database errors
- ✅ Operation success rate
- ✅ Average operation duration

### How to Check
**Browser:**
```
http://localhost:3000/api/health/database
```

### Response Example
```json
{
  "success": true,
  "data": {
    "tables": {
      "users": 5,
      "exams": 12,
      "questions": 450,
      "subjects": 10,
      "studentExams": 25,
      "studentAnswers": 1200
    },
    "errors": {
      "recent": [],
      "summary": {
        "totalOperations": 1500,
        "successfulOperations": 1495,
        "failedOperations": 5,
        "successRate": "99.67%"
      }
    }
  }
}
```

---

## 3. Check Database Logs

### Endpoint
```
GET /api/health/logs
```

### What It Shows
- ✅ All database operations
- ✅ Failed operations with details
- ✅ Performance metrics
- ✅ Error messages

### How to Check
**Browser:**
```
http://localhost:3000/api/health/logs
```

---

## 4. Common Database Issues & Solutions

### Issue: "Failed to load dashboard data"

**Symptoms:**
- Dashboard shows mock/sample data
- Console shows: `❌ [DASHBOARD] API Error`

**Debugging Steps:**

1. **Check Backend is Running**
   ```bash
   # Terminal should show: "Server running on port 3000"
   npm run dev
   ```

2. **Check Database Connection**
   ```
   http://localhost:3000/api/health
   ```
   - If `database.connected` is `false` → Database not running
   - If `database.error` exists → Connection error

3. **Check Database Records**
   ```
   http://localhost:3000/api/health/database
   ```
   - If all table counts are 0 → Database is empty
   - Run seed: `npx prisma db seed`

4. **Check Browser Console**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for error messages with `[DASHBOARD]` prefix

### Issue: "Failed to load subjects"

**Symptoms:**
- Subject list shows mock data
- Console shows: `❌ [SUBJECTS] API Error`

**Debugging Steps:**

1. **Check Subjects Table**
   ```
   http://localhost:3000/api/health/database
   ```
   - Check `subjects` count
   - If 0 → Run seed: `npx prisma db seed`

2. **Check API Response**
   ```bash
   curl http://localhost:3000/api/subjects
   ```
   - Should return list of subjects
   - If error → Check backend logs

### Issue: "Database connection failed"

**Symptoms:**
- All APIs fail
- Console shows: `❌ [DB CONNECTION]`

**Debugging Steps:**

1. **Check PostgreSQL is Running**
   ```bash
   # Windows
   Get-Process postgres
   
   # Mac/Linux
   ps aux | grep postgres
   ```

2. **Check Connection String**
   - Open `.env` file
   - Verify `DATABASE_URL` is correct
   - Format: `postgresql://user:password@localhost:5432/database`

3. **Check Database Exists**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # List databases
   \l
   
   # Should see: utme_master
   ```

4. **Restart PostgreSQL**
   ```bash
   # Windows
   net stop PostgreSQL
   net start PostgreSQL
   
   # Mac
   brew services restart postgresql
   ```

---

## 5. Browser Console Error Messages

### Error Format
```
❌ [COMPONENT] Error Details: {
  message: "...",
  status: 500,
  statusText: "Internal Server Error",
  endpoint: "/api/...",
  errorData: {...}
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `status: 404` | Endpoint not found | Check API route is registered |
| `status: 500` | Server error | Check backend logs |
| `status: 401` | Not authenticated | Login first |
| `status: 403` | Permission denied | Check user role |
| `ECONNREFUSED` | Backend not running | Run `npm run dev` |
| `ENOTFOUND` | Database not found | Check DATABASE_URL |

---

## 6. Backend Console Logs

### What to Look For

**Successful Operations:**
```
✅ [DB READ] studentExam - 45ms - recordsFound: 5
✅ [DASHBOARD] Dashboard data received successfully
```

**Failed Operations:**
```
❌ [DB READ] studentExam - Error: Connection timeout
❌ [DASHBOARD] API Error Details: {...}
```

### Enable Detailed Logging

Edit `.env`:
```
LOG_LEVEL=debug
```

---

## 7. Database Seeding Issues

### Issue: Seed Fails

**Solution:**

1. **Clear Database**
   ```bash
   npx prisma migrate reset
   ```

2. **Run Seed**
   ```bash
   npx prisma db seed
   ```

3. **Verify Data**
   ```
   http://localhost:3000/api/health/database
   ```

### Issue: Seed Runs But No Data Shows

**Solution:**

1. **Check Seed File**
   ```bash
   cat prisma/seed-simple.ts
   ```

2. **Run Seed with Logs**
   ```bash
   npx ts-node prisma/seed-simple.ts
   ```

3. **Check Database Directly**
   ```bash
   psql -U postgres -d utme_master
   SELECT COUNT(*) FROM "User";
   ```

---

## 8. Performance Issues

### Slow Dashboard Loading

**Check:**
```
http://localhost:3000/api/health/database
```

**Look for:**
- `averageDuration` > 1000ms → Slow queries
- `failedOperations` > 0 → Errors causing retries

**Solutions:**
1. Add database indexes
2. Optimize queries
3. Increase server resources

---

## 9. Quick Troubleshooting Checklist

- [ ] Backend running? (`npm run dev`)
- [ ] Database running? (`/api/health`)
- [ ] Database has data? (`/api/health/database`)
- [ ] Correct credentials? (Check `.env`)
- [ ] Seed ran? (`npx prisma db seed`)
- [ ] Browser cache cleared? (Ctrl+Shift+Delete)
- [ ] Check browser console? (F12)
- [ ] Check backend logs? (Terminal)

---

## 10. Getting Help

### Collect Debug Information

1. **System Health**
   ```
   http://localhost:3000/api/health
   ```

2. **Database Diagnostics**
   ```
   http://localhost:3000/api/health/database
   ```

3. **Database Logs**
   ```
   http://localhost:3000/api/health/logs
   ```

4. **Browser Console**
   - F12 → Console tab
   - Copy all error messages

5. **Backend Logs**
   - Copy terminal output

### Share This Information
When reporting issues, include:
- System health response
- Database diagnostics
- Error messages from console
- Steps to reproduce
