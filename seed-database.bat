@echo off
REM ==========================================
REM UTME Master - Database Seeding Script
REM ==========================================
REM Seeds the database with initial data

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo   UTME Master - Database Seeding
echo ==========================================
echo.

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo [*] Checking PostgreSQL connection...
cd /d "%SCRIPT_DIR%utme-master-backend"

REM Check if database exists
psql -U postgres -d utme_master -c "SELECT 1" >nul 2>&1
if !errorlevel! neq 0 (
    echo [!] Database connection failed
    echo [*] Make sure PostgreSQL is running and database exists
    echo [*] Create database with: psql -U postgres -c "CREATE DATABASE utme_master;"
    pause
    exit /b 1
)

echo [OK] Database connection successful

REM Run migrations
echo.
echo [*] Running database migrations...
call npx prisma migrate deploy >nul 2>&1
if !errorlevel! neq 0 (
    echo [!] Migration failed, trying fresh migration...
    call npx prisma migrate dev --name init
    if !errorlevel! neq 0 (
        echo [!] Fresh migration failed
        pause
        exit /b 1
    )
)
echo [OK] Migrations completed

REM Run seed
echo.
echo [*] Seeding database...
call npx prisma db seed
if !errorlevel! neq 0 (
    echo [!] Seed failed
    echo [*] Trying manual seed...
    call npx ts-node prisma/seed-simple.ts
    if !errorlevel! neq 0 (
        echo [!] Manual seed also failed
        pause
        exit /b 1
    )
)

echo.
echo ==========================================
echo   Database Seeding Completed Successfully
echo ==========================================
echo.
echo Login Credentials:
echo   Admin:    admin@utmemaster.com / Admin@123
echo   Student1: student1@test.com / Student@123
echo   Student2: student2@test.com / Student@123
echo   Student3: student3@test.com / Student@123
echo.
echo Subjects Created:
echo   - English Language
echo   - Mathematics
echo   - Physics
echo   - Chemistry
echo   - Biology
echo   - Economics
echo   - Government
echo   - Commerce
echo   - Literature in English
echo   - CRK/IRK
echo.
echo Next Steps:
echo   1. Run: start-services-simple.bat
echo   2. Open: http://localhost:5173
echo   3. Login with credentials above
echo   4. Create questions in admin dashboard
echo.
pause
