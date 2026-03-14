# UTME Master - Quick Start Guide

## 🚀 Get Running in 3 Minutes

### Step 1: Start PostgreSQL (30 seconds)
```bash
net start postgresql-x64-15
```

### Step 2: Seed Database (1 minute)
```bash
cd utme-master-backend
npx prisma db seed
```

### Step 3: Start Both Servers (1 minute)

**Terminal 1 - Backend:**
```bash
cd utme-master-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd utme-master-frontend
npm run dev
```

---

## 📱 Access the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

---

## 🔐 Login Credentials

### Admin Account
```
Email: admin@utmemaster.com
Password: Admin@123
```

### Student Accounts
```
Email: student1@test.com
Password: Student@123

Email: student2@test.com
Password: Student@123

Email: student3@test.com
Password: Student@123
```

---

## ✅ What to Test

### As Admin
1. Login with admin account
2. Go to **Admin Dashboard** → **Questions**
3. Click **Create Question**
4. Fill in question details
5. Click **Save Question**

### As Student
1. Login with student account
2. Go to **Student Dashboard**
3. Click on a subject (e.g., Biology)
4. Configure exam (type, difficulty, duration)
5. Click **Start Exam**
6. Answer questions
7. Click **Submit Exam**
8. View results

---

## 🐛 Troubleshooting

### PostgreSQL Not Running
```bash
net start postgresql-x64-15
```

### Port Already in Use
- Backend uses port 3000
- Frontend uses port 5173
- Change in `.env` files if needed

### Module Not Found
```bash
# Backend
cd utme-master-backend
npm install

# Frontend
cd utme-master-frontend
npm install
```

### Database Errors
```bash
cd utme-master-backend
npx prisma db seed
```

---

## 📚 Documentation

- **DEVELOPMENT_COMMANDS.md** - All commands reference
- **EXAM_SYSTEM_GUIDE.md** - Complete exam system docs
- **SETUP_AND_RUN_GUIDE.md** - Detailed setup guide
- **ERROR_LOGGER_GUIDE.md** - Error logging system

---

## 🎯 Next Steps

1. Create some questions as admin
2. Take a practice exam as student
3. View results and analytics
4. Explore the admin dashboard
5. Check out the error logging system (F12 → Console)

---

## ⚡ Pro Tips

- Use `npm run dev` for development (hot reload)
- Use `npm run build` only for production
- Check browser console (F12) for errors
- Check backend terminal for logs
- Use Prisma Studio to view database: `npm run prisma:studio`

---

## 🆘 Need Help?

1. Check the documentation files
2. Check browser console (F12)
3. Check backend terminal output
4. Verify PostgreSQL is running
5. Try restarting both servers

---

**System Ready! Happy Testing! 🎉**

