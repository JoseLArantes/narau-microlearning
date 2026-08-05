# Tenant-scoped content and slug routing

Narau uses one database and one shared engine pipeline, while a tenant owns the language-specific content boundary. Tenant slugs are public route keys resolved dynamically from the database; tenant IDs are internal foreign keys, and composite tenant-aware relations prevent areas, subjects, daily selections, assignments, and reports from crossing boundaries. This keeps the engines shared without making the admin catalog global or allowing a new language to require code changes.

The request tenant is established by middleware from the first URL segment. A first-time user is created by the Auth.js adapter with that request tenant, and tenant ownership is mandatory in the database; there is no implicit English fallback. Tenant administration is global-admin-only, while all content administration is scoped to the tenant in the current route.
