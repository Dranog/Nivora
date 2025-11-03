#!/bin/bash
set -e

# Health Check Script for Post-Deployment Verification
# Usage: ./health-check.sh [api_url]

API_URL="${1:-http://localhost:3000}"
MAX_RETRIES=30
RETRY_INTERVAL=5

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Check API health endpoint
check_health() {
    log_info "Checking API health at $API_URL/health"

    for i in $(seq 1 $MAX_RETRIES); do
        if curl -f -s "$API_URL/health" > /dev/null; then
            log_info "✓ Health check passed"
            return 0
        else
            log_warn "Health check failed (attempt $i/$MAX_RETRIES)"
            sleep $RETRY_INTERVAL
        fi
    done

    log_error "Health check failed after $MAX_RETRIES attempts"
    return 1
}

# Check readiness endpoint
check_readiness() {
    log_info "Checking API readiness at $API_URL/health/ready"

    if curl -f -s "$API_URL/health/ready" > /dev/null; then
        log_info "✓ Readiness check passed"
        return 0
    else
        log_error "Readiness check failed"
        return 1
    fi
}

# Check liveness endpoint
check_liveness() {
    log_info "Checking API liveness at $API_URL/health/live"

    if curl -f -s "$API_URL/health/live" > /dev/null; then
        log_info "✓ Liveness check passed"
        return 0
    else
        log_error "Liveness check failed"
        return 1
    fi
}

# Check database connectivity
check_database() {
    log_info "Checking database connectivity..."

    RESPONSE=$(curl -s "$API_URL/health")
    DB_STATUS=$(echo "$RESPONSE" | jq -r '.info.database.status // "unknown"')

    if [ "$DB_STATUS" == "up" ]; then
        log_info "✓ Database connection OK"
        return 0
    else
        log_error "Database connection failed: $DB_STATUS"
        return 1
    fi
}

# Check metrics endpoint
check_metrics() {
    log_info "Checking metrics endpoint at $API_URL/metrics"

    if curl -f -s "$API_URL/metrics" | grep -q "# HELP"; then
        log_info "✓ Metrics endpoint OK"
        return 0
    else
        log_error "Metrics endpoint failed"
        return 1
    fi
}

# Run all checks
run_all_checks() {
    local failed=0

    check_health || ((failed++))
    check_readiness || ((failed++))
    check_liveness || ((failed++))
    check_database || ((failed++))
    check_metrics || ((failed++))

    if [ $failed -eq 0 ]; then
        log_info "========================================="
        log_info "✅ All health checks passed successfully"
        log_info "========================================="
        return 0
    else
        log_error "========================================"
        log_error "❌ $failed health check(s) failed"
        log_error "========================================"
        return 1
    fi
}

# Main
log_info "Starting health checks for $API_URL"
log_info "========================================="
run_all_checks
