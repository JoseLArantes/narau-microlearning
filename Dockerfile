FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json eslint.config.mjs prettier.config.mjs .npmrc ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM base AS builder
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=postgresql://app:app@localhost:5432/dailycurio?schema=public
ENV REDIS_URL=redis://localhost:6379
ENV AUTH_SECRET=build-secret
ENV AUTH_URL=http://localhost:3030
ENV EMAIL_FROM="Daily Curio <no-reply@localhost>"
ENV SMTP_HOST=localhost
ENV SMTP_PORT=1025
ENV SMTP_USER=
ENV SMTP_PASS=
ENV SMTP_SECURE=false
ENV WIKIPEDIA_USER_AGENT="DailyCurioBot/0.1 (build)"
RUN pnpm build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV PORT=3030
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3030
CMD ["node", "apps/web/server.js"]
