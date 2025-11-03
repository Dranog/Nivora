#!/bin/bash
# ==========================================
# scripts/deploy.sh - DEPLOYMENT SCRIPT
# ==========================================

set -e

echo "🚀 Oliver Platform Deployment Script"
echo "===================================="

if [ -f .env.prod ]; then
    export $(cat .env.prod | grep -v '#' | awk '/=/ {print $1}')
fi

: ${VERSION:?"VERSION not set"}
: ${DOCKER_REGISTRY:?"DOCKER_REGISTRY not set"}

echo "📦 Building Docker images..."
echo "Version: $VERSION"
echo "Registry: $DOCKER_REGISTRY"

echo "🔨 Building API..."
docker build \
    -t oliver-api:$VERSION \
    -t oliver-api:latest \
    -f apps/api/Dockerfile \
    --target runner \
    .

echo "🔨 Building Web..."
docker build \
    -t oliver-web:$VERSION \
    -t oliver-web:latest \
    -f apps/web/Dockerfile \
    --target runner \
    .

echo "🏷️ Tagging images..."
docker tag oliver-api:$VERSION $DOCKER_REGISTRY/oliver-api:$VERSION
docker tag oliver-api:latest $DOCKER_REGISTRY/oliver-api:latest
docker tag oliver-web:$VERSION $DOCKER_REGISTRY/oliver-web:$VERSION
docker tag oliver-web:latest $DOCKER_REGISTRY/oliver-web:latest

echo "📤 Pushing to registry..."
docker push $DOCKER_REGISTRY/oliver-api:$VERSION
docker push $DOCKER_REGISTRY/oliver-api:latest
docker push $DOCKER_REGISTRY/oliver-web:$VERSION
docker push $DOCKER_REGISTRY/oliver-web:latest

echo "✅ Build and push completed!"
echo ""
echo "Next steps:"
echo "1. SSH to production server"
echo "2. Run: ./scripts/deploy-prod.sh $VERSION"

# ==========================================
# scripts/deploy-prod.sh - PRODUCTION DEPLOYMENT
# ==========================================

#!/bin/bash
set -e

VERSION=${1:-latest}

echo "🚀 Deploying Oliver Platform v$VERSION to Production"
echo "=================================================="

echo "📥 Pulling images..."
docker-compose -f docker-compose.prod.yml pull

echo "💾 Creating database backup..."
./scripts/backup-db.sh

echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy

echo "🔄 Updating services..."
docker-compose -f docker-compose.prod.yml up -d --no-deps --build redis
sleep 5
docker-compose -f docker-compose.prod.yml up -d --no-deps --build api
sleep 15
docker-compose -f docker-compose.prod.yml up -d --no-deps --build web
sleep 10

echo "🏥 Running health checks..."
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/health || echo "000")
WEB_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "000")
REDIS_HEALTH=$(docker exec oliver-redis-prod redis-cli ping | grep -c PONG || echo "0")

if [ "$API_HEALTH" = "200" ] && [ "$WEB_HEALTH" = "200" ] && [ "$REDIS_HEALTH" = "1" ]; then
    echo "✅ Deployment successful!"
    echo "API Health: $API_HEALTH"
    echo "Web Health: $WEB_HEALTH"
    echo "Redis Health: PONG"
else
    echo "❌ Health check failed!"
    echo "API Health: $API_HEALTH"
    echo "Web Health: $WEB_HEALTH"
    echo "Redis Health: $REDIS_HEALTH"
    echo "Rolling back..."
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d
    exit 1
fi

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✨ Deployment completed successfully!"

# ==========================================
# scripts/backup-db.sh - DATABASE BACKUP
# ==========================================

#!/bin/bash
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/oliver_db_$TIMESTAMP.sql"

if [ -f .env.prod ]; then
    export $(cat .env.prod | grep -v '#' | awk '/=/ {print $1}')
fi

echo "💾 Creating database backup..."
mkdir -p $BACKUP_DIR

DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

