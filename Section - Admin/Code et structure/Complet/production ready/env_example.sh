# ==========================================
# OLIVER PLATFORM - ENVIRONMENT VARIABLES
# ==========================================
# Copy this file to .env and fill in your values
# NEVER commit .env to version control

# ==========================================
# APPLICATION
# ==========================================
NODE_ENV=development # development | staging | production
PORT=4000
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:4000
LOG_LEVEL=info # debug | info | warn | error

# ==========================================
# DATABASE
# ==========================================
# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://oliver:oliver_password@localhost:5432/oliver_db"

# Connection pool settings
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20

# Enable query logging (only in development)
DATABASE_LOG_QUERIES=false

# ==========================================
# REDIS
# ==========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Redis connection string (alternative to individual values)
# REDIS_URL="redis://:password@localhost:6379/0"

# ==========================================
# AUTHENTICATION
# ==========================================
# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# JWT expiration times
JWT_EXPIRY=7d
JWT_REFRESH_EXPIRY=30d

# 2FA settings
ENABLE_2FA=false
TOTP_APP_NAME=Oliver Platform

# Session settings
MAX_SESSIONS_PER_USER=5
SESSION_ABSOLUTE_TIMEOUT=7d
SESSION_IDLE_TIMEOUT=24h

# ==========================================
# AWS SERVICES
# ==========================================
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key

# S3 Buckets
S3_BUCKET=oliver-storage-dev
S3_BUCKET_KYC=oliver-kyc-documents-dev
S3_BUCKET_EXPORTS=oliver-exports-dev

# S3 Configuration
S3_ENDPOINT= # Leave empty for AWS, set for MinIO/Localstack
S3_FORCE_PATH_STYLE=false # Set true for MinIO/Localstack

# Cloudflare R2 (alternative to S3)
# CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
# CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
# CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
# CLOUDFLARE_R2_BUCKET=oliver-storage

# ==========================================
# AWS REKOGNITION (AI Moderation)
# ==========================================
AWS_REKOGNITION_REGION=eu-west-1
AWS_REKOGNITION_MIN_CONFIDENCE=0

# ==========================================
# GOOGLE CLOUD (AI Moderation)
# ==========================================
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_VISION_KEY_PATH=/path/to/google-vision-credentials.json
# Or use service account JSON directly
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# ==========================================
# EMAIL SERVICE
# ==========================================
# Primary email provider: sendgrid | ses | resend | smtp
EMAIL_PROVIDER=sendgrid

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key

# AWS SES
# AWS_SES_REGION=eu-west-1
# AWS_SES_FROM_EMAIL=no-reply@oliver.com

# Resend
# RESEND_API_KEY=your-resend-api-key

# SMTP (fallback)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password

# Email settings
FROM_EMAIL=no-reply@oliver.com
FROM_NAME=Oliver Platform
SUPPORT_EMAIL=support@oliver.com
ADMIN_EMAIL=admin@oliver.com

# ==========================================
# KYC PROVIDERS
# ==========================================
# Primary KYC provider: yoti | jumio
KYC_PROVIDER=yoti

# Yoti
YOTI_CLIENT_SDK_ID=your-yoti-client-sdk-id
YOTI_KEY_FILE_PATH=/path/to/yoti-private-key.pem
YOTI_SANDBOX_MODE=true # Set false in production

# Jumio
# JUMIO_API_TOKEN=your-jumio-api-token
# JUMIO_API_SECRET=your-jumio-api-secret
# JUMIO_DATACENTER=US # US | EU | SG
# JUMIO_SANDBOX_MODE=true

# KYC settings
KYC_ENCRYPTION_KEY=your-32-character-encryption-key
KYC_AUTO_APPROVE_THRESHOLD=90 # Auto-approve if all scores > 90%
KYC_DOCUMENT_RETENTION_DAYS=1825 # 5 years

# ==========================================
# PAYMENT PROCESSORS
# ==========================================
# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PLATFORM_FEE_PERCENTAGE=15 # 15%

# CCBill (alternative processor)
# CCBILL_ACCOUNT_NUMBER=your-account-number
# CCBILL_SUB_ACCOUNT=your-sub-account
# CCBILL_FLEXFORMS_ID=your-flexforms-id
# CCBILL_SALT=your-salt-key

# Payout settings
PAYOUT_MINIMUM_AMOUNT=5000 # 50.00 EUR in cents
PAYOUT_PROCESSING_DAYS=7
PAYOUT_MAX_RETRIES=3
PAYOUT_RETRY_INTERVAL_HOURS=24

# ==========================================
# TAX COMPLIANCE
# ==========================================
TAX_FORM_THRESHOLD=60000 # 600.00 EUR in cents
TAX_YEAR_START_MONTH=1 # January
AUTO_GENERATE_1099=false
IRS_EFILE_ENABLED=false

