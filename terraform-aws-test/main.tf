data "aws_caller_identity" "current" {}

provider "aws" {
  region = "ap-northeast-2"
}
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

################################################################################
# SG Module
################################################################################
# 테스트용이므로 전체적으로 다 허용되는 security group 하나 추가
module "security_group" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "sg_for_all_purpose"
  description = "Mysql & 80 & 443"
  vpc_id      = module.vpc.vpc_id


  # ingress
  ingress_with_cidr_blocks = [
    {
      from_port   = 3306
      to_port     = 3306
      protocol    = "tcp"
      description = "MySQL access from within VPC"
      cidr_blocks = module.vpc.vpc_cidr_block
    },
    {
      from_port   = 443        
      to_port     = 443       
      protocol    = "tcp"      
      description = "https"    
      cidr_blocks = "0.0.0.0/0"
    },
    {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      description = "http"
      cidr_blocks = "0.0.0.0/0"
    },
    {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      description = "ssh"
      cidr_blocks = "0.0.0.0/0"
    }
  ]

    egress_with_cidr_blocks = [
    {
      from_port   = 0          
      to_port     = 0          
      protocol    = "-1"       
      description = "all"      
      cidr_blocks = "0.0.0.0/0"
    }
  ]

  tags ={
    Name = "sg_for_all_purpose"
  }
}



################################################################################
# RDS Module
################################################################################

module "db" {
  source = "terraform-aws-modules/rds/aws"

  identifier = "test-rds"

  create_db_option_group    = false
  create_db_parameter_group = false

  engine               = "mysql"
  engine_version       = "8.0"
  family               = "mysql8.0" # DB parameter group
  major_engine_version = "8.0"      # DB option group
  instance_class       = "db.t4g.small"

  allocated_storage = 100

  db_name  = var.db_name
  username = var.username
  port     = 3306

  manage_master_user_password = false
  password = var.password

  multi_az               = false
  db_subnet_group_name   = module.vpc.database_subnet_group
  vpc_security_group_ids = [module.security_group.security_group_id]
  create_cloudwatch_log_group     = true
  publicly_accessible = false

  skip_final_snapshot = true
  deletion_protection = false

  performance_insights_enabled          = false
  create_monitoring_role                = false


  parameters = [
    {
      name  = "character_set_client"
      value = "utf8mb4"
    },
    {
      name  = "character_set_server"
      value = "utf8mb4"
    }
  ]

  tags = {
    Name = "DB-for-test"
  }
}

################################################################################
# ECR
################################################################################
module "ecr" {
  source = "./ecr"
}

################################################################################
# EKS Module
# ################################################################################
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.2.1"

  cluster_name                   = "supertone-test"
  cluster_endpoint_public_access = true

  enable_cluster_creator_admin_permissions = true

  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent    = true
      before_compute = true
    }
  }

  
  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.private_subnets


  eks_managed_node_group_defaults = {
    ami_type       = "AL2_x86_64"
    instance_types = ["t3.medium"]
    min_size = 2
    max_size = 3

    tags ={
      Name = "default-node-group"
    }

  }
  tags = {
    Name = "supertone-cluster"
  }

}