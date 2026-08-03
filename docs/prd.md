# PRD — “Learn One Tiny Thing Every Day”

**Working product name:** Narau Microlearning  
**Document version:** 0.1  
**Date:** Monday, August 03, 2026  
**Author role:** Expert Software Architect / Product Architect  
**Status:** Draft for review

---

## 1. Executive Summary

**Narau Microlearning** is a daily micro-learning app where each user learns **one small, interesting, trustworthy thing per day** based on the areas they care about.

Users choose areas such as **Science, History, Art, Technology, Geography, Space, Psychology, Economics, Music, Philosophy**, etc. Every day, the system selects one area from the user’s interests and delivers one short learning card sourced primarily from Wikipedia. The content is normalized, stored, attributed to the original source, and tracked as **pending/read/learned**.

The product should feel like a **real, editorial, carefully crafted learning ritual** — not childish, not feed-like, and not AI-generated. It should be closer to a premium daily digest than a social feed or gamified kids app.

The MVP will support:

- Admin-created users or invited users.
- User selection of one or more areas.
- One learning item per user per day.
- Content ingestion from Wikipedia.
- One subject per area per day, shared across users assigned to that area.
- Read/pending tracking.
- Post-read rating.
- Inaccuracy reporting.
- Source link and attribution.
- Dashboard with total learned items and history grouped by area.
- Basic backoffice for users, areas, daily subjects, moderation, and reports.

---

## 2. Product Vision

### Vision

Help curious people build a sustainable daily habit of learning by giving them **one tiny, high-quality thing to learn every day**.

### Core Promise

> “Every day, learn one small thing worth remembering.”

### Product Principles

1. **Tiny over overwhelming**  
   One item per day. No infinite feed. No binge pressure.

2. **Trustworthy over clickbait**  
   Every item must link to the original source and include attribution.

3. **Personal but simple**  
   Users choose areas. The system randomly mixes them, but the logic remains understandable.

4. **Editorial quality over AI slop**  
   Content should feel curated, clean, and human. Avoid generic AI phrasing, overproduced visuals, and childish gamification.

5. **Ritual over addiction**  
   Streaks and progress should be motivating but calm. No dark patterns.

6. **Efficient content delivery**  
   Where possible, generate one subject per area per day and reuse it for all users assigned to that area.

---

## 3. Market Research and Competitive Scan

Below is a secondary research summary based on publicly known products and patterns up to 2026. Before development, I recommend doing a fresh app store and web teardown because products change quickly.

### 3.1 Similar or Adjacent Products

| Product / Experience | What it does | What it proves | Gap for Narau Microlearning |
|---|---|---|---|
| **Wikipedia Random Article** | Lets users jump to random Wikipedia pages. | Random knowledge discovery can be fun and addictive. | No personalization, no daily cadence, no progress tracking, no polished learning experience. |
| **Wikiwand / Wikipedia UI improvements** | Improves Wikipedia reading experience. | Better presentation can make encyclopedia content more approachable. | Not a learning product. No daily delivery, no user progress, no area-based personalization. |
| **DailyArt** | Sends one artwork per day with a short story. | A single daily item creates a strong ritual. | Focused only on art. No user-selected areas or cross-domain learning. |
| **Deepstash** | Bite-sized ideas from books, articles, podcasts. | Micro-content can feel consumable and motivating. | Feed-like, can become overwhelming. Less transparent source-of-truth per item. |
| **Blinkist / Shortform / getAbstract** | Summaries of books or long-form content. | People like compressed knowledge. | Not one tiny thing per day. Subscription-heavy. Not Wikipedia/source-based. |
| **Curiosity / Feedly / discovery apps** | Content discovery across topics. | Users want content tailored to interests. | Too much content. Not tiny. Not a clean daily ritual. |
| **Duolingo / Elevate / Lumosity** | Daily practice with streaks and gamification. | Streaks and daily habits improve retention. | Often feels game-like or childlike. Learning is exercise-based, not knowledge-discovery-based. |
| **Reddit r/todayilearned** | Community posts of interesting learned facts. | People enjoy “I learned something today” content. | Unstructured, variable quality, not personalized, not a calm daily product. |
| **StumbleUpon / Mix** | Random web discovery based on interests. | Interest-based random discovery is compelling. | Too broad, low trust, no learning history, no source normalization. |

### 3.2 Key Insights

1. **Daily single-item products work**  
   Products like DailyArt show that one item per day can create a strong, low-pressure habit.

2. **Wikipedia is an excellent MVP source**  
   It has broad coverage, human-written content, stable URLs, APIs, and licensing that permits reuse with attribution.

3. **Trust requires visible sourcing**  
   Users should always see where the content came from, when it was retrieved, and how to open the original article.

4. **Too much content kills the ritual**  
   The product should avoid becoming a feed. The core experience must remain: **one card per day**.

