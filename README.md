# Online Auction System

An online auction system built with microservices architecture, supporting product auctions, order management, and interactive features between buyers and sellers.

## 📋 Overview

The system provides:
- **Product Auctions**: Users can place bids, auto-bid, and buy now
- **Order Management**: Complete workflow from payment to delivery and reviews
- **Search**: Elasticsearch integration for fast search
- **Chat**: Communication between buyers and sellers
- **Administration**: Dashboard for managing products, users, and categories

## 🏗️ System Architecture

```
┌─────────────┐
│   Frontend   │  React + TypeScript + Vite
│   (Port 5173)│
└──────┬──────┘
       │
┌──────▼──────┐
│   Gateway   │  Spring Cloud Gateway
│  (Port 8080)│
└──────┬──────┘
       │
   ┌───┴───┬──────────┬─────────┐
   │       │          │         │
┌──▼──┐ ┌─▼───┐  ┌───▼──┐  ┌───▼──┐
│User │ │Main │  │Worker│  │  DB  │
│8081 │ │8082 │  │ 8083 │  │5432/3│
└─────┘ └─────┘  └──────┘  └──────┘
   │       │          │
   │       └──────┬───┘
   │              │
┌──▼──────────────▼──┐
│  Kafka + Elasticsearch │
└───────────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.5.8
- **Language**: Java 17
- **Database**: PostgreSQL 15 (2 databases)
- **Message Queue**: Apache Kafka 3.9.1
- **Search**: Elasticsearch 8.11.0
- **API Gateway**: Spring Cloud Gateway
- **Security**: JWT (Access Token + Refresh Token)
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) + Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Real-time**: Socket.IO Client

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Logging**: ELK Stack (Elasticsearch, Kibana, Filebeat)
- **Monitoring**: Kibana Dashboard

## 📁 Project Structure

```
Online_auction/
├── frontend/          # React frontend application
├── gateway/           # API Gateway service
├── main/              # Main service (products, auctions, orders)
├── user/              # User service (authentication, profiles)
├── worker/            # Worker service (background jobs, schedulers)
├── docs/              # System documentation, schema, diagrams
├── docker-compose.yml # Docker services configuration
├── db1_script.sql     # Database schema for User service
├── db2_script.sql     # Database schema for Main service
└── filebeat.yml       # Filebeat configuration for logging
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Java 17+ (if running locally)
- Node.js 18+ (if running frontend locally)
- Maven 3.8+

### Running with Docker Compose

1. **Clone repository and navigate to project directory**
```bash
cd Online_auction
```

2. **Start all services**
```bash
docker-compose up -d
```

3. **Check running services**
```bash
docker-compose ps
```

### Running Frontend (Development)

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Running Backend Services (Local)

Each service can be run independently:

```bash
# User Service
cd user
./mvnw spring-boot:run

# Main Service  
cd main
./mvnw spring-boot:run

# Gateway
cd gateway
./mvnw spring-boot:run
```

## 🔗 Services & Ports

| Service | Port | Description |
|---------|------|-------------|
| Gateway | 8080 | API Gateway |
| User Service | 8081 | Authentication, User Management |
| Main Service | 8082 | Products, Auctions, Orders |
| Worker Service | 8083 | Background Jobs, Schedulers |
| PostgreSQL (db1) | 5432 | User Service Database |
| PostgreSQL (db2) | 5433 | Main Service Database |
| Elasticsearch | 9200 | Search Engine |
| Kibana | 5601 | Log Visualization |
| Kafka | 9092 | Message Broker |

## 📚 Documentation

For detailed system information, database schema, and system design, see the [`docs/`](./docs/) directory:
- `final_sys_des_1.0.png` - System Design Diagram
- `schema_v2.0.png` - Database Schema
- `WNC - Final Project - Online Auction - HackMD.pdf` - Full Documentation

## 🔐 API Documentation

After starting the services, access Swagger UI:
- **Main Service**: http://localhost:8082/swagger-ui.html
- **User Service**: http://localhost:8081/swagger-ui.html

## 📝 Logs

Logs are stored at:
- `logs_from_docker/` - Logs from Docker containers
- `main/logs/` - Logs from Main service (local)
- `user/logs/` - Logs from User service (local)
- `worker/logs/` - Logs from Worker service (local)

View logs visually in Kibana: http://localhost:5601

## 🧪 Testing

```bash
# Test frontend
cd frontend
npm run lint

# Test backend services
cd main
./mvnw test
```