# ==========================================
# RATE LIMITING
# ==========================================
RATE_LIMIT_ADMIN=100 # requests per minute
RATE_LIMIT_MODERATOR=100
RATE_LIMIT_USER=60
RATE_LIMIT_ANONYMOUS=10

# Endpoint-specific limits
RATE_LIMIT_LOGIN=5 # per 15 minutes
RATE_LIMIT_EXPORT=3 # per hour
RATE_LIMIT_UPLOAD=10 # per hour

# ==========================================
# CACHING
# ==========================================
CACHE_TTL_DASHBOARD=30 # seconds
CACHE_TTL_USERS=60
CACHE_TTL_SETTINGS=300
CACHE_TTL_REPORTS=10
CACHE_TTL_HEALTH=30

# ==========================================
# FILE UPLOADS
# ==========================================
MAX_FILE_SIZE=104857600 # 100 MB in bytes
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/gif
ALLOWED_DOCUMENT_TYPES=application/pdf,image/jpeg,image/png
ALLOWED_VIDEO_TYPES=video/mp4,video/quicktime,video/x-msvideo

# ==========================================
# MODERATION
# ==========================================
# AI Moderation thresholds (0-100)
AI_MODERATION_VIOLENCE_THRESHOLD=80
AI_MODERATION_ADULT_THRESHOLD=80
AI_MODERATION_HATE_THRESHOLD=70
AI_MODERATION_SPAM_THRESHOLD=70

# Auto-block if score exceeds
AI_AUTO_BLOCK_THRESHOLD=95

# Moderator protection
MAX_MODERATION_HOURS_PER_DAY=4
MODERATION_BREAK_INTERVAL_MINUTES=60
MODERATION_BREAK_DURATION_MINUTES=15
MODERATION_FATIGUE_THRESHOLD=50 # items per hour

# ==========================================
# LEGAL & COMPLIANCE
# ==========================================
# DMCA
DMCA_COUNTER_NOTICE_PERIOD_DAYS=14

# Legal holds
LEGAL_HOLD_DATA_RETENTION_YEARS=7

# Data retention
DATA_RETENTION_TRANSACTIONS_YEARS=10
DATA_RETENTION_AUDIT_LOGS_YEARS=7
DATA_RETENTION_CONTENT_AFTER_DELETE_YEARS=1
DATA_RETENTION_KYC_DOCUMENTS_YEARS=5
DATA_RETENTION_SUPPORT_TICKETS_YEARS=3

# GDPR
GDPR_DATA_EXPORT_EXPIRY_DAYS=7
GDPR_DATA_DELETION_GRACE_PERIOD_DAYS=30

# ==========================================
# MONITORING & LOGGING
# ==========================================
# Sentry (Error tracking)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1 # 10% of transactions

# Datadog (Monitoring)
DATADOG_API_KEY=your-datadog-api-key
DATADOG_SITE=datadoghq.eu # datadoghq.com | datadoghq.eu
ENABLE_DATADOG=false

# LogRocket (Session replay)
# LOGROCKET_APP_ID=your-app-id

# Structured logging
LOG_FORMAT=json # json | pretty
LOG_TIMESTAMPS=true

# ==========================================
# PERFORMANCE
# ==========================================
# API timeouts (milliseconds)
API_TIMEOUT=30000
DATABASE_QUERY_TIMEOUT=10000
EXTERNAL_API_TIMEOUT=15000

# Pagination defaults
DEFAULT_PAGE_SIZE=50
MAX_PAGE_SIZE=100

# ==========================================
# SECURITY
# ==========================================
# Encryption keys (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=your-64-character-hex-encryption-key
ENCRYPTION_ALGORITHM=aes-256-gcm

# Password policy
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBER=true
PASSWORD_REQUIRE_SPECIAL=true
PASSWORD_MAX_AGE_DAYS=90

# Lockout policy
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_DURATION_MINUTES=15

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true

# ==========================================
# WEBHOOKS
# ==========================================
# Webhook secrets (generate with: openssl rand -base64 32)
WEBHOOK_SECRET_YOTI=your-yoti-webhook-secret
WEBHOOK_SECRET_STRIPE=whsec_your-stripe-webhook-secret
WEBHOOK_SECRET_JUMIO=your-jumio-webhook-secret

# ==========================================
# BACKGROUND JOBS
# ==========================================
# Bull queue settings
QUEUE_CONCURRENCY=5
QUEUE_MAX_ATTEMPTS=3
QUEUE_BACKOFF_TYPE=exponential
QUEUE_BACKOFF_DELAY=1000

# Job types
ENABLE_PAYOUT_PROCESSING=true
ENABLE_EXPORT_PROCESSING=true
ENABLE_EMAIL_QUEUE=true
ENABLE_MODERATION_AI=true

# Cron jobs
CRON_CLEANUP_EXPORTS=0 2 * * * # Daily at 2 AM
CRON_CLEANUP_SESSIONS=0 3 * * * # Daily at 3 AM
CRON_RETRY_FAILED_PAYOUTS=0 */6 * * * # Every 6 hours
CRON_GENERATE_TAX_FORMS=0 0 1 1 * # January 1st at midnight
CRON_HEALTH_CHECK=*/5 * * * * # Every 5 minutes

