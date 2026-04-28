resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet"
  subnet_ids = aws_subnet.private[*].id

  tags = { Name = "${var.project_name}-db-subnet" }
}

resource "aws_db_instance" "main" {
  identifier              = "${var.project_name}-db"
  allocated_storage       = 20
  storage_type            = "gp3"
  engine                  = "postgres"
  engine_version          = "15.4"
  instance_class          = var.db_instance_class
  db_name                 = "ecommerce"
  username                = var.db_username
  password                = var.db_password
  port                    = 5432
  vpc_security_group_ids  = [aws_security_group.rds.id]
  db_subnet_group_name    = aws_db_subnet_group.main.name
  publicly_accessible     = false
  skip_final_snapshot     = true
  backup_retention_period = 7
  deletion_protection     = false
  storage_encrypted       = true

  tags = { Name = "${var.project_name}-db" }
}