5. **Gamification must be mature**  
   Streaks, milestones, and progress can be useful, but they should be subtle. No cartoon mascots, excessive confetti, or childish rewards.

6. **AI-generated summaries can reduce trust**  
   For MVP, prefer Wikipedia’s human-written lead section or carefully edited summaries. If AI is used, it should be invisible unless necessary, and quality must be reviewed.

### 3.3 Market Opportunity

There is a gap between:

- **Wikipedia random browsing**, which is interesting but unstructured.
- **Content feeds**, which are overwhelming.
- **Learning apps**, which often require courses or lessons.
- **Daily ritual apps**, which are usually limited to one domain.

Narau Microlearning can occupy the following position:

> A calm, trustworthy, personalized daily micro-learning ritual across multiple areas of knowledge.

---

## 4. Target Users

### Primary Persona: The Curious Professional

- Age: 22–45.
- Busy but intellectually curious.
- Does not have time for courses.
- Wants to feel like they learned something meaningful each day.
- Values clean design and credible sources.

### Secondary Persona: The Lifelong Learner

- Age: 35–65.
- Enjoys reading, documentaries, history, science, culture.
- Likes tracking personal progress.
- Prefers a calm, non-childish experience.

### Anti-Persona

- Users looking for deep courses, certifications, or social learning.
- Users expecting a TikTok-style infinite feed.
- Children or users expecting a kids-style educational game.

---

## 5. Core Product Concept

### 5.1 Main Loop

1. User is created or invited.
2. User selects one or more areas of interest.
3. Every day, the system chooses one of the user’s areas.
4. The system retrieves the preselected subject for that area.
5. User receives one learning card.
6. User reads the summary.
7. User marks the item as learned or it remains pending.
8. User rates the item.
9. User can report inaccuracies.
10. Dashboard updates with learned count, streak, and history.

### 5.2 Example

User selects:

- Science
- History
- Art

On a given day:

1. The system randomly chooses **Science**.
2. The daily Science subject is **Rocket**.
3. The user sees a card titled **Rocket**.
4. The card contains a short summary from Wikipedia.
5. The user reads it, marks it learned, rates it, and sees a link to the original Wikipedia article.

---

## 6. Product Scope

### 6.1 MVP Scope

The MVP must include:

- User authentication via invited account or simple email login.
- User onboarding with area selection.
- Admin/backoffice creation of users.
- Admin/backoffice creation of areas.
- Wikipedia content ingestion pipeline.
- One subject per area per day.
- Daily assignment of one subject per user.
- Today screen.
- Read/pending tracking.
- Rating after reading.
- Inaccuracy reporting.
- Source attribution and original link.
- Dashboard with learned count and history grouped by area.
- Basic moderation queue for reported content.
- Basic analytics.

### 6.2 Out of Scope for MVP

- Public self-registration.
- Social features.
- Comments.
- Sharing feeds.
- User-generated content.
- Offline mode.
- Multi-language content.
- Advanced AI personalization.
- Native mobile apps, unless required by business decision.
- Monetization/payments.
- Web crawling beyond Wikipedia.
- Course-like learning paths.

---

## 7. Core Entities and Definitions

| Entity | Definition |
|---|---|
| **User** | A person using the app. |
| **Area** | A topic category such as Science, History, Art. |
| **UserArea** | Assignment of a user to an area. |
| **Subject** | A normalized learning item sourced from Wikipedia. |
| **DailyAreaSubject** | The selected subject for a specific area on a specific day. |
| **UserDailyItem** | The item assigned to a user on a specific day. |
| **Rating** | User feedback after reading. |
| **Inaccuracy Report** | User-submitted alert about wrong, misleading, or problematic content. |
| **Backoffice User** | Admin or moderator managing users, areas, subjects, and reports. |

---

## 8. Functional Requirements

Priority legend:

- **M** = Must have for MVP.
- **S** = Should have for MVP if feasible.
- **C** = Could have, nice-to-have.
- **W** = Won’t have in MVP.

### 8.1 User Management

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | The backoffice must be able to create users. | M |
| FR-02 | Users must be able to log in securely, preferably via email magic link or OAuth. | M |
| FR-03 | Users must be able to select at least one area during onboarding. | M |
| FR-04 | Users must be able to update their selected areas in settings. | S |
| FR-05 | Admin must be able to assign areas to users. | M |
| FR-06 | Admin must be able to deactivate users. | M |
| FR-07 | System must store user timezone. | S |

### 8.2 Area Management

| ID | Requirement | Priority |
|---|---|---|
| FR-08 | Backoffice must be able to create areas. | M |
| FR-09 | Each area must have name, slug, description, icon/color, and status. | M |
| FR-10 | Each area must have at least one source mapping, e.g. Wikipedia category or Wikidata query. | M |
| FR-11 | Admin must be able to enable/disable areas. | M |
| FR-12 | Admin must be able to upload or select an area icon. | S |
| FR-13 | System must support area ordering for display. | C |

