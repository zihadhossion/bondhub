# ============================================================
# Stage 1: Turbo Prune
# Extracts only the files needed for @bondhub/api
# ============================================================
FROM node:22-alpine AS pruner

WORKDIR /app

RUN npm install -g turbo@^2

COPY . .

# Produces ./out/json (manifests only) and ./out/full (source)
RUN turbo prune @bondhub/api --docker

# ============================================================
# Stage 2: Builder
# Install dependencies and compile TypeScript
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Required to compile bcrypt native addon
RUN apk add --no-cache python3 make g++

# Copy pruned package manifests first (layer cache: npm ci only
# reruns when package.json/lock changes, not on source changes)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

RUN npm ci

# Copy the rest of the pruned source
COPY --from=pruner /app/out/full/ .

# Build the API (outputs to apps/api/dist/)
RUN npm run build --workspace=apps/api

# Compile standalone migration script (excluded from nest build since it's not imported by main.ts)
RUN cd apps/api && npx tsc -p tsconfig.scripts.json

# ============================================================
# Stage 3: Runner
# Minimal production image — only compiled output + prod deps
# ============================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Runtime dependency for bcrypt native addon
RUN apk add --no-cache libstdc++

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy pruned manifests again to install only prod dependencies
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled application
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Copy entrypoint script
COPY apps/api/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 5001

ENV NODE_ENV=production
ENV PORT=5001

CMD ["/app/entrypoint.sh"]
