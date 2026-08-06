# Narau Content Context

Narau delivers one daily learning card per language-specific tenant. A tenant owns the language route and all editorial content consumed by its users, while the ingestion, selection, and assignment engines are shared across tenants.

## Content boundaries

**Tenant**:
A language-specific content boundary with a unique public route slug, such as `en`, `es`, or `pt-br`.
_Avoid_: Locale, language, site

**Tenant slug**:
The URL-safe public key used to resolve a tenant in routes and links.
_Avoid_: Tenant ID, locale code

**Content**:
The areas, subjects, candidate records, daily selections, and learning history owned by one tenant.
_Avoid_: Shared content, global content

**Area**:
A tenant-owned editorial category that drives ingestion and daily selection.
_Avoid_: Topic, category

**Subject**:
A tenant-owned sourced learning article that can be selected for a daily card.
_Avoid_: Content item, article

**AI curation**:
An optional, source-bound editorial transformation that reshapes a selected Subject to the configured reading time without adding outside facts. Failure always falls back to the Subject.
_Avoid_: AI generation, AI-authored content

**Curated daily text**:
The immutable-for-the-day AI derivative stored on a DailyAreaSubject and shared by every user assigned that publication. Its model, prompt version, source revision, and time are recorded; the Subject remains the authority.
_Avoid_: Curated Subject, personalized AI text

## Operations

**Tenant context**:
The tenant resolved from the current public route and used to scope every request, admin view, and mutation.
_Avoid_: Current locale, selected language

**Shared engine**:
The worker pipeline that runs the same ingestion, selection, assignment, and reminder logic for every tenant.
_Avoid_: Tenant engine, language service

**Tenant manager**:
The admin surface used to create, edit, activate, and select tenant contexts.
_Avoid_: Language manager, locale settings

**Tenant-owned user**:
A user created through a tenant route and permanently assigned to that tenant. A user session cannot switch the user's tenant; administrators switch tenant context when managing shared infrastructure or another tenant's catalog.
_Avoid_: Global user, language preference
