## 1. Goal

Adapt the current setup into a production-ready boilerplate for a daily micro-learning app with the following behavior:

- Users select areas of interest.
- Every day, each active user receives one learning item.
- Content is ingested from Wikipedia using a background worker.
- One subject is selected per active area per day.
- The same subject may be assigned to all users assigned to that area.
- Users can read, mark as learned, rate, and report inaccuracies.
- Users have a dashboard with learned history grouped by area.
- Admin/backoffice can manage users, areas, daily subjects, and reports.
- The UI must feel mature, editorial, and real. It must not look childish or AI-generated.

This plan is for a **monorepo boilerplate** using:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- TanStack Query
- React Hook Form
- Zod
- Next.js API routes / Server Actions
- Modular monolith backend
- Node.js worker
- BullMQ
- Redis
- PostgreSQL
- Prisma ORM
- Auth.js magic-link email login
- SMTP email
- S3-compatible storage
- Sentry
- Local Docker Compose
- GitHub Actions
- Unit tests
- Linter
- Typecheck

The generated repository must compile, lint, typecheck, and run locally with Docker Compose.

---

## 2. Global Rules for Implementation

The implementation must follow these rules:

1. Use **pnpm** as the package manager.
2. Use **pnpm workspaces** and **Turborepo**.
3. Use **TypeScript strict mode** everywhere.
4. Use **Next.js App Router**, not Pages Router.
5. Use **React Server Components** by default.
6. Use **Server Actions** for mutations.
7. Use **REST API routes only for health checks or integration endpoints** if needed.
8. All database access must happen on the server or worker.
9. Never expose database secrets to the browser.
10. Use **Zod** for all external input validation.
11. Use **Prisma** for database access.
12. Use **BullMQ** for background jobs.
13. Use **Redis** for queues and cache.
14. Use **Docker Compose** for local PostgreSQL, Redis, Mailpit, and MinIO.
15. Do not create microservices.
16. Do not add GraphQL, tRPC, Redux, MobX, Kafka, MongoDB, or Elasticsearch.
17. Do not add unnecessary dependencies.
18. Do not use placeholder code that breaks typecheck.
19. Do not use `any` unless absolutely unavoidable.
20. Prefer simple, explicit, maintainable code.
21. All generated code must pass:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm build`

---

## 3. Product Baseline

### 3.1 Core domain

The app manages:

- Users
- Areas
- User-area assignments
- Subjects
- Area subject candidates
- Daily area subjects
- User daily items
- Ratings
- Inaccuracy reports
- Audit logs
- Analytics events

### 3.2 Daily behavior

For each UTC content date:

1. The worker ingests candidate Wikipedia pages for active areas.
2. The worker selects one subject per active area.
3. The worker assigns one daily item to each active user.
4. If a user has multiple areas, the worker randomly chooses one valid area.
5. The user sees one learning card for the day.
6. The user can mark it learned.
7. The user can rate it.
8. The user can report inaccuracies.
9. The dashboard records learned subjects grouped by area.

### 3.3 Timezone rule

For MVP:

- `contentDate` is a UTC calendar date.
- `userLocalDate` is stored for display/reporting.
- The worker generates items by UTC date.
- Timezone-aware personalization is future work.

---

## 4. Repository Layout

Generate this monorepo structure:

```text
/
├─ apps/
│  ├─ web/
│  └─ worker/
├─ packages/
│  ├─ config/
│  ├─ database/
│  ├─ validation/
│  ├─ wikipedia-client/
│  ├─ content-normalizer/
│  ├─ email/
│  ├─ analytics/
│  └─ ui/
├─ docker/
│  └─ docker-compose.yml
├─ .github/
│  └─ workflows/
│     └─ ci.yml
├─ .env.example
├─ .gitignore
├─ .npmrc
├─ package.json
├─ pnpm-workspace.yaml
├─ turbo.json
├─ tsconfig.base.json
├─ eslint.config.mjs
├─ prettier.config.mjs
└─ README.md
```

Do not create a separate `apps/admin` app for MVP. Admin functionality must be implemented inside `apps/web` under `/admin`.

---

## 5. Package Naming

Use the scope:

```text
@dailycurio
```

Packages:

```text
@dailycurio/web
@dailycurio/worker
@dailycurio/config
@dailycurio/database
@dailycurio/validation
@dailycurio/wikipedia-client
@dailycurio/content-normalizer
@dailycurio/email
@dailycurio/analytics
@dailycurio/ui
```

---

## 6. Root Configuration

### 6.1 Root `package.json`

Required scripts:

```json
{
  "name": "dailycurio",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "format": "prettier --write .",
    "docker:up": "docker compose -f docker/docker-compose.yml up -d",
    "docker:down": "docker compose -f docker/docker-compose.yml down",
    "db:migrate": "pnpm --filter @dailycurio/database db:migrate",
    "db:push": "pnpm --filter @dailycurio/database db:push",
    "db:generate": "pnpm --filter @dailycurio/database db:generate",
    "db:seed": "pnpm --filter @dailycurio/database db:seed",
    "db:studio": "pnpm --filter @dailycurio/database db:studio",
    "worker:dev": "pnpm --filter @dailycurio/worker dev",
    "worker:build": "pnpm --filter @dailycurio/worker build",
    "job:ingest": "pnpm --filter @dailycurio/worker job:ingest",
    "job:select": "pnpm --filter @dailycurio/worker job:select",
    "job:assign": "pnpm --filter @dailycurio/worker job:assign",
    "postinstall": "pnpm --filter @dailycurio/database db:generate"
  }
}
```

### 6.2 `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 6.3 `turbo.json`

