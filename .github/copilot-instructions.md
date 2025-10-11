## WorkDoc360 — Copilot instructions (concise)

Purpose: give an AI coding agent the immediate, practical knowledge needed to be productive in this repo.

High-level architecture (why-files matter)
- Frontend: Vite + React (project root `frontend/` — build *before* infra deploy). See `frontend/package.json`.
- Backend: Node + Express + TypeScript in `server/`. Main routing and business logic live in `server/routes.ts` and `server/*` services.
- Database: PostgreSQL accessed via Drizzle ORM. Migration config in `drizzle.config.ts` and migrations output under `./migrations`.
- Infra: AWS CDK in `infra/` — `infra/lib/base-stack.ts` provisions S3 + CloudFront SPA hosting.
- Scripts: misc operational scripts in `scripts/` (Confluence sync, backups, Cloudflare helpers).

Critical developer workflows (concrete)
- Install deps (root): `npm install` (note there are also `package.json` files in `server/` and `infra/`).
- Run backend dev server: from repo root run `npm run dev` (this runs `tsx server/index.ts`).
- Build app: `npm run build` — produces frontend build and bundles server (`vite build` then `esbuild` for server).
- Database migrations: `npm run db:push` (uses `drizzle-kit`; requires `DATABASE_URL` env var). See `drizzle.config.ts` which throws if DATABASE_URL missing.
- Infra deploy (CDK):
  - Build frontend first: `cd frontend && npm install && npm run build`
  - Then: `cd infra && npm install && npm run deploy` (CDK bootstrap required once per account/region).
- Confluence test & sync: `node scripts/test-confluence.js` and `node scripts/sync-to-confluence.js` (use `.env.confluence.template` as example env).

Project-specific conventions & gotchas
- Single company per account: routes enforce "one company per account" and often return the existing company instead of error (see company creation in `server/routes.ts`).
- Dev-only shortcuts: a number of endpoints and behaviors are intentionally relaxed in `NODE_ENV=development`:
  - `/api/auth/test-login` (creates a persistent test user)
  - Download endpoint sets a hard-coded dev user (email `deividasm@hotmail.co.uk`) when in development (search `Development mode - auto-setting David user` in `server/routes.ts`).
- Subdomain system: the app uses a preloaded subdomain pool and `preloadedSubdomainManager` (`server/services/preloadedSubdomainManager.ts`) for company subdomains. Be careful when changing slug logic.
- File uploads: multer stores uploads to `uploaded_assets/` and enforces a 10MB limit and mime/extension filters (see multer config in `server/routes.ts`).
- Environment: many scripts require specific env vars. `drizzle.config.ts` fails without `DATABASE_URL`. Use `.env.template` and `.env.confluence.template` as starting points.

Integration points (external services to be aware of)
- CSCS Smart Check: RPA/Puppeteer-based verification (look for `server/services/cscsRpaService.ts` and other `cscs*` files).
- AI: Anthropic SDK (`@anthropic-ai/sdk`) used for document generation; see `document-generator` modules.
- Email: SendGrid is initialised in `server/routes.ts` if `SENDGRID_API_KEY` is present.
- Payments: Stripe SDKs are used for subscriptions (see `server/services/*payment*` and `package.json` dependencies).
- DNS/hosting automation: Cloudflare and GoDaddy helpers across `server/services/*` and `scripts/*` (many helper scripts like `update-cloudflare.ps1`).

Where to look first when asked to change behavior
- Business logic / routes: `server/routes.ts` (very large but central). For smaller, focused features inspect `server/services/*.ts`.
- DB schema: `shared/schema.ts` referenced by `drizzle.config.ts` (migrations written by drizzle-kit).
- Frontend contract: API endpoints used by frontend are defined in `server/routes.ts` — use them as the source of truth.
- Infra: `infra/lib/base-stack.ts` and `infra/bin/workdoc360.ts`.

Debugging tips & quick checks
- If migrations fail: ensure `DATABASE_URL` is set and points to a Postgres instance. `drizzle.config.ts` will throw early.
- PDF/doc exports: document download/preview endpoints perform heavy runtime imports and log extensively — follow console output in backend to trace PDF generation errors (`documentExport` module import and buffer checks are instrumented).
- Authentication in dev: use `/api/auth/test-login` or the dev auto-user in downloads to bypass SSO/session issues.
- Large edits: run `npm run check` (TS compile) and `npm run dev` to smoke-test endpoints.

Notes & assumptions
- Node engine is set high in `package.json` (22.x) — validate local Node version or use nvm/nvs.
- There are multiple `package.json` files; run commands in the right folder (root vs `infra` vs `server` or use top-level scripts where provided).

If anything in these instructions is unclear or you'd like more examples (unit tests, a specific endpoint flow, or how to wire a new env var), tell me which part to expand and I will iterate.