### 8.3 Content Ingestion

| ID | Requirement | Priority |
|---|---|---|
| FR-14 | System must ingest content from Wikipedia using official APIs where possible. | M |
| FR-15 | System must not scrape raw HTML unless API access is insufficient. | S |
| FR-16 | System must store normalized subject data: title, summary, source URL, source ID, retrieval date, revision ID, image, license. | M |
| FR-17 | System must remove citation markers and noisy formatting from summaries. | M |
| FR-18 | System must avoid disambiguation pages, list pages, stubs, and low-quality pages. | M |
| FR-19 | System must deduplicate subjects by source ID, canonical URL, and content hash. | M |
| FR-20 | System must store a content quality score. | S |
| FR-21 | System must store content safety flags. | S |
| FR-22 | System must support manual content override by admin. | M |

### 8.4 Daily Subject Selection

| ID | Requirement | Priority |
|---|---|---|
| FR-23 | System must select one subject per active area per content day. | M |
| FR-24 | Selection must be randomized but weighted by quality and freshness. | M |
| FR-25 | System must avoid repeating a subject in the same area for a configurable cooldown period. | M |
| FR-26 | System must avoid assigning a subject the user has already read. | M |
| FR-27 | Admin must be able to preview and override the daily subject for an area. | M |
| FR-28 | System must create fallback subjects if no valid candidate exists. | M |
| FR-29 | System must log why a subject was selected for auditing. | C |

### 8.5 User Daily Assignment

| ID | Requirement | Priority |
|---|---|---|
| FR-30 | Each active user must receive one learning item per day. | M |
| FR-31 | If a user has one area, the item must come from that area. | M |
| FR-32 | If a user has multiple areas, the system must randomly choose one area for the day. | M |
| FR-33 | The random area selection should be influenced by user preferences, recency, and unread availability. | S |
| FR-34 | The assigned item must use the daily subject already selected for that area. | M |
| FR-35 | If the selected area has no valid subject, the system must choose another area or fallback subject. | M |
| FR-36 | The system must support pending status for unopened/unlearned items. | M |
| FR-37 | The system must support catch-up access to recent pending items. | S |

### 8.6 Today Experience

| ID | Requirement | Priority |
|---|---|---|
| FR-38 | User must see one main learning card for the day. | M |
| FR-39 | Card must display area, title, summary, image if available, reading time, and source link. | M |
| FR-40 | Card must display attribution to Wikipedia. | M |
| FR-41 | User must be able to mark the item as learned. | M |
| FR-42 | User must be able to open the original source. | M |
| FR-43 | User must be prompted to rate the item after marking it learned. | M |
| FR-44 | User must be able to report an inaccuracy. | M |
| FR-45 | User must be able to defer the item until later in the day. | C |

### 8.7 Rating and Reporting

| ID | Requirement | Priority |
|---|---|---|
| FR-46 | User must be able to rate a learned item. | M |
| FR-47 | Rating should be 1–5 stars or a simple helpfulness scale. | M |
| FR-48 | User must be able to submit an inaccuracy report after reading. | M |
| FR-49 | Report reasons must include: inaccurate, outdated, offensive, misleading summary, broken source, other. | M |
| FR-50 | User may add optional free-text details. | M |
| FR-51 | Reports must be visible in backoffice. | M |
| FR-52 | If a subject receives multiple reports, it should be flagged for moderation. | S |
| FR-53 | Admin must be able to hide or replace a reported subject. | M |

### 8.8 Dashboard and History

| ID | Requirement | Priority |
|---|---|---|
| FR-54 | Dashboard must show total number of learned items. | M |
| FR-55 | Dashboard must show current streak. | S |
| FR-56 | Dashboard must show history of read subjects. | M |
| FR-57 | History must be grouped by area. | M |
| FR-58 | History must show date learned, title, area, rating, and source link. | M |
| FR-59 | Dashboard must show pending recent items. | S |
| FR-60 | Dashboard must show area distribution. | C |

### 8.9 Backoffice

| ID | Requirement | Priority |
|---|---|---|
| FR-61 | Admin must be able to add users. | M |
| FR-62 | Admin must be able to add areas. | M |
| FR-63 | Admin must be able to assign users to areas. | M |
| FR-64 | Admin must be able to view daily subjects by area. | M |
| FR-65 | Admin must be able to override daily subjects. | M |
| FR-66 | Admin must be able to moderate inaccuracy reports. | M |
| FR-67 | Admin must be able to hide subjects. | M |
| FR-68 | Admin must be able to view basic usage analytics. | S |
| FR-69 | Admin actions must be audited. | S |

---

## 9. User Flows

### 9.1 Onboarding Flow