Use Turborepo tasks:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {},
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 6.4 Root TypeScript config

`tsconfig.base.json` must enable strict mode:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

Web app may add `DOM` to `lib`.

Worker app may add Node types.

---

## 7. Environment Variables

Create `.env.example`.

```env
# App
NODE_ENV=development
APP_URL=http://localhost:3030

# Database
DATABASE_URL=postgresql://app:app@localhost:5432/dailycurio?schema=public

# Redis
REDIS_URL=redis://localhost:6379

# Auth.js
AUTH_SECRET=change-me
AUTH_URL=http://localhost:3030
AUTH_TRUST_HOST=true

# Email / SMTP
EMAIL_FROM="Daily Curio <no-reply@localhost>"
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false

# Storage / S3-compatible
STORAGE_ENABLED=false
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_BUCKET=dailycurio
STORAGE_REGION=us-east-1
STORAGE_PUBLIC_BASE_URL=http://localhost:9000/dailycurio

# Wikipedia
WIKIPEDIA_USER_AGENT="DailyCurioBot/0.1 (local dev; contact@example.com)"

# Sentry
SENTRY_DSN=
```

Local Docker services:

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Mailpit SMTP: `localhost:1025`
- Mailpit UI: `http://localhost:8025`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

---

## 8. Docker Compose

Create `docker/docker-compose.yml`.

It must start:

- PostgreSQL 16
- Redis 7
- Mailpit
- MinIO
- MinIO bucket initializer

```yaml
name: dailycurio

services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: dailycurio
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d dailycurio"]
      interval: 5s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 10

  mailpit:
    image: axllent/mailpit
    restart: unless-stopped
    ports:
      - "1025:1025"
      - "8025:8025"

  minio:
    image: minio/minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

  minio-init:
    image: minio/mc
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      sleep 3;
      mc alias set local http://minio:9000 minioadmin minioadmin;
      mc mb --ignore-existing local/dailycurio;
      mc anonymous set download local/dailycurio;
      exit 0;
      "

volumes:
  db_data:
  minio_data:
```

---

## 9. Database Package

Package name:

```text
@dailycurio/database
```

Structure:

```text
packages/database/
├─ package.json
├─ tsconfig.json
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
└─ src/
   ├─ index.ts
   └─ client.ts
```

### 9.1 Database package scripts

