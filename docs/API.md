# API Reference

Spécification complète : http://localhost:3000/api/docs (Swagger UI) — ou `GET /api/docs.json` en JSON.

## Authentification

Toutes les routes admin requièrent le header :

```
Authorization: Bearer <jwt>
```

Obtenir un JWT via `POST /api/auth/login`.

## Codes de retour

| Code | Sens                                          |
|------|-----------------------------------------------|
| 200  | OK                                            |
| 201  | Created                                       |
| 204  | No content                                    |
| 400  | Validation error (`details` dans la réponse)  |
| 401  | Token absent ou invalide / mauvais identifiants|
| 403  | Authentifié mais rôle insuffisant             |
| 404  | Ressource introuvable                         |
| 409  | Conflit (ex. email déjà utilisé)              |
| 429  | Rate limit dépassé                            |
| 500  | Erreur serveur                                |

## Exemples

```bash
# Inscription
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"password1","name":"Alice"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"password1"}' | jq -r .token)

# Profile
curl http://localhost:3000/api/auth/me -H "Authorization: Bearer $TOKEN"

# Liste paginée + filtre
curl 'http://localhost:3000/api/products?page=1&limit=10&category=electronics&search=laptop'
```
