########################################
# Données & Locaux
########################################
data "aws_caller_identity" "current" {}

locals {
  bucket_name = "${var.name}-${data.aws_caller_identity.current.account_id}"

  common_tags = merge(
    {
      Name        = "${var.name}-media"
      Environment = "dev"
    },
    var.tags
  )
}

########################################
# S3 Bucket
########################################
resource "aws_s3_bucket" "media" {
  bucket        = local.bucket_name
  force_destroy = true
  tags          = local.common_tags
}

# Blocage de toute exposition publique
resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.media.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Versioning
resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.media.id
  versioning_configuration { status = "Enabled" }
}

# Lifecycle (filtre requis)
resource "aws_s3_bucket_lifecycle_configuration" "this" {
  bucket = aws_s3_bucket.media.id

  rule {
    id     = "expire-old-versions"
    status = "Enabled"

    # couvre tous les objets
    filter { prefix = "" }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

########################################
# KMS (optionnel)
# - enable_kms = true & kms_key_alias = null  => crée une clé + alias alias/<name>-s3
# - enable_kms = true & kms_key_alias != null => réutilise l’alias existant
########################################

resource "aws_kms_key" "s3" {
  count                   = var.enable_kms && var.kms_key_alias == null ? 1 : 0
  description             = "KMS key for ${var.name} S3 bucket"
  deletion_window_in_days = 7
}

resource "aws_kms_alias" "s3" {
  count         = var.enable_kms && var.kms_key_alias == null ? 1 : 0
  name          = "alias/${var.name}-s3"
  target_key_id = aws_kms_key.s3[0].key_id
}

data "aws_kms_alias" "existing" {
  count = var.enable_kms && var.kms_key_alias != null ? 1 : 0
  name  = var.kms_key_alias
}

# Chiffrement côté serveur S3
resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  count  = var.enable_kms ? 1 : 0
  bucket = aws_s3_bucket.media.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm   = "aws:kms"
      kms_master_key_id = (
        var.kms_key_alias != null
          ? data.aws_kms_alias.existing[0].target_key_arn
          : aws_kms_key.s3[0].arn
      )
    }
  }
}

########################################
# Bucket Policy : refuse tout upload non chiffré
########################################
resource "aws_s3_bucket_policy" "enforce_sse" {
  bucket = aws_s3_bucket.media.id

  policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Sid       = "DenyUnEncryptedObjectUploads"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:PutObject"
        Resource  = "${aws_s3_bucket.media.arn}/*"
        Condition = {
          StringNotEquals = {
            "s3:x-amz-server-side-encryption" = "aws:kms"
          }
        }
      }
    ]
  })
}