```json
{
  "name": "@dailycurio/database",
  "scripts": {
    "build": "tsc --noEmit",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run --passWithNoTests",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

### 9.2 Prisma schema

Use PostgreSQL.

The schema must include these models and enums:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
  MODERATOR
}

enum UserStatus {
  INVITED
  ACTIVE
  DISABLED
}

enum AreaStatus {
  ACTIVE
  DISABLED
}

enum SubjectSource {
  WIKIPEDIA
  FALLBACK
  MANUAL
}

enum SubjectStatus {
  ACTIVE
  UNDER_REVIEW
  HIDDEN
}

enum CandidateStatus {
  CANDIDATE
  SELECTED
  REJECTED
  USED
}

enum DailySubjectStatus {
  DRAFT
  PUBLISHED
  HIDDEN
  REPLACED
}

enum UserDailyItemStatus {
  PENDING
  VIEWED
  LEARNED
  SKIPPED
  MISSED
  REPLACED
}

enum ReportReason {
  INACCURATE
  OUTDATED
  OFFENSIVE
  MISLEADING_SUMMARY
  BROKEN_SOURCE
  COPYRIGHT
  OTHER
}

enum ReportStatus {
  NEW
  REVIEWING
  RESOLVED
  DISMISSED
}

model User {
  id            String        @id @default(cuid())
  name          String?
  email         String        @unique
  emailVerified DateTime?
  image         String?
  role          Role          @default(USER)
  status        UserStatus    @default(ACTIVE)
  timezone      String        @default("UTC")
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  accounts       Account[]
  sessions       Session[]
  userAreas      UserArea[]
  dailyItems     UserDailyItem[]
  reports        InaccuracyReport[]
  auditLogs      AuditLog[]
  analyticsEvents AnalyticsEvent[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Area {
  id           String     @id @default(cuid())
  name         String     @unique
  slug         String     @unique
  description  String?
  iconUrl      String?
  color        String?
  status       AreaStatus @default(ACTIVE)
  displayOrder Int        @default(0)
  sourceConfig Json
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  userAreas       UserArea[]
  candidates      AreaSubjectCandidate[]
  dailySubjects   DailyAreaSubject[]
  userDailyItems  UserDailyItem[]
}

model Subject {
  id                String        @id @default(cuid())
  source            SubjectSource @default(WIKIPEDIA)
  sourcePageId      String?
  title             String
  canonicalUrl      String        @unique
  summary           String
  hook              String?
  imageUrl          String?
  imageLicense      String?
  imageAttribution  String?
  contentHash       String        @unique
  language          String        @default("en")
  revisionId        String?
  retrievedAt       DateTime      @default(now())
  license           String?
  qualityScore      Float         @default(0)
  safetyScore       Float         @default(100)
  status            SubjectStatus @default(ACTIVE)
  raw               Json?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  candidates      AreaSubjectCandidate[]
  dailySubjects   DailyAreaSubject[]
  userDailyItems  UserDailyItem[]
  reports         InaccuracyReport[]

  @@index([source, sourcePageId])
  @@index([status])
}

model AreaSubjectCandidate {
  id                 String          @id @default(cuid())
  areaId             String
  subjectId          String
  generatedForDate   DateTime        @db.Date
  candidateScore     Float           @default(0)
  status             CandidateStatus @default(CANDIDATE)
  createdAt          DateTime        @default(now())

  area    Area    @relation(fields: [areaId], references: [id], onDelete: Cascade)
  subject Subject @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  @@unique([areaId, subjectId, generatedForDate])
  @@index([areaId, generatedForDate, status])
}

model DailyAreaSubject {
  id          String             @id @default(cuid())
  contentDate DateTime           @db.Date
  areaId      String
  subjectId   String
  status      DailySubjectStatus @default(PUBLISHED)
  selectedBy  String?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  area           Area            @relation(fields: [areaId], references: [id], onDelete: Cascade)
  subject        Subject         @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  userDailyItems UserDailyItem[]

  @@unique([contentDate, areaId])
  @@index([contentDate, status])
}

model UserArea {
  userId           String
  areaId           String
  preferenceWeight Float    @default(1)
  assignedBy       String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  area Area @relation(fields: [areaId], references: [id], onDelete: Cascade)

  @@id([userId, areaId])
}

model UserDailyItem {
  id                 String              @id @default(cuid())
  userId             String
  contentDate        DateTime            @db.Date
  userLocalDate      DateTime            @db.Date
  areaId             String
  subjectId          String
  dailyAreaSubjectId String?
  status             UserDailyItemStatus @default(PENDING)
  assignedAt         DateTime            @default(now())
  viewedAt           DateTime?
  learnedAt          DateTime?
  rating             Int?
  ratingComment      String?
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  user             User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  area             Area               @relation(fields: [areaId], references: [id], onDelete: Cascade)
  subject          Subject            @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  dailyAreaSubject DailyAreaSubject?  @relation(fields: [dailyAreaSubjectId], references: [id], onDelete: SetNull)
  reports          InaccuracyReport[]

  @@unique([userId, contentDate])
  @@index([userId, status, contentDate])
}

model InaccuracyReport {
  id              String       @id @default(cuid())
  userId          String?
  userDailyItemId String?
  subjectId       String
  reason          ReportReason
  details         String?
  status          ReportStatus @default(NEW)
  createdAt       DateTime     @default(now())
  reviewedBy      String?
  reviewedAt      DateTime?
  resolutionNote  String?

  user            User?            @relation(fields: [userId], references: [id], onDelete: SetNull)
  userDailyItem   UserDailyItem?   @relation(fields: [userDailyItemId], references: [id], onDelete: Cascade)
  subject         Subject          @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  @@index([status, createdAt])
}

model AuditLog {
  id         String   @id @default(cuid())
  actorId    String?
  action     String
  entityType String
  entityId   String?
  metadata   Json?
  createdAt  DateTime @default(now())

  actor User? @relation(fields: [actorId], references: [id], onDelete: SetNull)
}

model AnalyticsEvent {
  id        String   @id @default(cuid())
  userId    String?
  name      String
  payload   Json?
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([name, createdAt])
}
```

### 9.3 Database client

Export a singleton Prisma client:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### 9.4 Seed script

Seed must create:

1. Admin user:

```text
email: admin@example.com
role: ADMIN
status: ACTIVE
```

2. Normal user:

```text
email: user@example.com
role: USER
status: ACTIVE
```

3. Areas:

```text
Science
History
Art
Technology
Space
```

Example area `sourceConfig`:

```json
{
  "categories": ["Category:Science"],
  "includeSubcategories": true,
  "depth": 1,
  "maxCandidates": 100,
  "excludeCategories": ["Category:Disambiguation pages"]
}
```

4. Assign admin and normal user to at least:

```text
Science
History
Technology
```

Seed must be idempotent.

---

## 10. Validation Package

Package name:

```text
@dailycurio/validation
```

Structure:

```text
packages/validation/
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ index.ts
   ├─ area.ts
   ├─ user.ts
   ├─ today.ts
   ├─ report.ts
   └─ admin.ts
```

Use Zod.

Required schemas:

```ts
areaSourceConfigSchema
createAreaSchema
updateAreaSchema
onboardingAreasSchema
ratingSchema
reportSchema
createUserSchema
assignUserAreasSchema
overrideDailySubjectSchema
```

Rules:

- Area slugs must be URL-safe.
- Area source config must contain at least one Wikipedia category.
- Rating must be integer from 1 to 5.
- Report details max length: 2000.
- User email must be valid email.
- All schemas must be exported from package entrypoint.

Example:

