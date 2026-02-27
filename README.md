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

The backend is organized as multiple Spring Boot services, with the main business logic in a **multi-module `core` project**:

```
┌─────────────┐
│  Frontend   │  React + TypeScript + Vite
│  (5173)     │
└──────┬──────┘
       │ HTTP
┌──────▼──────┐
│  Gateway    │  Spring Cloud Gateway
│  (8080)     │
└──────┬──────┘
       │ routes /api to backend services
       │
   ┌───▼──────┬───────────┬───────────┐
   │          │           │           │
┌──▼───┐  ┌───▼───┐   ┌───▼────┐  ┌───▼─────┐
│ User │  │ Core  │   │Worker  │  │  Other │
│8081  │  │8082   │   │8083    │  │   ...  │
└──────┘  └───┬───┘   └───┬────┘  └────────┘
             │           │
             │ Kafka     │
             ▼           ▼
        ┌───────────────────────┐
        │  Kafka + PostgreSQL   │
        │  (db1, db2)           │
        │  + Elasticsearch      │
        └───────────────────────┘
```

### `core` Multi-Module Structure

The `core` backend is a Maven multi-module project:

- **`core/main`**: Main service exposing REST APIs for auctions, orders, payments, search integration, etc.
- **`core/product`**: Product management (CRUD products, categories, attributes).
- **`core/auction`**: Auction logic (bidding, auto-bid, auction lifecycle).
- **`core/admin`**: Admin APIs and dashboard-related features.
- **`core/common`**: Shared code (DTOs, exceptions, common utils, configs).
- **`core/integration-spring-boot-starter`**: Spring Boot starter for common integrations (logging, tracing, etc.) reused across modules.

Other services:

- **`user`**: Authentication, authorization, user profiles, roles.
- **`worker`**: Background jobs, schedulers, async processing related to auctions/orders.
- **`gateway`**: API Gateway routing external traffic to backend services.
- **`frontend`**: React SPA for buyers, sellers, and admins.

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.5.x
- **Language**: Java 17
- **Build Tool**: Maven (multi-module for `core`)
- **Database**: PostgreSQL 15 (`db1` for user, `db2` for core)
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
├── core/                 # Main multi-module backend
│   ├── pom.xml           # Parent POM for core
│   ├── admin/            # Admin module
│   ├── auction/          # Auction module
│   ├── common/           # Shared/common module
│   ├── integration-spring-boot-starter/ # Integration starter
│   └── main/             # Main business APIs (auctions, orders, etc.)
│
├── user/                 # User service (auth, profiles)
├── worker/               # Worker service (background jobs, schedulers)
├── gateway/              # API Gateway service
├── frontend/             # React frontend application
├── docs/                 # System documentation, schema, diagrams
├── docker-compose.yml    # Docker services configuration
├── db1_script.sql        # Database schema for User service (db1)
├── db2_script.sql        # Database schema for Core service (db2)
└── filebeat.yml          # Filebeat configuration for logging
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Java 17+ (if running backend services locally)
- Node.js 18+ (if running frontend locally)
- Maven 3.8+

### Running with Docker Compose (Recommended)

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

Frontend will be available at `http://localhost:5173` (if you also start frontend separately, see below).

### Running Frontend (Development)

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server will be available at: `http://localhost:5173`

### Running Backend Services (Local, without Docker)

Each service can be run independently.

```bash
# User Service
cd user
./mvnw spring-boot:run

# Core (multi-module backend)
cd core
./mvnw spring-boot:run

# Worker Service
cd worker
./mvnw spring-boot:run

# Gateway
cd gateway
./mvnw spring-boot:run
```

> Note: check each module's `application.yaml` for the exact port and DB/Kafka/Elasticsearch connection settings when running locally.

## 🔗 Services & Ports

According to `docker-compose.yml`:

| Service           | Port  | Description                                |
|-------------------|-------|--------------------------------------------|
| Gateway           | 8080  | API Gateway                               |
| User Service      | 8081  | Authentication, User Management           |
| Core (multi-module) | 8082 | Main business logic (products, auctions, orders, search, admin, ...) |
| Worker Service    | 8083  | Background Jobs, Schedulers               |
| PostgreSQL (db1)  | 5432  | User Service Database                     |
| PostgreSQL (db2)  | 5433  | Core Service Database                     |
| Elasticsearch     | 9200  | Search Engine                             |
| Kibana            | 5601  | Log Visualization                         |
| Kafka             | 9092  | Message Broker                            |

## 📚 Documentation

For detailed system information, database schema, and system design, see the `docs/` directory:
- `final_sys_des_1.0.png` - System Design Diagram
- `schema_v2.0.png` - Database Schema
- `WNC - Final Project - Online Auction - HackMD.pdf` - Full Documentation

## 🔐 API Documentation

After starting the services, access Swagger UI:
- **Core/Main APIs** (inside `core`): `http://localhost:8082/swagger-ui.html`
- **User Service**: `http://localhost:8081/swagger-ui.html`

## 📝 Logs

Logs are stored at:
- `logs_from_docker/core/`   - Logs from Core service (when running via Docker)
- `logs_from_docker/user/`   - Logs from User service (Docker)
- `logs_from_docker/worker/` - Logs from Worker service (Docker)
- `logs_from_docker/main/`   - (if used by other services)
- `core/logs/`               - Logs from Core service (local run)
- `user/logs/`               - Logs from User service (local run)
- `worker/logs/`             - Logs from Worker service (local run)

View logs visually in Kibana: `http://localhost:5601`

## 🧪 Testing

```bash
# Test frontend
cd frontend
npm run lint

# Test core backend (multi-module)
cd core
./mvnw test

# (Optional) Test other services
cd user
./mvnw test

cd worker
./mvnw test
```