docker exec oliver-postgres-prod pg_dump \
    -U $DB_USER \
    -h localhost \
    -p 5432 \
    -d $DB_NAME \
    -F c \
    > $BACKUP_FILE

gzip $BACKUP_FILE

echo "✅ Backup created: ${BACKUP_FILE}.gz"

if [ ! -z "$AWS_BACKUP_BUCKET" ]; then
    echo "📤 Uploading to S3..."
    aws s3 cp ${BACKUP_FILE}.gz s3://$AWS_BACKUP_BUCKET/database/
    echo "✅ Backup uploaded to S3"
fi

find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
echo "🧹 Cleaned old backups (kept last 7 days)"

# ==========================================
# scripts/restore-db.sh - DATABASE RESTORE
# ==========================================

#!/bin/bash
set -e

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./scripts/restore-db.sh <backup-file.sql.gz>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will restore the database!"
echo "Backup file: $BACKUP_FILE"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

if [ -f .env.prod ]; then
    export $(cat .env.prod | grep -v '#' | awk '/=/ {print $1}')
fi

DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

if [[ $BACKUP_FILE == *.gz ]]; then
    echo "📦 Decompressing backup..."
    gunzip -c $BACKUP_FILE > /tmp/restore.sql
    BACKUP_FILE=/tmp/restore.sql
fi

echo "🛑 Stopping API..."
docker-compose -f docker-compose.prod.yml stop api

echo "♻️  Restoring database..."
cat $BACKUP_FILE | docker exec -i oliver-postgres-prod pg_restore \
    -U $DB_USER \
    -d $DB_NAME \
    --clean \
    --if-exists

echo "🚀 Starting API..."
docker-compose -f docker-compose.prod.yml start api

rm -f /tmp/restore.sql

echo "✅ Database restored successfully!"

# ==========================================
# scripts/setup-dev.sh - DEVELOPMENT SETUP
# ==========================================

#!/bin/bash
set -e

echo "🔧 Setting up Oliver Platform Development Environment"
echo "==================================================="

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

echo "📦 Installing dependencies..."
npm install

if [ ! -f "apps/api/.env" ]; then
    echo "📝 Creating apps/api/.env from template..."
    cat > apps/api/.env << EOF
DATABASE_URL="postgresql://oliver:oliver_password@localhost:5432/oliver_db"
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
JWT_SECRET="dev-jwt-secret-change-in-production"
JWT_EXPIRY="7d"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
S3_BUCKET="oliver-storage-dev"
S3_BUCKET_KYC="oliver-kyc-documents-dev"
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="no-reply@oliver.com"
SUPPORT_EMAIL="support@oliver.com"
GOOGLE_VISION_KEY_PATH="/path/to/google-vision-key.json"
YOTI_CLIENT_SDK_ID="your-yoti-client-sdk-id"
YOTI_KEY_FILE_PATH="/path/to/yoti-key.pem"
FRONTEND_URL="http://localhost:3000"
PORT=4000
EOF
    echo "⚠️  Please edit apps/api/.env with your credentials"
fi

if [ ! -f "apps/web/.env.local" ]; then
    echo "📝 Creating apps/web/.env.local from template..."
    cat > apps/web/.env.local << EOF
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_WS_URL="ws://localhost:4000/admin"
EOF
fi

echo "🐳 Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

echo "⏳ Waiting for services to be ready..."
sleep 15

echo "🔨 Generating Prisma Client..."
cd packages/database
npx prisma generate

echo "🗄️ Running database migrations..."
npx prisma migrate dev --name init

echo "🌱 Seeding database..."
npx prisma db seed || echo "⚠️  No seed script found"

cd ../..

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "🚀 To start developing:"
echo "  npm run dev"
echo ""
echo "📚 Access points:"
echo "  Frontend:    http://localhost:3000"
echo "  Backend:     http://localhost:4000"
echo "  API Docs:    http://localhost:4000/api/docs"
echo "  Prisma:      npx prisma studio"
echo "  WebSocket:   ws://localhost:4000/admin"
echo ""
echo "🔐 Default admin credentials:"
echo "  Email:       admin@oliver.com"
echo "  Password:    Admin123!"

