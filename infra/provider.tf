terraform {
  required_providers {
    aws = {
      version = "~> 5"
      source  = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_credential_profile
}