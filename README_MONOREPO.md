ZaraDrop monorepo — developer notes

Structure
- apps/customer — existing customer app (migrated)
- apps/rider    — rider standalone app (starter)
- apps/store    — store standalone app (starter)
- apps/admin    — admin dashboard (starter)
- packages/lib  — shared Supabase client and helpers
- packages/ui   — shared UI primitives
- packages/hooks— shared hooks (placeholder)
- packages/types— shared types/contracts

Local dev
1. Install dependencies:

```bash
npm run bootstrap
```

2. Start an app (example: admin):

```bash
npm run dev:admin
```

Notes
- `packages/lib` re-exports the Supabase client; apps should import from `@zaradrop/lib`.
- Environment variables: set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (or legacy `REACT_APP_` vars) per app.

Enterprise upgrade
- A strong enterprise architecture doc has been added at `docs/ENTERPRISE_ARCHITECTURE.md`.
- A complete core schema foundation is available at `supabase/schema.sql`.
- The repo is now positioned to evolve into dispatch, support, finance, and operations center apps.
