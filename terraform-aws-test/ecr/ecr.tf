resource "aws_ecr_repository" "supertone-ecr" {
  name                 = "supertone"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "supertone-ecr"
  }
}

output "ecr_registry_id" {
  value = aws_ecr_repository.supertone-ecr.registry_id
}

output "ecr_repository_url" {
  value = aws_ecr_repository.supertone-ecr.repository_url
}

