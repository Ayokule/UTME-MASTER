@echo off
REM ==========================================
REM UTME Master - Start All Services
REM ==========================================
REM This script starts PostgreSQL, Backend, and Frontend

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo   UTME Master - Service Startup
echo ==========================================
echo.

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo Current directory: %SCRIPT_DIR%
echo.

REM Quick Node.js check
echo Checking Node.js...
where node >nul 2>&1
if !errorlevel! neq 0 (
    echo [!] Node.js not found in PATH
    echo [*] Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo [OK] Node.js found
)

REM Quick npm check
echo Checking npm...
where npm >nul 2>&1
if !errorlevel! neq 0 (
    echo [!] npm not found in PATH
    pause
    exit /b 1
) else (
    echo [OK] npm found
)

REM Check if backend dependencies are installed
echo Checking backend dependencies...
if not exist "utme-master-backend\node_modules" (
    echo [!] Backend dependencies not installed
    echo [*] Installing backend dependencies...
    cd /d "%SCRIPT_DIR%utme-master-backend"
    call npm install
    if !errorlevel! neq 0 (
        echo [!] Failed to install backend dependencies
        echo [*] Please run: cd utme-master-backend && npm install
        pause
        exit /b 1
    )
    cd /d "%SCRIPT_DIR%"
    echo [OK] Backend dependencies installed
) else (
    echo [OK] Backend dependencies found
)

REM Check if frontend dependencies are installed
echo Checking frontend dependencies...
if not exist "utme-master-frontend\node_modules" (
    echo [!] Frontend dependencies not installed
    echo [*] Installing frontend dependencies...
    cd /d "%SCRIPT_DIR%utme-master-frontend"
    call npm install
    if !errorlevel! neq 0 (
        echo [!] Failed to install frontend dependencies
        echo [*] Please run: cd utme-master-frontend && npm install
        pause
        exit /b 1
    )
    cd /d "%SCRIPT_DIR%"
    echo [OK] Frontend dependencies installed
) else (
    echo [OK] Frontend dependencies found
)

REM Check if PostgreSQL is running
echo Checking PostgreSQL service...
tasklist /FI "IMAGENAME eq postgres.exe" 2>nul | find /I /N "postgres.exe">nul
if "%ERRORLEVEL%"=="0" (
    echo [OK] PostgreSQL is running
    goto :postgresql_ready
)

echo [!] PostgreSQL is not running
echo [*] Detecting and starting PostgreSQL service...

REM Try to detect and start PostgreSQL service
call :start_postgresql
if !errorlevel! neq 0 (
    echo [!] Could not start PostgreSQL automatically
    echo [*] Please start PostgreSQL manually:
    echo    - Open Services ^(services.msc^)
    echo    - Find PostgreSQL service ^(any version^)
    echo    - Right-click and select "Start"
    echo    - Or start pgAdmin and ensure server is running
    echo.
    pause
    exit /b 1
)

:postgresql_ready

REM Wait for database to be ready
echo.
echo Waiting for database to be ready...
timeout /t 3 /nobreak >nul

REM Start Backend
echo.
echo Starting Backend Server on port 3000...
start "UTME Master Backend" cmd /k "cd /d "%SCRIPT_DIR%utme-master-backend" && npm run dev"
timeout /t 5 /nobreak >nul

REM Start Frontend
echo.
echo Starting Frontend Server on port 5173...
start "UTME Master Frontend" cmd /k "cd /d "%SCRIPT_DIR%utme-master-frontend" && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ==========================================
echo   All Services Started Successfully
echo ==========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo Health:   http://localhost:3000/health
echo.
echo Demo Credentials:
echo   Student: student@demo.com / password123
echo   Admin:   admin@demo.com / password123
echo.
echo Troubleshooting:
echo   - If backend fails: Check PostgreSQL is running
echo   - If frontend fails: Check Node.js is installed
echo   - If ports are in use: Change PORT in .env files
echo.
echo Closing this window will NOT stop the services.
echo To stop services, close the individual windows.
echo.
pause

REM ==========================================
REM POSTGRESQL DETECTION AND START FUNCTION
REM ==========================================
:start_postgresql
echo [*] Trying to detect PostgreSQL installation...

REM List of common PostgreSQL service names to try
set services=postgresql-x64-16 postgresql-x64-15 postgresql-x64-14 postgresql-x64-13 postgresql-x64-12 postgresql postgresql-11 postgresql-10 PostgreSQL

for %%s in (%services%) do (
    echo [*] Trying service: %%s
    sc query "%%s" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [*] Found service: %%s
        net start "%%s" >nul 2>&1
        if !errorlevel! equ 0 (
            echo [OK] PostgreSQL service started: %%s
            timeout /t 5 /nobreak >nul
            exit /b 0
        ) else (
            echo [*] Service %%s exists but failed to start
        )
    )
)

REM Try alternative methods
echo [*] Trying alternative PostgreSQL detection...

REM Check for pg_ctl in common locations
set pg_paths="C:\Program Files\PostgreSQL\*\bin\pg_ctl.exe" "C:\PostgreSQL\*\bin\pg_ctl.exe" "C:\Program Files (x86)\PostgreSQL\*\bin\pg_ctl.exe"

for %%p in (%pg_paths%) do (
    if exist %%p (
        echo [*] Found PostgreSQL installation at %%p
        echo [*] Please start PostgreSQL manually using pgAdmin or Services
        exit /b 1
    )
)

REM Check for Docker PostgreSQL
docker ps --filter "name=postgres" --format "table {{.Names}}" 2>nul | find "postgres" >nul
if !errorlevel! equ 0 (
    echo [*] Found PostgreSQL running in Docker
    exit /b 0
)

echo [!] No PostgreSQL installation detected
exit /b 1