1. Admin creates a user or user receives invite.
2. User opens the app and signs in.
3. User sees onboarding: “What do you want to learn about?”
4. User selects at least one area.
5. System saves user areas.
6. User sees either today’s item or a welcome state if today’s item has already been generated.

### 9.2 Daily Learning Flow

1. User opens app.
2. Home shows: “Your tiny thing for today.”
3. Card shows area, title, summary, image, source link.
4. User reads.
5. User taps “I learned this.”
6. Item status becomes **learned**.
7. Rating prompt appears.
8. User optionally reports an issue.
9. Dashboard updates.

### 9.3 Pending / Catch-up Flow

1. User does not open or complete the item on a given day.
2. Item remains **pending**.
3. Next day, user sees today’s item first.
4. User can access recent pending items from dashboard or catch-up section.
5. After a configured period, pending items may be archived as missed.

### 9.4 Inaccuracy Report Flow

1. User opens report action.
2. User selects reason.
3. User optionally adds details.
4. Report is stored.
5. Backoffice receives report.
6. Moderator reviews.
7. Moderator may keep, hide, replace, or edit the subject.
8. If subject is hidden, pending users may receive a fallback subject.

---

## 10. Content Strategy

### 10.1 Primary Source for MVP

Use **Wikipedia** as the first source.

Reasons:

- Huge topic coverage.
- Human-written content.
- Stable article URLs.
- APIs available.
- Clear licensing with attribution.
- Good summary endpoints.

Do **not** begin by crawling the broader internet. That increases legal risk, content quality risk, and engineering complexity.

### 10.2 Content Format

Each learning card should contain:

| Field | Requirement |
|---|---|
| Area label | Example: Science |
| Title | Example: Rocket |
| Hook | One short sentence if possible |
| Summary | 60–120 words, ideally from Wikipedia lead section |
| Image | Optional, freely licensed, with attribution |
| Reading time | Estimated, e.g. “30 seconds” |
| Source link | Direct Wikipedia URL |
| License | CC BY-SA 4.0 or applicable license |
| Retrieved date | Stored internally and optionally shown |
| Revision ID | Stored for provenance |

### 10.3 Content Tone

The content should feel:

- Intelligent.
- Concise.
- Curious.
- Human.
- Slightly delightful.
- Not childish.
- Not clickbait.
- Not overly formal.

Example tone:

> **Rocket**  
> A rocket is a vehicle or engine that produces thrust by expelling matter at high speed, allowing it to travel through air or space. Rockets are used for spacecraft launch, missiles, scientific research, and exploration beyond Earth’s atmosphere.

This is preferable to:

> “Wow! Rockets are super cool things that zoom into space!”

### 10.4 Avoiding an AI-Generated Feel

To avoid making the product feel AI-generated:

1. Prefer human-written Wikipedia lead sections.
2. Avoid generic phrases like “delve into,” “unlock the secrets,” or “embark on a journey.”
3. Avoid overly symmetrical card layouts with fake futuristic gradients.
4. Avoid cartoon mascots.
5. Avoid excessive confetti or childish badges.
6. Use real editorial microcopy.
7. Use restrained animations.
8. Show source attribution naturally.
9. If AI is used for normalization, keep it behind strict rules and review.
10. Ensure empty states and errors sound human and specific.

---

## 11. Content Ingestion Architecture

### 11.1 High-Level Pipeline

```text
Scheduler
   |
   v
Area Source Connector
   |
   v
Candidate Generator
   |
   v
Wikipedia Fetcher
   |
   v
Content Normalizer
   |
   v
Deduplicator
   |
   v
Quality/Safety Scorer
   |
   v
Subject Database
   |
   v
Daily Subject Selector
   |
   v
DailyAreaSubject Table
   |
   v
User Assignment Service
   |
   v
User App
```

### 11.2 Recommended Wikipedia Access

Prefer official APIs over scraping.

Useful endpoints:

1. **Page summary**
   ```text
   https://en.wikipedia.org/api/rest_v1/page/summary/{title}
   ```

2. **Category members**
   ```text
   https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:Science&cmlimit=500&format=json
   ```

3. **Page details**
   ```text
   https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages|info|revisions&titles={title}&format=json
   ```

4. **Random pages**
   ```text
   https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&format=json
   ```

For better topic modeling in a later phase, consider **Wikidata Query Service**.

### 11.3 Candidate Generation

For each active area:

1. Read area source mapping.
   - Example: Science maps to `Category:Science` and selected subcategories.
2. Collect candidate page IDs/titles.
3. Filter candidates:
   - Namespace: article only.
   - Not a disambiguation page.
   - Not a list page.
   - Not a stub.
   - Has a summary.
   - Has acceptable length.
   - Has no safety flag.
   - Not shown recently in the same area.
4. Score candidates.
5. Randomly select one high-quality candidate per area per day.