```ts
import { z } from "zod";

export const areaSourceConfigSchema = z.object({
  categories: z.array(z.string().min(1)).min(1),
  includeSubcategories: z.boolean().default(true),
  depth: z.number().int().min(0).max(3).default(1),
  maxCandidates: z.number().int().min(10).max(500).default(100),
  excludeCategories: z.array(z.string()).default([])
});
```

---

## 11. Wikipedia Client Package

Package name:

```text
@dailycurio/wikipedia-client
```

Structure:

```text
packages/wikipedia-client/
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ index.ts
   ├─ client.ts
   ├─ types.ts
   └─ utils.ts
```

Dependencies:

```text
zod
p-limit
p-retry
```

The client must use native `fetch`.

Required functions:

```ts
createWikipediaClient(options)
getCategoryMembers(categoryTitle, options)
getPagesFromCategories(categories, options)
getPageDetails(pageIds)
getPageSummary(title)
```

Rules:

- Use official Wikipedia APIs.
- Do not scrape HTML pages directly.
- Send a custom User-Agent from `WIKIPEDIA_USER_AGENT`.
- Limit concurrency with `p-limit`.
- Retry failed requests with `p-retry`.
- Return typed results.
- Handle API errors gracefully.
- Do not throw on individual page failures unless all retries fail.

Example endpoints:

```text
https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle={category}&format=json

https://en.wikipedia.org/api/rest_v1/page/summary/{title}

https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages|info|revisions|categories&titles={title}&format=json
```

---

## 12. Content Normalizer Package

Package name:

```text
@dailycurio/content-normalizer
```

Structure:

```text
packages/content-normalizer/
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ index.ts
   ├─ normalize.ts
   ├─ clean.ts
   └─ hash.ts
```

Required exports:

```ts
normalizeWikipediaContent(input)
cleanText(text)
truncateToSentence(text, maxWords)
createContentHash(input)
```

Normalization rules:

1. Remove citation markers such as:
   - `[1]`
   - `[2]`
   - `[citation needed]`
   - `[note 1]`
2. Remove HTML tags.
3. Collapse whitespace.
4. Remove empty parentheses where safe.
5. Preserve plain readable text.
6. Truncate summary to 60–120 words.
7. Truncate at sentence boundary when possible.
8. Generate a stable SHA-256 content hash.

The package must include unit tests for:

- citation removal
- whitespace normalization
- sentence truncation
- content hash stability

---

## 13. Email Package

Package name:

```text
@dailycurio/email
```

Structure:

```text
packages/email/
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ index.ts
   └─ transport.ts
```

Use `nodemailer`.

Required exports:

```ts
createMailTransport()
sendEmail(options)
```

Rules:

- Read SMTP settings from environment.
- Support local Mailpit without auth.
- Support any SMTP provider via environment variables.
- Do not crash if SMTP is unavailable during tests.
- In test environment, log email instead of sending.

---

## 14. Analytics Package

Package name:

```text
@dailycurio/analytics
```

Structure:

```text
packages/analytics/
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ index.ts
   └─ events.ts
```

Required event names:

```ts
USER_INVITED
USER_LOGGED_IN
ONBOARDING_COMPLETED
AREA_SELECTED
TODAY_VIEWED
ITEM_MARKED_LEARNED
RATING_SUBMITTED
REPORT_SUBMITTED
SOURCE_LINK_CLICKED
DASHBOARD_VIEWED
ADMIN_USER_CREATED
ADMIN_AREA_CREATED
ADMIN_SUBJECT_OVERRIDDEN
REPORT_RESOLVED
```

The package should export:

```ts
AnalyticsEventName
trackEvent(name, payload)
```

For MVP, `trackEvent` may write to database using an injected callback or simply log in development. Do not couple it tightly to the database package.

---

## 15. UI Package

Package name:

```text
@dailycurio/ui
```

Structure:

```text
packages/ui/
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ index.ts
   ├─ components/
   │  ├─ button.tsx
   │  ├─ card.tsx
   │  ├─ input.tsx
   │  ├─ label.tsx
   │  ├─ textarea.tsx
   │  ├─ dialog.tsx
   │  ├─ table.tsx
   │  ├─ badge.tsx
   │  ├─ select.tsx
   │  └─ empty-state.tsx
   └─ styles/
      └─ globals.css
```

Requirements:

- Use Tailwind CSS.
- Use Radix UI primitives.
- Use shadcn/ui-style components.
- Export components from package entrypoint.
- Components must be accessible.
- Visual style must be mature and editorial.

Design constraints:

- Neutral backgrounds.
- Strong typography.
- Editorial card layout.
- Restrained accent color.
- Soft shadows.
- Small or medium border radius.
- Minimal icons.
- Mature empty states.
- Clear source attribution.

Avoid:

- Bright candy gradients.
- Cartoon icons.
- Large mascot illustrations.
- Confetti.
- Overly rounded bubble UI.
- Fake futuristic glow.
- Generic AI landing-page aesthetics.

---

## 16. Web App

Package name:

```text
@dailycurio/web
```

Use:

- Next.js App Router
- React Server Components
- Server Actions
- Tailwind CSS
- shadcn/ui
- Radix UI
- TanStack Query
- React Hook Form
- Zod
- Auth.js
- Sentry

### 16.1 Web app structure

