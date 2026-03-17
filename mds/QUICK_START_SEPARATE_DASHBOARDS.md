# Quick Start: Separate Dashboards

## 🚀 TL;DR - Get It Running in 5 Minutes

### 1. Run Migration (2 min)
```bash
cd utme-master-backend
npx prisma migrate dev --name add_is_practice_field
```

### 2. Restart Backend (1 min)
```bash
npm run dev
```

### 3. Test in Browser (2 min)
1. Open http://localhost:5173
2. Login as student
3. Go to `/student/dashboard`
4. Click "Official Exams Dashboard" or "Practice Tests Dashboard"

**Done!** ✨

---

## 📍 What Was Added

### Frontend Pages
- `/student/dashboard/official-exams` - Official exams analytics
- `/student/dashboard/practice-tests` - Practice tests analytics

### Navigation
- Main Dashboard now has "Performance Analytics" section
- Two cards linking to both dashboards
- Back buttons on each dashboard

### Backend Endpoints
- `GET /api/student/dashboard/official-exams` - Official exams data
- `GET /api/student/dashboard/practice-tests` - Practice tests data

---

## 🎯 Key Features

### Official Exams Dashboard
- Total exams, average score, best/worst scores
- Pass rate and passed exams count
- Subject performance breakdown
- Progress trends
- Strengths and weaknesses
- Recent activity

### Practice Tests Dashboard
- Total tests, average score, best/worst scores
- Improvement trend (📈 improving, 📉 declining, ➡️ stable)
- Subject performance breakdown
- Progress trends
- Strong and weak areas
- Recent activity with time spent

---

## 🔧 If Something Goes Wrong

### Backend won't start
```bash
npx prisma generate
npm run dev
```

### Migration hangs
- Wait 5-10 minutes
- If still hanging, press Ctrl+C
- Check database: `psql $DATABASE_URL -c "SELECT 1"`

### Frontend dashboards show no data
- Verify backend is running
- Check browser console for errors
- Ensure student has completed exams/tests

### Navigation buttons not visible
- Clear browser cache: Ctrl+Shift+R
- Restart frontend: `npm run dev`

---

## 📊 Files Changed

### Created
- `OfficialExamsDashboard.tsx`
- `PracticeTestsDashboard.tsx`

### Modified
- `App.tsx` (added routes)
- `Dashboard.tsx` (added navigation)

### Already Done
- Backend services
- Backend routes
- API client
- Database schema

---

## ✅ Verification

After setup, check:
- [ ] Backend starts without errors
- [ ] Frontend loads
- [ ] Can login as student
- [ ] Main Dashboard shows "Performance Analytics" section
- [ ] Can click "Official Exams Dashboard"
- [ ] Can click "Practice Tests Dashboard"
- [ ] Both dashboards load without errors
- [ ] Can navigate between dashboards

---

## 📞 Need Help?

See detailed guides:
- `SEPARATE_DASHBOARDS_SETUP_INSTRUCTIONS.md` - Full setup guide
- `PRISMA_MIGRATION_GUIDE.md` - Migration details
- `SEPARATE_DASHBOARDS_FRONTEND_COMPLETE.md` - Frontend implementation
- `TASK_13_COMPLETION_SUMMARY.md` - Complete overview

---

## 🎉 You're All Set!

The separate dashboards feature is ready to use. Just run the migration and you're done!

**Command**: `npx prisma migrate dev --name add_is_practice_field`

**Time**: ~5 minutes

**Result**: Students can now view separate analytics for official exams and practice tests! 🚀