### 11.4 Quality Score

Suggested scoring factors:

| Factor | Description |
|---|---|
| Summary availability | Has a clean lead summary. |
| Length | Not too short, not too long. |
| Image availability | Has a usable image. |
| Article maturity | Not a stub. |
| Topic clarity | First sentence defines the subject. |
| Freshness | Not recently used. |
| Safety | No adult/violent/controversial flags. |
| Link/category quality | Belongs to expected area categories. |

### 11.5 Normalization Rules

The system should:

- Remove citation markers like `[1]`, `[citation needed]`.
- Remove pronunciation brackets if noisy.
- Remove reference links.
- Convert HTML to plain text.
- Truncate summary at sentence boundary.
- Limit summary to 60–120 words.
- Preserve original title.
- Store canonical URL.
- Store revision ID.
- Store retrieval timestamp.
- Store license information.
- Detect content hash for deduplication.

### 11.6 Deduplication

Deduplicate by:

- Wikipedia page ID.
- Canonical URL.
- Title after redirect resolution.
- Content hash of normalized summary.

Rules:

- Do not assign the same subject to a user twice.
- Do not use the same subject in the same area within a cooldown window, e.g. 180 days.
- If subject appears under multiple areas, allow it only if context differs, but avoid cross-area repetition within a shorter window.

---

## 12. Daily Selection Logic

### 12.1 Area-Level Daily Subject

For each active area, generate one subject per content day.

Example:

| Date | Area | Subject |
|---|---|---|
| 2026-08-04 | Science | Rocket |
| 2026-08-04 | History | Silk Road |
| 2026-08-04 | Art | Impressionism |
| 2026-08-04 | Technology | Transistor |

This satisfies the requirement:

> The same subject can be sent to all users assigned to the same area.

### 12.2 User-Level Assignment

For each user:

1. Get the user’s active areas.
2. Get the daily subject for each area.
3. Remove subjects already learned by the user.
4. Remove hidden or flagged subjects.
5. Choose one area randomly.
6. Assign that area’s daily subject to the user.
7. If no valid subject exists, choose fallback subject.

### 12.3 Random Area Selection

For MVP, simple weighted random is sufficient.

Possible weight formula:

```text
area_weight =
  user_preference_weight
  * recency_penalty
  * availability_weight
```

Where:

- `user_preference_weight`: default 1.0, can be increased by user settings later.
- `recency_penalty`: lower if the user recently received content from that area.
- `availability_weight`: lower if no valid subject is available.

For MVP, this can be simplified to:

```text
Choose randomly from valid areas.
Avoid repeating the same area too many days in a row.
```

### 12.4 Timezone and Daily Boundary

Recommended MVP rule:

- Use one canonical content date per area per UTC day.
- User sees the current canonical subject when their local day begins.
- Store both:
  - `content_date`
  - `user_local_date`

This avoids generating separate subjects for every timezone.

Future versions can support fully local daily subjects.

---

## 13. User Experience Requirements

### 13.1 Design Direction

The app should feel:

- Calm.
- Editorial.
- Premium.
- Curious.
- Minimal.
- Slightly playful, but adult.

Avoid:

- Cartoon mascots.
- Loud game sounds.
- Excessive badges.
- Childish fonts.
- Overly bright candy colors.
- Infinite scroll.
- Generic AI-style purple gradients.
- Fake futuristic visuals.

### 13.2 Suggested Visual Identity

| Element | Direction |
|---|---|
| Typography | Clean sans-serif for UI, optional serif for article titles |
| Color palette | Ink, paper white, deep navy, muted amber or teal accents |
| Cards | Clean, generous spacing, clear hierarchy |
| Imagery | Wikipedia thumbnails with attribution, no clickbait images |
| Motion | Subtle fade/slide, no excessive animation |
| Progress | Thin progress bars, small milestone markers |
| Tone | Intelligent and warm |

### 13.3 Screens

#### 1. Onboarding

Purpose:

- Explain product.
- Let user choose areas.
- Set notification preference.

Main actions:

- Continue.
- Select at least one area.
- Save preferences.

#### 2. Today Screen

Purpose:

- Show the one thing to learn today.

Elements:

- Area tag.
- Subject title.
- Image.
- Summary.
- Reading time.
- Source link.
- “I learned this” button.
- Report action.
- Pending state if not yet learned.

#### 3. Rating Modal

Purpose:

- Collect feedback after learning.

Elements:

- “How was today’s item?”
- 1–5 rating or helpful/not helpful.
- Optional comment.
- Report entry point.

#### 4. Report Modal

Purpose:

- Submit inaccuracy alert.

Fields:

- Reason.
- Optional details.
- Submit button.
- Confirmation message.

#### 5. Dashboard

Purpose:

- Show progress and history.

Elements:

- Total learned.
- Current streak.
- This week/month.
- History grouped by area.
- Pending recent items.
- Source links.

