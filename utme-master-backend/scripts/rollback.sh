#!/bin/bash
# ==========================================
# UTME MASTER - ROLLBACK SCRIPT
# ==========================================
# Rollback to previous version with data safety

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
BACKUP_FILE="${2:-}"

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}UTME MASTER ROLLBACK${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""

# ==========================================
# VALIDATION
# ==========================================
if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
    echo -e "${RED}ERROR: Environment must be 'production' or 'staging'${NC}"
    exit 1
fi

echo -e "${YELLOW}Rolling back to previous version...${NC}"
echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
echo ""

# ==========================================
# PRE-ROLLBACK CHECKS
# ==========================================
echo -e "${GREEN}[1/6] Running pre-rollback checks...${NC}"

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not installed${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}ERROR: .env file not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Pre-rollback checks passed${NC}"
echo ""

# ==========================================
# BACKUP CURRENT STATE
# ==========================================
echo -e "${GREEN}[2/6] Backing up current state...${NC}"

BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/rollback-${BACKUP_TIMESTAMP}"

mkdir -p "$BACKUP_DIR"

# Backup database
echo "Backing up database..."
if [ "$ENVIRONMENT" == "production" ]; then
    docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U ${POSTGRES_USER:-utme_user} ${POSTGRES_DB:-utme_master} > "$BACKUP_DIR/database.sql" 2>/dev/null
else
    docker-compose -f docker-compose.staging.yml exec -T db pg_dump -U ${POSTGRES_USER:-utme_user} ${POSTGRES_DB:-utme_master} > "$BACKUP_DIR/database.sql" 2>/dev/null
fi

# Backup application files
echo "Backing up application files..."
if [ -d "dist" ]; then
    tar -czf "$BACKUP_DIR/app.tar.gz" dist/ 2>/dev/null || true
fi

echo -e "${GREEN}✓ Backup completed: $BACKUP_DIR${NC}"
echo ""

# ==========================================
# STOP SERVICES
# ==========================================
echo -e "${GREEN}[3/6] Stopping current services...${NC}"

if [ "$ENVIRONMENT" == "production" ]; then
    docker-compose -f docker-compose.prod.yml down
else
    docker-compose -f docker-compose.staging.yml down
fi

echo -e "${GREEN}✓ Services stopped${NC}"
echo ""

# ==========================================
# RESTORE DATABASE
# ==========================================
echo -e "${GREEN}[4/6] Restoring database from backup...${NC}"

# Find latest backup if not specified
if [ -z "$BACKUP_FILE" ]; then
    LATEST_BACKUP=$(ls -t backups/*.sql 2>/dev/null | head -1)
    if [ -z "$LATEST_BACKUP" ]; then
        echo -e "${RED}ERROR: No backup files found${NC}"
        exit 1
    fi
    BACKUP_FILE="$LATEST_BACKUP"
    echo -e "${YELLOW}Using latest backup: $BACKUP_FILE${NC}"
fi

# Restore database
echo "Restoring database from: $BACKUP_FILE"
if [ "$ENVIRONMENT" == "production" ]; then
    docker-compose -f docker-compose.prod.yml exec -T db psql -U ${POSTGRES_USER:-utme_user} -d ${POSTGRES_DB:-utme_master} < "$BACKUP_FILE" 2>/dev/null
else
    docker-compose -f docker-compose.staging.yml exec -T db psql -U ${POSTGRES_USER:-utme_user} -d ${POSTGRES_DB:-utme_master} < "$BACKUP_FILE" 2>/dev/null
fi

echo -e "${GREEN}✓ Database restored${NC}"
echo ""

# ==========================================
# START SERVICES
# ==========================================
echo -e "${GREEN}[5/6] Starting services...${NC}"

if [ "$ENVIRONMENT" == "production" ]; then
    docker-compose -f docker-compose.prod.yml up -d
else
    docker-compose -f docker-compose.staging.yml up -d
fi

echo -e "${GREEN}✓ Services started${NC}"
echo ""

# ==========================================
# VERIFY ROLLBACK
# ==========================================
echo -e "${GREEN}[6/6] Verifying rollback...${NC}"

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check backend health
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null || echo "000")
if [ "$BACKEND_HEALTH" == "200" ]; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed (HTTP $BACKEND_HEALTH)${NC}"
fi

# Check frontend health
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80/health 2>/dev/null || echo "000")
if [ "$FRONTEND_HEALTH" == "200" ]; then
    echo -e "${GREEN}✓ Frontend is healthy${NC}"
else
    echo -e "${RED}✗ Frontend health check failed (HTTP $FRONTEND_HEALTH)${NC}"
fi

# Verify database connection
DB_HEALTH=$(docker exec utme-master-db pg_isready 2>/dev/null || echo "unhealthy")
if [ "$DB_HEALTH" == "accepting connections" ]; then
    echo -e "${GREEN}✓ Database is healthy${NC}"
else
    echo -e "${RED}✗ Database health check failed${NC}"
fi

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}ROLLBACK COMPLETE${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""

echo -e "${YELLOW}Rollback Summary:${NC}"
echo "  Environment: $ENVIRONMENT"
echo "  Backup: $BACKUP_FILE"
echo "  Backup Location: $BACKUP_DIR"
echo "  Backend: http://localhost:5000"
echo "  Frontend: http://localhost:80"
echo ""

if [ "$BACKEND_HEALTH" == "200" ] && [ "$FRONTEND_HEALTH" == "200" ]; then
    echo -e "${GREEN}✓ Rollback successful!${NC}"
else
    echo -e "${RED}✗ Rollback may have issues. Check logs.${NC}"
fi

echo ""
echo -e "${GREEN}Done!${NC}"
