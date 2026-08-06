FROM oven/bun:1-alpine AS base
WORKDIR /app

COPY package.json bun.lock turbo.json tsconfig.base.json eslint.config.mjs prettier.config.mjs ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/worker/package.json ./apps/worker/package.json
COPY packages/ai-curation/package.json ./packages/ai-curation/package.json
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
ENV WIKIPEDIA_REQUEST_DELAY_MS=10000
RUN bun run build

FROM dev-deps AS runtime-files
ARG TARGETARCH

# Next standalone already contains the traced application runtime. Keep only
# the external packages needed by Prisma and the worker CLI. The worker's
# other dependencies are bundled by tsup.
RUN set -eux; \
    mkdir -p /runtime/node_modules/@prisma /runtime/node_modules/.prisma; \
    client_dir="$(find /app/node_modules/.bun -maxdepth 1 -type d -name '@prisma+client@*' | head -n 1)/node_modules/@prisma/client"; \
    client_store_dir="$(dirname "$(dirname "$(dirname "$client_dir")")")"; \
    client_store_name="$(basename "$client_store_dir")"; \
    cp -R "$client_dir" /runtime/node_modules/@prisma/client; \
    generated_dir="$(dirname "$(dirname "$client_dir")")/.prisma/client"; \
    cp -R "$generated_dir" /runtime/node_modules/.prisma/client; \
    package_dir="$(find /app/node_modules/.bun -maxdepth 1 -type d -name 'nodemailer@*' | head -n 1)/node_modules/nodemailer"; \
    mkdir -p /runtime/node_modules/nodemailer; \
    cp -R "$package_dir"/. /runtime/node_modules/nodemailer/; \
    find /runtime/node_modules/@prisma/client -type f \( -name '*.map' -o -name '*.d.ts' -o -name '*.md' \) -delete; \
    find /runtime/node_modules/@prisma/client/runtime -type f -name '*wasm*' -delete; \
    rm -rf /runtime/node_modules/@prisma/client/generator-build /runtime/node_modules/@prisma/client/scripts; \
    find /runtime/node_modules/.prisma/client -type f \( -name '*.d.ts' -o -name '*.map' -o -name '*wasm*' \) -delete; \
    if [ "$TARGETARCH" = "arm64" ]; then \
      rm -f /runtime/node_modules/.prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node; \
    elif [ "$TARGETARCH" = "amd64" ]; then \
      rm -f /runtime/node_modules/.prisma/client/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node; \
    fi; \
    mkdir -p "/runtime/node_modules/.bun/$client_store_name/node_modules/@prisma"; \
    cp -R /runtime/node_modules/@prisma/client "/runtime/node_modules/.bun/$client_store_name/node_modules/@prisma/client"; \
    mkdir -p "/runtime/node_modules/.bun/$client_store_name/node_modules/.prisma"; \
    cp -R /runtime/node_modules/.prisma/client "/runtime/node_modules/.bun/$client_store_name/node_modules/.prisma/client"

FROM oven/bun:1-alpine AS migrator
ARG TARGETARCH
WORKDIR /migration
COPY docker/migrator/package.json ./package.json
COPY packages/database/prisma ./prisma
COPY packages/database/src ./src
RUN bun install --no-save --exact && \
    bunx prisma generate && \
    find ./node_modules -type f \( -name '*.map' -o -name '*.d.ts' -o -name '*.md' \) -delete && \
    find ./node_modules/@prisma/client/runtime -type f -name '*wasm*' -delete && \
    find ./node_modules/.prisma/client -type f -name '*wasm*' -delete && \
    rm -rf ./node_modules/@prisma/client/generator-build ./node_modules/@prisma/client/scripts && \
    if [ "$TARGETARCH" = "arm64" ]; then \
      rm -f ./node_modules/.prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node ./node_modules/prisma/libquery_engine-linux-musl-openssl-3.0.x.so.node; \
    elif [ "$TARGETARCH" = "amd64" ]; then \
      rm -f ./node_modules/.prisma/client/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node ./node_modules/prisma/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node; \
    fi; \
    rm -rf /root/.bun/install/cache
CMD ["sh", "-c", "bunx prisma migrate deploy && bun run prisma/seed.ts"]

FROM oven/bun:1-alpine AS runner
ENV NODE_ENV=production
ENV PORT=3030
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Root workspace metadata used by the worker job commands.
COPY --from=builder /app/package.json ./package.json

# Copy Next.js standalone traced server and static assets.
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Keep the compiled worker CLI available for operational jobs without its
# development source tree and dependency graph.
COPY --from=builder /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist

# Restore only external packages omitted from Next's standalone trace.
COPY --from=runtime-files /runtime/node_modules/@prisma ./node_modules/@prisma
COPY --from=runtime-files /runtime/node_modules/.prisma ./node_modules/.prisma
COPY --from=runtime-files /runtime/node_modules/.bun ./node_modules/.bun
COPY --from=runtime-files /runtime/node_modules/nodemailer ./node_modules/nodemailer

RUN find ./apps/worker/dist -type f -name '*.map' -delete

EXPOSE 3030
CMD ["bun", "apps/web/server.js"]
