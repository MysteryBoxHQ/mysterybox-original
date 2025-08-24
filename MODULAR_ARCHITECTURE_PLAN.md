# RollingDrop Modular Architecture Plan
## Scaling to 50+ Million Daily Transactions (B2B + B2C)

### Current State Analysis
- **Monolithic Node.js/Express**: Single application handling all concerns
- **PostgreSQL Database**: Centralized data storage
- **React Frontend**: Client-side rendering with API consumption
- **Target**: 50M+ transactions/day (~578 transactions/second average, 3000+ peak)
- **Transaction Types**: Box openings, deposits, withdrawals, redemptions, trades, marketplace sales
- **Mix**: 70% B2C (individual users), 30% B2B (partner integrations)
- **Peak Load**: Black Friday/special events can reach 5000+ transactions/second

---

## 1. Microservices Architecture Overview

### Core Services Breakdown

#### 1.1 Authentication & Session Service
**Responsibility**: User authentication, session management, JWT validation
**Technology**: Spring Boot + Spring Security + Redis
**Scaling**: Stateless, horizontal scaling behind load balancer
```
- POST /auth/login
- POST /auth/logout  
- GET /auth/validate
- POST /auth/refresh
- Rate limiting: 100 req/min per IP
```

#### 1.2 Transaction Engine Service
**Responsibility**: All financial operations - box openings, deposits, withdrawals, redemptions, trades
**Technology**: Spring Boot WebFlux + R2DBC + PostgreSQL Cluster
**Scaling**: 5 write-masters (sharded), 15 read replicas, reactive streams
```
- POST /transactions/open-box
- POST /transactions/deposit
- POST /transactions/withdraw  
- POST /transactions/redeem
- POST /transactions/trade
- GET /transactions/history
- Database: 5 Write-masters + 15 Read replicas (sharded by user_id)
- Queue: Kafka with 50 partitions for async processing
- Peak capacity: 5000 transactions/second
```

#### 1.3 Inventory Management Service  
**Responsibility**: User inventory, item transfers, marketplace operations
**Technology**: Spring Boot + MongoDB Cluster (10 shards)
**Scaling**: Horizontally sharded by user ID, Redis Cluster caching
```
- GET /inventory/user/{userId}
- POST /inventory/transfer
- PUT /inventory/item/{itemId}
- Cache: Redis Cluster (50GB) with 5-minute TTL
- Database: 10 MongoDB shards, 3 replicas each
```

#### 1.4 Box & Item Configuration Service
**Responsibility**: Box definitions, item drops, probability calculations
**Technology**: Spring Boot + PostgreSQL + Redis Cache
**Scaling**: Heavy caching, CDN for images
```
- GET /boxes/catalog
- GET /boxes/{boxId}/items
- POST /admin/boxes (admin only)
- Cache: 30-minute TTL for box configs
```

#### 1.5 Analytics & Reporting Service
**Responsibility**: Transaction analytics, user statistics, fraud detection
**Technology**: Spring Boot + ClickHouse + Kafka Streams
**Scaling**: Time-series database, real-time stream processing
```
- GET /analytics/user/{userId}/stats
- GET /analytics/global/overview
- POST /analytics/events (internal)
- Data retention: 2 years
```

#### 1.6 Partner API Gateway
**Responsibility**: B2B integrations, API key management, rate limiting, real-time feeds
**Technology**: Spring Cloud Gateway + Redis + Kafka Streams
**Scaling**: Independent scaling, partner-specific rate limits, Kafka topic broadcasting
```
- GET /partner/v1/boxes
- POST /partner/v1/open-box
- WebSocket: /partner/ws/live-feed
- Kafka Consumer API: /partner/v1/stream/{topic}
- Topics: partner-transactions, partner-inventory-updates, partner-box-openings
- Rate limiting: Per-partner quotas
- Authentication: API key + signature validation + Kafka SASL/SSL
- Real-time feeds: Transaction events, inventory changes, box opening results
```

#### 1.7 Real-time Events Service
**Responsibility**: WebSocket connections, live feeds, battle system
**Technology**: Spring Boot WebFlux + Redis Pub/Sub
**Scaling**: Sticky sessions, horizontal pod scaling
```
- WebSocket: /ws/battles
- WebSocket: /ws/live-feed
- Event broadcasting via Redis
```

---

## 2. Data Architecture

### 2.1 Database Strategy

#### Primary Transaction Database (PostgreSQL Cluster)
```sql
-- Partitioned by date for transaction history
transactions_2024_01, transactions_2024_02, etc.
-- Read replicas: 3 nodes for analytics queries
-- Connection pool: HikariCP with 50 connections per service
```

