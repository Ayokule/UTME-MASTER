@echo off
REM ==========================================
REM UTME MASTER - DEPLOYMENT SCRIPT (WINDOWS)
REM ==========================================

setlocal enabledelayedexpansion

echo ==========================================
echo UTME MASTER DEPLOYMENT
echo ==========================================
echo.

REM Parse arguments
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

set BRANCH=%2
if "%BRANCH%"=="" set BRANCH=main

echo Environment: %ENVIRONMENT%
echo Branch: %BRANCH%
echo.

REM Validate environment
if "%ENVIRONMENT%" neq "production" (
    if "%ENVIRONMENT%" neq "staging" (
        echo ERROR: Environment must be 'production' or 'staging'
        exit /b 1
    )
)

echo Deploying to %ENVIRONMENT% environment...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo ERROR: .env file not found
    exit /b 1
)

echo [1/5] Pulling latest code...
git pull origin %BRANCH%
if %errorlevel% neq 0 (
    echo ERROR: Failed to pull code
    exit /b 1
)
echo OK
echo.

echo [2/5] Building Docker images...
if "%ENVIRONMENT%"=="production" (
    docker-compose -f docker-compose.prod.yml build backend
    docker-compose -f docker-compose.prod.yml build frontend
) else (
    docker-compose -f docker-compose.staging.yml build backend
    docker-compose -f docker-compose.staging.yml build frontend
)
if %errorlevel% neq 0 (
    echo ERROR: Failed to build images
    exit /b 1
)
echo OK
echo.

echo [3/5] Stopping current services...
if "%ENVIRONMENT%"=="production" (
    docker-compose -f docker-compose.prod.yml down
) else (
    docker-compose -f docker-compose.staging.yml down
)
echo OK
echo.

echo [4/5] Starting new services...
if "%ENVIRONMENT%"=="production" (
    docker-compose -f docker-compose.prod.yml up -d
) else (
    docker-compose -f docker-compose.staging.yml up -d
)
if %errorlevel% neq 0 (
    echo ERROR: Failed to start services
    exit /b 1
)
echo OK
echo.

echo [5/5] Running database migrations...
timeout /t 10 /nobreak >nul
if "%ENVIRONMENT%"=="production" (
    docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy
) else (
    docker-compose -f docker-compose.staging.yml exec -T backend npx prisma migrate deploy
)
echo OK
echo.

echo ==========================================
echo DEPLOYMENT COMPLETE
echo ==========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:80
echo.
