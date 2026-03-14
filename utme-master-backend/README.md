# 🚀 UTME Master - Backend API

Production-ready Node.js backend for UTME exam preparation system.

## 📋 Prerequisites

- **Node.js v20+** - [Download](https://nodejs.org/)
- **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
# Copy .env.example to .env
cp .env.example .env
```

Edit `.env` and set your database password:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/utme_master
JWT_SECRET=your-super-secret-key-change-this-in-production
```

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init

# Seed database with sample data
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Server runs on: **http://localhost:3000**

## 📂 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # Prisma connection
│   │   └── jwt.ts        # JWT configuration
│   ├── controllers/      # HTTP request handlers
│   │   └── auth.controller.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/          # API routes
│   │   └── auth.routes.ts
│   ├── services/        # Business logic
│   │   └── auth.service.ts
│   ├── validation/      # Zod schemas
│   │   └── auth.validation.ts
│   ├── utils/           # Utilities
│   │   ├── logger.ts
│   │   └── errors.ts
│   └── server.ts        # Entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
├── package.json
├── tsconfig.json
└── .env.example
```

## 🛠️ Available Commands

```bash
npm run dev          # Start development server (with auto-reload)
npm run build        # Build for production
npm start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database
npm run prisma:studio    # Open Prisma Studio (database GUI)
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

## 🔐 Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your_access_token>
```

## 📝 Example API Calls

### 1. Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "Password123",
    "firstName": "Test",
    "lastName": "Student"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "Password123"
  }'
```

### 3. Get Profile (with token)

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🗄️ Database

### Seed Data

After running `npx prisma db seed`, you get:

**Admin User:**
- Email: admin@utmemaster.com
- Password: Admin@123
- Role: ADMIN

**Test Student:**
- Email: student@test.com
- Password: Student@123
- Role: STUDENT

**Subjects:**
- All JAMB subjects (English, Math, Physics, etc.)
- 50 sample questions per subject

### View Database

```bash
npx prisma studio
```

Opens database GUI at http://localhost:5555

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment (development/production) | development |
| PORT | Server port | 3000 |
| DATABASE_URL | PostgreSQL connection string | - |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRES_IN | Access token expiration | 7d |
| CORS_ORIGIN | Allowed frontend origin | http://localhost:5173 |

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env
PORT=3001
```

**Database connection failed:**
```bash
# Check PostgreSQL is running
# Windows: services.msc → PostgreSQL
# Mac: brew services list
# Linux: sudo systemctl status postgresql
```

**Prisma errors:**
```bash
# Regenerate Prisma client
npx prisma generate
```

**Migration errors:**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## 📚 Tech Stack

- **Node.js v20** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM (database)
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Zod** - Validation
- **Bcrypt** - Password hashing
- **Winston** - Logging

## ✅ Success Check

Test the API:

```bash
# Health check
curl http://localhost:3000/health

# Should return:
# {"status":"ok","message":"UTME Master API is running"}
```

## 🚀 Next Steps

1. ✅ Backend is running
2. ✅ Database is seeded
3. ➡️ Connect frontend (Phase 1.1)
4. ➡️ Build question management (Phase 2)
5. ➡️ Build exam system (Phase 3)

## 💡 Tips

- All files have **detailed comments** explaining what they do
- Read comments to understand code flow
- Use Prisma Studio to view database
- Check logs for errors (console output)
- Use Postman or curl to test APIs

## 🆘 Need Help?

Common issues:
1. **"Module not found"** → Run `npm install`
2. **"Port 3000 in use"** → Change PORT in .env
3. **"Database error"** → Check DATABASE_URL in .env
4. **"JWT error"** → Set JWT_SECRET in .env

---

**Backend is ready!** 🎉

Test it: http://localhost:3000/health
