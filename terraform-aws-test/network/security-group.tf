data "aws_vpc" "vpc_supertone" {}

# 테스트용이므로 전체적으로 다 허용되는 security group 하나 추가
module "security_group" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "sg_for_all_purpose"
  description = "Mysql & 80 & 443"
  vpc_id      = data.aws_vpc.vpc_supertone.id


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