#!/bin/bash
# ==========================================
# UTME MASTER - DEPLOYMENT SCRIPT
# ==========================================
# Deploy to production or staging environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ==========================================
# CONFIGURATION
# ==========================================
ENVIRONMENT="${1:-production}"
BRANCH="${2:-main}"

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}UTME MASTER DEPLOYMENT${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""

# ==========================================
# VALIDATION
# ==========================================
if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
    echo -e "${RED}ERROR: Environment must be 'production' or 'staging'${NC}"
    exit 1
fi

if [ "$ENVIRONMENT" == "production" ]; then
    echo -e "${YELLOW}Deploying to PRODUCTION environment${NC}"
    COMPOSE_FILE="docker-compose.prod.yml"
else
    echo -e "${YELLOW}Deploying to STAGING environment${NC}"
    COMPOSE_FILE="docker-compose.staging.yml"
fi

echo -e "${YELLOW}Branch: $BRANCH${NC}"
echo ""

# ==========================================
# PRE-DEPLOYMENT CHECKS
# ==========================================
echo -e "${GREEN}[1/6] Running pre-deployment checks...${NC}"

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not installed${NC}"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}ERROR: Docker Compose is not available${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}ERROR: .env file not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Pre-deployment checks passed${NC}"
echo ""

# ==========================================
# PULL LATEST CODE
# ==========================================
echo -e "${GREEN}[2/6] Pulling latest code...${NC}"
git pull origin "$BRANCH"
echo -e "${GREEN}✓ Code updated${NC}"
echo ""

# ==========================================
# BUILD DOCKER IMAGES
# ==========================================
echo -e "${GREEN}[3/6] Building Docker images...${NC}"

# Build backend
echo "Building backend image..."
docker-compose -f "$COMPOSE_FILE" build backend

# Build frontend
echo "Building frontend image..."
docker-compose -f "$COMPOSE_FILE" build frontend

echo -e "${GREEN}✓ Images built${NC}"
echo ""

# ==========================================
# STOP SERVICES
# ==========================================
echo -e "${GREEN}[4/6] Stopping current services...${NC}"
docker-compose -f "$COMPOSE_FILE" down
echo -e "${GREEN}✓ Services stopped${NC}"
echo ""

# ==========================================
# START SERVICES
# ==========================================
echo -e "${GREEN}[5/6] Starting new services...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d
echo -e "${GREEN}✓ Services started${NC}"
echo ""

# ==========================================
# RUN MIGRATIONS
# ==========================================
echo -e "${GREEN}[6/6] Running database migrations...${NC}"

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run migrations
docker-compose -f "$COMPOSE_FILE" exec -T backend npx prisma migrate deploy

echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

# ==========================================
# VERIFICATION
# ==========================================
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}DEPLOYMENT COMPLETE${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""

echo -e "${YELLOW}Verifying deployment...${NC}"

# Check backend health
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)
if [ "$BACKEND_HEALTH" == "200" ]; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed (HTTP $BACKEND_HEALTH)${NC}"
fi

# Check frontend health
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80/health)
if [ "$FRONTEND_HEALTH" == "200" ]; then
    echo -e "${GREEN}✓ Frontend is healthy${NC}"
else
    echo -e "${RED}✗ Frontend health check failed (HTTP $FRONTEND_HEALTH)${NC}"
fi

echo ""
echo -e "${YELLOW}Deployment Summary:${NC}"
echo "  Environment: $ENVIRONMENT"
echo "  Branch: $BRANCH"
echo "  Backend: http://localhost:5000"
echo "  Frontend: http://localhost:80"
echo ""
echo -e "${GREEN}Done!${NC}"
