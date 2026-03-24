#!/bin/bash
# ==========================================
# UTME MASTER - RESTORE SCRIPT
# ==========================================
# Restore database from backup

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
BACKUP_NAME="${2:-}"

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}UTME MASTER RESTORE${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""

# ==========================================
# VALIDATION
# ==========================================
if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
    echo -e "${RED}ERROR: Environment must be 'production' or 'staging'${NC}"
    exit 1
fi

if [ -z "$BACKUP_NAME" ]; then
    echo -e "${RED}ERROR: Backup name is required${NC}"
    echo -e "${YELLOW}Usage: ./scripts/restore.sh <environment> <backup_name>${NC}"
    echo -e "${YELLOW}Example: ./scripts/restore.sh production backup-20240101_120000${NC}"
    exit 1
fi

BACKUP_DIR="backups/$BACKUP_NAME"

if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}ERROR: Backup directory not found: $BACKUP_DIR${NC}"
    echo -e "${YELLOW}Available backups:${NC}"
    ls -1 backups/
    exit 1
fi

echo -e "${YELLOW}Restoring from backup: $BACKUP_NAME${NC}"
echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
echo ""

# ==========================================
# PRE-RESTORE CHECKS
# ==========================================
echo -e "${GREEN}[1/4] Running pre-restore checks...${NC}"

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not installed${NC}"
    exit 1
fi

# Check if backup exists
if [ ! -f "$BACKUP_DIR/database.sql.gz" ]; then
    echo -e "${RED}ERROR: Database backup not found: $BACKUP_DIR/database.sql.gz${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Pre-restore checks passed${NC}"
echo ""

# ==========================================
# STOP SERVICES
# ==========================================
echo -e "${GREEN}[2/4] Stopping services...${NC}"

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
echo -e "${GREEN}[3/4] Restoring database...${NC}"

# Decompress and restore
gunzip -c "$BACKUP_DIR/database.sql.gz" | \
    if [ "$ENVIRONMENT" == "production" ]; then
        docker-compose -f docker-compose.prod.yml exec -T db psql -U ${POSTGRES_USER:-utme_user} -d ${POSTGRES_DB:-utme_master}
    else
        docker-compose -f docker-compose.staging.yml exec -T db psql -U ${POSTGRES_USER:-utme_user} -d ${POSTGRES_DB:-utme_master}
    fi

echo -e "${GREEN}✓ Database restored${NC}"
echo ""

# ==========================================
# START SERVICES
# ==========================================
echo -e "${GREEN}[4/4] Starting services...${NC}"

if [ "$ENVIRONMENT" == "production" ]; then
    docker-compose -f docker-compose.prod.yml up -d
else
    docker-compose -f docker-compose.staging.yml up -d
fi

echo -e "${GREEN}✓ Services started${NC}"
echo ""

# ==========================================
# VERIFY RESTORE
# ==========================================
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}RESTORE COMPLETE${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""

echo -e "${YELLOW}Verifying restore...${NC}"

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

echo ""
echo -e "${YELLOW}Restore Summary:${NC}"
echo "  Environment: $ENVIRONMENT"
echo "  Backup: $BACKUP_NAME"
echo "  Backend: http://localhost:5000"
echo "  Frontend: http://localhost:80"
echo ""

if [ "$BACKEND_HEALTH" == "200" ] && [ "$FRONTEND_HEALTH" == "200" ]; then
    echo -e "${GREEN}✓ Restore successful!${NC}"
else
    echo -e "${RED}✗ Restore may have issues. Check logs.${NC}"
fi

echo ""
echo -e "${GREEN}Done!${NC}"
