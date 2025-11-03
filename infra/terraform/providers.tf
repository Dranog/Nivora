provider "aws" {
  region = var.region
}

variable "region" {
  type    = string
  default = "eu-west-3"
}
