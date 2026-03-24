@echo off
REM ==========================================
REM UTME MASTER - ROLLBACK SCRIPT (WINDOWS)
REM ==========================================

setlocal enabledelayedexpansion

echo ==========================================
echo UTME MASTER ROLLBACK
echo ==========================================
echo.

REM Parse arguments
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

set BACKUP_FILE=%2

echo Environment: %ENVIRONMENT%
echo.

REM Pre-rollback checks
echo [1/5] Running pre-rollback checks...

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed
    exit /b 1
)

if not exist .env (
    echo ERROR: .env file not found
    exit /b 1
)

echo OK
echo.

REM Backup current state
echo [2/5] Backing up current state...

set BACKUP_TIMESTAMP=%date:~-4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=backups\rollback-%BACKUP_TIMESTAMP%

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Backing up database...
docker-compose -f docker-compose.%ENVIRONMENT%.yml exec -T db pg_dump -U %POSTGRES_USER% %POSTGRES_DB% > "%BACKUP_DIR%\database.sql" 2>nul

echo Backing up application files...
if exist dist (
    tar -czf "%BACKUP_DIR%\app.tar.gz" dist/ 2>nul
)

echo Backup completed: %BACKUP_DIR%
echo.

REM Stop services
echo [3/5] Stopping current services...
docker-compose -f docker-compose.%ENVIRONMENT%.yml down
echo OK
echo.

REM Restore database
echo [4/5] Restoring database from backup...

if "%BACKUP_FILE%"=="" (
    for /f "tokens=*" %%i in ('dir /b /od backups\*.sql ^| findstr /v "^$"') do set LATEST=%%i
    set BACKUP_FILE=%%LATEST%%
    echo Using latest backup: !BACKUP_FILE!
)

echo Restoring database from: %BACKUP_FILE%
docker-compose -f docker-compose.%ENVIRONMENT%.yml exec -T db psql -U %POSTGRES_USER% -d %POSTGRES_DB% < "%BACKUP_FILE%" 2>nul
echo OK
echo.

REM Start services
echo [5/5] Starting services...
docker-compose -f docker-compose.%ENVIRONMENT%.yml up -d
echo OK
echo.

REM Verify rollback
echo ==========================================
echo ROLLBACK COMPLETE
echo ==========================================
echo.

echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo Checking backend health...
curl -s -o nul -w %%{http_code} http://localhost:5000/api/health >nul 2>&1
if errorlevel 200 if not errorlevel 300 (
    echo OK - Backend is healthy
) else (
    echo ERROR - Backend health check failed
)

echo Checking frontend health...
curl -s -o nul -w %%{http_code} http://localhost:80/health >nul 2>&1
if errorlevel 200 if not errorlevel 300 (
    echo OK - Frontend is healthy
) else (
    echo ERROR - Frontend health check failed
)

echo.
echo Rollback Summary:
echo   Environment: %ENVIRONMENT%
echo   Backup: %BACKUP_FILE%
echo   Backup Location: %BACKUP_DIR%
echo   Backend: http://localhost:5000
echo   Frontend: http://localhost:80
echo.

echo Done!
