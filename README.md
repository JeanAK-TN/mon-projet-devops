# mon-projet-devops — E-commerce DevOps Final Project

Bachelor 3 DevOps – Session 10. Application e-commerce full-stack avec pipeline DevOps complet : React + Node.js + PostgreSQL, conteneurisée, déployable sur AWS ECS via Terraform et GitHub Actions.

## Stack

- **Frontend** : React 18 + **TypeScript** + Vite
- **Backend** : Node.js 18 + Express + **TypeScript** + Sequelize
- **Base de données** : PostgreSQL 15 (migrations versionnées via sequelize-cli)
- **Authentification** : JWT + bcrypt + Helmet + rate-limit
- **Tests** : Jest + ts-jest + Supertest (couverture **92,8 %** statements / **97,5 %** functions, seuil 70 %)
- **API Docs** : Swagger / OpenAPI 3
- **Conteneurisation** : Docker multi-stage (build TS → runtime JS) + docker-compose
- **CI/CD** : GitHub Actions (lint, typecheck, build, tests, Trivy scan, terraform validate, déploiement ECR/ECS)
- **Infrastructure** : Terraform (VPC, ECS Fargate, RDS, ALB, ECR, **S3 assets + ALB logs**, CloudWatch)
- **Monitoring** : CloudWatch logs + alarmes + **Prometheus** (`/metrics` exposé par le backend)

## Structure

```
mon-projet-devops/
├── .github/workflows/        # ci.yml + cd.yml
├── src/
│   ├── backend/              # API Node.js + Express
│   ├── frontend/             # SPA React + Vite
│   └── database/             # migrations + seeders
├── infrastructure/
│   ├── terraform/            # IaC AWS (VPC, ECS, RDS, ALB, ECR, S3, CloudWatch)
│   ├── docker/               # docker-compose (Postgres + backend + frontend + Prometheus)
│   └── monitoring/           # cloudwatch-agent-config.json + prometheus.yml
├── docs/                     # architecture, OpenAPI, deployment
├── tests/                    # smoke + e2e transverses
└── README.md
```

## Démarrage rapide (local)

Prérequis : Docker Desktop, Node.js 18+, npm.

```bash
# 1. Lancer la stack complète (frontend + backend + Postgres)
docker compose -f infrastructure/docker/docker-compose.yml up --build

# Frontend  : http://localhost:5173
# Backend   : http://localhost:3000
# Swagger   : http://localhost:3000/api/docs
# Metrics   : http://localhost:3000/metrics
# Prometheus: http://localhost:9090
# Postgres  : localhost:5432 (user: ecommerce, pass: ecommerce)
```

### Sans Docker

```bash
# Backend
cd src/backend
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev

# Frontend (autre terminal)
cd src/frontend
npm install
npm run dev
```

## Pages frontend

| Route                | Accès                  | Description                          |
|----------------------|------------------------|--------------------------------------|
| `/`                  | public                 | Accueil                              |
| `/products`          | public                 | Liste + recherche                    |
| `/products/:id`      | public                 | Détail + ajout au panier             |
| `/cart`              | public (checkout auth) | Panier (localStorage) + commande     |
| `/login`, `/register`| public                 | Authentification                     |
| `/profile`           | utilisateur connecté   | Profil + historique des commandes    |
| `/admin/products`    | rôle `admin`           | Gestion CRUD des produits            |

## Tests

```bash
cd src/backend
npm test                # exécute Jest + Supertest
npm run test:coverage   # rapport de couverture
```

Cible : **>= 70 %** de couverture sur le backend.

## API

Documentation interactive Swagger : http://localhost:3000/api/docs

Principaux endpoints :

| Méthode | Endpoint              | Description                     | Auth   |
|---------|-----------------------|---------------------------------|--------|
| POST    | /api/auth/register    | Création de compte              | non    |
| POST    | /api/auth/login       | Connexion (retourne JWT)        | non    |
| GET     | /api/auth/me          | Profil utilisateur courant      | bearer |
| GET     | /api/products         | Liste paginée des produits      | non    |
| GET     | /api/products/:id     | Détail produit                  | non    |
| POST    | /api/products         | Créer un produit                | admin  |
| PUT     | /api/products/:id     | Mettre à jour                   | admin  |
| DELETE  | /api/products/:id     | Supprimer                       | admin  |
| POST    | /api/orders           | Créer une commande (panier)     | bearer |
| GET     | /api/orders           | Mes commandes                   | bearer |
| GET     | /api/orders/:id       | Détail (propriétaire ou admin)  | bearer |
| GET     | /api/users            | Liste utilisateurs              | admin  |
| GET     | /api/users/:id        | Détail utilisateur              | admin  |
| GET     | /api/health           | Healthcheck                     | non    |
| GET     | /metrics              | Prometheus exposition           | non    |

## Pipeline CI/CD

- **CI** (`.github/workflows/ci.yml`) : lint, tests + couverture, build images Docker, scan de sécurité (npm audit + Trivy).
- **CD** (`.github/workflows/cd.yml`) : sur push sur `main`, build & push images vers ECR, déclenche un déploiement ECS.

Secrets GitHub requis pour la CD :
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `ECR_REPOSITORY`, `ECS_CLUSTER`, `ECS_SERVICE`.

## Déploiement AWS

Voir [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) pour les étapes détaillées :

```bash
cd infrastructure/terraform
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

## Architecture

Voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Licence

MIT.
