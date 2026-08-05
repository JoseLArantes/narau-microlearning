# Narau

Narau is a micro-learning app that gives each user one small, well-sourced thing to learn every day.

It is a TypeScript monorepo containing a Next.js web application, a Bun worker for content ingestion and daily assignment, shared packages, and a Docker Compose development stack.

## Stack

- **Monorepo:** Bun workspaces and Turborepo
- **Web:** Next.js App Router, React, TypeScript, Tailwind CSS, Radix UI
- **Worker:** Bun, BullMQ, Redis, and a typed Wikipedia client
- **Data:** PostgreSQL 16 and Prisma
- **Authentication:** Auth.js magic links through SMTP
- **Local infrastructure:** Docker Compose, Mailpit, and MinIO

## Prerequisites

- Docker Desktop with Docker Compose v2
- Bun 1.2 or newer for local development
- Node.js 20 or newer for tools that invoke Node directly

Docker is the recommended way to run the complete application. The repository has one Compose file, located at [`docker/docker-compose.yml`](docker/docker-compose.yml), and one application image definition at [`docker/Dockerfile`](docker/Dockerfile).

## Run the complete stack

From the repository root:

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

The stack exposes:

| Service | URL or port | Purpose |
| --- | --- | --- |
| Web | http://localhost:3030 | Narau application |
| PostgreSQL | `localhost:5434` | Application database |
| Redis | `localhost:6379` | Queues and cache |
| Mailpit | http://localhost:8025 | Local email inbox |
| SMTP | `localhost:1025` | Local SMTP server |
| MinIO API | http://localhost:9000 | S3-compatible storage |
| MinIO console | http://localhost:9001 | Storage administration |

The `migrate` service uses the same `narau-web` image as the web service, applies Prisma migrations, and seeds a fresh database before the web service starts. To inspect the services or follow application logs:

```bash
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml logs -f web
```

### Tenants and language routes

Each tenant is a language-specific content boundary. Its unique slug is also its public route, so a tenant such as `pt-br` is served at `/pt-br`, `/pt-br/today`, and `/pt-br/admin`. The route is resolved from the database; adding a tenant does not require adding a code constant or changing the router.

Administrators manage tenants at `/en/admin/tenants` (or the equivalent route for the current tenant). Open a tenant's content from that page to work inside its isolated catalog. Areas, subjects, candidates, daily selections, assignments, reports, and learning history are tenant-scoped at both the application and database boundaries.

The ingestion, selection, assignment, and reminder workers are shared. They iterate over active tenants and use each tenant's language tag for its Wikipedia source. Regional tags such as `pt-br` map to the `pt` Wikipedia project while remaining a distinct tenant route.

The equivalent shortcuts are:

```bash
bun run docker:up
bun run docker:down
```

## Local development

Use Docker for infrastructure and run the web app from the host for fast reloads:

```bash
cp .env.example .env
bun install
docker compose -f docker/docker-compose.yml up -d db redis mailpit minio minio-init
bun run db:migrate
bun run db:seed
bun run dev
```

The web app runs at http://localhost:3030. Start the worker in a second terminal when worker processing is needed:

```bash
bun run worker:dev
```

## Worker jobs

The one-off job commands run the compiled worker entry point. For local development, build the worker first:

```bash
bun run worker:build
```

Each job can then be run once from the repository root:

```bash
bun run job:ingest   # ingest Wikipedia candidates for each area
bun run job:select   # select one subject per area for today
bun run job:assign   # assign today's item to each user
bun run job:remind   # send reminders for unread items
```

When using the Docker Compose stack, run the same jobs inside the running application container:

```bash
docker compose -f docker/docker-compose.yml exec web bun run job:ingest
```

Ingestion processes every active tenant and area. Run selection and assignment afterward when you want the newly ingested content to appear in users' daily cards.

## Quality checks

```bash
bun run test       # repository-structure test plus workspace tests
bun run lint
bun run typecheck
bun run build
```

The container build is also a required integration check:

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

## Project layout

```text
apps/
  web/                 Next.js application and admin backoffice
  worker/              BullMQ worker and job processors
packages/
  analytics/           Event names and tracking helpers
  config/              Shared ESLint and TypeScript configuration
  content-normalizer/  Content cleaning, truncation, and hashing
  database/            Prisma schema, migrations, client, and seed
  email/               SMTP transport
  ui/                  Shared UI components and styles
  validation/          Shared Zod schemas
  wikipedia-client/    Typed Wikipedia REST client
docker/
  Dockerfile           Multi-stage production image
  docker-compose.yml   Single Compose definition for local infrastructure and the full stack
docs/                  Product and project documentation
tests/                 Repository-level structural tests
```

Dependencies and build output are intentionally not part of the repository. `node_modules`, `.next`, `.turbo`, and `dist` are ignored locally and excluded from Docker build contexts by [`.dockerignore`](.dockerignore).

## Multi-tenant architecture and internationalization

Narau is organized by language tenant:

- Tenants are represented by language codes: `en`, `es`, and `pt`.
- Areas, subjects, and users are bound to a tenant.
- Composite unique keys preserve tenant isolation.
- Ingestion uses the Wikipedia API for the tenant's language.
- UI translations are stored in `apps/web/public/locales/`.

## License

Content shown to users is Wikipedia content under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) and links back to its source article. Code is MIT unless stated otherwise.
