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
RUN bun install --frozen-lockfile
COPY apps ./apps
COPY packages ./packages
COPY docker ./docker
COPY .dockerignore ./
COPY tests ./tests

FROM base AS builder
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
ENV WIKIPEDIA_USER_AGENT="NarauBot/0.1 (build)"
RUN bun run build

FROM oven/bun:1-alpine AS runner
ENV NODE_ENV=production
ENV PORT=3030
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=builder /app/package.json /app/bun.lock /app/turbo.json /app/tsconfig.base.json /app/eslint.config.mjs /app/prettier.config.mjs ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/src ./apps/web/src
COPY --from=builder /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=builder /app/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=builder /app/apps/worker/src ./apps/worker/src
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/docker ./docker
COPY --from=builder /app/.dockerignore ./.dockerignore
COPY --from=builder /app/tests ./tests

# Copy Prisma query engine binaries for Next.js runtime.
RUN mkdir -p ./apps/web/.prisma/client ./node_modules/.prisma/client && \
    CLIENT_DIR=$(find ./node_modules -name "libquery_engine*.so.node" -exec dirname {} \; | head -n 1) && \
    if [ -n "$CLIENT_DIR" ]; then \
      cp -r "$CLIENT_DIR"/* ./apps/web/.prisma/client/ ; \
      cp -r "$CLIENT_DIR"/* ./node_modules/.prisma/client/ ; \
    fi

EXPOSE 3030
CMD ["bun", "apps/web/node_modules/next/dist/bin/next", "start", "apps/web"]