```text
apps/web/
├─ package.json
├─ next.config.mjs
├─ tailwind.config.ts
├─ postcss.config.mjs
├─ tsconfig.json
├─ public/
└─ src/
   ├─ app/
   │  ├─ layout.tsx
   │  ├─ page.tsx
   │  ├─ globals.css
   │  ├─ login/
   │  │  └─ page.tsx
   │  ├─ onboarding/
   │  │  └─ page.tsx
   │  ├─ today/
   │  │  └─ page.tsx
   │  ├─ dashboard/
   │  │  └─ page.tsx
   │  ├─ settings/
   │  │  └─ page.tsx
   │  ├─ admin/
   │  │  ├─ page.tsx
   │  │  ├─ users/
   │  │  │  └─ page.tsx
   │  │  ├─ areas/
   │  │  │  └─ page.tsx
   │  │  ├─ subjects/
   │  │  │  └─ page.tsx
   │  │  └─ reports/
   │  │     └─ page.tsx
   │  └─ api/
   │     ├─ auth/
   │     │  └─ [...nextauth]/
   │     │     └─ route.ts
   │     └─ health/
   │        └─ route.ts
   ├─ components/
   │  ├─ providers/
   │  ├─ layout/
   │  ├─ today/
   │  ├─ dashboard/
   │  ├─ forms/
   │  └─ admin/
   ├─ server/
   │  ├─ auth.ts
   │  ├─ guards.ts
   │  ├─ actions/
   │  ├─ services/
   │  └─ repositories/
   ├─ lib/
   │  ├─ date.ts
   │  ├─ env.ts
   │  ├─ sentry.client.ts
   │  ├─ sentry.server.ts
   │  └─ utils.ts
   └─ middleware.ts
```

### 16.2 Next.js config

`next.config.mjs` must include:

```js
const nextConfig = {
  output: "standalone",
  transpilePackages: [
    "@dailycurio/ui",
    "@dailycurio/validation",
    "@dailycurio/analytics"
  ],
  serverExternalPackages: [
    "@prisma/client",
    "nodemailer"
  ]
};

export default nextConfig;
```

### 16.3 Authentication

Use Auth.js magic-link email login.

Required file:

```text
src/server/auth.ts
```

Requirements:

- Use Prisma adapter.
- Use Email provider.
- Use SMTP transport from environment variables.
- Add user id and role to session.
- Protect app routes.
- Protect admin routes.

Public pages:

```text
/
/login
/api/health
/api/auth/*
```

Authenticated user pages:

```text
/onboarding
/today
/dashboard
/settings
```

Admin-only pages:

```text
/admin
/admin/users
/admin/areas
/admin/subjects
/admin/reports
```

Middleware must:

1. Redirect unauthenticated users to `/login`.
2. Redirect authenticated users without area selections to `/onboarding`.
3. Redirect non-admin users away from `/admin`.

### 16.4 Server actions

Create server actions under:

```text
src/server/actions/
```

Required action files:

```text
onboarding.ts
today.ts
settings.ts
admin/users.ts
admin/areas.ts
admin/daily-subjects.ts
admin/reports.ts
```

Each action must:

1. Validate input with Zod.
2. Check authorization.
3. Call a service/repository.
4. Return a typed result.
5. Handle expected errors gracefully.

Recommended result type:

```ts
type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
```

Required actions:

```ts
selectOnboardingAreas
markTodayViewed
markTodayLearned
rateTodayItem
reportTodayItem
updateUserAreas

adminCreateUser
adminUpdateUser
adminAssignAreas

adminCreateArea
adminUpdateArea
adminDisableArea

adminOverrideDailySubject

adminResolveReport
adminDismissReport
adminHideSubject
```

### 16.5 Server services

Create services under:

```text
src/server/services/
```

Required services:

```text
users.ts
areas.ts
today.ts
dashboard.ts
admin.ts
reports.ts
```

Important service behavior:

#### `TodayService.getCurrentItem(userId)`

Returns the current UTC day item for the user.

If no item exists, call `ensureCurrentItem`.

#### `TodayService.ensureCurrentItem(userId)`

If the user has no item for current UTC date:

1. Load user active areas.
2. Load published daily subjects for current UTC date.
3. Filter valid area subjects.
4. Randomly select one area.
5. Create `UserDailyItem` with status `PENDING`.
6. Use upsert to remain idempotent.

This allows users created after worker runs to still receive a daily item.

#### `DashboardService.getHistory(userId)`

Returns learned items grouped by area.

### 16.6 UI pages

#### Landing page `/`

Simple editorial landing page.

Must include:

- Product name.
- Short value proposition.
- Login button.

Do not make it look like a generic AI landing page.

#### Login `/login`

Must include:

- Email input.
- Magic-link submit button.
- Message after request is sent.
- Link to Mailpit in local development.

#### Onboarding `/onboarding`

Must include:

- Area selection.
- Minimum one area required.
- Save with Server Action.
- Redirect to `/today` after saving.

#### Today `/today`

Main learning screen.

Must show:

- Area badge.
- Subject title.
- Summary.
- Image if available.
- Reading time estimate.
- Original source link.
- Wikipedia attribution.
- License text.
- Button: `I learned this`.
- Rating dialog after learning.
- Report dialog.

Must handle:

- Pending state.
- Viewed state.
- Learned state.
- Missing daily item empty state.

