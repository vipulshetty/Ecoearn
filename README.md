# 🌱 EcoEarn - AI-Powered Waste Management Platform

![DevOps](https://img.shields.io/badge/DevOps-Production%20Ready-blue?style=for-the-badge)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kafka](https://img.shields.io/badge/Apache%20Kafka-231F20?style=for-the-badge&logo=apache-kafka&logoColor=white)

> A production-grade waste management platform demonstrating modern DevOps practices with Kubernetes, Docker, Apache Kafka, and comprehensive monitoring.

[🎥 Watch Demo](https://youtu.be/T0KYWJk9ChE) | [🐛 Report Bug](https://github.com/vipulshetty/Ecoearn/issues) | [✨ Request Feature](https://github.com/vipulshetty/Ecoearn/issues)

---

## 📋 Overview

EcoEarn transforms waste management through AI-powered waste detection, optimized collection routes, and a rewards system. The platform showcases enterprise-level DevOps implementation with containerized microservices, event-driven architecture, and automated CI/CD pipelines.

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- npm

### Run Locally

```bash
# Clone the repository
git clone https://github.com/vipulshetty/Ecoearn.git
cd Ecoearn

# Option 1: Full DevOps Stack (Docker + Kafka + Monitoring)
# Windows
start-devops.bat

# Mac/Linux
chmod +x start-devops.sh && ./start-devops.sh

# Option 2: Development Only
npm install
npm run dev
```

### Access Services

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 Main App | http://localhost:3000 | Next.js Application |
| 🎛️ DevOps Dashboard | http://localhost:3000/devops | Real-time monitoring |
| 📊 Kafka UI | http://localhost:8080 | Message broker dashboard |
| 📈 Prometheus | http://localhost:9090 | Metrics database |
| 📊 Grafana | http://localhost:3001 | Dashboards (admin/admin) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    EcoEarn Cloud Platform                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     ┌──────────┐     ┌────────────────────┐      │
│  │ Next.js  │◄───►│  Kafka   │◄───►│   Microservices    │      │
│  │   App    │     │ Streaming│     │     Workers        │      │
│  └────┬─────┘     └────┬─────┘     └─────────┬──────────┘      │
│       │                │                      │                  │
│       └────────────────┴──────────────────────┘                  │
│                        │                                         │
│              ┌─────────▼─────────┐                              │
│              │    Prometheus     │                              │
│              │    (Metrics)      │                              │
│              └─────────┬─────────┘                              │
│                        │                                         │
│              ┌─────────▼─────────┐                              │
│              │     Grafana       │                              │
│              │   (Dashboards)    │                              │
│              └───────────────────┘                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Kubernetes Cluster (HPA: 3-10 replicas)                  │  │
│  │  ├── ecoearn-app (3 pods)                                 │  │
│  │  ├── ai-worker (2 pods)                                   │  │
│  │  ├── route-worker (1 pod)                                 │  │
│  │  ├── analytics (1 pod)                                    │  │
│  │  └── notifications (1 pod)                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### DevOps & Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization, multi-stage builds |
| **Kubernetes** | Orchestration, HPA auto-scaling (3-10 pods) |
| **Apache Kafka** | Event streaming, async communication |
| **Prometheus** | Metrics collection, alerting |
| **Grafana** | Visualization, dashboards |
| **GitHub Actions** | CI/CD with security scanning |

### Application
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type safety |
| **Supabase** | PostgreSQL database, auth |
| **TensorFlow.js** | Client-side AI inference |
| **Tailwind CSS** | Styling |

---

## 🎯 Key Features

### 🤖 AI Waste Detection
- YOLOv5 + TACO ensemble models
- 35 waste categories
- Real-time client-side processing

### 🗺️ Route Optimization
- Dijkstra & OSPF algorithms
- Real-time traffic integration
- 20% cost reduction

### 📊 Monitoring & Observability
- Custom metrics API (`/api/metrics`)
- Health checks (`/api/health`)
- Real-time DevOps dashboard

### 🔄 Event-Driven Architecture
- 4 Kafka consumer services
- Async AI processing
- Real-time notifications

---

## 📁 Project Structure

```
EcoEarn/
├── .github/workflows/     # CI/CD pipelines
├── k8s/                   # Kubernetes manifests
│   ├── base/             # Base configurations
│   ├── dev/              # Development overlay
│   └── prod/             # Production overlay
├── monitoring/            # Prometheus & Grafana configs
├── services/              # Microservices
│   ├── ai-worker/        # AI processing
│   ├── route-worker/     # Route optimization
│   ├── analytics/        # Metrics collection
│   └── notifications/    # Alert service
├── src/
│   ├── app/              # Next.js pages & API routes
│   ├── components/       # React components
│   ├── lib/              # Utilities
│   └── services/         # Business logic
├── tests/load/            # K6 load testing scripts
├── docker-compose.yml     # Local development
├── docker-compose.kafka.yml # Full stack with Kafka
└── Dockerfile             # Production image
```

---

## 🔧 DevOps Features

### ✅ Implemented

- [x] Multi-stage Docker builds
- [x] Kubernetes with HPA (auto-scaling 3-10 pods)
- [x] Kustomize overlays (dev/prod)
- [x] Apache Kafka event streaming
- [x] Prometheus metrics collection
- [x] Grafana dashboards
- [x] GitHub Actions CI/CD
- [x] Trivy security scanning
- [x] K6 load testing
- [x] Rolling deployments (zero downtime)
- [x] Health checks & readiness probes
- [x] ConfigMaps & Secrets management

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Auto-scaling | 3 → 10 replicas |
| Throughput | 1,500 req/s (with HPA) |
| Response time | < 200ms (p95) |
| Uptime | Zero-downtime deployments |

---

## 🚀 Deployment

### Production (Vercel)
The app is deployed on Vercel with automatic deployments on push to `main`.

### Kubernetes (Optional)
```bash
# Apply production manifests
kubectl apply -k k8s/prod/

# Verify deployment
kubectl get pods -n ecoearn
```

---

## 📈 CI/CD Pipeline

```
Push to main
     │
     ▼
┌─────────────────┐
│  Test & Build   │ ─── Lint, Type Check, Build
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Docker Build   │ ─── Multi-stage build + Push to GHCR
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Security Scan   │ ─── Trivy vulnerability scanning
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Validate K8s  │ ─── Kustomize build validation
└─────────────────┘
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

**Vipul Shetty**

[![GitHub](https://img.shields.io/badge/GitHub-vipulshetty-181717?style=flat&logo=github)](https://github.com/vipulshetty)
