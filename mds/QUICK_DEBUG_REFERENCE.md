# Quick Debug Reference Card

## 🚨 Dashboard Shows Mock Data?

### Quick Check (30 seconds)
```
1. Open: http://localhost:3000/api/health
2. Look for: "connected": true
3. If false → Start PostgreSQL
4. If true → Check next step
```

---

## 🔍 What's Wrong?

### Check These in Order

| Issue | Check | Fix |
|-------|-------|-----|
| Dashboard blank | `/api/health` | Start PostgreSQL |
| No data in tables | `/api/health/database` | Run `npx prisma db seed` |
| API errors | Browser F12 Console | Check error message |
| Slow loading | `/api/health/logs` | Check `averageDuration` |
| Auth failed | Login page | Check credentials |

---

## 🛠️ Common Fixes

### PostgreSQL Not Running
```bash
# Windows
net start PostgreSQL

# Mac
brew services start postgresql
```

### Database Empty
```bash
npx prisma db seed
```

### Backend Not Running
```bash
npm run dev
```

### Clear Cache
```
Browser: Ctrl+Shift+Delete
```

---

## 📊 Health Check URLs

| URL | Shows |
|-----|-------|
| `http://localhost:3000/api/health` | System status |
| `http://localhost:3000/api/health/database` | Table counts |
| `http://localhost:3000/api/health/logs` | Error logs |

---

## 🔴 Error Codes

| Status | Meaning | Fix |
|--------|---------|-----|
| 404 | Not found | Check endpoint URL |
| 500 | Server error | Check backend logs |
| 401 | Not logged in | Login first |
| 403 | No permission | Check user role |
| ECONNREFUSED | DB not running | Start PostgreSQL |

---

## 📝 Console Messages

### ✅ Good
```
✅ [DASHBOARD] Dashboard data received successfully
✅ [SUBJECTS] Subjects loaded successfully
✅ [DB READ] studentExam - 45ms
```

### ❌ Bad
```
❌ [DASHBOARD] API Error Details
❌ [DB CONNECTION] Database connection failed
❌ [DB READ] Error: Connection timeout
```

---

## 🎯 Step-by-Step Debugging

### 1. Is Backend Running?
```bash
# Terminal should show: "Server running on port 3000"
npm run dev
```

### 2. Is Database Running?
```
http://localhost:3000/api/health
# Look for: "connected": true
```

### 3. Does Database Have Data?
```
http://localhost:3000/api/health/database
# Look for: "users": > 0, "subjects": > 0
```

### 4. What's the Error?
```
Browser F12 → Console tab
# Look for messages with [DASHBOARD], [SUBJECTS], etc.
```

### 5. Check Backend Logs
```
Terminal where npm run dev is running
# Look for ❌ error messages
```

---

## 🚀 Quick Start

```bash
# 1. Start PostgreSQL
net start PostgreSQL  # Windows
brew services start postgresql  # Mac

# 2. Seed database
npx prisma db seed

# 3. Start backend
npm run dev

# 4. Start frontend (new terminal)
npm run dev

# 5. Open browser
http://localhost:5173
```

---

## 📞 Need Help?

1. Check `/api/health` - Is system healthy?
2. Check `/api/health/database` - Does DB have data?
3. Check `/api/health/logs` - Are there errors?
4. Check browser console (F12) - What's the error?
5. Check backend terminal - Any error messages?

---

## 💡 Pro Tips

- **Always check `/api/health` first** - Tells you if DB is connected
- **Check `/api/health/database` second** - Tells you if DB has data
- **Browser F12 Console** - Shows exact API errors
- **Backend terminal** - Shows database operation logs
- **Clear browser cache** - Fixes many "blank page" issues

---

## ⚡ Most Common Issues

| Problem | Solution |
|---------|----------|
| Dashboard blank | Check `/api/health` |
| No subjects | Run `npx prisma db seed` |
| Login fails | Check credentials in seed |
| Slow loading | Check `/api/health/logs` |
| API 500 error | Check backend terminal |

---

## 📋 Checklist

- [ ] PostgreSQL running?
- [ ] Backend running? (`npm run dev`)
- [ ] Database has data? (`/api/health/database`)
- [ ] Browser cache cleared?
- [ ] Correct login credentials?
- [ ] Check browser console (F12)?
- [ ] Check backend terminal logs?

---

**Remember:** Most issues are either:
1. PostgreSQL not running
2. Database is empty (need to seed)
3. Backend not running
4. Browser cache needs clearing
