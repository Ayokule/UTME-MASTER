@echo off
REM ==========================================
REM UTME Master - Quick Start Services
REM ==========================================
REM Simple version - assumes PostgreSQL is running

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo   UTME Master - Quick Start
echo ==========================================
echo.

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo [*] Starting Backend Server on port 3000...
start "UTME Master Backend" cmd /k "cd /d "%SCRIPT_DIR%utme-master-backend" && npm run dev"
timeout /t 5 /nobreak >nul

echo [*] Starting Frontend Server on port 5173...
start "UTME Master Frontend" cmd /k "cd /d "%SCRIPT_DIR%utme-master-frontend" && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ==========================================
echo   Services Started
echo ==========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Login Credentials:
echo   Admin:    admin@utmemaster.com / Admin@123
echo   Student1: student1@test.com / Student@123
echo   Student2: student2@test.com / Student@123
echo   Student3: student3@test.com / Student@123
echo.
echo To stop services, close the individual windows.
echo.
pause
