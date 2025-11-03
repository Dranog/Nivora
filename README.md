# OLIVER Platform

Code source de la plateforme OLIVER – plateforme premium créateurs & fans (OnlyFans-like)

## Architecture

- **API** (NestJS) - Backend API avec authentification, paiements, CRM, support, analytics
- **Web** (Next.js) - Application web frontale
- **Mobile** - Applications mobiles natives

## API Backend

### Tech Stack

- NestJS + TypeScript
- Prisma ORM + PostgreSQL
- Redis (cache & queue)
- Stripe (paiements)
- MinIO (stockage S3)
- SendGrid (emails)
- Bull (queues)

### Health Checks

- **Full health**: `GET /api/health`
- **Database only**: `GET /api/health/db`
- **Redis only**: `GET /api/health/redis`

### Metrics

Prometheus metrics available at: `GET /api/metrics`

Metrics exposed:
- `http_requests_total` - Total HTTP requests (by method, route, status)
- `http_request_duration_seconds` - Request duration histogram
- `active_connections` - Active connections gauge

## Development

```bash
# Install dependencies
pnpm install

# Start Postgres & Redis
docker-compose up -d

# Run migrations
pnpm prisma migrate dev

# Start API dev server
cd apps/api && pnpm dev

# Start Web dev server
cd apps/web && pnpm dev
```

## Deployment

### Production

```bash
# Deploy
./scripts/deploy.sh

# Rollback
./scripts/rollback.sh <commit-hash>

# Health check
./scripts/health-check.sh https://api.oliver.com/health
```

### Docker

```bash
# Build
docker-compose -f docker-compose.prod.yml build

# Start
docker-compose -f docker-compose.prod.yml up -d

# Logs
docker-compose -f docker-compose.prod.yml logs -f api

# Stop
docker-compose -f docker-compose.prod.yml down
```

## Monitoring

### Logs

Structured JSON logs with correlation IDs for request tracing.

### Alerts

Configure alerts in your monitoring system (Prometheus/Grafana):

- API response time > 2s
- Error rate > 5%
- Database connection failures
- Redis connection failures

## Security

- Helmet (CSP, HSTS, XSS protection)
- Rate limiting on auth endpoints
- CORS configuration
- JWT authentication
- Role-based access control (RBAC)

## Features

### BLOCS 1-7 (Base Platform)
- Authentication (JWT + refresh tokens)
- User management (creators, fans)
- Posts & content management
- Subscriptions & payments (Stripe)
- Storage (MinIO S3)
- Queue system (Bull)
- Payouts

### BLOCS 8-9 (CRM & Support)
- Email marketing (SendGrid)
- Double opt-in workflow (RGPD)
- Reactions system (LIKE, LOVE, FIRE, STAR)
- Ticket support with auto-priority

### BLOCS 10-11-12 (Analytics & Admin)
- Creator analytics dashboard
- Public SEO-optimized pages
- Admin moderation system with risk scoring

### BLOCS 13-14 (Observability & CI/CD)
- Structured logging (Winston)
- Health checks (@nestjs/terminus)
- Prometheus metrics
- Docker multi-stage builds
- GitHub Actions CI/CD
- Deployment scripts
