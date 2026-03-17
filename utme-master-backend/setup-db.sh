#!/bin/bash

# ==========================================
# UTME Master Database Setup Script
# ==========================================
# This script sets up the database with all necessary tables and seed data

echo "🚀 UTME Master Database Setup"
echo "=============================="
echo ""

# Check if PostgreSQL is running
echo "📋 Checking PostgreSQL connection..."
if ! psql -U postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running or not accessible"
    echo "   Please start PostgreSQL and try again"
    exit 1
fi
echo "✅ PostgreSQL is running"
echo ""

# Create database if it doesn't exist
echo "📦 Creating database (if not exists)..."
createdb utme_master 2>/dev/null || echo "   Database already exists"
echo "✅ Database ready"
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi
echo "✅ Prisma client generated"
echo ""

# Run migrations
echo "🗄️  Running database migrations..."
npm run prisma:migrate
if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations"
    exit 1
fi
echo "✅ Migrations completed"
echo ""

# Seed database
echo "🌱 Seeding database with initial data..."
npx prisma db seed
if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi
echo "✅ Database seeded"
echo ""

echo "═════════════════════════════════════════"
echo "🎉 DATABASE SETUP COMPLETED!"
echo "═════════════════════════════════════════"
echo ""
echo "📝 Next Steps:"
echo "   1. Start backend: npm run dev"
echo "   2. Start frontend: npm run dev"
echo "   3. Login with:"
echo "      - Admin: admin@utmemaster.com / Admin@123"
echo "      - Student: student1@test.com / Student@123"
echo ""
