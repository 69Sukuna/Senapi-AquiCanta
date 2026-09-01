# Multi-stage Dockerfile for Next.js Web App with Turborepo & Railway support

FROM oven/bun:1.2-alpine AS pruner
WORKDIR /app
RUN bun add --global turbo
COPY . .
RUN turbo prune @repo/web --docker

# Installer stage
FROM oven/bun:1.2-alpine AS installer
WORKDIR /app

# First install dependencies
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock* ./
RUN bun install --frozen-lockfile || bun install

# Build the Next.js app
COPY --from=pruner /app/out/full/ .
ENV NEXT_TELEMETRY_DISABLED=1

# Railway injects service variables as build args for Dockerfile builds, but
# only vars declared here with ARG actually reach the build — and Next.js
# inlines NEXT_PUBLIC_* at build time, so it must be present before `build`.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN bun run build --filter=@repo/web...

# Production runner stage (Minimal Alpine image)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy standalone build and static assets
COPY --from=installer /app/apps/web/public ./apps/web/public
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
