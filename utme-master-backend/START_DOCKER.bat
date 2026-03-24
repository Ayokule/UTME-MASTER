@echo off
REM ==========================================
REM UTME MASTER - START DOCKER SERVICES
REM ==========================================
REM Quick start script for Windows

echo ==========================================
echo UTME MASTER DOCKER START
echo ==========================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running
    echo Please start Docker Desktop first
    pause
    exit /b 1
)

echo.
echo Starting all services...
echo.

REM Start all services
docker-compose -f docker-compose.all.yml up -d

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo SERVICES STARTED SUCCESSFULLY!
    echo ==========================================
    echo.
    echo Backend API:  http://localhost:5000
    echo Frontend:     http://localhost:80
    echo API Health:   http://localhost:5000/api/health
    echo.
    echo To view logs: docker-compose -f docker-compose.all.yml logs -f
    echo To stop:      docker-compose -f docker-compose.all.yml down
    echo.
) else (
    echo.
    echo ==========================================
    echo ERROR STARTING SERVICES
    echo ==========================================
    echo.
    echo Check the error messages above
    echo Make sure Docker is running
    echo.
)

pause
