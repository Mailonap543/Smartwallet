# Deployment Guide - Smartwallet

## Overview
This document provides comprehensive deployment instructions for the Smartwallet application, including backend (Java/Spring Boot) and frontend (Angular) components.

## Architecture
```
Frontend (Angular) → Backend (Spring Boot) → Database (PostgreSQL)
                      ↓
                  Redis (Cache)
```

## Prerequisites

### System Requirements
- **Java**: 17+ (Temurin recommended)
- **Node.js**: 20+ LTS
- **Maven**: 3.8+
- **PostgreSQL**: 15+
- **Redis**: 7+
- **Docker**: 20+ (optional, for containerized deployment)

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/smartwallet
SPRING_DATASOURCE_USERNAME=smartwallet
SPRING_DATASOURCE_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRATION=86400000

# Redis
SPRING_REDIS_HOST=localhost
SPRING_REDIS_PORT=6379
```

## Local Development

### Backend Setup
```bash
cd /path/to/smartwallet

# 1. Start dependencies (PostgreSQL, Redis)
docker-compose -f docker-compose.dev.yml up -d postgres redis

# 2. Configure database
createdb smartwallet_dev

# 3. Build and run
mvn clean spring-boot:run

# Backend will be available at http://localhost:8080
# Health check: http://localhost:8080/api/health
# Actuator: http://localhost:8080/actuator/health
```

### Frontend Setup
```bash
cd smartwallet-front

# 1. Install dependencies
npm ci

# 2. Start development server
npm run start

# Frontend will be available at http://localhost:4200
```

### Combined Development (Docker)
```bash
# Start all services (backend, frontend, db, cache, monitoring)
docker-compose -f docker-compose.dev.yml up -d

# Backend: http://localhost:8080
# Frontend: http://localhost:4200
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000 (admin/admin)
```

## Production Deployment

### Option 1: Docker Deployment (Recommended)

#### Build Images
```bash
# Backend
cd /path/to/smartwallet
docker build -t smartwallet/backend:latest .

# Frontend
cd smartwallet-front
docker build -t smartwallet/frontend:latest .
```

#### Production Docker Compose
```bash
# Copy and configure production environment
cp docker-compose.production.yml docker-compose.yml

# Edit .env for production values
vim .env

# Deploy
docker-compose up -d

# Verify
docker-compose ps
docker-compose logs -f
```

#### Production Stack
- **Backend**: 3 replicas (load balanced)
- **Frontend**: 2 replicas (Nginx served)
- **PostgreSQL**: 1 primary, 1 replica
- **Redis**: Cluster mode
- **Monitoring**: Prometheus + Grafana + Loki

### Option 2: Manual Deployment

#### Backend
```bash
# 1. Package application
mvn clean package -DskipTests

# 2. Deploy JAR
java -jar target/smartwallet-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  --spring.config.location=/etc/smartwallet/application.yml

# Or use systemd service
sudo systemctl start smartwallet
sudo systemctl enable smartwallet
```

#### Frontend
```bash
# 1. Build production
cd smartwallet-front
npm run build

