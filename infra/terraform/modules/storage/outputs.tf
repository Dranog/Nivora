output "bucket_name" {
  value       = aws_s3_bucket.media.bucket
  description = "Nom du bucket S3"
}

output "bucket_arn" {
  value       = aws_s3_bucket.media.arn
  description = "ARN du bucket S3"
}

output "kms_key_arn" {
  value = (
    var.enable_kms ?
      (var.kms_key_alias != null
        ? data.aws_kms_alias.existing[0].target_key_arn
        : aws_kms_key.s3[0].arn
      )
      : null
  )
  description = "ARN de la clé KMS utilisée (si activée)"
}
