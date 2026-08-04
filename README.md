# Narau

One small, well-sourced thing to learn every day — a micro-learning app.

A production-style monorepo: Next.js web app, a Node/Bun worker that ingests Wikipedia content and picks a daily subject per area, PostgreSQL + Prisma, Redis + BullMQ, Auth.js magic-link login, Mailpit locally, MinIO (S3-compatible) storage.

## Stack

- **Monorepo**: Bun workspaces + Turborepo
- **Web**: Next.js (App Router, RSC, Server Actions), React 19, TypeScript (strict), Tailwind CSS, shadcn-style Radix UI, TanStack Query, React Hook Form, Zod
- **Worker**: Bun/Node, BullMQ, Wikipedia REST/API client, S3 storage
- **Data**: PostgreSQL 16, Prisma, Redis 7
- **Auth**: Auth.js magic-link emails via SMTP
- **Infra**: Docker Compose (Postgres, Redis, Mailpit, MinIO), GitHub Actions CI

## Quick start

The whole app runs through the root `docker-compose.yml` — web (production build), Postgres, Redis, Mailpit, and MinIO — no local dev server needed.

```bash
# 1. Build and start the full stack (web on http://localhost:3030)
docker compose up -d --build

# 2. One-time data setup (only when the stack's database is fresh):
bun run db:seed       # demo users + areas
bun run job:ingest    # pull Wikipedia candidates
bun run job:select    # pick today's subject per area
bun run job:assign    # assign each user today's item
```

Magic-link emails land in Mailpit at http://localhost:8025.

For local development instead, run the infra + dev server:

```bash
docker compose -f docker/docker-compose.yml up -d   # Postgres, Redis, Mailpit, MinIO
cp .env.example .env
bun install
bun run db:migrate && bun run db:seed
bun run dev         # web at http://localhost:3030
```

## Worker jobs

Run manually, or let the repeatables handle it:

```bash
bun run job:ingest   # pull Wikipedia categories for each area -> candidates
bun run job:select   # pick one high-quality subject per area per day
bun run job:assign   # assign each user their daily item
bun run job:remind   # send reminder emails for unread items
```

## Multi-Tenant Architecture & Internationalization (i18n)

Narau Microlearning is multi-tenant, organized by language locale:
- **Tenants**: Represented by language codes (`en` base/default English, `es` Spanish, `pt` Portuguese).
- **Content Isolation**: `Area`, `Subject`, and `User` entities are bound to `tenantId`. Composite unique keys (`@@unique([slug, tenantId])`, `@@unique([canonicalUrl, tenantId])`) enforce isolation per tenant.
- **Multi-Tenant Content Engines**: Ingestion workers query Wikipedia API endpoints matching each tenant area's language (e.g. `es.wikipedia.org` for Spanish areas). Daily selection and user item assignments operate within each tenant.
- **Persisted JSON i18n**: UI translation dictionaries are stored in JSON files (`apps/web/public/locales/en.json`, `es.json`, `pt.json`). Users can toggle their tenant/language via the header `TenantSwitcher`.

## Commands

| Command | What it does |
| --- | --- |
| `bun run dev` | Run the web app (port 3030) |
| `bun run worker:dev` | Run the queue worker |
| `bun run job:<name>` | Run a job once |
| `bun run db:migrate` / `db:seed` / `db:studio` | Prisma migrate, seed, studio |
| `bun run lint` / `typecheck` / `test` / `build` | Turbo across the monorepo |
| `docker compose up -d --build` | Full self-contained stack (web + infra) |

## Project layout

```
apps/
  web/      Next.js application (users + admin backoffice)
  worker/   BullMQ worker, job processors, Wikipedia client logic
packages/
  analytics  event names + tracking helper
  config     shared eslint / tsconfig
  content-normalizer  text cleaning, summary truncation, hashing
  database   Prisma schema, client, seed
  email      SMTP transport
  ui         design tokens + Radix components
  validation  zod schemas shared by web and worker
  wikipedia-client  typed Wikipedia REST client
```

## License

Content shown to users is Wikipedia content under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), attributed with links to the source article. Code is MIT unless stated otherwise.
