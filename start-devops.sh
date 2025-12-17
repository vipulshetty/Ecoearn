#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

clear
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  EcoEarn DevOps Platform Launcher${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERROR] Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}[ERROR] Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}[OK] Docker and Docker Compose are ready${NC}"
echo ""

# Main menu
echo -e "${BLUE}========================================${NC}"
echo "Select what to start:"
echo -e "${BLUE}========================================${NC}"
echo "1. Full DevOps Stack (Recommended)"
echo "   - Next.js App"
echo "   - Kafka + Microservices"
echo "   - Prometheus + Grafana"
echo "   - All Monitoring Tools"
echo ""
echo "2. App Only (Basic)"
echo "   - Just the Next.js application"
echo ""
echo "3. Stop All Services"
echo ""
echo "4. View Logs"
echo ""
echo "5. View Service Status"
echo ""
echo "6. Run Load Test"
echo ""
read -p "Enter choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}========================================${NC}"
        echo -e "${BLUE}  Starting Full DevOps Stack...${NC}"
        echo -e "${BLUE}========================================${NC}"
        echo ""
        echo "This will start:"
        echo " - Kafka (Event Streaming)"
        echo " - 4 Microservices (AI, Route, Analytics, Notifications)"
        echo " - Prometheus (Metrics)"
        echo " - Grafana (Dashboards)"
        echo " - Kafka UI (Monitoring)"
        echo " - Node Exporter (System Metrics)"
        echo ""
        
        docker-compose -f docker-compose.kafka.yml up -d
        
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}  Services Started Successfully!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo "Access your services at:"
        echo -e "  ${YELLOW}DevOps Dashboard:${NC}  http://localhost:3000/devops"
        echo -e "  ${YELLOW}Main App:${NC}          http://localhost:3000"
        echo -e "  ${YELLOW}Kafka UI:${NC}          http://localhost:8080"
        echo -e "  ${YELLOW}Prometheus:${NC}        http://localhost:9090"
        echo -e "  ${YELLOW}Grafana:${NC}           http://localhost:3001 ${BLUE}(admin/admin)${NC}"
        echo -e "  ${YELLOW}Health Check:${NC}      http://localhost:3000/api/health"
        echo -e "  ${YELLOW}Metrics:${NC}           http://localhost:3000/api/metrics"
        echo ""
        echo "To view logs: docker-compose -f docker-compose.kafka.yml logs -f"
        echo "To stop:      docker-compose -f docker-compose.kafka.yml down"
        echo ""
        ;;
        
    2)
        echo ""
        echo "Starting Next.js app only..."
        npm run dev
        ;;
        
    3)
        echo ""
        echo "Stopping all services..."
        docker-compose -f docker-compose.kafka.yml down
        docker-compose -f docker-compose.yml down
        echo -e "${GREEN}All services stopped.${NC}"
        ;;
        
    4)
        echo ""
        echo "Select service to view logs:"
        echo "1. All services"
        echo "2. Main app"
        echo "3. Kafka"
        echo "4. Prometheus"
        echo "5. Grafana"
        echo ""
        read -p "Enter choice (1-5): " log_choice
        
        case $log_choice in
            1) docker-compose -f docker-compose.kafka.yml logs -f ;;
            2) docker-compose -f docker-compose.kafka.yml logs -f ecoearn-app ;;
            3) docker-compose -f docker-compose.kafka.yml logs -f kafka ;;
            4) docker-compose -f docker-compose.kafka.yml logs -f prometheus ;;
            5) docker-compose -f docker-compose.kafka.yml logs -f grafana ;;
        esac
        ;;
        
    5)
        echo ""
        echo -e "${BLUE}========================================${NC}"
        echo -e "${BLUE}  Service Status${NC}"
        echo -e "${BLUE}========================================${NC}"
        echo ""
        docker-compose -f docker-compose.kafka.yml ps
        echo ""
        echo "Detailed container stats:"
        docker stats --no-stream
        echo ""
        ;;
        
    6)
        echo ""
        echo "Select load test:"
        echo "1. Basic Load Test"
        echo "2. HPA Stress Test (triggers auto-scaling)"
        echo ""
        read -p "Enter choice (1-2): " test_choice
        
        if ! command -v k6 &> /dev/null; then
            echo -e "${RED}[ERROR] K6 is not installed${NC}"
            echo "Install K6: https://k6.io/docs/getting-started/installation/"
            exit 1
        fi
        
        case $test_choice in
            1) 
                echo "Running basic load test..."
                k6 run tests/load/basic-load-test.js
                ;;
            2) 
                echo "Running HPA stress test (watch pods scale!)..."
                echo "In another terminal, run: watch kubectl get hpa -n ecoearn"
                k6 run tests/load/hpa-stress-test.js
                ;;
        esac
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