#### User Data (PostgreSQL)
```sql
-- Partitioned by user_id % 10 for horizontal scaling
users, user_profiles, user_sessions
-- Read replicas for profile queries
```

#### Inventory Database (MongoDB Cluster)
```javascript
// Sharded by user_id for horizontal scaling
{
  user_id: "12345",
  items: [
    { item_id: "sword_001", quantity: 2, acquired_date: "2024-01-15" }
  ]
}
```

#### Analytics Database (ClickHouse)
```sql
-- Optimized for time-series analytics
CREATE TABLE transaction_events (
    timestamp DateTime,
    user_id UInt64,
    event_type String,
    amount Decimal(10,2),
    metadata String
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, user_id);
```

### 2.2 Caching Strategy

#### Redis Cluster Configuration
```
- Session Cache: 30-minute TTL, 10GB memory
- Box Configuration Cache: 4-hour TTL, 5GB memory  
- User Inventory Cache: 10-minute TTL, 15GB memory
- Rate Limiting Cache: 1-hour sliding window
```

#### CDN Strategy
```
- Static Assets: AWS CloudFront / Cloudflare
- Box Images: Cached at edge locations
- API Responses: Cache-Control headers for public data
```

---

## 3. Message Queue Architecture

### 3.1 Kafka Cluster Architecture

#### Internal Event Streaming Topics
```
Topic: transaction-events
Partitions: 50 (by user_id hash)
Retention: 7 days
Producers: Transaction Engine
Consumers: Analytics Service, Fraud Detection, Partner Feed Bridge

Topic: inventory-updates
Partitions: 20 (by user_id hash)
Retention: 24 hours
Producers: Transaction Engine, Marketplace
Consumers: Inventory Service, Real-time Events, Partner Feed Bridge

Topic: admin-operations
Partitions: 5
Retention: 30 days
Producers: Admin Service
Consumers: All services (for config updates)
```

#### B2B Partner Feed Topics
```
Topic: partner-transactions
Partitions: 30 (by partner_id hash)
Retention: 7 days
Message Rate: ~2000 messages/second peak
Purpose: Real-time transaction notifications for B2B partners
Security: SASL/SSL with partner-specific ACLs

Topic: partner-inventory-updates
Partitions: 20 (by partner_id hash)
Retention: 24 hours
Message Rate: ~500 messages/second peak
Purpose: Inventory changes affecting partner integrations
Security: SASL/SSL with partner-specific ACLs

Topic: partner-box-openings
Partitions: 40 (by partner_id hash)
Retention: 3 days
Message Rate: ~3000 messages/second peak
Purpose: Box opening results for partner analytics
Security: SASL/SSL with partner-specific ACLs

Topic: partner-{partnerId}-notifications
Partitions: 1 (partner-specific)
Retention: 7 days
Message Rate: Variable per partner
Purpose: Partner-specific notifications and alerts
Security: Partner-isolated topics with strict ACLs
```

#### Kafka Message Schema (Avro)
```json
{
  "namespace": "com.rollingdrop.events",
  "type": "record",
  "name": "TransactionEvent",
  "fields": [
    {"name": "messageId", "type": "string"},
    {"name": "timestamp", "type": "long", "logicalType": "timestamp-millis"},
    {"name": "partnerId", "type": ["null", "string"], "default": null},
    {"name": "eventType", "type": {"type": "enum", "name": "EventType", 
      "symbols": ["BOX_OPENING", "DEPOSIT", "WITHDRAWAL", "REDEMPTION", "TRADE"]}},
    {"name": "transactionId", "type": "string"},
    {"name": "userId", "type": "string"},
    {"name": "data", "type": {
      "type": "record",
      "name": "TransactionData",
      "fields": [
        {"name": "boxId", "type": ["null", "string"], "default": null},
        {"name": "amount", "type": ["null", "double"], "default": null},
        {"name": "items", "type": {"type": "array", "items": {
          "type": "record",
          "name": "Item",
          "fields": [
            {"name": "itemId", "type": "string"},
            {"name": "rarity", "type": "string"},
            {"name": "value", "type": "double"}
          ]
        }}, "default": []},
        {"name": "totalValue", "type": "double"}
      ]
    }},
    {"name": "metadata", "type": {
      "type": "record",
      "name": "Metadata",
      "fields": [
        {"name": "region", "type": "string"},
        {"name": "apiVersion", "type": "string"},
        {"name": "source", "type": "string"}
      ]
    }}
  ]
}
```

#### Kafka Cluster Configuration
```
Cluster Size: 9 brokers (3 per availability zone)
Replication Factor: 3
Min In-Sync Replicas: 2
Partitioner: Murmur2 hash
Compression: LZ4 (best throughput for real-time feeds)
Batch Size: 100KB for optimal latency/throughput balance
```

---

