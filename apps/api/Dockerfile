# Multi-stage Dockerfile for NestJS API with Turborepo & Railway support

FROM oven/bun:1.2-alpine AS pruner
WORKDIR /app
RUN bun add --global turbo
COPY . .
RUN turbo prune @repo/api --docker

# Installer stage
FROM oven/bun:1.2-alpine AS installer
WORKDIR /app

# First install dependencies (as they change less often)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock* ./
RUN bun install --frozen-lockfile || bun install

# Build the project and its dependencies
COPY --from=pruner /app/out/full/ .
RUN bun run db:generate
RUN bun run build --filter=@repo/api...

# Production runner stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs

COPY --from=installer /app/packages/database/prisma ./packages/database/prisma
COPY --from=installer /app/packages/database/dist ./packages/database/dist
COPY --from=installer /app/packages/database/package.json ./packages/database/package.json
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/api/dist ./apps/api/dist
COPY --from=installer /app/apps/api/package.json ./apps/api/package.json

# El runner es node:22-alpine (no oven/bun), pero prisma/seed.ts es TypeScript
# y siempre se corrió con `bun prisma/seed.ts` — en vez de compilarlo aparte,
# se copia el binario de bun desde installer (mismo Alpine/musl, probado que
# corre tal cual sobre node:22-alpine) solo para ese comando puntual.
COPY --from=installer /usr/local/bin/bun /usr/local/bin/bun

USER nestjs
EXPOSE 4000

# 1) Aplica migraciones pendientes. 2) Siembra categorías/vistas/admin — el
# seed es idempotente (upsert o "ya existe, no lo toco"), así que es seguro
# correrlo en cada arranque; si igual llegara a fallar (ej. hiccup de red),
# el "|| echo" evita que tumbe el arranque del API por un paso no crítico.
# 3) Arranca el servidor.
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy --schema=packages/database/prisma/schema.prisma && (bun packages/database/prisma/seed.ts || echo 'Seed falló (no crítico) — el admin puede no estar creado todavía. Revisa ADMIN_EMAIL/ADMIN_PASSWORD/JWT_SECRET en las variables de entorno.') && node apps/api/dist/src/main.js"]
