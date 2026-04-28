variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project / resource prefix"
  type        = string
  default     = "ecommerce"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "az_count" {
  type    = number
  default = 2
}

variable "db_username" {
  type    = string
  default = "ecommerce"
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  type    = string
  default = "db.t3.micro"
}

variable "backend_image" {
  description = "Full image URI for backend (e.g. <ecr>/<repo>:tag)"
  type        = string
}

variable "frontend_image" {
  description = "Full image URI for frontend"
  type        = string
}

variable "backend_cpu" {
  type    = number
  default = 256
}

variable "backend_memory" {
  type    = number
  default = 512
}

variable "frontend_cpu" {
  type    = number
  default = 256
}

variable "frontend_memory" {
  type    = number
  default = 512
}

variable "desired_count" {
  type    = number
  default = 1
}

variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}