#### Dashboard `/dashboard`

Must show:

- Total learned count.
- Current streak.
- Recent history.
- History grouped by area.
- Source links.
- Pending recent items.

#### Settings `/settings`

Must allow:

- Updating selected areas.
- Viewing account email.
- Sign out.

#### Admin pages

Admin area must include:

- Users list and create form.
- Areas list and create form.
- Daily subjects list by date.
- Reports queue.
- Subject moderation actions.

Use tables, dialogs, and forms.

---

## 17. Worker App

Package name:

```text
@dailycurio/worker
```

Structure:

```text
apps/worker/
├─ package.json
├─ tsconfig.json
├─ tsup.config.ts
└─ src/
   ├─ index.ts
   ├─ cli.ts
   ├─ lib/
   │  ├─ env.ts
   │  ├─ redis.ts
   │  ├─ queue.ts
   │  ├─ logger.ts
   │  ├─ date.ts
   │  └─ storage.ts
   ├─ jobs/
   │  ├─ ingest-area-candidates.ts
   │  ├─ select-daily-subjects.ts
   │  ├─ assign-user-items.ts
   │  └─ send-daily-reminders.ts
   └─ services/
      ├─ wikipedia-ingestion.ts
      ├─ candidate-scoring.ts
      ├─ subject-selection.ts
      └─ user-assignment.ts
```

### 17.1 Worker dependencies

Required:

```text
bullmq
ioredis
zod
p-limit
p-retry
cheerio
sanitize-html
@aws-sdk/client-s3
@dailycurio/database
@dailycurio/wikipedia-client
@dailycurio/content-normalizer
@dailycurio/validation
@dailycurio/email
```

Dev dependencies:

```text
tsx
tsup
typescript
vitest
@types/node
```

### 17.2 Worker scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup src/index.ts src/cli.ts --format esm --target node20",
    "start": "node dist/index.js",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run --passWithNoTests",
    "job:ingest": "tsx src/cli.ts ingest-area-candidates",
    "job:select": "tsx src/cli.ts select-daily-subjects",
    "job:assign": "tsx src/cli.ts assign-user-daily-items"
  }
}
```

### 17.3 Queue

Use one main queue:

```ts
const QUEUE_NAME = "dailycurio";
```

Jobs:

```text
ingest.area-candidates
daily.select-area-subjects
daily.assign-user-items
notify.daily-reminder
```

Use BullMQ repeatable jobs.

Suggested UTC schedule:

```text
ingest.area-candidates        00:00 UTC
daily.select-area-subjects    00:20 UTC
daily.assign-user-items       00:40 UTC
notify.daily-reminder         08:00 UTC
```

The worker must:

- Start BullMQ workers.
- Register processors.
- Handle retries.
- Gracefully shut down on SIGTERM/SIGINT.
- Log job start/success/failure.
- Initialize Sentry if `SENTRY_DSN` is set.

### 17.4 Job: ingest-area-candidates

Purpose:

Generate candidate subjects for each active area.

Logic:

1. Get current UTC date.
2. Load active areas.
3. Parse area `sourceConfig` with Zod.
4. For each area:
   - Load Wikipedia categories.
   - Optionally load subcategories up to configured depth.
   - Collect candidate page IDs.
   - Fetch page details.
   - Filter pages.
   - Normalize content.
   - Create or update subject.
   - Create `AreaSubjectCandidate`.

Filtering rules:

- Include namespace article pages only.
- Exclude disambiguation pages.
- Exclude list pages.
- Exclude stubs.
- Exclude pages with missing summary.
- Exclude pages with summary shorter than 80 characters.
- Exclude pages already used in same area within last 180 days.
- Exclude pages with unsafe categories if configured.

Scoring rules:

```text
qualityScore =
  + 40 if summary length between 200 and 1200 characters
  + 20 if image exists
  + 10 if first sentence appears definitional
  + 10 if page has categories
  - 50 if disambiguation-like
  - 50 if list-like
  - 30 if stub-like
