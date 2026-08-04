---
version: 1
slug: "apps-web-src-app-today-page-tsx"
primary_target: "apps/web/src/app/today/page.tsx"
related_targets: []
---

# Surface: Today

## Scope & Mode

Scope: the daily reading surface, the app's first viewport after onboarding. Mode: **Operate** (complete the daily reading ritual) with a light Read register.

## Audience & Job

A returning learner, at a desk or on a commute, with two minutes. Job: pull today's card, read one well-sourced gem, stamp it learned, move on.

## Action / Task

Read the subject and its source attribution; mark the item learned; optionally rate it or report an inaccuracy. Every mutation is a server action followed by `router.refresh()`.

## Proof / Content

The item is real curated Wikipedia content (CC BY-SA 4.0). The card must always show: the area guide tab, the typewriter metadata line (CARD · date · minutes), the Literata reading, and a SEE-ALSO footer linking the source article.

## Constraints

- UTC content date is the source of truth; format dates with `timeZone: "UTC"`.
- The stamp is the one authored motion on the surface; everything else stays calm (Rarity Rule).
- Stamped badge text renders uppercase (CSS `text-transform`); tests must not assume title-case.

## Chosen Direction & Memorable Moment

World: Library card catalog. Memorable moment: the rubber-stamp LEARNED slam — a red stamp rotates into the card ("LEARNED / date"), then the surface refreshes to the stamped badge and the rating control.

## Unresolved

- A literal card-tray (drawer) visual on small screens was intentionally skipped for restraint; revisit if the metaphor needs reinforcing.

## 2026-08-04 updates

- The reading is trimmed to the global default reading time (admin-set, default 5 minutes, ~200 wpm) via `fitToReadingTime`; the "N MIN READ" badge shows the target when the lead is long enough, otherwise the actual length.
- A "Skip this card" control sits beside the stamp; skipping sets the item to SKIPPED and the surface renders a calm "card set aside" state (no penalty).
- Brand renamed to Narau; the masthead reads "NARAU · THE DAILY CARD".
