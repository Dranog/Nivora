# Préfixe pour nommer le bucket (ex: "creator-dev")
variable "name" {
  type        = string
  description = "Préfixe du bucket S3"
}

# Active (ou non) le chiffrement côté serveur avec KMS
variable "enable_kms" {
  type        = bool
  default     = false
  description = "Active ou non le chiffrement KMS pour le bucket"
}

# Si tu veux utiliser une clé KMS existante, mets son alias ici (ex: "alias/creator-dev-s3").
# Laisser à null pour créer automatiquement une nouvelle clé + alias.
variable "kms_key_alias" {
  type        = string
  default     = null
  description = "Alias de la clé KMS à utiliser (ex: alias/creator-dev-s3) ; null pour créer une clé"
}

# Tags additionnels optionnels
variable "tags" {
  type        = map(string)
  default     = {}
  description = "Tags additionnels à appliquer"
}
