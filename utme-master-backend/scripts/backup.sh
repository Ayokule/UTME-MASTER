#!/bin/bash
# ==========================================
# UTME MASTER - BACKUP SCRIPT
# ==========================================
# Create database and application backups

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
echo -e "${GREEN}UTME MASTER BACKUP${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""

# ==========================================
# VALIDATION
# ==========================================
if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
    echo -e "${RED}ERROR: Environment must be 'production' or 'staging'${NC}"
    exit 1
fi

echo -e "${YELLOW}Creating backup for $ENVIRONMENT environment${NC}"
echo ""

# ==========================================
# CREATE BACKUP DIRECTORY
# ==========================================
echo -e "${GREEN}[1/3] Creating backup directory...${NC}"

if [ -z "$BACKUP_NAME" ]; then
    BACKUP_NAME="backup-$(date +%Y%m%d_%H%M%S)"
fi

BACKUP_DIR="backups/$BACKUP_NAME"
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}✓ Backup directory: $BACKUP_DIR${NC}"
echo ""

# ==========================================
# BACKUP DATABASE
# ==========================================
echo -e "${GREEN}[2/3] Backing up database...${NC}"

if [ "$ENVIRONMENT" == "production" ]; then
    docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U ${POSTGRES_USER:-utme_user} ${POSTGRES_DB:-utme_master} > "$BACKUP_DIR/database.sql"
else
    docker-compose -f docker-compose.staging.yml exec -T db pg_dump -U ${POSTGRES_USER:-utme_user} ${POSTGRES_DB:-utme_master} > "$BACKUP_DIR/database.sql"
fi

# Compress backup
gzip "$BACKUP_DIR/database.sql"

echo -e "${GREEN}✓ Database backup: $BACKUP_DIR/database.sql.gz${NC}"
echo ""

# ==========================================
# BACKUP APPLICATION FILES
# ==========================================
echo -e "${GREEN}[3/3] Backing up application files...${NC}"

# Backup configuration
cp .env "$BACKUP_DIR/.env" 2>/dev/null || true

# Backup uploads
if [ -d "uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads.tar.gz" uploads/ 2>/dev/null || true
fi

# Backup logs
if [ -d "logs" ]; then
    tar -czf "$BACKUP_DIR/logs.tar.gz" logs/ 2>/dev/null || true
fi

echo -e "${GREEN}✓ Application files backed up${NC}"
echo ""

# ==========================================
# VERIFY BACKUP
# ==========================================
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}BACKUP COMPLETE${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""

echo -e "${YELLOW}Backup Summary:${NC}"
echo "  Environment: $ENVIRONMENT"
echo "  Backup Name: $BACKUP_NAME"
echo "  Location: $BACKUP_DIR"
echo ""
echo -e "${GREEN}Files:${NC}"
ls -lh "$BACKUP_DIR"
echo ""

echo -e "${GREEN}To restore:${NC}"
echo "  ./scripts/restore.sh $ENVIRONMENT $BACKUP_NAME"
echo ""

echo -e "${GREEN}Done!${NC}"