# ==========================================
# FEATURE FLAGS
# ==========================================
ENABLE_KYC_AUTO_APPROVAL=false
ENABLE_AI_MODERATION=true
ENABLE_AUDIT_LOG=true
ENABLE_RATE_LIMITING=true
ENABLE_ANALYTICS=true
ENABLE_DEBUG_MODE=false

# Beta features
ENABLE_CRYPTO_PAYOUTS=false
ENABLE_MULTI_LANGUAGE=false

# ==========================================
# EXTERNAL INTEGRATIONS
# ==========================================
# Analytics
# GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
# MIXPANEL_TOKEN=your-mixpanel-token

# Customer support
# INTERCOM_APP_ID=your-intercom-app-id
# ZENDESK_SUBDOMAIN=your-subdomain
# ZENDESK_API_TOKEN=your-api-token

# SMS (for 2FA, notifications)
# TWILIO_ACCOUNT_SID=your-account-sid
# TWILIO_AUTH_TOKEN=your-auth-token
# TWILIO_PHONE_NUMBER=+1234567890

# ==========================================
# DEVELOPMENT
# ==========================================
# Development tools
ENABLE_SWAGGER=true
ENABLE_GRAPHQL_PLAYGROUND=false
ENABLE_DEBUG_ROUTES=true

# Mock services (for testing)
MOCK_EMAIL_SERVICE=false
MOCK_KYC_SERVICE=false
MOCK_PAYMENT_SERVICE=false
MOCK_AI_MODERATION=false

# Seeding
SEED_DATABASE=false
SEED_ADMIN_EMAIL=admin@oliver.com
SEED_ADMIN_PASSWORD=Admin123!

# ==========================================
# TESTING
# ==========================================
# Test database (separate from dev database)
TEST_DATABASE_URL="postgresql://oliver:oliver_password@localhost:5432/oliver_test_db"

# Test settings
TEST_JWT_SECRET=test-jwt-secret-not-for-production
TEST_ENCRYPTION_KEY=test-encryption-key-32-characters

# ==========================================
# PRODUCTION (Additional)
# ==========================================
# SSL/TLS
# SSL_KEY_PATH=/path/to/privkey.pem
# SSL_CERT_PATH=/path/to/fullchain.pem

# Load balancing
# CLUSTER_MODE=true
# CLUSTER_WORKERS=4

# CDN
# CDN_URL=https://cdn.oliver.com
# CDN_DISTRIBUTION_ID=your-cloudfront-distribution-id

# Backup
# BACKUP_S3_BUCKET=oliver-backups
# BACKUP_FREQUENCY=daily
# BACKUP_RETENTION_DAYS=30

# ==========================================
# COMPLIANCE CERTIFICATIONS
# ==========================================
# PCI DSS
# PCI_COMPLIANCE_MODE=true

# GDPR
GDPR_COMPLIANCE_MODE=true
GDPR_DPO_EMAIL=dpo@oliver.com

# CCPA
CCPA_COMPLIANCE_MODE=false

# Age verification (2257 compliance)
AGE_VERIFICATION_REQUIRED=true
AGE_VERIFICATION_MIN_AGE=18

# ==========================================
# CUSTOM PLATFORM SETTINGS
# ==========================================
PLATFORM_NAME=Oliver
PLATFORM_COMMISSION_RATE=0.15 # 15%
PLATFORM_CURRENCY=EUR
PLATFORM_LOCALE=en-US
PLATFORM_TIMEZONE=Europe/Paris

# Business settings
BUSINESS_EMAIL=business@oliver.com
BUSINESS_ADDRESS="123 Platform Street, 75001 Paris, France"
BUSINESS_PHONE=+33123456789
BUSINESS_REGISTRATION_NUMBER=123456789

# Support
SUPPORT_HOURS=24/7
SUPPORT_SLA_URGENT_HOURS=1
SUPPORT_SLA_HIGH_HOURS=4
SUPPORT_SLA_MEDIUM_HOURS=24
SUPPORT_SLA_LOW_HOURS=72

# ==========================================
# NOTES
# ==========================================
# 1. Generate secure secrets using: openssl rand -base64 32
# 2. Never commit .env to version control
# 3. Use different values for dev/staging/production
# 4. Rotate secrets regularly (at least every 90 days)
# 5. Use environment-specific .env files (.env.development, .env.production)
# 6. Store production secrets in secure vault (AWS Secrets Manager, HashiCorp Vault)
# 7. Enable all security features (2FA, rate limiting, etc.) in production
# 8. Test with mock services in development, real services in staging/production
# 9. Monitor all external API costs (AWS, Yoti, SendGrid, etc.)
# 10. Keep this file updated when adding new environment variables