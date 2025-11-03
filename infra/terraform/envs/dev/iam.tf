locals {
  bucket_name = module.storage.bucket_name
  bucket_arn  = module.storage.bucket_arn
  kms_arn     = module.storage.kms_key_arn # peut être null si KMS désactivé
}

# Policy complète pour le bucket media (objet + list) + KMS si présent
resource "aws_iam_policy" "s3_media_full" {
  name        = "creator-dev-s3-media-policy"
  description = "Full access to ${local.bucket_name} (with KMS if enabled)"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      [
        # Accès au bucket (list)
        {
          Effect = "Allow"
          Action = [
            "s3:ListBucket",
            "s3:GetBucketLocation",
            "s3:ListBucketVersions"
          ]
          Resource = local.bucket_arn
        },
        # Objets (RW + versions)
        {
          Effect = "Allow"
          Action = [
            "s3:GetObject",
            "s3:PutObject",
            "s3:DeleteObject",
            "s3:GetObjectVersion",
            "s3:DeleteObjectVersion",
            "s3:PutObjectAcl",
            "s3:GetObjectAcl"
          ]
          Resource = "${local.bucket_arn}/*"
        }
      ],

      # Bloc KMS seulement si une clé est utilisée
      local.kms_arn != null ? [
        {
          Effect = "Allow"
          Action = [
            "kms:Encrypt",
            "kms:Decrypt",
            "kms:ReEncrypt*",
            "kms:GenerateDataKey*",
            "kms:DescribeKey"
          ]
          Resource = local.kms_arn
          Condition = {
            StringEquals = {
              "kms:ViaService" = "s3.eu-west-3.amazonaws.com"
            }
          }
        }
      ] : []
    )
  })
}

# Rôle d’exécution pour ton appli (ex: EC2; mets ecs-tasks.amazonaws.com si ECS)
resource "aws_iam_role" "app_role" {
  name = "creator-dev-app-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "ec2.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

# Attache la policy au rôle
resource "aws_iam_role_policy_attachment" "s3_media_attach" {
  role       = aws_iam_role.app_role.name
  policy_arn = aws_iam_policy.s3_media_full.arn
}

# Instance profile (utile pour lier le rôle à une EC2)
resource "aws_iam_instance_profile" "app_profile" {
  name = "creator-dev-app-profile"
  role = aws_iam_role.app_role.name
}
