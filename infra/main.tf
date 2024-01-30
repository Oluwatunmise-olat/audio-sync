module "serverless_module" {
  aws_preexisting_ecr = var.aws_preexisting_ecr
  source = "./serverless"
}