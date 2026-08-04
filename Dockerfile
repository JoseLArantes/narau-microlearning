FROM oven/bun:1-alpine AS base
WORKDIR /app

COPY package.json turbo.json tsconfig.base.json eslint.config.mjs prettier.config.mjs ./
COPY apps ./apps
COPY packages ./packages
RUN bun install

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

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/packages ./packages

# Copy Prisma query engine binaries for Next.js runtime
RUN mkdir -p ./apps/web/.prisma/client ./node_modules/.prisma/client && \
    CLIENT_DIR=$(find ./node_modules -name "libquery_engine*.so.node" -exec dirname {} \; | head -n 1) && \
    if [ -n "$CLIENT_DIR" ]; then \
      cp -r "$CLIENT_DIR"/* ./apps/web/.prisma/client/ ; \
      cp -r "$CLIENT_DIR"/* ./node_modules/.prisma/client/ ; \
    fi

EXPOSE 3030
CMD ["bun", "apps/web/node_modules/next/dist/bin/next", "start", "apps/web"]