```

Clamp score between 0 and 100.

Store raw API response in `Subject.raw` only if useful and not too large.

### 17.5 Job: select-daily-subjects

Purpose:

Select one subject per active area for current UTC date.

Logic:

1. Get current UTC date.
2. For each active area:
   - Find candidates for date with status `CANDIDATE`.
   - Exclude hidden subjects.
   - Exclude subjects already used recently.
   - Select highest-scoring candidates with randomized tie-break.
   - Pick one subject.
   - Upsert `DailyAreaSubject`.
   - Mark candidate as `SELECTED`.
   - Mark other candidates as `REJECTED` or leave as candidates.

Rules:

- Unique constraint: one published subject per area per date.
- If no candidates exist, skip area and log warning.
- Admin override must not be overwritten.

### 17.6 Job: assign-user-items

Purpose:

Assign one daily item to each active user.

Logic:

1. Get current UTC date.
2. Load active users with at least one active area.
3. For each user:
   - Load user areas.
   - Load published daily subjects for those areas.
   - Exclude subjects already learned by user.
   - Exclude hidden subjects.
   - Randomly choose one valid area.
   - Upsert `UserDailyItem`.

Rules:

- `UserDailyItem` unique per user per content date.
- If item already exists, do not replace it.
- If no valid subject exists, do not create an invalid item.
- Store `userLocalDate` using user timezone if possible, otherwise UTC.

### 17.7 Job: send-daily-reminders

Purpose:

Send optional reminder emails for pending items.

Logic:

1. Find users with current UTC day item still `PENDING`.
2. Send email using SMTP.
3. Do not fail the whole job if one email fails.
4. Log failures.

Email copy must be calm and mature.

Example subject:

```text
Your tiny thing for today is ready
```

### 17.8 CLI

`src/cli.ts` must support manual execution:

```text
pnpm job:ingest
pnpm job:select
pnpm job:assign
```

Optional flags:

```text
--date=YYYY-MM-DD
```

If no date is provided, use current UTC date.

---

## 18. Storage

Use S3-compatible storage.

For local development:

- MinIO.
- Bucket: `dailycurio`.
- Public read access for local bucket is acceptable.

Worker storage behavior:

- If `STORAGE_ENABLED=false`, keep original Wikipedia image URL.
- If `STORAGE_ENABLED=true`, download image and upload to storage.
- Store uploaded public URL in `Subject.imageUrl`.
- Store image license and attribution.
- If image license is unclear, do not store/display image.

Storage key pattern:

```text
subjects/{subjectId}/image.{ext}
```

---

## 19. Sentry

Integrate Sentry in both web and worker.

Web:

- Use `@sentry/nextjs`.
- Initialize only if `SENTRY_DSN` is set.
- Add global error boundary.
- Add server instrumentation.

Worker:

- Use `@sentry/node`.
- Capture job errors.
- Log job context.

Do not crash local development if Sentry DSN is empty.

---

## 20. Testing

Use Vitest.

Required test coverage:

### 20.1 Unit tests

Must include tests for:

- Content normalizer citation removal.
- Content normalizer truncation.
- Content hash stability.
- Validation schemas accepting valid input.
- Validation schemas rejecting invalid input.
- Candidate scoring basic rules.
- User assignment idempotency using mocked repository.

### 20.2 Test rules

- Tests must not require live Wikipedia network access.
- Tests must not require live SMTP.
- Tests must not require live Redis unless explicitly marked integration.
- Mock external dependencies.

### 20.3 Commands

Each package must support:

```text
pnpm test
```

Root must support:

```text
pnpm test
```

---

## 21. Linting and Formatting

Use:

- ESLint
- Prettier
- Husky
- lint-staged

Root scripts:

```json
{
  "lint": "turbo run lint",
  "format": "prettier --write ."
}
```

Lint rules:

- TypeScript strict.
- No unused variables.
- No console warnings except allowed logger.
- Prefer explicit return types for exported functions.
- Prettier formatting.

Add:

```text
.husky/pre-commit
```

Pre-commit should run:

```text
pnpm lint-staged
```

`lint-staged` should run:

```text
eslint --fix
prettier --write
```

---

## 22. GitHub Actions

Create:

```text
.github/workflows/ci.yml
```

CI must run:

1. Checkout.
2. Setup pnpm.
3. Setup Node 20.
4. Install dependencies.
5. Generate Prisma client.
6. Lint.
7. Typecheck.
8. Test.
9. Build.

Use dummy environment variables for build:

```yaml
env:
  DATABASE_URL: postgresql://app:app@localhost:5432/dailycurio
  REDIS_URL: redis://localhost:6379
  AUTH_SECRET: ci-secret
  AUTH_URL: http://localhost:3030
  EMAIL_FROM: test@localhost
  SMTP_HOST: localhost
  SMTP_PORT: 1025
```

---

## 23. README Requirements

Root `README.md` must include:

1. Project overview.
2. Tech stack.
3. Prerequisites:
   - Node 20+
   - pnpm 9+
   - Docker
4. Setup instructions:

```bash
pnpm install
cp .env.example .env
pnpm docker:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

5. Service URLs:

```text
Web app: http://localhost:3030
Mailpit: http://localhost:8025
MinIO Console: http://localhost:9001
```

6. Worker commands:

```bash
pnpm worker:dev
pnpm job:ingest
pnpm job:select
pnpm job:assign
```

7. Auth note:

```text
Magic-link emails are visible in Mailpit during local development.
```

---

## 24. Implementation Order

The LLM or developer should implement in this order:

### Step 1: Root monorepo

Create:

- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `.gitignore`
- `.env.example`
- `README.md`
- ESLint config
- Prettier config
- Husky config

### Step 2: Docker

Create:

- `docker/docker-compose.yml`

Services:

- PostgreSQL
- Redis
- Mailpit
- MinIO
- MinIO initializer

### Step 3: Shared packages

Create in this order:

1. `packages/config`
2. `packages/database`
3. `packages/validation`
4. `packages/content-normalizer`
5. `packages/wikipedia-client`
6. `packages/email`
7. `packages/analytics`
8. `packages/ui`

### Step 4: Database schema and seed

Implement:

- Prisma schema
- Prisma client export
- Seed script

Then:

```bash
pnpm db:migrate
pnpm db:seed
```

### Step 5: Worker

Implement:

- Redis connection
- BullMQ queue
- Job processors
- CLI
- Wikipedia ingestion
- Candidate scoring
- Daily subject selection
- User assignment

### Step 6: Web app foundation

