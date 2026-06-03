# QR Link Manager

An admin-only dashboard for creating, managing, and tracking short links and QR codes with engagement analytics.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + Tailwind CSS + shadcn/ui
- QR generation: `qrcode` npm package

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for API contracts
- `lib/db/src/schema/links.ts` — short links table
- `lib/db/src/schema/admins.ts` — admin users table
- `artifacts/api-server/src/routes/auth.ts` — login/logout/me endpoints
- `artifacts/api-server/src/routes/links.ts` — CRUD + QR endpoints
- `artifacts/api-server/src/routes/analytics.ts` — summary + table endpoints
- `artifacts/qr-admin/src/` — React frontend

## Architecture decisions

- Auth uses a simple header-based pattern (`x-admin-id`) stored in localStorage on the client — no JWT/sessions needed for a single-admin tool
- QR codes are generated server-side with the `qrcode` package and returned as base64 data URLs
- Short codes are 6-char random alphanumeric strings generated with uniqueness checks
- Short URL base is `https://link.company.com/{code}` (update to real domain in production)
- Analytics are computed from the links table (clicks + scans columns) — no separate analytics table

## Product

- Admin login (username: `admin`, password: `admin123`)
- Create short links with name, destination URL, status, and optional expiry date
- Auto-generates a 6-character short code and QR code on creation
- Manage all codes — search, filter by status/expiry, edit, or delete
- Analytics dashboard with total engagements, active/inactive/expired counts, and per-link breakdown

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Admin password is stored as plain text hash in dev — replace with bcrypt for production
- Clicks and scans are seeded but not automatically incremented (would need a redirect handler at the short URL domain)
- Run `pnpm --filter @workspace/db run push` after any schema changes

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
