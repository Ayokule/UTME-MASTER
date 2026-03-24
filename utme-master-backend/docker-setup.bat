@echo off
REM ==========================================
REM UTME MASTER DOCKER SETUP SCRIPT
REM ==========================================
REM This script sets up and starts all services

echo ==========================================
echo UTME MASTER DOCKER SETUP
echo ==========================================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not available
    echo Please ensure Docker Desktop is installed with Compose support
    pause
    exit /b 1
)

echo.
echo Docker is installed and ready!
echo.

REM Ask user what they want to do
echo Choose an option:
echo 1. Start all services (Backend + Frontend + Database)
echo 2. Start only Backend + Database
echo 3. Stop all services
echo 4. View logs
echo 5. Rebuild images
echo 6. Exit

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" (
    echo.
    echo Starting all services...
    docker-compose -f docker-compose.all.yml up -d
    echo.
    echo Services started!
    echo.
    echo Backend API: http://localhost:5000
    echo Frontend: http://localhost:80
    echo API Health: http://localhost:5000/api/health
    echo.
    echo To view logs: docker-compose -f docker-compose.all.yml logs -f
    echo To stop: docker-compose -f docker-compose.all.yml down
) else if "%choice%"=="2" (
    echo.
    echo Starting Backend + Database...
    docker-compose up -d
    echo.
    echo Services started!
    echo.
    echo Backend API: http://localhost:5000
    echo Database: localhost:5432
    echo API Health: http://localhost:5000/api/health
    echo.
    echo To view logs: docker-compose logs -f
    echo To stop: docker-compose down
) else if "%choice%"=="3" (
    echo.
    echo Stopping all services...
    docker-compose -f docker-compose.all.yml down
    echo.
    echo Services stopped!
) else if "%choice%"=="4" (
    echo.
    echo Which services? (all/backend/frontend/db)
    set /p service="Enter service name: "
    docker-compose -f docker-compose.all.yml logs -f %service%
) else if "%choice%"=="5" (
    echo.
    echo Rebuilding images...
    docker-compose -f docker-compose.all.yml build --no-cache
    echo.
    echo Images rebuilt! Start services with option 1.
) else (
    echo Exiting...
)

pause
