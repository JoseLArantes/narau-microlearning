# Daily Curio

One small, well-sourced thing to learn every day — a micro-learning app.

A production-style monorepo: Next.js web app, a Node worker that ingests Wikipedia content and picks a daily subject per area, PostgreSQL + Prisma, Redis + BullMQ, Auth.js magic-link login, Mailpit locally, MinIO (S3-compatible) storage.

## Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Web**: Next.js (App Router, RSC, Server Actions), React 19, TypeScript (strict), Tailwind CSS, shadcn-style Radix UI, TanStack Query, React Hook Form, Zod
- **Worker**: Node, BullMQ, Wikipedia REST/API client, S3 storage
- **Data**: PostgreSQL 16, Prisma, Redis 7
- **Auth**: Auth.js magic-link emails via SMTP
- **Infra**: Docker Compose (Postgres, Redis, Mailpit, MinIO), GitHub Actions CI

## Quick start

```bash
# 1. Infra (Postgres, Redis, Mailpit, MinIO)
docker compose -f docker/docker-compose.yml up -d

# 2. Env
cp .env.example .env

# 3. Install + generate client
pnpm install

# 4. Migrate + seed (admin@example.com / user@example.com)
pnpm db:migrate
pnpm db:seed

# 5. Run everything
pnpm dev        # web at http://localhost:3030
pnpm worker:dev # queue worker
```

Magic-link emails land in Mailpit at http://localhost:8025.

## Worker jobs

Run manually, or let the repeatables handle it:

```bash
pnpm job:ingest   # pull Wikipedia categories for each area -> candidates
pnpm job:select   # pick one high-quality subject per area per day
pnpm job:assign   # assign each user their daily item
pnpm job:remind   # send reminder emails for unread items
```

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Run the web app (port 3030) |
| `pnpm worker:dev` | Run the queue worker |
| `pnpm job:<name>` | Run a job once |
| `pnpm db:migrate` / `db:seed` / `db:studio` | Prisma migrate, seed, studio |
| `pnpm lint` / `typecheck` / `test` / `build` | Turbo across the monorepo |
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
