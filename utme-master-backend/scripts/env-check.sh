#!/bin/bash

# ==========================================
# UTME MASTER - ENVIRONMENT CHECK SCRIPT
# ==========================================
# This script validates environment configuration
# before starting the application

set -e

echo "=========================================="
echo "UTME Master - Environment Check"
echo "=========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file from .env.example"
    exit 1
fi

# Check if NODE_ENV is set
if [ -z "$NODE_ENV" ]; then
    echo "❌ NODE_ENV is not set!"
    echo "Please set NODE_ENV in your .env file"
    exit 1
fi

echo "✅ NODE_ENV: $NODE_ENV"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set!"
    echo "Please set DATABASE_URL in your .env file"
    exit 1
fi

echo "✅ DATABASE_URL: [configured]"

# Check if JWT_SECRET is set
if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET is not set!"
    echo "Please set JWT_SECRET in your .env file"
    exit 1
fi

# Check if JWT_SECRET is too weak (development warning)
if [ "$NODE_ENV" = "production" ]; then
    if [ ${#JWT_SECRET} -lt 32 ]; then
        echo "❌ JWT_SECRET is too short for production!"
        echo "Please use a secret with at least 32 characters"
        exit 1
    fi
fi

echo "✅ JWT_SECRET: [configured]"

# Check if FRONTEND_URL is set
if [ -z "$FRONTEND_URL" ]; then
    echo "❌ FRONTEND_URL is not set!"
    echo "Please set FRONTEND_URL in your .env file"
    exit 1
fi

echo "✅ FRONTEND_URL: $FRONTEND_URL"

# Check if SMTP settings are configured
if [ -z "$SMTP_HOST" ]; then
    echo "⚠️  SMTP_HOST is not set - email functionality will not work"
else
    echo "✅ SMTP_HOST: [configured]"
fi

# Check if LOG_LEVEL is set
if [ -z "$LOG_LEVEL" ]; then
    LOG_LEVEL="info"
    echo "⚠️  LOG_LEVEL not set, defaulting to 'info'"
fi

echo "✅ LOG_LEVEL: $LOG_LEVEL"

# Check database connection
echo "Checking database connection..."
if ! npx prisma db execute --query "SELECT 1" > /dev/null 2>&1; then
    echo "❌ Database connection failed!"
    echo "Please check your DATABASE_URL"
    exit 1
fi

echo "✅ Database connection: OK"

# Check if Prisma client is generated
if [ ! -d "node_modules/.prisma" ]; then
    echo "⚠️  Prisma client not generated, running generate..."
    npx prisma generate
fi

echo "✅ Prisma client: OK"

# Check if build exists (for production)
if [ "$NODE_ENV" = "production" ]; then
    if [ ! -d "dist" ]; then
        echo "❌ Build directory not found!"
        echo "Please run 'npm run build' first"
        exit 1
    fi
    echo "✅ Build: OK"
fi

echo "=========================================="
echo "✅ All environment checks passed!"
echo "=========================================="
