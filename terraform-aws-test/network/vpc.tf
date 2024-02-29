locals {
  name    = "vpc_supertone"

  region  = "ap-northeast-2"
  vpc_cidr = "10.0.0.0/16"
  
  
  azs = ["ap-northeast-2a", "ap-northeast-2c"]

  tags = {
    Name    = local.name
    }
}
################################################################################
# VPC Module
################################################################################
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"

  name = local.name
  cidr = local.vpc_cidr

  azs                 = local.azs
  private_subnets     = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k)]
  public_subnets      = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k + 4)]
  database_subnets    = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k + 8)]

  private_subnet_names  = ["private-subnet-a", "private-subnet-c"]
  public_subnet_names   = ["public-subnet-a", "public-subnet-c"] 
  database_subnet_names = ["db-subnet"]

  create_database_subnet_group = true
  create_database_subnet_route_table = true 

  enable_dns_hostnames = true
  enable_dns_support   = true

  enable_nat_gateway = true

  tags = local.tags
}

