# Database

The schema is managed through **sequelize-cli** versioned migrations and seeders, located inside the backend service:

- Migrations : [src/backend/migrations/](../backend/migrations/)
- Seeders    : [src/backend/seeders/](../backend/seeders/)
- Config     : [src/backend/src/config/sequelize.js](../backend/src/config/sequelize.js)
- `.sequelizerc` : [src/backend/.sequelizerc](../backend/.sequelizerc)

## Commands (from `src/backend/`)

```bash
# Apply all pending migrations
npm run migrate

# Roll back the most recent migration
npm run migrate:undo

# Run all sequelize-cli seeders
npm run seed:cli

# Quick demo seed (idempotent, used by docker-compose)
npm run seed

# Sync schema directly from models (dev only — no migrations)
npm run migrate:sync
```

## Schema

| Table         | Columns                                                                             |
|---------------|-------------------------------------------------------------------------------------|
| `users`       | id, email (unique), password (bcrypt), name, role (`user`/`admin`), timestamps      |
| `products`    | id, name, description, price, imageUrl, stock, category, timestamps                 |
| `orders`      | id, userId (FK users), total, status (`pending`/`paid`/`shipped`/`cancelled`)       |
| `order_items` | id, orderId (FK orders, CASCADE), productId (FK products, RESTRICT), quantity, price|

## Conventions

- Migration filenames : `YYYYMMDDHHMMSS-description.js` so they are applied in order.
- Always provide both `up` and `down`.
- Never edit a migration that has been applied to a shared environment — write a follow-up migration instead.