## 4. Deployment Strategy

### 4.1 Kubernetes Architecture

#### Namespace Organization
```yaml
# Production namespaces
- rollingdrop-auth
- rollingdrop-transactions  
- rollingdrop-inventory
- rollingdrop-analytics
- rollingdrop-partners
- rollingdrop-realtime
```

#### Service Scaling Configuration
```yaml
# High-volume services
Transaction Engine:
  replicas: 10
  cpu: 2 cores
  memory: 4GB
  
Authentication Service:
  replicas: 5
  cpu: 1 core
  memory: 2GB

Analytics Service:
  replicas: 3
  cpu: 4 cores  
  memory: 8GB
```

### 4.2 Load Balancing Strategy

#### API Gateway (Nginx/Kong)
```
- Rate limiting: 1000 req/min per user
- Circuit breaker: 50% error rate threshold
- Retry policy: 3 attempts with exponential backoff
- Health checks: /actuator/health endpoint
```

---

## 5. Migration Strategy

### Phase 1: Database Preparation (Week 1-2)
1. Set up PostgreSQL read replicas
2. Implement database sharding for users table
3. Configure Redis cluster for caching
4. Set up ClickHouse for analytics

### Phase 2: Extract Authentication Service (Week 3-4)
1. Create Spring Boot authentication microservice
2. Migrate session management to Redis
3. Update frontend to use new auth endpoints
4. Run parallel with existing system

### Phase 3: Extract Transaction Engine (Week 5-8)
1. Create transaction microservice with async processing
2. Implement Kafka for event streaming
3. Migrate box opening logic
4. Performance testing with production load

### Phase 4: Extract Remaining Services (Week 9-12)
1. Inventory management service
2. Analytics service with real-time dashboards
3. Partner API gateway
4. Real-time events service

### Phase 5: Optimization & Monitoring (Week 13-16)
1. Performance tuning
2. Implement distributed tracing
3. Set up comprehensive monitoring
4. Load testing for 20M+ daily transactions

---

## 6. Performance Targets

### Latency Requirements
```
- Authentication: < 50ms p95
- Box Opening: < 200ms p95  
- Inventory Queries: < 100ms p95
- Analytics Queries: < 500ms p95
- Partner API: < 150ms p95
```

### Throughput Targets
```
- Peak Load: 1,500 transactions/second
- Sustained Load: 300 transactions/second
- Database Connections: 500 total across all services
- Cache Hit Rate: > 90% for frequently accessed data
```

### Availability Requirements
```
- Uptime: 99.9% (8.76 hours downtime/year)
- Zero-downtime deployments
- Automatic failover for database
- Circuit breakers for service resilience
```

---

## 7. Monitoring & Observability

### Metrics Collection
```
- Prometheus for metrics collection
- Grafana for dashboards
- Jaeger for distributed tracing
- ELK stack for log aggregation
```

### Key Metrics to Track
```
- Transaction success rate
- Average response time per service
- Database connection pool utilization
- Cache hit/miss ratios
- Queue depth and processing lag
- Error rates by service and endpoint
```

### Alerting Strategy
```
- PagerDuty integration for critical alerts
- Slack notifications for warnings
- Automated scaling triggers
- Health check failures
```

---

## 8. Security Considerations

### Service-to-Service Communication
```
- mTLS for internal service communication
- JWT tokens with short expiration (15 minutes)
- API keys with rate limiting for partners
- Network policies in Kubernetes
```

### Data Protection
```
- Encryption at rest for sensitive data
- PII data masking in logs
- GDPR compliance for user data
- Regular security audits
```

---

## 9. Cost Optimization

### Resource Planning
```
- Auto-scaling based on CPU/memory metrics
- Spot instances for non-critical workloads
- Reserved instances for baseline capacity
- Database connection pooling optimization
```

### Infrastructure Costs (Monthly Estimates)
```
- Kubernetes Cluster: $2,000
- Database (PostgreSQL + MongoDB): $1,500
- Redis Cluster: $500
- Message Queue (Kafka): $400
- Monitoring Stack: $300
- CDN & Storage: $200
Total: ~$4,900/month for 20M transactions/day
```

---

## 10. Success Metrics

### Technical KPIs
- Handle 20M+ daily transactions with < 200ms latency
- Achieve 99.9% uptime
- Scale to 1,500 peak transactions/second
- Maintain < 0.1% error rate

### Business KPIs  
- Support 100+ concurrent partner integrations
- Process $1M+ daily transaction volume
- Enable real-time analytics for business intelligence
- Reduce operational costs by 30% through automation

This modular architecture provides a clear path to scale RollingDrop from the current monolithic structure to a high-performance, distributed system capable of handling enterprise-level transaction volumes while maintaining reliability and performance.