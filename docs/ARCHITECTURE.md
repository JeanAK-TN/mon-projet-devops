# Architecture

## Vue d'ensemble

Application e-commerce SPA avec backend REST stateless, déployée sur AWS ECS Fargate derrière un ALB, avec PostgreSQL managé (RDS) et CI/CD GitHub Actions.

```
                        ┌──────────────────────┐
   Internet  ──HTTPS──▶ │ Application Load     │
                        │ Balancer (ALB)       │
                        └──────────┬───────────┘
                                   │
                  ┌────────────────┼────────────────┐
                  │ /api/*         │ /*             │
                  ▼                ▼
          ┌──────────────┐  ┌──────────────┐
          │ ECS Fargate  │  │ ECS Fargate  │
          │   backend    │  │   frontend   │
          │ Node/Express │  │ React + nginx│
          └──────┬───────┘  └──────────────┘
                 │
                 ▼
          ┌──────────────┐
          │ RDS Postgres │
          │ (private)    │
          └──────────────┘

CloudWatch Logs <── tasks logs (awslogs driver)
CloudWatch Metrics & Alarms <── ALB / ECS / RDS
```

## Choix techniques

| Décision               | Justification                                                 |
|------------------------|---------------------------------------------------------------|
| TypeScript (full-stack)| sécurité de typage, refactor sûr, cohérent avec le brief     |
| Node.js + Express      | écosystème mature, rapide à démarrer, JSON natif             |
| Sequelize + sequelize-cli | ORM multi-dialecte, migrations versionnées (SQLite tests, Postgres prod) |
| JWT stateless          | scaling horizontal sans session sticky                       |
| React + Vite           | build rapide, HMR, SPA simple                                |
| nginx pour le front    | sert les assets statiques + proxy `/api`                     |
| ECS Fargate            | pas de gestion d'EC2, scaling à la tâche                     |
| RDS Postgres           | sauvegardes auto, multi-AZ optionnel, sécurité réseau         |
| ALB + path routing     | un seul point d'entrée, TLS terminé sur l'ALB, access logs S3|
| S3 (assets + logs)     | stockage objets pour uploads, persistance des logs ALB       |
| Prometheus + CloudWatch | métriques applicatives custom + métriques infra AWS         |
| Terraform              | IaC reproductible, plan/apply, état partagé via S3           |
| GitHub Actions         | natif au repo, secrets dédiés, OIDC possible                 |

## Sécurité

- Helmet (headers HTTP) + CORS strict + rate limiting (300 req / 15 min / IP).
- Mots de passe : bcrypt (10 rounds), jamais sérialisés (`toJSON` strip).
- JWT signé avec secret côté serveur, expiration 24 h.
- Validation des entrées via `express-validator`.
- Containers Docker en utilisateur non-root (`nodeapp`), `dumb-init` PID 1.
- RDS dans des subnets privés, accès limité au security group des tâches ECS.
- Image scanning ECR + scan Trivy en CI.

## Observabilité

- **Logs applicatifs** : `morgan` → stdout → CloudWatch Logs (driver `awslogs`).
- **Logs ALB** : access logs S3 (`<project>-alb-logs-<account>`), expiration 90 jours.
- **Métriques applicatives** : `prom-client` expose `/metrics` (compteurs HTTP par méthode/route/status, histogramme de durée, métriques Node par défaut). Scrapable par Prometheus / AWS Managed Prometheus / ADOT.
- **Healthcheck** : `GET /api/health` (utilisé par ALB target group et Docker `HEALTHCHECK`).
- **Alarmes CloudWatch** : CPU ECS backend, 5xx ALB, CPU RDS.
- **Container Insights** activé sur le cluster ECS.
- En local : Prometheus dans `docker-compose` scrape `http://backend:3000/metrics` toutes les 15 s (UI sur :9090).

## Flux CI/CD

1. **Push / PR** → `ci.yml` :
   - Lint + tests + couverture (backend, seuil 70 %).
   - Build front (Vite).
   - Build images Docker, scan Trivy.
   - `terraform fmt` + `validate`.
2. **Push sur `main`** → `cd.yml` :
   - Login ECR.
   - Build & push images (`:sha` + `:latest`).
   - `aws ecs update-service --force-new-deployment`.
   - Wait `services-stable`.

## Modèle de données

- `users` : id, email (unique), password (bcrypt), name, role (`user`/`admin`).
- `products` : id, name, description, price, imageUrl, stock, category.
- `orders` : id, userId, total, status.
- `order_items` : id, orderId, productId, quantity, price.

## Évolutions possibles

- HTTPS sur l'ALB (ACM cert + listener 443, redirect 80).
- Auto-scaling ECS sur CPU/RPS.
- Read replicas RDS, multi-AZ.
- WAF devant l'ALB.
- OIDC GitHub Actions ↔ AWS (suppression des access keys).
- Caches CloudFront pour les assets front.
