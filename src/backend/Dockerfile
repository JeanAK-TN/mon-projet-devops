# syntax=docker/dockerfile:1.6
# ---- Build stage : install dev deps and compile TS to JS ----
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig*.json ./
RUN npm ci
COPY src ./src
COPY migrations ./migrations
COPY seeders ./seeders
COPY .sequelizerc ./
COPY healthcheck.js ./
RUN npm run build

# ---- Runtime stage : production deps + dist ----
FROM node:18-alpine AS runtime
RUN apk add --no-cache dumb-init \
    && addgroup -S nodejs && adduser -S nodeapp -G nodejs

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder --chown=nodeapp:nodejs /app/dist ./dist
COPY --from=builder --chown=nodeapp:nodejs /app/migrations ./migrations
COPY --from=builder --chown=nodeapp:nodejs /app/seeders ./seeders
COPY --chown=nodeapp:nodejs .sequelizerc ./
COPY --chown=nodeapp:nodejs src/config/sequelize.js ./src/config/sequelize.js
COPY --chown=nodeapp:nodejs healthcheck.js ./

USER nodeapp
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node healthcheck.js || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
