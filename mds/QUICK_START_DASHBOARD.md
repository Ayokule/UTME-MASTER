# Quick Start - Dashboard Setup

## TL;DR - Get Dashboards Working in 5 Minutes

### Windows Users
```bash
cd utme-master-backend
setup-db.bat
npm run dev
```

Then in another terminal:
```bash
cd utme-master-frontend
npm run dev
```

### Mac/Linux Users
```bash
cd utme-master-backend
chmod +x setup-db.sh
./setup-db.sh
npm run dev
```

Then in another terminal:
```bash
cd utme-master-frontend
npm run dev
```

### Manual Setup (All Platforms)
```bash
cd utme-master-backend
npm run prisma:generate
npm run prisma:migrate
npx prisma db seed
npm run dev
```

Then in another terminal:
```bash
cd utme-master-frontend
npm run dev
```

## Login Credentials

### Admin
- **Email**: `admin@utmemaster.com`
- **Password**: `Admin@123`
- **URL**: `http://localhost:5173/login` → Click "Admin Portal"

### Student
- **Email**: `student1@test.com`
- **Password**: `Student@123`
- **URL**: `http://localhost:5173/login` → Click "Student 1 Portal"

## What You'll See

### Admin Dashboard (`/admin/dashboard`)
- 📊 Total Students, Teachers, Questions, Exams
- 📈 Recent Activity Feed
- 📚 Subject Distribution
- 🏥 System Health Status

### Student Dashboard (`/student/dashboard`)
- 👋 Welcome Message
- 📊 Quick Stats (Tests, Average Score, Best Score, Study Hours)
- 📈 Performance Charts
- 🎯 Quick Start Practice Tests
- 🛠️ Study Tools
- 🎓 Today's Goals
- 📋 Recent Activity

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Database does not exist" | Run `createdb utme_master` |
| "Relation does not exist" | Run `npm run prisma:migrate` |
| "No data showing" | Run `npx prisma db seed` |
| "Cannot connect to backend" | Verify backend is running on port 3000 |
| "Cannot connect to database" | Verify PostgreSQL is running on port 5432 |

## What Was Fixed

✅ API endpoint corrected  
✅ Layout component fixed  
✅ Dashboard containers sized properly  
✅ UI components improved  
✅ DOM nesting issues resolved  
✅ React Router warnings fixed  

## Files Changed

- `src/api/admin.ts` - API endpoint
- `src/components/Layout.tsx` - Layout structure
- `src/pages/student/Dashboard.tsx` - Container width
- `src/pages/admin/Dashboard.tsx` - Container width
- `src/pages/auth/Login.tsx` - DOM structure
- `src/App.tsx` - React Router config
- `src/components/ui/*` - UI components

## Next Steps

1. ✅ Setup database (see above)
2. ✅ Start backend and frontend
3. ✅ Login with credentials
4. 📝 Create questions in admin dashboard
5. 📋 Create exams
6. 🎓 Students take exams
7. 📊 View results and analytics

## Need Help?

See `DATABASE_SETUP_GUIDE.md` for detailed setup instructions.
See `DASHBOARD_FIX_SUMMARY.md` for complete technical details.
