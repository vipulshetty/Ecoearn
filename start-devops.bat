@echo off
echo ========================================
echo   EcoEarn DevOps Platform Launcher
echo ========================================
echo.

echo Checking prerequisites...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed
    pause
    exit /b 1
)

echo [OK] Docker and Docker Compose are ready
echo.

echo ========================================
echo Select what to start:
echo ========================================
echo 1. Full DevOps Stack (Recommended)
echo    - Next.js App
echo    - Kafka + Microservices
echo    - Prometheus + Grafana
echo    - All Monitoring Tools
echo.
echo 2. App Only (Basic)
echo    - Just the Next.js application
echo.
echo 3. Stop All Services
echo.
echo 4. View Logs
echo.
echo 5. View Service Status
echo.
set /p choice="Enter choice (1-5): "

if "%choice%"=="1" goto full_stack
if "%choice%"=="2" goto app_only
if "%choice%"=="3" goto stop_services
if "%choice%"=="4" goto view_logs
if "%choice%"=="5" goto service_status
echo Invalid choice
pause
exit /b 1

:full_stack
echo.
echo ========================================
echo   Starting Full DevOps Stack...
echo ========================================
echo.
echo This will start:
echo  - Kafka (Event Streaming)
echo  - 4 Microservices (AI, Route, Analytics, Notifications)
echo  - Prometheus (Metrics)
echo  - Grafana (Dashboards)
echo  - Kafka UI (Monitoring)
echo  - Node Exporter (System Metrics)
echo.

docker-compose -f docker-compose.kafka.yml up -d

echo.
echo ========================================
echo   Services Started Successfully!
echo ========================================
echo.
echo Access your services at:
echo  DevOps Dashboard:  http://localhost:3000/devops
echo  Main App:          http://localhost:3000
echo  Kafka UI:          http://localhost:8080
echo  Prometheus:        http://localhost:9090
echo  Grafana:           http://localhost:3001 (admin/admin)
echo  Health Check:      http://localhost:3000/api/health
echo  Metrics:           http://localhost:3000/api/metrics
echo.
echo To view logs: docker-compose -f docker-compose.kafka.yml logs -f
echo To stop:      docker-compose -f docker-compose.kafka.yml down
echo.
pause
exit /b 0

:app_only
echo.
echo Starting Next.js app only...
npm run dev
pause
exit /b 0

:stop_services
echo.
echo Stopping all services...
docker-compose -f docker-compose.kafka.yml down
docker-compose -f docker-compose.yml down
echo All services stopped.
pause
exit /b 0

:view_logs
echo.
echo Select service to view logs:
echo 1. All services
echo 2. Main app
echo 3. Kafka
echo 4. Prometheus
echo 5. Grafana
echo.
set /p log_choice="Enter choice (1-5): "

if "%log_choice%"=="1" docker-compose -f docker-compose.kafka.yml logs -f
if "%log_choice%"=="2" docker-compose -f docker-compose.kafka.yml logs -f ecoearn-app
if "%log_choice%"=="3" docker-compose -f docker-compose.kafka.yml logs -f kafka
if "%log_choice%"=="4" docker-compose -f docker-compose.kafka.yml logs -f prometheus
if "%log_choice%"=="5" docker-compose -f docker-compose.kafka.yml logs -f grafana
pause
exit /b 0

:service_status
echo.
echo ========================================
echo   Service Status
echo ========================================
echo.
docker-compose -f docker-compose.kafka.yml ps
echo.
echo Detailed container stats:
docker stats --no-stream
echo.
pause
exit /b 0
