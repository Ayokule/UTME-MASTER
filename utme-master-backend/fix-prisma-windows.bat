@echo off
REM ==========================================
REM Fix Prisma Windows File Lock Issue
REM ==========================================
REM This script fixes the "EPERM: operation not permitted" error
REM when running prisma migrate on Windows

echo.
echo 🔧 Fixing Prisma Windows File Lock Issue
echo ==========================================
echo.

REM Stop any running Node processes
echo 🛑 Stopping Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak

REM Delete Prisma cache
echo 🗑️  Clearing Prisma cache...
if exist "node_modules\.prisma" (
    rmdir /s /q "node_modules\.prisma" 2>nul
    echo ✅ Prisma cache cleared
) else (
    echo ℹ️  Prisma cache not found
)

REM Delete node_modules and reinstall
echo 📦 Reinstalling dependencies...
if exist "node_modules" (
    rmdir /s /q "node_modules" 2>nul
    echo ✅ node_modules removed
)

call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

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
echo 🗄️  Running migrations...
call npm run prisma:migrate
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to run migrations
    echo.
    echo 💡 If the error persists:
    echo    1. Close all Node processes
    echo    2. Close any database connections
    echo    3. Try again
    pause
    exit /b 1
)
echo ✅ Migrations completed
echo.

REM Seed database
echo 🌱 Seeding database...
call npx prisma db seed
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)
echo ✅ Database seeded
echo.

echo ═════════════════════════════════════════
echo ✅ PRISMA FIX COMPLETED!
echo ═════════════════════════════════════════
echo.
echo 🚀 You can now run: npm run dev
echo.
pause
