---
name: Narau
description: One small, well-sourced thing to learn every day.
colors:
  primary: "#1F1A14"
  neutral-bg: "#F0ECE0"
  neutral-card: "#F9F7F0"
  accent-stamp: "#A33729"
  ink-muted: "#6D6255"
  aged-paper: "#E5E1D7"
  hairline: "#D3CBBB"
  focus-ink-blue: "#41609F"
  destructive: "#A93B2D"
typography:
  display:
    fontFamily: "Literata, Georgia, serif"
    fontWeight: 400
    lineHeight: 1.08
  body:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "1.0625rem mobile / 1.125rem desktop"
    lineHeight: 1.7
    maxWidth: "66ch"
  label:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.10em"
    textTransform: "uppercase"
rounded:
  card: "11px"
  control: "5px"
  badge: "2px"
spacing:
  card-pad: "1.5rem"
  stack: "1.25rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-card}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1.5rem"
  button-outline:
    backgroundColor: "{colors.neutral-card}"
    textColor: "{colors.primary}"
    rounded: "{rounded.control}"
    padding: "0.5rem 1rem"
  card-index:
    backgroundColor: "{colors.neutral-card}"
    textColor: "{colors.primary}"
    rounded: "{rounded.card}"
    padding: "1.5rem"
  badge-stamped:
    backgroundColor: "transparent"
    textColor: "{colors.accent-stamp}"
    rounded: "{rounded.badge}"
    padding: "0.125rem 0.5rem"
  input-field:
    backgroundColor: "{colors.neutral-card}"
    textColor: "{colors.primary}"
    rounded: "{rounded.control}"
    padding: "0.375rem 0.75rem"
---

# Design System: Narau

## Overview

**Creative North Star: "The Library Card Catalog"**

Narau renders the daily-learning ritual as a quiet personal library. One manila index card sits on an ivory desk each morning — a single well-sourced Wikipedia reading, its metadata typed in Courier Prime, its prose set in Literata. Marking it learned is not a click but a rubber stamp: a red stamp slams onto the card and the entry joins the drawer on the dashboard. The whole system is the physical apparatus of a card catalog — classification labels, guide tabs, hairline rules, and a rubber stamp — rendered with restraint so the metaphor never obstructs the task.

The palette is deliberately narrow and disciplined. Near-black ink does the everyday work of text and actions; a single rubber-stamp red is reserved for the LEARNED moment and urgent flags, so its rarity is the point. Depth comes from paper itself: manila cards carry a hairline edge and a soft contact shadow on the desk. Type is the personality — a typewriter mono for every catalog datum (dates, areas, call numbers, stamps) against a literary serif for reading. Light surfaces chosen from the use scene: a reader at a desk in daylight.

**Key Characteristics:**
- One authored moment per surface (the stamp); everything else stays calm.
- Classification labels in typewriter mono are the world's header grammar, not decorative eyebrows.
- Cards are paper: hairline edge + soft shadow, never a ghost-panel border.
- The accent is rare: rubber-stamp red only on LEARNED, urgent, and destructive states.
- Motion is damped and physical when it appears; `prefers-reduced-motion` is respected.

## Colors

An ivory-and-ink paper system with one rare red accent.

