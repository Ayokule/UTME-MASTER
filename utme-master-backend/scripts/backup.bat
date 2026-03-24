@echo off
REM ==========================================
REM UTME MASTER - BACKUP SCRIPT (WINDOWS)
REM ==========================================

setlocal enabledelayedexpansion

echo ==========================================
echo UTME MASTER BACKUP
echo ==========================================
echo.

REM Parse arguments
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

set BACKUP_NAME=%2
if "%BACKUP_NAME%"=="" (
    for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
    set YEAR=!dt:~0,4!
    set MONTH=!dt:~4,2!
    set DAY=!dt:~6,2!
    set HOUR=!dt:~8,2!
    set MIN=!dt:~10,2!
    set SEC=!dt:~12,2!
    set BACKUP_NAME=backup-%YEAR%%MONTH%%DAY%_%HOUR%%MIN%%SEC%
)

echo Environment: %ENVIRONMENT%
echo Backup Name: %BACKUP_NAME%
echo.

REM Create backup directory
echo [1/3] Creating backup directory...
set BACKUP_DIR=backups\%BACKUP_NAME%
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
echo Backup directory: %BACKUP_DIR%
echo.

REM Backup database
echo [2/3] Backing up database...
docker-compose -f docker-compose.%ENVIRONMENT%.yml exec -T db pg_dump -U %POSTGRES_USER% %POSTGRES_DB% > "%BACKUP_DIR%\database.sql" 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Failed to backup database
    exit /b 1
)
echo Database backup: %BACKUP_DIR%\database.sql
echo.

REM Backup application files
echo [3/3] Backing up application files...
if exist .env (
    copy .env "%BACKUP_DIR%\.env" >nul
    echo Configuration backed up
)

if exist uploads (
    tar -czf "%BACKUP_DIR%\uploads.tar.gz" uploads/ 2>nul
    echo Uploads backed up
)

if exist logs (
    tar -czf "%BACKUP_DIR%\logs.tar.gz" logs/ 2>nul
    echo Logs backed up
)

echo Application files backed up
echo.

echo ==========================================
echo BACKUP COMPLETE
echo ==========================================
echo.
echo Backup Summary:
echo   Environment: %ENVIRONMENT%
echo   Backup Name: %BACKUP_NAME%
echo   Location: %BACKUP_DIR%
echo.
echo To restore: scripts\restore.bat %ENVIRONMENT% %BACKUP_NAME%
echo.
echo Done!
