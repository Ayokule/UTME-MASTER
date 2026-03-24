#!/bin/bash

# ==========================================
# UTME MASTER - ENVIRONMENT SETUP SCRIPT
# ==========================================
# This script sets up the environment for the application

set -e

echo "=========================================="
echo "UTME Master - Environment Setup"
echo "=========================================="

# Get the environment from argument or use default
ENV=${1:-development}

echo "Setting up environment: $ENV"

# Check if environment file exists
if [ ! -f ".env.$ENV" ]; then
    echo "❌ Environment file .env.$ENV not found!"
    echo "Available environments: development, staging, production"
    exit 1
fi

# Copy environment file to .env
echo "Copying .env.$ENV to .env..."
cp .env.$ENV .env

echo "✅ Environment file created"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo "✅ Prisma client generated"

# Run migrations if not in production
if [ "$ENV" != "production" ]; then
    echo "Running migrations..."
    npx prisma migrate deploy
    echo "✅ Migrations completed"
fi

# Seed database if enabled
if [ "$ENV" = "development" ]; then
    echo "Seeding database..."
    npx prisma db seed || npx ts-node prisma/seed-simple.ts
    echo "✅ Database seeded"
fi

echo "=========================================="
echo "✅ Environment setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Or build for production: npm run build"
echo ""