# ==========================================
# scripts/test.sh - RUN ALL TESTS
# ==========================================

#!/bin/bash
set -e

echo "🧪 Running Oliver Platform Tests"
echo "================================"

echo "🔧 Running backend tests..."
cd apps/api
npm run test
npm run test:e2e
cd ../..

echo "🎨 Running frontend tests..."
cd apps/web
npm run test
cd ../..

echo "🔗 Running integration tests..."
npm run test:integration

echo "✅ All tests passed!"

# ==========================================
# scripts/monitor.sh - SYSTEM MONITORING
# ==========================================

#!/bin/bash

echo "📊 Oliver Platform Monitoring"
echo "============================"

echo ""
echo "🐳 Docker Container Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "💾 Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "🗄️ Database Connections:"
docker exec oliver-postgres-prod psql -U oliver -d oliver_db -c "SELECT count(*) as active_connections FROM pg_stat_activity;" 2>/dev/null || echo "Unable to connect to database"

echo ""
echo "🔴 Redis Memory:"
docker exec oliver-redis-prod redis-cli INFO memory | grep used_memory_human 2>/dev/null || echo "Unable to connect to Redis"

echo ""
echo "🏥 Service Health Checks:"
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/health 2>/dev/null || echo "000")
WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
WS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/admin/socket.io/ 2>/dev/null || echo "000")

echo "API:       $API_STATUS $([ $API_STATUS -eq 200 ] && echo '✅' || echo '❌')"
echo "Web:       $WEB_STATUS $([ $WEB_STATUS -eq 200 ] && echo '✅' || echo '❌')"
echo "WebSocket: $WS_STATUS $([ $WS_STATUS -eq 200 ] && echo '✅' || echo '❌')"

echo ""
echo "💿 Disk Usage:"
df -h / | tail -1

echo ""
echo "⚠️  Recent API Errors:"
docker logs oliver-api --tail 100 2>&1 | grep -i error | tail -10 || echo "No errors found"

# ==========================================
# scripts/logs.sh - VIEW LOGS
# ==========================================

#!/bin/bash

SERVICE=${1:-all}

case $SERVICE in
    api)
        docker logs -f oliver-api
        ;;
    web)
        docker logs -f oliver-web
        ;;
    postgres)
        docker logs -f oliver-postgres
        ;;
    redis)
        docker logs -f oliver-redis
        ;;
    all)
        docker-compose logs -f
        ;;
    *)
        echo "Usage: ./scripts/logs.sh [api|web|postgres|redis|all]"
        exit 1
        ;;
esac

# ==========================================
# Makefile - SIMPLIFIED COMMANDS
# ==========================================

.PHONY: help install dev build start stop clean test deploy backup restore monitor logs

help:
	@echo "Oliver Platform - Available Commands"
	@echo "===================================="
	@echo "install    - Install all dependencies"
	@echo "dev        - Start development environment"
	@echo "build      - Build all applications"
	@echo "start      - Start production environment"
	@echo "stop       - Stop all services"
	@echo "clean      - Clean build artifacts"
	@echo "test       - Run all tests"
	@echo "deploy     - Deploy to production"
	@echo "backup     - Backup database"
	@echo "restore    - Restore database"
	@echo "monitor    - Monitor system status"
	@echo "logs       - View application logs"

install:
	@./scripts/setup-dev.sh

dev:
	@docker-compose up -d postgres redis
	@npm run dev

build:
	@npm run build

start:
	@docker-compose -f docker-compose.prod.yml up -d

stop:
	@docker-compose down

clean:
	@npm run clean
	@rm -rf node_modules apps/*/node_modules packages/*/node_modules

test:
	@./scripts/test.sh

deploy:
	@./scripts/deploy.sh

backup:
	@./scripts/backup-db.sh

restore:
	@./scripts/restore-db.sh

monitor:
	@./scripts/monitor.sh

logs:
	@./scripts/logs.sh all