#### 6. Settings

Purpose:

- Manage account and preferences.

Elements:

- Edit areas.
- Notification settings.
- Timezone.
- Account details.
- Delete/deactivate request.

#### 7. Backoffice

Purpose:

- Manage users, areas, content, and reports.

Modules:

- Users.
- Areas.
- Daily subjects.
- Subjects.
- Reports.
- Analytics.
- Audit log.

---

## 14. Gamification and Motivation

The product must be fun but not childish.

### 14.1 Recommended Mechanics

| Mechanic | Description | Tone |
|---|---|---|
| Streak | Number of consecutive days learned. | Subtle |
| Milestones | 7, 30, 100 items learned. | Elegant |
| Area progress | Number learned per area. | Informative |
| Weekly recap | Summary of learned items. | Optional |
| Curiosity spark | One surprising fact or question. | Editorial |

### 14.2 Mechanics to Avoid in MVP

- Leaderboards.
- Loud rewards.
- Lives/energy.
- Cartoon characters.
- Aggressive push notifications.
- Shame-based streak loss messages.

---

## 15. Data Model

Below is a simplified relational model. PostgreSQL is a good default choice.

### 15.1 Users

```text
users
-----
id
email
name
role
status
timezone
created_at
last_login_at
```

### 15.2 Areas

```text
areas
-----
id
name
slug
description
icon_url
color
status
display_order
created_at
updated_at
```

### 15.3 User Areas

```text
user_areas
----------
user_id
area_id
preference_weight
assigned_by
created_at
updated_at
```

### 15.4 Subjects

```text
subjects
--------
id
source
source_page_id
title
canonical_url
summary
hook
image_url
image_license
image_attribution
content_hash
language
revision_id
retrieved_at
license
quality_score
safety_score
status
created_at
updated_at
```

### 15.5 Area Subject Candidates

```text
area_subject_candidates
-----------------------
id
area_id
subject_id
candidate_score
generated_for_date
status
created_at
```

### 15.6 Daily Area Subjects

```text
daily_area_subjects
-------------------
id
content_date
area_id
subject_id
status
selected_by
created_at
updated_at
```

Unique constraint:

```text
(content_date, area_id)
```

### 15.7 User Daily Items

```text
user_daily_items
----------------
id
user_id
content_date
user_local_date
area_id
subject_id
status
assigned_at
viewed_at
learned_at
rating
rating_comment
created_at
updated_at
```

Statuses:

- `pending`
- `viewed`
- `learned`
- `skipped`
- `missed`
- `replaced`

Unique constraint:

```text
(user_id, content_date)
```

### 15.8 Inaccuracy Reports

```text
inaccuracy_reports
------------------
id
user_id
user_daily_item_id
subject_id
reason
details
status
created_at
reviewed_by
reviewed_at
resolution_note
```

### 15.9 Events

```text
events
------
id
user_id
event_type
entity_type
entity_id
metadata
created_at
```

---

## 16. API Design

The implementation can be API-first. Below is a suggested REST-style API.

### 16.1 Client APIs

#### Authentication

```text
POST /auth/request-login
POST /auth/verify
GET  /me
```

#### Onboarding and Areas

```text
GET  /areas
POST /me/areas
PUT  /me/areas
```

#### Today

```text
GET /me/today
POST /me/today/{userDailyItemId}/view
POST /me/today/{userDailyItemId}/learned
POST /me/today/{userDailyItemId}/rating
POST /me/today/{userDailyItemId}/report
```

#### Dashboard

```text
GET /me/dashboard
GET /me/history?area={areaId}&page={page}
```

### 16.2 Admin APIs

```text
GET    /admin/users
POST   /admin/users
GET    /admin/users/{id}
PATCH  /admin/users/{id}

GET    /admin/areas
POST   /admin/areas
PATCH  /admin/areas/{id}

GET    /admin/daily-subjects?date={date}
POST   /admin/daily-subjects
PATCH  /admin/daily-subjects/{id}

GET    /admin/reports
PATCH  /admin/reports/{id}

GET    /admin/subjects
GET    /admin/subjects/{id}
PATCH  /admin/subjects/{id}
```

---

## 17. Backoffice Requirements

### 17.1 User Management

Admin can:

- Add user.
- Edit user.
- Assign areas.
- Remove areas.
- Deactivate user.
- View user progress.
- Resend invite.

### 17.2 Area Management

Admin can:

- Create area.
- Edit area name, slug, description, icon, color.
- Map area to Wikipedia categories/Wikidata queries.
- Enable/disable area.
- Preview candidate subjects.

### 17.3 Content Moderation

Admin can:

- View daily subjects.
- Replace subject for a given area/date.
- Hide subject globally.
- Review reports.
- Mark report as resolved.
- Restore hidden subject if appropriate.
- Add internal notes.

