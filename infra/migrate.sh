#!/bin/bash
set -e

# Database Migration Script with Rollback Support
# Usage: ./migrate.sh [deploy|rollback|status]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
API_DIR="$PROJECT_ROOT/apps/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL environment variable is not set"
    exit 1
fi

# Navigate to API directory
cd "$API_DIR"

# Backup database before migration
backup_database() {
    log_info "Creating database backup..."
    BACKUP_DIR="$PROJECT_ROOT/backups"
    mkdir -p "$BACKUP_DIR"

    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql"

    # Extract database connection details
    DB_URL=$DATABASE_URL

    # Use pg_dump if PostgreSQL
    if [[ $DB_URL == postgresql://* ]] || [[ $DB_URL == postgres://* ]]; then
        pg_dump "$DB_URL" > "$BACKUP_FILE"
        log_info "Backup created: $BACKUP_FILE"
    else
        log_warn "Backup not supported for this database type"
    fi
}

# Deploy migrations
deploy_migrations() {
    log_info "Deploying database migrations..."

    # Check for pending migrations
    if pnpm exec prisma migrate status | grep -q "Database schema is up to date"; then
        log_info "No pending migrations"
        return 0
    fi

    # Create backup before migration
    backup_database

    # Deploy migrations
    log_info "Applying migrations..."
    if pnpm exec prisma migrate deploy; then
        log_info "Migrations deployed successfully"

        # Verify database schema
        log_info "Verifying database schema..."
        pnpm exec prisma migrate status

        return 0
    else
        log_error "Migration deployment failed"
        return 1
    fi
}

# Rollback last migration
rollback_migration() {
    log_warn "Rolling back last migration..."

    # Get list of applied migrations
    MIGRATIONS=$(pnpm exec prisma migrate status --json | jq -r '.appliedMigrations[-1].name')

    if [ -z "$MIGRATIONS" ] || [ "$MIGRATIONS" == "null" ]; then
        log_error "No migrations to rollback"
        return 1
    fi

    log_info "Last migration: $MIGRATIONS"

    # Find the most recent backup
    LATEST_BACKUP=$(ls -t "$PROJECT_ROOT/backups"/backup_*.sql 2>/dev/null | head -1)

    if [ -z "$LATEST_BACKUP" ]; then
        log_error "No backup found for rollback"
        return 1
    fi

    log_warn "Restoring from backup: $LATEST_BACKUP"
    read -p "Are you sure you want to restore from backup? (yes/no): " -r

    if [[ $REPLY == "yes" ]]; then
        psql "$DATABASE_URL" < "$LATEST_BACKUP"
        log_info "Database restored from backup"
    else
        log_info "Rollback cancelled"
    fi
}

# Show migration status
show_status() {
    log_info "Checking migration status..."
    pnpm exec prisma migrate status
}

# Main script
case "${1:-deploy}" in
    deploy)
        deploy_migrations
        ;;
    rollback)
        rollback_migration
        ;;
    status)
        show_status
        ;;
    backup)
        backup_database
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|status|backup}"
        exit 1
        ;;
esac
