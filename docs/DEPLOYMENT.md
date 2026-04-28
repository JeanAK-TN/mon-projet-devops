# Guide de déploiement

## 1. Local (Docker Compose)

```bash
docker compose -f infrastructure/docker/docker-compose.yml up --build
```

- Frontend : http://localhost:5173
- Backend  : http://localhost:3000
- Swagger  : http://localhost:3000/api/docs

Seed automatique au premier démarrage : compte admin `admin@example.com` / `admin1234`.

## 2. AWS — pré-requis

- Compte AWS avec permissions IAM (`AdministratorAccess` pour le bootstrap).
- AWS CLI configuré (`aws configure`).
- Terraform >= 1.5.
- Docker pour builder les images localement (ou laisser GitHub Actions le faire).

## 3. Bootstrap Terraform (première fois)

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
# éditer terraform.tfvars : db_password, jwt_secret, et placeholders pour les images
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

À l'issue du premier `apply`, récupérer les URLs ECR :

```bash
terraform output ecr_backend_url
terraform output ecr_frontend_url
terraform output alb_dns_name
```

## 4. Build & push initiaux des images

```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

# Backend
docker build -t ecommerce-backend:latest src/backend
docker tag ecommerce-backend:latest <ecr_backend_url>:latest
docker push <ecr_backend_url>:latest

# Frontend
docker build -t ecommerce-frontend:latest src/frontend
docker tag ecommerce-frontend:latest <ecr_frontend_url>:latest
docker push <ecr_frontend_url>:latest
```

Puis re-`apply` Terraform avec les vraies URLs dans `terraform.tfvars` :

```hcl
backend_image  = "<ecr_backend_url>:latest"
frontend_image = "<ecr_frontend_url>:latest"
```

## 5. Déploiements suivants — GitHub Actions

Configurer ces secrets sur le dépôt GitHub :

| Secret                   | Exemple                                        |
|--------------------------|------------------------------------------------|
| `AWS_ACCESS_KEY_ID`      | `AKIA...`                                      |
| `AWS_SECRET_ACCESS_KEY`  | `…`                                            |
| `AWS_REGION`             | `us-east-1`                                    |
| `ECR_REPOSITORY_BACKEND` | `ecommerce-backend`                            |
| `ECR_REPOSITORY_FRONTEND`| `ecommerce-frontend`                           |
| `ECS_CLUSTER`            | `ecommerce-cluster`                            |
| `ECS_SERVICE_BACKEND`    | `ecommerce-backend`                            |
| `ECS_SERVICE_FRONTEND`   | `ecommerce-frontend`                           |

Chaque push sur `main` déclenche `cd.yml` : build → push ECR → `update-service --force-new-deployment` → wait `services-stable`.

## 6. Vérification

```bash
curl http://<alb_dns_name>/api/health
# {"status":"OK","timestamp":"..."}
open http://<alb_dns_name>/
```

Logs : CloudWatch → groupes `/ecs/ecommerce/backend` et `/ecs/ecommerce/frontend`.

## 7. Rollback

```bash
# Lister les task definitions précédentes
aws ecs list-task-definitions --family-prefix ecommerce-backend --status ACTIVE

# Forcer le service sur une révision antérieure
aws ecs update-service \
  --cluster ecommerce-cluster \
  --service ecommerce-backend \
  --task-definition ecommerce-backend:<revision>
```

## 8. Destruction

```bash
cd infrastructure/terraform
terraform destroy -var-file=terraform.tfvars
```

> Vérifier qu'aucune image n'est référencée par un service avant destruction (sinon `force_delete` sur les repos ECR ou suppression manuelle).