Implement:

- Next.js app
- Tailwind
- UI package integration
- Sentry initialization
- Health endpoint
- Auth.js magic-link login

### Step 7: Core user features

Implement:

- Onboarding
- Today page
- Mark viewed
- Mark learned
- Rating
- Report
- Dashboard
- Settings

### Step 8: Admin features

Implement:

- Admin layout
- Users management
- Areas management
- Daily subjects management
- Reports moderation
- Audit logging

### Step 9: Tests and quality

Implement:

- Unit tests
- Lint scripts
- Typecheck scripts
- Build scripts

### Step 10: CI

Implement:

- GitHub Actions workflow

---

## 25. Acceptance Checklist

The boilerplate is complete when all of the following are true.

### Repository

- [ ] Monorepo exists with `apps/web` and `apps/worker`.
- [ ] Shared packages exist and are linked.
- [ ] pnpm workspaces are configured.
- [ ] Turborepo tasks run correctly.

### Local environment

- [ ] `pnpm install` succeeds.
- [ ] `pnpm docker:up` starts PostgreSQL, Redis, Mailpit, and MinIO.
- [ ] `.env.example` exists and is complete.
- [ ] `pnpm db:migrate` succeeds.
- [ ] `pnpm db:seed` creates admin, user, and areas.

### Database

- [ ] Prisma schema matches required domain.
- [ ] Unique constraints exist for daily area subjects.
- [ ] Unique constraints exist for user daily items.
- [ ] Seed is idempotent.

### Auth

- [ ] Magic-link login works locally.
- [ ] Email appears in Mailpit.
- [ ] Session contains user id and role.
- [ ] Admin routes are protected.

### Web app

- [ ] Landing page renders.
- [ ] Login page renders.
- [ ] Onboarding allows selecting areas.
- [ ] Today page shows a daily item or clear empty state.
- [ ] User can mark item learned.
- [ ] User can rate learned item.
- [ ] User can submit report.
- [ ] Dashboard shows learned items grouped by area.
- [ ] Settings allows editing areas.
- [ ] Source attribution is visible.

### Admin

- [ ] Admin can create users.
- [ ] Admin can create areas.
- [ ] Admin can assign users to areas.
- [ ] Admin can view daily subjects.
- [ ] Admin can override daily subject.
- [ ] Admin can review reports.
- [ ] Admin actions are audited.

### Worker

- [ ] Worker starts and connects to Redis.
- [ ] BullMQ jobs are registered.
- [ ] Manual CLI jobs work.
- [ ] Candidate ingestion can run against Wikipedia.
- [ ] Daily subject selection creates one subject per active area.
- [ ] User assignment creates one item per active user.
- [ ] Assignment is idempotent.
- [ ] Worker logs errors.

### Quality

- [ ] `pnpm lint` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm build` passes.
- [ ] GitHub Actions workflow is valid.

---

## 26. Coding Standards

Use these standards everywhere:

### TypeScript

- Strict mode.
- No implicit any.
- Prefer `unknown` over `any`.
- Use Zod to parse unknown external data.
- Use explicit types for service inputs and outputs.

### React

- Server Components by default.
- Client Components only when needed.
- Use `"use client"` explicitly.
- Avoid prop drilling beyond two levels.
- Use TanStack Query for client-side asynchronous state if needed.

### Server Actions

- Validate input.
- Check auth.
- Use services.
- Return typed results.
- Do not expose internal errors directly.

### Database

- Use Prisma repositories/services.
- Do not write raw SQL unless necessary.
- Use transactions for multi-step mutations.
- Use upsert for idempotent daily records.

### Worker

- Jobs must be idempotent.
- Jobs must be retryable.
- Use structured logs.
- Use concurrency limits for Wikipedia calls.
- Do not crash worker on single item failure.

### UI

- Use accessible form labels.
- Use semantic HTML.
- Use loading states.
- Use empty states.
- Use error states.
- Keep visual design mature and editorial.

---

## 27. Important Business Rules

These rules must be enforced in code:

1. A user must have at least one area.
2. A user receives at most one item per UTC content date.
3. An area has at most one published subject per UTC content date.
4. A subject must include source URL.
5. A subject must include attribution when sourced from Wikipedia.
6. A user may rate an item only after it is learned.
7. A report must reference a subject.
8. Admin actions must be audited.
9. Hidden subjects must not be assigned to users.
10. Already learned subjects must not be reassigned to the same user.
11. Daily assignment must be idempotent.
12. Candidate generation must be resumable/retryable.
13. Worker must not repeatedly fetch the same Wikipedia page unnecessarily.
14. The app must not expose admin functionality to normal users.

---

## 28. Definition of Done

The task is complete when:

```bash
pnpm install
pnpm docker:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

works locally, and in another terminal:

```bash
pnpm worker:dev
```

works, and:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

all pass.

The app must be usable locally:

1. Visit `http://localhost:3030`.
2. Request magic link for `admin@example.com`.
3. Open Mailpit at `http://localhost:8025`.
4. Use magic link to sign in.
5. Complete onboarding if needed.
6. View today page.
7. Visit admin pages as admin.
8. Run worker jobs manually to generate subjects and assignments.

The final boilerplate should feel like a real product foundation, not a toy demo.
