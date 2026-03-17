@echo off
REM ==========================================
REM UTME Master Database Setup Script (Windows)
REM ==========================================
REM This script sets up the database with all necessary tables and seed data

echo.
echo 🚀 UTME Master Database Setup
echo ==============================
echo.

REM Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed or not in PATH
    echo    Please install Node.js and npm first
    pause
    exit /b 1
)

REM Generate Prisma client
echo 🔧 Generating Prisma client...
call npm run prisma:generate
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✅ Prisma client generated
echo.

REM Run migrations
echo 🗄️  Running database migrations...
call npm run prisma:migrate
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to run migrations
    pause
    exit /b 1
)
echo ✅ Migrations completed
echo.

REM Seed database
echo 🌱 Seeding database with initial data...
call npx prisma db seed
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)
echo ✅ Database seeded
echo.

echo ═════════════════════════════════════════
echo 🎉 DATABASE SETUP COMPLETED!
echo ═════════════════════════════════════════
echo.
echo 📝 Next Steps:
echo    1. Start backend: npm run dev
echo    2. Start frontend: npm run dev
echo    3. Login with:
echo       - Admin: admin@utmemaster.com / Admin@123
echo       - Student: student1@test.com / Student@123
echo.
pause
