# Villawe Architecture

## Stack

- Next.js 16 App Router
- TypeScript strict mode
- Tailwind CSS v4
- shadcn/ui
- Standalone PostgreSQL on Coolify + Prisma
- Self-hosted Redis on Coolify for cache / rate limiting foundations
- Zod validation
- Cookie-based admin auth with signed JWT sessions
- Cloudflare R2 behind a storage abstraction with local fallback

## Why Prisma

Villawe needs a relationally rich backoffice from day one: villas, seasons, verification, media, owners, inquiries, bookings, SEO pages, and audit logs all interact heavily. Prisma gives us a mature migration workflow, strong relation ergonomics, and a straightforward path for secure admin auth and CRUD-heavy server actions in a monolithic deployment.

## Folders

- `src/app`: Routes, layouts, metadata files, and API handlers
- `src/components`: Reusable public, admin, and UI primitives
- `src/features`: Domain logic by product area
- `src/lib`: Shared services such as auth, database, storage, and validation
- `prisma`: Schema, migrations, and seed data
- `public`: Brand-safe local placeholders and static assets
- `docs`: Implementation notes

## Runtime Strategy

- Public pages are server-rendered and SEO-first.
- Admin routes enforce server-side session and role checks.
- Prisma runtime connects through `DATABASE_URL`; Prisma CLI can use `DIRECT_URL` when a separate migration path is needed.
- Villawe uses standalone PostgreSQL in this deployment profile; Supabase Auth and Supabase Storage are intentionally not in scope.
- Redis is reserved for rate limiting, public cache layers, and future queue/availability workloads.
- Database access is lazy-initialized to stay build-safe.
- Demo data is allowed only outside production when `DEMO_MODE=true`.
- File storage uses `STORAGE_DRIVER=local` only in development and switches to R2 for staging/production.
