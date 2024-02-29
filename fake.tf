data "aws_caller_identity" "current" {}

provider "aws" {}

locals {
  name    = "nsus-cluster"

  region  = "ap-northeast-2"
  vpc_cidr = "10.0.0.0/16"
  
  # cidr 10.0.0.0/24는 aws 자체적으로 예약된 ip 주소가 이미 5개 정도 존재하므로 10.0.1.0 으로 시작되도록 설정
  public_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.3.0/24", "10.0.4.0/24"]
  
  azs = ["ap-northeast-2a", "ap-northeast-2c"]

  tags = {
    Name    = local.name
    }
}


################################################################################
# VPC Module
################################################################################
  module "network" {
    source = "./network"
  }

################################################################################
# CSI IAM ROLE
################################################################################
module "ebs_csi_irsa_role" {
  source = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
 
  role_name             = "${local.name}-ebs-csi"
  attach_ebs_csi_policy = true

  oidc_providers = {
    ex = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:ebs-csi-controller-sa"]
    }
  }
}
resource "aws_iam_policy" "ebs_csi_controller" {
  name_prefix = "ebs-csi-controller"
  description = "EKS ebs-csi-controller policy for cluster ${local.name}"
  policy      = file("./addons.json")
}


################################################################################
# EKS Module
################################################################################

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.2.1"

  cluster_name                   = local.name
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

  }

  eks_managed_node_groups = {
    nsus_node_group = {
      min_size = 2
      max_size = 3
      desired_size = 2
      disk_size = 20
    }
    tags = local.tags
  }
}


################################################################################
# GitHub OIDC Provider
# Note: This is one per AWS account
################################################################################

module "iam_github_oidc_provider" {
  source = "terraform-aws-modules/iam/aws//modules/iam-github-oidc-provider"

  tags = {
    Name = "iam-provider-github-oidc"
    }
}


################################################################################
# GitHub OIDC Role
################################################################################
resource "aws_iam_policy" "ECR_Read_Write" {
  name = "ECR_Read_Write"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        "Sid": "GetAuthorizationToken"
        "Action": [
            "ecr:BatchGetImage",
            "ecr:BatchCheckLayerAvailability",
            "ecr:CompleteLayerUpload",
            "ecr:GetDownloadUrlForLayer",
            "ecr:InitiateLayerUpload",
            "ecr:PutImage",
            "ecr:UploadLayerPart",
            "ecr:GetAuthorizationToken"
        ]
        "Effect"   = "Allow"
        "Resource" = "*"
       },
    ]
  })

}


module "iam_github_oidc_role" {
  source = "terraform-aws-modules/iam/aws//modules/iam-github-oidc-role"

  name = "iam-role-github-oidc"

  # This should be updated to suit your organization, repository, references/branches, etc.
  subjects = [
    "repo:alli-eunbi/nsus:*"
  ]

  policies = {
    additional = aws_iam_policy.ECR_Read_Write.arn
    }

  tags = {
    name = "iam-role-github-oidc"
  }
}

