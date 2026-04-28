# Tests transverses

Ce dossier accueille les tests **end-to-end** et de smoke / charge qui dépassent le scope d'un service unique.

| Type             | Emplacement                              |
|------------------|------------------------------------------|
| Tests unitaires  | [src/backend/tests/](../src/backend/tests/) |
| Tests d'intégration API | [src/backend/tests/](../src/backend/tests/) (Supertest sur Express + Sequelize en SQLite) |
| Tests E2E        | `tests/e2e/` (Playwright — voir ci-dessous) |
| Smoke production | [tests/smoke.sh](smoke.sh) |

## Smoke test

Vérifie qu'un déploiement répond correctement :

```bash
BASE_URL=https://my-app.example.com ./tests/smoke.sh
```

## E2E (à mettre en place)

Stack recommandée : [Playwright](https://playwright.dev/) ou Cypress.

```bash
mkdir -p tests/e2e
cd tests/e2e
npm init -y
npm i -D @playwright/test
npx playwright install --with-deps
```

Pour l'instant, les parcours utilisateurs critiques (login → ajout panier → commande) sont couverts par les tests d'intégration backend (Supertest).
