FROM oven/bun:1-alpine AS base
WORKDIR /app

COPY package.json bun.lock turbo.json tsconfig.base.json eslint.config.mjs prettier.config.mjs ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/worker/package.json ./apps/worker/package.json
COPY packages/analytics/package.json ./packages/analytics/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/content-normalizer/package.json ./packages/content-normalizer/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/database/prisma ./packages/database/prisma
COPY packages/email/package.json ./packages/email/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/validation/package.json ./packages/validation/package.json
COPY packages/wikipedia-client/package.json ./packages/wikipedia-client/package.json

FROM base AS dev-deps
RUN bun install --frozen-lockfile
COPY apps ./apps
COPY packages ./packages
COPY docker ./docker
COPY .dockerignore ./
COPY tests ./tests

FROM dev-deps AS builder
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=postgresql://app:app@localhost:5432/narau?schema=public
ENV REDIS_URL=redis://localhost:6379
ENV AUTH_SECRET=build-secret
ENV AUTH_URL=http://localhost:3030
ENV EMAIL_FROM="Narau <no-reply@localhost>"
ENV SMTP_HOST=localhost
ENV SMTP_PORT=1025
ENV SMTP_USER=
ENV SMTP_PASS=
ENV SMTP_SECURE=false
ENV WIKIPEDIA_USER_AGENT="NarauBot/0.1 (https://localhost:3030; contact@example.com)"
RUN bun run build

FROM base AS prod-deps
ENV NODE_ENV=production
RUN bun install --frozen-lockfile --production

# Purge build caches, dev tools, and duplicate Next.js binaries in prod-deps
RUN rm -rf ./apps/web/.next/cache ./node_modules/.cache && \
    rm -rf \
      ./node_modules/.bun/next@* \
      ./node_modules/.bun/@next+swc-* \
      ./node_modules/.bun/typescript* \
      ./node_modules/.bun/eslint* \
      ./node_modules/.bun/@typescript-eslint* \
      ./node_modules/.bun/vitest* \
      ./node_modules/.bun/tsup* \
      ./node_modules/.bun/esbuild* \
      ./node_modules/.bun/@esbuild* \
      ./node_modules/.bun/@turbo* \
      ./node_modules/.bun/prettier* \
      ./node_modules/.bun/tailwindcss* \
      ./node_modules/.bun/postcss* \
      ./node_modules/.bun/rollup* \
      ./node_modules/.bun/vite* \
      ./node_modules/.bun/@next+swc-*-gnu* \
      ./node_modules/.bun/@next+swc-darwin* \
      ./node_modules/.bun/@next+swc-win32* \
      ./node_modules/.bun/@img+sharp-libvips-linux-arm64* \
      ./node_modules/.bun/@img+sharp-libvips-linux-x64* \
      ./node_modules/.bun/@img+sharp-linux-x64* 2>/dev/null || true

FROM oven/bun:1-alpine AS runner
ENV NODE_ENV=production
ENV PORT=3030
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Copy root metadata
COPY --from=builder /app/package.json /app/bun.lock /app/turbo.json /app/tsconfig.base.json /app/eslint.config.mjs /app/prettier.config.mjs ./

# Copy pruned production node_modules from prod-deps stage
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy Next.js standalone traced server & runtime (without .next/cache)
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy compiled worker distribution
COPY --from=builder /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist

# Copy packages & config
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/docker ./docker
COPY --from=builder /app/.dockerignore ./.dockerignore
COPY --from=builder /app/tests ./tests

# Ensure Prisma query engine binary is available in client path
RUN mkdir -p ./apps/web/.prisma/client ./node_modules/.prisma/client && \
    CLIENT_DIR=$(find ./node_modules ./apps/web/.next/standalone -name "libquery_engine*.so.node" -exec dirname {} \; 2>/dev/null | head -n 1) && \
    if [ -n "$CLIENT_DIR" ]; then \
      cp -r "$CLIENT_DIR"/* ./apps/web/.prisma/client/ 2>/dev/null || true ; \
      cp -r "$CLIENT_DIR"/* ./node_modules/.prisma/client/ 2>/dev/null || true ; \
    fi

EXPOSE 3030
CMD ["bun", "apps/web/server.js"]
