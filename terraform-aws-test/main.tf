data "aws_caller_identity" "current" {}

provider "aws" {}

locals {
  name    = "nsus-cluster"
  region  = "ap-northeast-2"
}


################################################################################
# VPC & Security Module
################################################################################
  module "network" {
    source = "./network"
  }


