module "storage" {
  source = "../../modules/storage"

  # préfixe du bucket / des tags
  name = "creator-dev"

  # Activer KMS et laisser le module créer la clé automatiquement
  enable_kms    = true
  kms_key_alias = null # <- PAS d'alias existant, le module créera alias/creator-dev-s3

  # Exemple de tags additionnels (facultatif)
  # tags = { Project = "Oliver" }
}
