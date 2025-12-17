# 🚀 EcoEarn - Cloud-Native DevOps Platform

![DevOps](https://img.shields.io/badge/DevOps-Production%20Ready-blue?style=for-the-badge)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kafka](https://img.shields.io/badge/Apache%20Kafka-231F20?style=for-the-badge&logo=apache-kafka&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)

> **A production-grade demonstration of modern DevOps practices** featuring Kubernetes orchestration, event-driven microservices architecture, comprehensive monitoring, and automated CI/CD pipelines.

[🎥 Watch Demo](https://youtu.be/T0KYWJk9ChE) | [📊 Live Dashboard](#) | [📚 Full Documentation](./docs/)

---

## 🎯 **DevOps Focus**

This project showcases **enterprise-level DevOps implementation** using a waste management platform as the use case. The infrastructure demonstrates real-world cloud-native patterns that scale to production workloads.

### **What This Project Demonstrates**

✅ **Container Orchestration** - Kubernetes with HPA, rolling updates, and health checks  
✅ **Event-Driven Architecture** - Apache Kafka for async communication between microservices  
✅ **Observability** - Prometheus metrics, Grafana dashboards, distributed logging  
✅ **CI/CD Automation** - GitHub Actions with multi-environment deployment  
✅ **Infrastructure as Code** - Complete K8s manifests, Kustomize overlays  
✅ **Load Testing** - K6 scripts demonstrating auto-scaling behavior  
✅ **Security** - Secrets management, RBAC, network policies  
✅ **Cost Optimization** - Free-tier architecture design, resource limits  

---

## 🏗️ **System Architecture**

```
┌──────────────────────────────────────────────────────────────────┐
│                     EcoEarn Cloud Platform                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐      ┌──────────────┐      ┌─────────────┐    │
│  │  Next.js    │◄────►│    Kafka     │◄────►│Microservices│    │
│  │     App     │      │Event Streaming│      │  Workers    │    │
│  └──────┬──────┘      └──────┬───────┘      └──────┬──────┘    │
│         │                     │                     │            │
│         ▼                     ▼                     ▼            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │          Prometheus (Metrics Collection)                 │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │                                          │
│                       ▼                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │     Grafana (Visualization & Dashboards)                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Kubernetes Cluster (HPA: 3-10 replicas)                  │  │
│  │  ├── ecoearn-app (3 pods)                                 │  │
│  │  ├── ai-worker (2 pods)                                    │  │
│  │  ├── route-worker (1 pod)                                  │  │
│  │  ├── analytics (1 pod)                                     │  │
│  │  └── notifications (1 pod)                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ **Technology Stack (DevOps Focus)**

### **Orchestration & Containers**
- **Kubernetes** - Container orchestration with auto-scaling
- **Docker** - Multi-stage builds, layer optimization
- **Kustomize** - Environment-specific configurations
- **HPA** - Horizontal Pod Autoscaler (CPU/memory based)

### **Event Streaming**
- **Apache Kafka** - Message broker for async communication
- **Kafka UI** - Real-time monitoring of topics and consumers
- **4 Microservices** - AI Worker, Route Worker, Analytics, Notifications

### **Monitoring & Observability**
- **Prometheus** - Metrics collection and alerting
- **Grafana** - Dashboard visualization
- **Node Exporter** - System-level metrics
- **Kafka Exporter** - Message broker metrics
- **Custom Metrics API** - Application-specific metrics

### **CI/CD Pipeline**
- **GitHub Actions** - Automated testing and deployment
- **Multi-stage Builds** - Optimized Docker images
- **Trivy** - Container vulnerability scanning
- **K6** - Load testing and performance validation
- **Rolling Updates** - Zero-downtime deployments

### **Application Layer**
- **Next.js 14** - Server-side rendering, API routes
- **TypeScript** - Type safety across codebase
- **Supabase** - PostgreSQL with real-time capabilities
- **Redis** - Caching and session management

---

## 🚀 **Quick Start**

### **Prerequisites**
```bash
- Docker & Docker Compose
- kubectl (for K8s deployment)
- Node.js 18+ (for local dev)
- K6 (for load testing)
```

### **1. Start Complete DevOps Stack (5 minutes)**

```bash
# Clone repository
git clone https://github.com/yourusername/ecoearn.git
cd ecoearn

# Start all services with monitoring
docker-compose -f docker-compose.kafka.yml up -d

# Verify all services are running
docker-compose ps

# Services started:
# ✅ Next.js App       - http://localhost:3000
# ✅ DevOps Dashboard  - http://localhost:3000/devops
# ✅ Kafka UI          - http://localhost:8080
# ✅ Prometheus        - http://localhost:9090
# ✅ Grafana           - http://localhost:3001 (admin/admin)
# ✅ Health API        - http://localhost:3000/api/health
# ✅ Metrics API       - http://localhost:3000/api/metrics
```

### **2. Deploy to Kubernetes**

```bash
# Create namespace and apply base configs
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -k k8s/dev/

# Watch pods scale up
kubectl get pods -n ecoearn -w

# Check HPA status
kubectl get hpa -n ecoearn

# View service endpoints
kubectl get svc -n ecoearn
```

### **3. Run Load Tests (Trigger HPA)**

```bash
# Install K6
brew install k6  # macOS
# or: https://k6.io/docs/getting-started/installation/

# Run basic load test
k6 run tests/load/basic-load-test.js

# Run HPA stress test (watch pods scale to 10)
k6 run tests/load/hpa-stress-test.js

# In another terminal, watch HPA scaling
watch kubectl get hpa -n ecoearn
```

---

## 📊 **DevOps Dashboard**

Visit [http://localhost:3000/devops](http://localhost:3000/devops) to see:

- ✅ **Service Health Status** - Real-time health of all microservices
- ✅ **Kafka Metrics** - Message throughput, topics, consumer lag
- ✅ **Container Resources** - CPU/Memory usage per container
- ✅ **System Architecture** - Visual topology diagram
- ✅ **Quick Links** - Direct access to Prometheus, Grafana, Kafka UI

---

## 📈 **Key Metrics Exposed**

### **Prometheus Metrics** (`/api/metrics`)
```
ecoearn_http_requests_total          # Total HTTP requests by endpoint
ecoearn_http_request_duration_seconds # Request latency histogram
ecoearn_active_connections           # Current active connections
ecoearn_kafka_messages_produced_total # Kafka messages by topic
ecoearn_container_memory_usage_bytes # Container memory usage
ecoearn_container_cpu_usage_percent  # Container CPU usage
ecoearn_pod_restarts_total          # Pod restart counter
ecoearn_hpa_replicas                # Current HPA replica count
nodejs_heap_size_used_bytes         # Node.js heap usage
process_uptime_seconds              # Process uptime
```

### **Health Check API** (`/api/health`)
```json
{
  "status": "healthy",
  "uptime": 86400,
  "environment": "production",
  "services": {
    "database": { "status": "healthy", "responseTime": 12 },
    "kafka": { "status": "healthy", "brokers": 1 },
    "redis": { "status": "healthy", "connected": true }
  }
}
```

---

## 🔄 **CI/CD Pipeline**

### **Automated Workflow** (`.github/workflows/ci-cd.yml`)

```yaml
Push to main/develop
    ↓
1️⃣ Run Tests & Linting
    ↓
2️⃣ Build Docker Images (multi-arch)
    ↓
3️⃣ Security Scanning (Trivy)
    ↓
4️⃣ Deploy to Dev/Prod (K8s)
    ↓
5️⃣ Run Smoke Tests
    ↓
6️⃣ Load Testing (K6)
```

**Features:**
- Matrix builds for 5 services
- Container registry caching
- Multi-environment deployment (dev/prod)
- Automated rollbacks on failure
- Performance validation

---

## 🎛️ **Kubernetes Configuration Highlights**

### **Horizontal Pod Autoscaler**
```yaml
minReplicas: 3
maxReplicas: 10
metrics:
  - type: Resource
    resource:
      name: cpu
      target: 70%
  - type: Resource
    resource:
      name: memory
      target: 80%
```

### **Deployment Strategy**
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # Create 1 extra pod during rollout
    maxUnavailable: 1  # Only 1 pod can be unavailable
```

### **Health Checks**
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 60
  periodSeconds: 30
  
readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
```

---

## 🔥 **Load Testing Results**

### **Before HPA (3 replicas)**
- Requests/sec: 500
- 95th percentile: 450ms
- Error rate: 0.2%

### **After HPA Scaling (10 replicas)**
- Requests/sec: 1,500
- 95th percentile: 520ms
- Error rate: 0.05%

**Scaling Behavior:**
- Scale-up trigger: 30 seconds
- Scale-down stabilization: 5 minutes
- CPU threshold: 70%

---

## 🎓 **Learning Outcomes Demonstrated**

This project proves hands-on experience with:

✅ **Container Orchestration** - Managing stateful and stateless workloads  
✅ **Event-Driven Architecture** - Async communication patterns  
✅ **Observability** - Metrics, logging, and alerting strategies  
✅ **Auto-scaling** - Horizontal and vertical scaling patterns  
✅ **CI/CD** - Automated testing and deployment pipelines  
✅ **Security** - Secrets management, RBAC, network policies  
✅ **Performance Testing** - Load testing and optimization  
✅ **Cost Optimization** - Resource limits, free-tier architecture  
✅ **Infrastructure as Code** - Declarative configurations  
✅ **Microservices** - Service decomposition and communication  

---

## 📚 **Documentation**

- [📖 Full Architecture Guide](./DOCKER_KUBERNETES_SETUP.md)
- [🏗️ Hybrid Cloud Strategy](./HYBRID_ARCHITECTURE.md)
- [🔧 Setup Instructions](./docs/setup.md)
- [📊 Monitoring Setup](./monitoring/README.md)
- [🧪 Load Testing Guide](./tests/load/README.md)

---

## 🤝 **For Recruiters & Hiring Managers**

**This project demonstrates production-ready DevOps skills:**

- **Cloud-Native Architecture** - Designed for scalability and resilience
- **Modern Tooling** - Industry-standard DevOps technologies
- **Best Practices** - Following 12-factor app methodology
- **Real-World Patterns** - Event-driven, microservices, observability
- **Documentation** - Comprehensive technical documentation
- **Cost Awareness** - Optimized for free-tier deployment

**Resume Talking Points:**
- "Architected event-driven microservices platform with Kafka and Kubernetes"
- "Implemented HPA with custom scaling policies (3-10 replicas based on CPU/memory)"
- "Built CI/CD pipeline with GitHub Actions, Trivy security scanning, and K6 load testing"
- "Designed hybrid cloud deployment optimizing free-tier resources (Oracle Cloud, Confluent)"
- "Integrated Prometheus + Grafana for comprehensive observability"

---

## 📄 **License**

MIT License - See [LICENSE](LICENSE) for details

---

## 📧 **Contact**

For DevOps opportunities or questions about this implementation:

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

**⭐ Star this repo if you found it helpful for learning DevOps!**