### Primary
- **Ink** (#1F1A14): Text, the primary button (an imprint), active nav underline, checked-area emphasis.

### Secondary
- **Stamp Red** (#A33729): The only accent. The rubber-stamp LEARNED control and its stamped badge, the login SENT stamp, the landing's illustrative stamp. Rarity is the point.

### Tertiary
- **Focus Ink-Blue** (#41609F): Focus rings only — a visible but calm cue against ivory.

### Neutral
- **Desk Ivory** (#F0ECE0): The page background — the desk.
- **Manila Card** (#F9F7F0): Card stock — cards, popovers, inputs, badge bases.
- **Aged Paper** (#E5E1D7): Secondary fills (masthead strip, hover surfaces).
- **Muted Ink** (#6D6255): Secondary text on paper (≥4.5:1 on both ivory and card).
- **Hairline** (#D3CBBB): Borders and dividers — the card's printed rule.

### Named Rules
**The Rarity Rule.** Rubber-stamp red appears on at most one control per surface. When two red elements would sit together, one is wrong.
**The Paper Rule.** Text surfaces are paper: an edge and a soft shadow, never a hard offset block shadow and never a border under a wide soft shadow.

## Typography

**Display Font:** Literata (Georgia fallback)
**Body Font:** Literata (Georgia fallback)
**Label/Mono Font:** Courier Prime (Courier New fallback), system sans for UI chrome

**Character:** A literary serif for reading against a typewriter mono for catalog data — the library's prose and its typed records. The pairing carries the editorial tone: mature, sourced, real.

### Hierarchy
- **Display** (Literata 400, clamp 4xl→5xl, 1.08): The landing hero only.
- **Reader headline** (Literata 400, responsive 28→36px, 1.12, −0.025em): The daily card's subject title, left aligned with balanced wrapping.
- **Title** (Literata 400, xl–2xl, 1.1): Section titles and card titles.
- **Standfirst** (Literata 400 italic, 1.125rem, 1.55, max 55ch): An optional short editorial hook below a reader headline; shown only when it is concise and never repeated in the body.
- **Body** (Literata 400, 1.0625rem mobile / 1.125rem desktop, 1.7, max 66ch): The daily reading and long text, left aligned with paragraph spacing and no justification.
- **Label** (Courier Prime 700, 0.75rem, 0.10em tracking, uppercase): Short catalog metadata — dates, area names, "CARD", "SEE ALSO", reading time, and stamps.
- **Source caption** (system sans 400, 0.75rem, 1.5): Long image credits and legal/source text where monospaced uppercase would reduce legibility.

### Named Rules
**The One Voice Rule.** Typewriter mono is for catalog data and labels only; prose is always the serif. Mono used as decoration on body text is off-brand.

**The Reading Measure Rule.** Running text stays within 66ch on larger screens and uses the card's full available width on small screens. Reading prose is always left aligned with a ragged right edge; text is never fully justified.

**The Standfirst Rule.** A hook may appear in Literata italic below the title only when it is no more than 32 words and 220 characters. When displayed, the same sentence is removed from the body so the reader encounters it once.

## Layout

A single centered column, max `64rem`, `px-6` at rest. Dense grouping inside cards, generous separation between surfaces; more space above a heading than below it. Two-column grids only for paired counts (dashboard totals, admin stats) and the landing hero; three columns for the landing's three-step strip. On mobile every multi-column group stacks to a single column; the guide tab and masthead date stay but the middle masthead tagline hides below `sm`.

## Elevation & Depth

Paper-in-light. Depth is conveyed by a soft contact shadow under a manila card on the ivory desk — never hard offset shadows, never tonal gradients. The stamp is the one elevated moment, physically slamming into the card (scale 2.4 → 1 with a settle and a 5° rotation), its ink blending with `multiply`.

### Shadow Vocabulary
- **Card contact** (`0 1px 2px rgba(48,34,12,0.1), 0 16px 36px -18px rgba(48,34,12,0.35)`): The standard card elevation.
- **Stamp lift** (`0 2px 6px rgba(150,40,20,0.18)`): Only under the stamp.

### Named Rules
**The One Depth Rule.** Elevation is declared once per surface — an edge or a shadow, never both doing the same job. Cards are paper, so they keep a hairline edge and a contact shadow as one material fact.

## Shapes

Small, sharp radii throughout — the geometry of card stock and rubber, not rounded-app chrome. Cards at `11px`, controls at `5px`, badges and stamps at `2px`. Stamp badges and the stamp control carry a deliberate −2° rotation, the fingerprint of a rubber stamp. Guide tabs are rectangular with a small top radius, sitting half-translated above their card's top edge.

## Components

### Buttons
- **Shape:** 5px radius; icons at 16px, consistent stroke (lucide).
- **Primary:** Ink fill (`#1F1A14`) with ivory text, a faint drop (`0 1px 2px`), pressing down 1px on `:active`.
- **Outline:** Manila fill, hairline border, ink text; used for secondary and admin actions.
- **Ghost:** Transparent, hover on aged paper.
- **Hover / Focus:** color shift; focus ring in ink-blue with 2px offset.
- **The Stamp** (signature): a 3px red-outlined, rotated label — "I LEARNED THIS" in Courier Prime. On success it triggers the stamp-slam overlay ("LEARNED / date") before the card refreshes to its stamped badge.
- **The Skip control** (set-aside): a quiet manila-outlined mono button ("SKIP THIS CARD"); skipping turns the card into a "card set aside" state without penalty. It never competes with the stamp — one red moment per card, always.

### Filter pills (dashboard / admin)
- **Style:** mono, 0.65rem, uppercase, 2px radius, ink-filled when active, manila when idle — the guide-tab grammar for selecting one area's drawer.

### Cards / Containers
- **Corner Style:** 11px.
- **Background:** Manila (`#F9F7F0`).
- **Shadow Strategy:** card contact (see Elevation).
- **Border:** hairline (`#D3CBBB`).
- **Internal Padding:** 1.5rem (0.75rem–1.25rem inside dense rows).
- **Guide Tab:** the area classification tab (Courier Prime, 0.62rem) rides the top-left edge, translated 52% above the card.

### Inputs / Fields
- **Style:** manila fill, hairline stroke, subtle inset (`inset 0 1px 2px rgba(48,34,12,0.06)`), 5px radius.
- **Focus:** ink-blue ring, 2px offset.
- **Disabled:** 50% opacity.

### Navigation
- **Masthead strip:** a thin aged-paper band with the world's masthead in Courier Prime — "THE DAILY CARD · VOL. I / ONE WELL-SOURCED THING A DAY / date".
- **Bar:** the wordmark in Literata, links in system sans; the active link carries an ink underline offset 8px. Admin gets a second hairline tab row.

### Badges
- **Default/Secondary/Muted:** Courier Prime, 0.62rem, uppercase, 2px radius.
- **Stamped:** transparent fill, red border and text, −2° rotation — the catalog stamp.

## Do's and Don'ts

### Do:
- **Do** set the daily card's metadata in Courier Prime and its prose in Literata.
- **Do** reserve rubber-stamp red for LEARNED, urgent, and destructive states.
- **Do** give the signature stamp its slam and rotation; it is the one authored motion.
- **Do** let the guide tab name the area on cards that carry one.

### Don't:
- **Don't** use a second accent or gradient text; emphasis comes from weight, size, and the rare red.
- **Don't** use hard offset block shadows — depth is paper contact, not neobrutalism.
- **Don't** render the stamp effect on every interaction; its rarity is the point.
- **Don't** type body prose in the mono; it is a catalog label face.
- **Don't** introduce cream-with-terracotta "editorial" chrome; the incumbent look is the anti-reference this world replaced.
