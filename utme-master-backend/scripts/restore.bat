@echo off
REM ==========================================
REM UTME MASTER - RESTORE SCRIPT (WINDOWS)
REM ==========================================

setlocal enabledelayedexpansion

echo ==========================================
echo UTME MASTER RESTORE
echo ==========================================
echo.

REM Parse arguments
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

set BACKUP_NAME=%2
if "%BACKUP_NAME%"=="" (
    echo ERROR: Backup name is required
    echo Usage: scripts\restore.bat ^<environment^> ^<backup_name^>
    echo Example: scripts\restore.bat production backup-20240101_120000
    exit /b 1
)

set BACKUP_DIR=backups\%BACKUP_NAME%

if not exist "%BACKUP_DIR%" (
    echo ERROR: Backup directory not found: %BACKUP_DIR%
    echo Available backups:
    dir /b backups
    exit /b 1
)

echo Environment: %ENVIRONMENT%
echo Backup Name: %BACKUP_NAME%
echo.

REM Pre-restore checks
echo [1/4] Running pre-restore checks...

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed
    exit /b 1
)

if not exist "%BACKUP_DIR%\database.sql" (
    echo ERROR: Database backup not found: %BACKUP_DIR%\database.sql
    exit /b 1
)

echo OK
echo.

REM Stop services
echo [2/4] Stopping services...
docker-compose -f docker-compose.%ENVIRONMENT%.yml down
echo OK
echo.

REM Restore database
echo [3/4] Restoring database...
docker-compose -f docker-compose.%ENVIRONMENT%.yml exec -T db psql -U %POSTGRES_USER% -d %POSTGRES_DB% < "%BACKUP_DIR%\database.sql" 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Failed to restore database
    exit /b 1
)
echo Database restored
echo.

REM Start services
echo [4/4] Starting services...
docker-compose -f docker-compose.%ENVIRONMENT%.yml up -d
echo OK
echo.

REM Verify restore
echo ==========================================
echo RESTORE COMPLETE
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
echo Restore Summary:
echo   Environment: %ENVIRONMENT%
echo   Backup: %BACKUP_NAME%
echo   Backend: http://localhost:5000
echo   Frontend: http://localhost:80
echo.

echo Done!
