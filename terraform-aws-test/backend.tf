terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "supertone"

    workspaces {
      name = "forTest"
    }
  }
}