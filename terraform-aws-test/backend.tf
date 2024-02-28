terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "supertone"

    workspaces {
      name = "honglab-tf-backend-vpc"
    }
  }
}