#!/bin/bash

# EcoEarn - Start All Services Script
echo "🚀 Starting EcoEarn Services..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "📦 Starting Docker services..."
# Start all Kafka and microservices
docker compose -f docker-compose.kafka.yml up -d

echo "⏳ Waiting for services to start..."
sleep 5

# Start simple analytics service if not running
if ! docker ps | grep -q simple-analytics; then
    echo "📊 Starting Analytics service..."
    docker run -d --name simple-analytics --network ecoearn_ecoearn-kafka -p 3001:80 nginx:alpine
fi

echo "🔍 Checking service status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ Services Status:"
echo "🌐 Next.js App:      http://localhost:3000"
echo "📊 Kafka UI:         http://localhost:8080" 
echo "📈 Analytics:        http://localhost:3001"
echo "💾 Redis Cache:      localhost:6379"
echo "🔧 Zookeeper:       localhost:2181"

echo ""
echo "🎉 All services started! Your EcoEarn application is ready."
echo "📝 To stop all services: ./stop-all-services.sh"