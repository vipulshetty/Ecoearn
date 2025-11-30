# 🌱 EcoEarn - AI-Powered Waste Management Platform

![EcoEarn Banner](https://img.youtube.com/vi/T0KYWJk9ChE/maxresdefault.jpg
)

[View Live Demo](https://youtu.be/T0KYWJk9ChE) | [Report Bug](https://github.com/vipulshetty/Ecoearn/issues) | [Request Feature](https://github.com/vipulshetty/Ecoearn/issues)

## 📋 Project Overview

EcoEarn is a revolutionary Next.js application that transforms waste management through artificial intelligence, containerized microservices, and optimized logistics. The platform demonstrates modern DevOps practices with Docker, Kubernetes, and Apache Kafka while providing real-world environmental impact through smart waste classification and AI-optimized collection routes.

## 🎯 Core Mission

**Vision**: Create a sustainable ecosystem where waste management becomes profitable, efficient, and environmentally conscious through cutting-edge technology and modern DevOps practices.

**Target Users**:
- Individual recyclers seeking rewards for proper waste disposal
- Waste collectors optimizing their collection routes
- Environmental organizations tracking impact metrics
- DevOps engineers interested in cloud-native architecture

## 🚀 Key Features & Capabilities

### 1. 🤖 AI-Powered Waste Detection (35% Accuracy Improvement)
- **Enhanced YOLOv5 + TACO Detection**: Multi-model ensemble approach for superior waste classification
- **Real-time Processing**: Client-side AI analysis using TensorFlow.js for privacy and speed
- **Confidence Scoring**: Advanced validation with multiple detection methods (color, shape, texture)
- **35 Waste Categories**: Specialized classification for various recyclable materials
- **Continuous Learning**: Model performance tracking and accuracy improvements

### 2. 🐳 **DevOps & Infrastructure Excellence**
- **Containerized Microservices**: Docker containers for AI processing, route optimization, analytics
- **Kubernetes Orchestration**: Production-ready K8s manifests with auto-scaling and health checks
- **Apache Kafka Event Streaming**: Real-time event processing and service communication
- **CI/CD Pipeline**: Automated deployment with environment-specific configurations
- **Monitoring & Observability**: Health checks, metrics collection, and distributed logging

### 3. 🗺️ AI-Optimized Route Planning (20% Cost Reduction)
- **Smart Route Optimization**: Machine learning algorithms using Dijkstra and OSPF for efficient collection
- **Real-time Integration**: Dynamic route adjustment based on traffic and weather data
- **Predictive Analytics**: Demand forecasting using historical pickup patterns
- **Cost-Effective Logistics**: Minimize fuel consumption, time, and emissions
- **Visual Route Planning**: Interactive maps with waypoint optimization

### 4. 💰 **Blockchain Integration** (In Development)
- **Basic Rewards System**: Points-based system with database persistence
- **Testnet Integration**: Experimental blockchain connectivity (development phase)
- **Future NFT Minting**: Planned eco-achievement NFT system
- **Digital Vouchers**: Partner discount system with QR code redemption
- **Note**: *Blockchain features are currently in proof-of-concept stage*

### 5. 🏆 Community Engagement Platform
- **Real-time Leaderboards**: Community competition and recognition
- **Environmental Impact Tracking**: CO2 reduction metrics and sustainability scores
- **Social Features**: User profiles, achievements, and community challenges
- **Analytics Dashboard**: Comprehensive performance metrics and insights

## 🛠️ Technology Stack

### **DevOps & Infrastructure** 
- **Docker**: Containerization for consistent environments and microservices
- **Kubernetes**: Container orchestration with auto-scaling and service discovery
- **Apache Kafka**: Event-driven architecture for real-time data streaming
- **Redis**: Caching layer and session management
- **Nginx**: Load balancing and reverse proxy

### Frontend Architecture
- **Next.js 14**: App Router with React Server Components for optimal performance
- **TypeScript**: Full type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first styling for responsive design
- **React**: Component-based UI with server and client rendering
- **Framer Motion**: Smooth animations and transitions

### Backend & Database
- **Next.js API Routes**: Full-stack functionality within single framework
- **Supabase**: PostgreSQL database with real-time capabilities and authentication
- **NextAuth**: Secure authentication with Google OAuth integration
- **Row Level Security**: Database-level access control and data protection

### AI & Machine Learning
- **TensorFlow.js**: Client-side AI model execution
- **YOLOv5**: State-of-the-art object detection for waste classification
- **TACO Dataset**: Specialized training data for waste detection accuracy
- **OpenCV.js**: Advanced image processing and computer vision
- **Custom Ensemble Models**: Multi-method detection for enhanced reliability

### Blockchain & Web3
- **Ethereum**: Smart contracts on Goerli testnet
- **Polygon**: Low-cost transactions on Mumbai testnet
- **Ethers.js**: Blockchain interaction and wallet integration
- **NFT.Storage**: Decentralized IPFS storage for NFT metadata
- **MetaMask**: Popular wallet integration for user convenience

### External APIs & Services
- **OpenRouteService**: Free routing and navigation API
- **OpenWeatherMap**: Real-time weather data for route optimization
- **Google Vision AI**: Advanced image analysis capabilities
- **Vercel**: Deployment platform with global CDN

## 🏢 DevOps Architecture Overview

### **Containerized Microservices Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Microservices │
│   (Next.js)     │◄──►│   (Nginx)       │◄──►│   (Docker)      │
│                 │    │                 │    │                 │
│ • React Components   │ • Load Balancing     │ • AI Worker     │
│ • Client-side AI     │ • Map Visualization  │ • Route Service │
│ • User Interface     │ • SSL Termination    │ • Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                ↓
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Event Stream  │    │   Data Layer    │    │   External      │
│   (Apache Kafka)│◄──►│   (Supabase)    │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • Real-time Events   │ • PostgreSQL DB      │ • Weather API   │
│ • Service Communication │ • Authentication  │ • Routing API   │
│ • Event Sourcing     │ • File Storage       │ • Maps API       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow Architecture
```
User Upload → AI Analysis → Classification → Point Calculation → Blockchain Reward
     ↓              ↓             ↓              ↓                    ↓
Image Processing → TensorFlow.js → Database → Supabase → Smart Contract
```

## 🚀 **DevOps Deployment Guide**

### **Prerequisites**
- **Docker Desktop**: For containerization demonstration
- **kubectl**: For Kubernetes cluster management
- **Node.js 18+**: For application development
- **Git**: For version control

### **Quick Start**

#### **1. Standard Development**
```bash
git clone https://github.com/vipulshetty/Ecoearn.git
cd ecoearn
npm install
npm run dev
```

#### **2. Docker Containerization**
```bash
# Build and run with Docker Compose
docker-compose up -d

# View running containers
docker ps

# Check logs
docker-compose logs -f ecoearn-app
```

#### **3. Kafka Microservices**
```bash
# Start Kafka cluster with microservices
docker-compose -f docker-compose.kafka.yml up -d

# Verify Kafka topics
docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092

# Access Kafka UI
open http://localhost:8080
```

#### **4. Kubernetes Orchestration**
```bash
# Apply development environment
kubectl apply -k k8s/dev

# Check deployment status
kubectl get pods -n ecoearn-dev

# View service details
kubectl describe deployment ecoearn-app -n ecoearn-dev
```

## 🚀 **Start Everything at Once**

### **Complete DevOps Stack Startup**
```bash
# 1. Start all services with one command
docker-compose -f docker-compose.yml -f docker-compose.kafka.yml up -d

# 2. Verify all containers are running
docker ps

# 3. Apply Kubernetes configurations (optional)
kubectl apply -k k8s/dev

# 4. Check everything is running
docker-compose ps
kubectl get pods -n ecoearn-dev
```

### **Access Points After Startup**
- **Main Application**: http://localhost:3000
- **Kafka UI**: http://localhost:8080
- **Analytics Service**: http://localhost:3001
- **Redis**: localhost:6379
- **PostgreSQL**: localhost:5432

### **Stop All Services**
```bash
# Stop Docker services
docker-compose -f docker-compose.yml -f docker-compose.kafka.yml down

# Stop Kubernetes services
kubectl delete -k k8s/dev
```

## 📊 **DevOps Monitoring & Health Checks**

### **Container Monitoring**
```bash
# Docker health checks
docker-compose ps
docker stats

# Kubernetes monitoring
kubectl top pods -n ecoearn-dev
kubectl get events -n ecoearn-dev --sort-by='.lastTimestamp'
```

### **Kafka Monitoring**
```bash
# Topic monitoring
docker-compose exec kafka kafka-console-consumer --topic waste-detection --from-beginning --bootstrap-server localhost:9092

# Consumer group status
docker-compose exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list
```

### **Application Health Checks**
```bash
# Application health endpoint
curl http://localhost:3000/api/health

# Kubernetes health checks
kubectl get pods -n ecoearn-dev -o wide
```

## 📦 **Free DevOps Resources**

### **Container & Orchestration**
- [Docker Desktop Free](https://www.docker.com/products/docker-desktop/)
- [Oracle Cloud Always Free K8s](https://www.oracle.com/cloud/free/)
- [Google Cloud Free Tier](https://cloud.google.com/free)

### **Event Streaming**
- [Confluent Cloud Free Tier](https://confluent.cloud/)
- [Apache Kafka Open Source](https://kafka.apache.org/)

### **Infrastructure**
- [Supabase Free Tier](https://supabase.com/pricing)
- [Vercel Free Deployment](https://vercel.com/pricing)

---

**Built with 💻 for modern DevOps practices**
