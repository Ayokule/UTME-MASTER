#!/bin/bash
# ==========================================
# UTME MASTER DOCKER SETUP SCRIPT
# ==========================================
# This script sets up and starts all services

echo "=========================================="
echo "UTME MASTER DOCKER SETUP"
echo "=========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed or not in PATH"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "ERROR: Docker Compose is not available"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo ""
echo "Docker is installed and ready!"
echo ""

# Ask user what they want to do
echo "Choose an option:"
echo "1. Start all services (Backend + Frontend + Database)"
echo "2. Start only Backend + Database"
echo "3. Stop all services"
echo "4. View logs"
echo "5. Rebuild images"
echo "6. Exit"

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "Starting all services..."
        docker-compose -f docker-compose.all.yml up -d
        echo ""
        echo "Services started!"
        echo ""
        echo "Backend API: http://localhost:5000"
        echo "Frontend: http://localhost:80"
        echo "API Health: http://localhost:5000/api/health"
        echo ""
        echo "To view logs: docker-compose -f docker-compose.all.yml logs -f"
        echo "To stop: docker-compose -f docker-compose.all.yml down"
        ;;
    2)
        echo ""
        echo "Starting Backend + Database..."
        docker-compose up -d
        echo ""
        echo "Services started!"
        echo ""
        echo "Backend API: http://localhost:5000"
        echo "Database: localhost:5432"
        echo "API Health: http://localhost:5000/api/health"
        echo ""
        echo "To view logs: docker-compose logs -f"
        echo "To stop: docker-compose down"
        ;;
    3)
        echo ""
        echo "Stopping all services..."
        docker-compose -f docker-compose.all.yml down
        echo ""
        echo "Services stopped!"
        ;;
    4)
        echo ""
        echo "Which services? (all/backend/frontend/db)"
        read -p "Enter service name: " service
        docker-compose -f docker-compose.all.yml logs -f $service
        ;;
    5)
        echo ""
        echo "Rebuilding images..."
        docker-compose -f docker-compose.all.yml build --no-cache
        echo ""
        echo "Images rebuilt! Start services with option 1."
        ;;
    6)
        echo "Exiting..."
        ;;
    *)
        echo "Invalid option. Exiting..."
        ;;
esac
