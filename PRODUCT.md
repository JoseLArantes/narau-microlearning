# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: curious lifelong learners — adults who want a small, reliable daily learning habit. They are busy, short on attention, and tired of endless feeds; they want one well-sourced thing to learn each day without deciding what it should be. Secondary audiences: administrators and moderators who run the backoffice (manage users, areas, daily subjects, and reports).

## Product Purpose

Narau asks "What did you learn today?" and helps you answer it — one small, well-sourced thing to learn every day. Each user picks areas of interest; every day they receive a single curated learning item pulled from Wikipedia, sized to a reading-time target (default five minutes); they read it, mark it learned or skip it, rate it, and can report inaccuracies. Success means a user returns every day, reads the item, and leaves having learned something real.

## Positioning

Curation over algorithm. Where feeds optimize engagement, Narau is the anti-scroll antidote: an editor-in-the-machine selects one high-quality subject per area per day, and the user gets exactly one item — no feed, no noise. Every fact is traceable to a real Wikipedia article (CC BY-SA 4.0), so nothing is fabricated.

## Operating Context

- Each user selects one or more areas (Science, History, Art, Technology, Space, etc.) during onboarding and can change them in settings.
- One item is assigned per user per day from a randomly chosen valid area; `contentDate` is a UTC calendar date.
- A background worker ingests Wikipedia category candidates, scores and selects one subject per active area per day, assigns items to users, and sends reminder emails for unread items.
- Users read, mark as learned or skip, rate (1–5), and report inaccuracies from a single daily reading view. A skipped card is set aside without penalty; tomorrow's card is assigned as usual.
- A dashboard shows learned history grouped by area with streak and count; the reader can pull a tab to review what they learned in any single area.
- Admins/moderators manage users, areas, daily subject overrides, the candidate pool, an inaccuracy-report queue, and the global reading-time default every card is sized to.

## Capabilities and Constraints

- Magic-link email login (no passwords), Auth.js, SMTP.
- Server Actions for all mutations; Zod validation; Prisma on PostgreSQL; Redis/BullMQ for worker jobs.
- Content is licensed CC BY-SA 4.0 and must be attributed with links to source articles. This is a binding constraint: every reading item links back to its Wikipedia source.
- Reading content is the article's lead section (the most reliably clean plain text Wikipedia exposes); the global default reading time trims it down but cannot extend a short lead. The admin sets the default (3/5/10 minutes).
- Card images are high-resolution Wikipedia thumbnails (1200px), attributed in the card's caption.
- Web app + Node worker in a pnpm/Turborepo monorepo. Docker Compose local stack (Postgres, Redis, Mailpit, MinIO).
- Roles: USER, ADMIN, MODERATOR.

## Brand Commitments

- Name: Narau. Keep it.
- Tone: editorial, mature, intelligent, and real. The UI must not feel childish or AI-generated; the product reads like a carefully edited daily digest rather than a content farm.
- Sourcing: Wikipedia with attribution is a brand commitment, not just a legal note.

## Evidence on Hand

- Seeded demo users: admin@example.com (ADMIN), user@example.com (USER with learned items), plus fresh users created via magic link.
- Seeded areas: Science, History, Art, Technology, Space; real Wikipedia candidates ingested (190+ subjects).
- Worker jobs proven live against Wikipedia (ingest, select, assign, remind).
- Real editorial copy lives in the app (landing, onboarding, today, dashboard, settings, admin).

## Product Principles

1. One thing, well chosen, every day. The product must never feel like a feed; restraint is a feature.
2. Curation and sourcing are the brand. Selection quality and traceable attribution are non-negotiable.
3. Editorial, not generic. Every surface should feel crafted, mature, and considered — never templated or childish.
4. Frictionless daily habit. Reading, marking learned, and rating must stay effortless; the daily visit should feel like a ritual, not a chore.
5. Trust through transparency. Where a subject came from, why it was chosen, and how to correct it (reporting) should be visible.

## Accessibility & Inclusion

- Target WCAG AA contrast; keyboard-accessible dialogs and forms via Radix primitives; focus-visible states; reduced-motion respect.