# 2. Deploy to web server (Nginx)
scp -r dist/smartwallet-front/* user@server:/var/www/smartwallet

# 3. Nginx Configuration
# /etc/nginx/sites-available/smartwallet
server {
    listen 80;
    server_name smartwallet.com;
    
    root /var/www/smartwallet;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option 3: Cloud Deployment

#### AWS
```bash
# Backend: ECS Fargate or EKS
# Frontend: S3 + CloudFront
# Database: RDS PostgreSQL
# Cache: ElastiCache Redis
# Monitoring: CloudWatch
```

#### Google Cloud
```bash
# Backend: GKE or Cloud Run
# Frontend: Firebase Hosting
# Database: Cloud SQL
# Cache: MemoryStore
```

#### Azure
```bash
# Backend: Azure Container Apps
# Frontend: Azure Static Web Apps
# Database: Azure Database for PostgreSQL
# Cache: Azure Cache for Redis
```

## Environment Configuration

### Backend Profiles

#### Development (`application-dev.yml`)
```yaml
spring:
  profiles: dev
  
datasource:
  url: jdbc:postgresql://localhost:5432/smartwallet_dev
  
jpa:
  hibernate:
    ddl-auto: update
    
logging:
  level:
    com.smartwallet: DEBUG
```

#### Production (`application-prod.yml`)
```yaml
spring:
  profiles: prod
  
datasource:
  url: jdbc:postgresql://prod-db:5432/smartwallet
  hikari:
    maximum-pool-size: 20
    
jpa:
  hibernate:
    ddl-auto: validate
    
logging:
  level:
    com.smartwallet: INFO
```

### Frontend Environments

#### Development
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  wsUrl: 'ws://localhost:8080'
};
```

#### Production
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.smartwallet.com',
  wsUrl: 'wss://api.smartwallet.com'
};
```

## CI/CD Pipeline

### GitHub Actions (Already Configured)

The repository includes `.github/workflows/ci.yml` with:

- **Backend Build**: Java 21, Maven, JaCoCo coverage
- **Backend Test**: Unit tests with coverage reporting
- **Frontend Test**: Vitest with coverage
- **Frontend Build**: Angular production build
- **SonarQube**: Code quality analysis
- **Docker Build**: Multi-stage builds
- **Deploy**: Automatic deployment to production

### Pipeline Stages

```
Push/PR → Test → Build → Quality Gate → Deploy
  ↓          ↓       ↓           ↓          ↓
Backend   Front   Docker    SonarQube   Production
```

## Health Checks

### Backend Health
```bash
# Health check
curl http://localhost:8080/api/health

# Response
{
  "status": "UP",
  "timestamp": "2026-04-24T06:29:02",
  "application": "smartwallet",
  "version": "0.0.1-SNAPSHOT",
  "components": {
    "database": {"status": "UP"},
    "cache": {"status": "UP"},
    "externalApi": {"status": "UP"}
  }
}

# Liveness
curl http://localhost:8080/api/health/liveness

# Readiness
curl http://localhost:8080/api/health/readiness
```

### Frontend Health
```bash
curl http://localhost:4200
# Should return index.html
```

## Monitoring

### Prometheus Metrics
```bash
# Application metrics
curl http://localhost:8080/actuator/prometheus

# JVM metrics
curl http://localhost:8080/actuator/metrics/jvm.memory.used
```

### Grafana Dashboards
Access at `http://localhost:3000`
- Default credentials: admin/admin
- Pre-configured dashboards for:
  - Application metrics
  - JVM performance
  - HTTP requests
  - Database connections

### Logs
```bash
# Backend logs
tail -f logs/server.log

# Docker logs
docker-compose logs -f backend

# Kubernetes logs
kubectl logs -f deployment/smartwallet-backend
```

## Scaling

### Horizontal Scaling
```bash
# Backend replicas
docker-compose up -d --scale backend=3

# Kubernetes
kubectl scale deployment smartwallet-backend --replicas=5
```

### Database Scaling
```sql
-- Add read replica
CREATE REPLICA postgres_replica ...;
```

### Load Balancing
```nginx
# Nginx configuration
upstream backend {
    server backend1:8080;
    server backend2:8080;
    server backend3:8080;
}

server {
    listen 80;
    location /api {
        proxy_pass http://backend;
    }
}
```

## Backup and Recovery

### Database Backup
```bash
# PostgreSQL backup
pg_dump smartwallet > smartwallet_backup_$(date +%Y%m%d).sql

# Restore
psql smartwallet < smartwallet_backup.sql
```

### Application Backup
```bash
# Configuration
cp application.yml application.yml.backup

# Secrets
cp .env .env.backup
```

## Troubleshooting

### Backend Won't Start
```bash
# Check logs
tail -f logs/server.log

# Check database connection
psql -h localhost -U smartwallet -d smartwallet

# Check port availability
netstat -tulnp | grep 8080
```

### Frontend Build Fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm ci

# Check Node version
node --version  # Should be 20+
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
systemctl status postgresql

# Check credentials
psql -h localhost -U smartwallet -d smartwallet

# Check firewall
ufw status
```

### High Memory Usage
```bash
# Check JVM memory
jstat -gc <pid>

# Adjust heap size
export JAVA_OPTS="-Xms512m -Xmx2048m"
```

## Security Checklist

- [ ] Change default passwords
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up SSL certificates
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Set up intrusion detection
- [ ] Regular security updates
- [ ] Backup strategy
- [ ] Disaster recovery plan

## Performance Tuning

### JVM Tuning
```bash
export JAVA_OPTS="
  -Xms2048m
  -Xmx4096m
  -XX:+UseG1GC
  -XX:MaxGCPauseMillis=200
  -XX:+UseStringDeduplication
"
```

### Database Tuning
```sql
-- Connection pool
ALTER SYSTEM SET max_connections = 200;

-- Query optimization
CREATE INDEX idx_assets_symbol ON assets(symbol);
```

### Application Tuning
```yaml
# application-prod.yml
spring:
  jpa:
    properties:
      hibernate:
        query:
          plan_cache_max_size: 2048
          plan_parameter_metadata_max_size: 32
```

## Rollback Procedure

```bash
# Docker
cd /path/to/deployment
docker-compose down
git checkout v1.0.0
docker-compose up -d

# Kubernetes
kubectl rollout undo deployment/smartwallet-backend

# Manual
cp smartwallet_backup.jar smartwallet.jar
systemctl restart smartwallet
```

## Support

- **Documentation**: https://docs.smartwallet.com
- **Issues**: https://github.com/smartwallet/smartwallet/issues
- **Emergency**: emergency@smartwallet.com
- **Status**: https://status.smartwallet.com

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.