### 17.4 Analytics

Admin should see:

- Active users.
- Daily completion rate.
- Read rate by area.
- Average rating by area.
- Report count.
- Most/least rated subjects.
- Pending/missed items.
- User retention summary.

---

## 18. Notifications

Notifications are not strictly required by the original request, but they are important for a daily habit product.

### 18.1 MVP Notification Requirement

| Requirement | Priority |
|---|---|
| Optional daily reminder email. | S |
| Optional push notification if using mobile/PWA. | C |
| User can disable notifications. | M |

### 18.2 Notification Copy Direction

Good:

> “Your tiny thing for today is ready.”

Also good:

> “One small thing to learn today.”

Avoid:

> “Don’t break your streak!!!”

---

## 19. Non-Functional Requirements

### 19.1 Performance

| Requirement | Target |
|---|---|
| Today screen load | < 1 second for cached daily item |
| Dashboard load | < 2 seconds |
| Daily content generation | Complete within 60 minutes for MVP scale |
| User assignment generation | Complete within 30 minutes for 10,000 users |

### 19.2 Scalability

MVP target:

- 1,000 to 20,000 users.
- One item per user per day.
- Tens to hundreds of areas.

Architecture should allow:

- Adding more source connectors.
- More areas.
- More languages later.
- Event-based processing if volume grows.

### 19.3 Reliability

- Daily assignment must not fail silently.
- Pipeline must have retry logic.
- Fallback subject must exist if Wikipedia fetch fails.
- Admin must be alerted if subject generation fails.

### 19.4 Security

- Authentication required.
- Role-based access for backoffice.
- Audit logging for admin actions.
- Encryption in transit.
- Encryption at rest.
- Rate limiting on auth and report endpoints.
- Input validation on all forms.

### 19.5 Privacy

- Collect minimal personal data.
- Store user email and interaction history.
- Allow user deletion or anonymization.
- Comply with GDPR/CCPA where applicable.
- Do not sell user data.
- Do not require phone number.

### 19.6 Accessibility

- WCAG 2.2 AA target.
- Keyboard navigation.
- Screen reader support.
- Sufficient color contrast.
- Alt text for images.
- Readable font sizes.

---

## 20. Legal and Licensing

### 20.1 Wikipedia Content

Wikipedia content is generally available under **CC BY-SA 4.0**, but individual media may have different licenses.

Requirements:

- Provide attribution.
- Include link to original article.
- Include license reference.
- Store revision ID where possible.
- Avoid using images with unclear licenses.
- If modifying text, indicate that content was adapted.

Example attribution:

> Summary adapted from “Rocket” on Wikipedia, licensed under CC BY-SA 4.0.

### 20.2 Images

For MVP:

- Use only images with clear free licenses.
- If license is unclear, do not display image.
- Store image license and attribution.

### 20.3 User Content

- Ratings and reports are user-generated.
- Users should not submit sensitive personal data.
- Provide basic terms of use and privacy policy.

---

## 21. Analytics and Success Metrics

### 21.1 North Star Metric

**Learned items per active user per week.**

### 21.2 Activation Metrics

- Percentage of invited users who log in.
- Percentage of users who select at least one area.
- Percentage of users who learn their first item on day one.

### 21.3 Engagement Metrics

- Daily completion rate.
- Day 1 retention.
- Day 7 retention.
- Day 30 retention.
- Average streak length.
- Number of learned items per user.
- Pending-to-learned conversion.

### 21.4 Quality Metrics

- Average rating.
- Report rate.
- Percentage of subjects hidden.
- Source click-through rate.
- Content generation failure rate.
- Duplicate assignment rate.

### 21.5 Event Tracking

Recommended events:

- `user_invited`
- `user_logged_in`
- `onboarding_completed`
- `area_selected`
- `today_viewed`
- `item_marked_learned`
- `rating_submitted`
- `report_submitted`
- `source_link_clicked`
- `dashboard_viewed`
- `notification_opened`

---

## 22. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Wikipedia content quality varies | Medium | Quality filters, admin override, report moderation |
| Summaries feel AI-generated | High | Use human-written lead sections, editorial microcopy, avoid LLM output in MVP |
| Repetitive content | High | Deduplication, cooldown windows, user history checks |
| API rate limits | Medium | Caching, scheduled ingestion, candidate pools |
| Licensing issues | High | Use official APIs, attribution, image license checks |
| Users forget to return | High | Optional daily reminders, streaks, clean daily ritual |
| Product feels childish | High | Mature design language, subtle gamification |
| Product feels like a feed | High | Keep one item per day, no infinite scroll |
| Timezone complexity | Medium | Start with UTC content date, store local date |
| Inappropriate content | High | Safety filters, moderation queue, hide/replace tools |

---

## 23. MVP Release Plan

### Phase 0 — Discovery and Design

Duration: 1–2 weeks

