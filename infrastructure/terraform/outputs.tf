output "alb_dns_name" {
  description = "Public DNS name of the ALB"
  value       = aws_lb.main.dns_name
}

output "ecr_backend_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "rds_endpoint" {
  value     = aws_db_instance.main.address
  sensitive = true
}

output "s3_assets_bucket" {
  value = aws_s3_bucket.assets.id
}

output "s3_alb_logs_bucket" {
  value = aws_s3_bucket.alb_logs.id
}