Deliverables:

- Final area taxonomy.
- User flows.
- Wireframes.
- Visual direction.
- Wikipedia source mapping.
- Data model.
- Technical stack decision.

### Phase 1 — Content Pipeline

Duration: 2–3 weeks

Deliverables:

- Area source mapping.
- Candidate generator.
- Wikipedia fetcher.
- Normalizer.
- Deduplicator.
- Subject storage.
- Daily subject selector.
- Admin override support.

### Phase 2 — Core App

Duration: 3–4 weeks

Deliverables:

- Authentication.
- Onboarding.
- Area selection.
- Today screen.
- Mark learned.
- Rating.
- Report.
- Source link.
- Dashboard/history.

### Phase 3 — Backoffice and Moderation

Duration: 2 weeks

Deliverables:

- User management.
- Area management.
- Daily subject management.
- Report moderation.
- Basic analytics.

### Phase 4 — Beta and Polish

Duration: 2 weeks

Deliverables:

- Private beta.
- Analytics review.
- Content quality tuning.
- UX polish.
- Bug fixing.
- Notification experiment.

---

## 24. MVP Acceptance Criteria

The MVP can be accepted if the following are true:

1. Admin can create a user.
2. User can log in.
3. User can select at least one area.
4. System generates one subject per active area per day.
5. System assigns one daily item to each active user.
6. If user has multiple areas, system randomly chooses one area.
7. User sees one learning card per day.
8. Card shows title, area, summary, source link, and attribution.
9. User can mark item as learned.
10. User can rate the item.
11. User can submit an inaccuracy report.
12. Dashboard shows total learned items.
13. Dashboard shows history grouped by area.
14. Admin can add users.
15. Admin can add areas.
16. Admin can view and replace daily subjects.
17. Admin can review reports.
18. The same subject can be delivered to multiple users assigned to the same area.
19. A subject is not repeated for a user if already learned.
20. The app does not rely on an infinite feed.

---

## 25. Suggested Technical Approach

This section is implementation guidance, not a final technical specification.

### 25.1 Recommended Stack

| Layer | Suggested Option |
|---|---|
| Frontend | Next.js / React or Vue/Nuxt, responsive PWA first |
| Mobile later | React Native or Flutter if native apps are needed |
| Backend API | Node.js/NestJS, Python/FastAPI, or Go |
| Database | PostgreSQL |
| Cache | Redis |
| Queue/Jobs | BullMQ, Celery, or equivalent |
| Storage | S3-compatible object storage for images/assets |
| Auth | Magic link email, OAuth, or identity provider |
| Analytics | Self-hosted or privacy-friendly analytics |
| Hosting | Cloud-managed containers or serverless |

### 25.2 Architecture Style

For MVP, use a **modular monolith**:

- Auth module.
- User module.
- Area module.
- Content ingestion module.
- Assignment module.
- Interaction module.
- Admin module.
- Analytics module.

This is simpler than microservices and sufficient for the expected scale.

---

## 26. Future Enhancements

These should not be included in MVP unless business priorities change.

1. Self-registration.
2. Native iOS/Android apps.
3. Push notifications.
4. More sources beyond Wikipedia.
5. Wikidata-based topic selection.
6. AI-assisted summary editing with human review.
7. Social sharing.
8. Weekly recap emails.
9. User-defined tags/subtopics.
10. Bookmarking.
11. Advanced spaced repetition.
12. Quizzes.
13. Premium curated collections.
14. Multi-language support.
15. Team/organization version for internal learning.

---

## 27. Open Questions

Before implementation, the following decisions should be made:

1. Will users be admin-created only, or can they self-register?
2. Is the first product web-only, mobile web, or native mobile?
3. Which areas should launch first?
4. Should users be able to select preferred area weights?
5. Should pending items expire or remain forever?
6. Should streaks be visible from day one?
7. Should rating be 1–5 stars, thumbs up/down, or helpfulness scale?
8. Should the app show images by default?
9. Should notifications be email-only for MVP?
10. What is the minimum age requirement?
11. Should admins be able to manually curate all subjects?
12. Should one subject per area per day be strict, or should popular areas have backups?
13. Should content be English-only at launch?
14. Should users be allowed to skip an item and receive another?
15. Should catch-up be limited to the last 7 days?

---

## 28. Recommendation

For MVP, I recommend building the product as a **calm, editorial, daily micro-learning experience** with the following constraints:

- Wikipedia-only content source.
- One item per user per day.
- One subject per area per day.
- No feed.
- No childish gamification.
- Strong source attribution.
- Simple admin-created user flow.
- Web-first responsive app.
- PostgreSQL-backed modular monolith.
- Scheduled content ingestion instead of real-time crawling.

This approach minimizes legal and technical risk while preserving the core product idea:

> **One tiny, trustworthy thing to learn every day.**
