# HavenHatchr

## Project Overview
HavenHatchr is a breeder management application for organizing day-to-day poultry operations around structured records instead of ad hoc spreadsheets and notes.

Current product areas:
- customers
- flocks
- birds
- pairings
- hatch groups
- chicks
- reservations
- orders
- analytics
- genetics
- AI tool placeholders

The app is designed so breeder workflows such as genetics tracking, hatch analysis, reservations, order fulfillment, and AI-assisted drafting can build on the same core data model.

## Current Tech Stack
- Next.js
- TypeScript
- Prisma
- PostgreSQL
- Railway
- Stripe

## Current Database Status
The richer Prisma schema in [prisma/schema.prisma](/C:/Users/Jordi/havenhatchr/prisma/schema.prisma) is the current source of truth for the application.

Key schema notes:
- the schema keeps the current product surface for birds, pairings, hatch groups, chicks, reservations, orders, traits, notes, photos, and genetics fields
- orders now use a real join model through `OrderChick` instead of relying only on `chickIds` as a string array
- `Note` and `Photo` still keep practical entity metadata, but now also support optional relations for the major entities the app works with most
- user-scoped auth and ownership are built into the current schema through `User`, `Session`, and `userId` ownership on breeder records
- billing and beta-access fields now live on `User`, including Stripe customer/subscription IDs, subscription status, trial dates, renewal dates, and `isBetaUser`
- the schema is intentionally richer than a minimal CRUD model because the current UI already depends on genetics fields, reservation request fields, pairing goals, chick detail fields, and analytics-ready records

Current checked-in migrations:
- `20260408014902_init`
- `20260408021236_add_note_photo_relations`
- `20260408023000_add_order_chick_join_and_defaults`
- `20260408093000_add_auth_and_user_scoping`
- `20260408103000_add_billing_and_beta_fields`

Important database files:
- [prisma/schema.prisma](/C:/Users/Jordi/havenhatchr/prisma/schema.prisma)
- [prisma/seed.ts](/C:/Users/Jordi/havenhatchr/prisma/seed.ts)
- [lib/prisma.ts](/C:/Users/Jordi/havenhatchr/lib/prisma.ts)
- [lib/db.ts](/C:/Users/Jordi/havenhatchr/lib/db.ts)

## Environment Setup
Create a local `.env` file in the project root with:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PRICE_ID="price_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
MONITORING_PROVIDER=""
SENTRY_DSN=""
```

For Railway, use the PostgreSQL connection string exposed by the Railway database service.

Required environment variables:
- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `MONITORING_PROVIDER` optional
- `SENTRY_DSN` optional

Security-sensitive environment notes:
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` must stay server-only
- `NEXT_PUBLIC_APP_URL` should be the canonical public app URL used for metadata, sitemap, billing redirects, and canonical tags
- local development can use Stripe test keys and a local webhook secret from the Stripe CLI
- `MONITORING_PROVIDER` and `SENTRY_DSN` are optional placeholders for a future provider-backed error monitoring integration

## Local Development Setup
1. Install dependencies:

```bash
npm install
```

2. Generate the Prisma client:

```bash
npm run prisma:generate
```

3. Run local development migrations:

```bash
npx prisma migrate dev --name init
```

4. Seed the database with realistic starter breeder data:

```bash
npm run prisma:seed
```

The seeded demo account is configured with Founder Access for local testing.

5. Start the dev server:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Railway Deployment Notes
HavenHatchr can be deployed with Railway hosting both:
- the PostgreSQL database
- the Next.js app service

For the Railway app service:
1. make sure `DATABASE_URL` is available in the app service variables
2. add the Stripe billing variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_ID`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_APP_URL`
3. use the same Railway PostgreSQL connection string for the app service
4. use checked-in Prisma migrations with `prisma migrate deploy`

Current Railway-friendly scripts in [package.json](/C:/Users/Jordi/havenhatchr/package.json):
- `npm run railway:build`
- `npm run railway:start`

Recommended Railway settings:
- Build Command:

```bash
npm run railway:build
```

- Start Command:

```bash
npm run railway:start
```

Final Railway deploy flow:
- build command runs `prisma generate`, `prisma migrate deploy`, and `next build`
- start command runs `next start` on Railway's host and port

Do not use `prisma migrate dev` or `prisma db push` in production.

Stripe webhook production notes:
- endpoint URL: `https://your-domain.com/api/stripe/webhook`
- required events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- production must use the matching `STRIPE_WEBHOOK_SECRET` for that endpoint

## Prisma Workflow
Use these commands for the following situations:

`npx prisma generate`
- regenerate the Prisma client after schema changes
- run this if TypeScript or Prisma types look out of date

`npx prisma migrate dev --name <name>`
- create and apply a new migration in local development
- use this when changing the schema during development

`npm run prisma:seed`
- reset or repopulate local development data
- use this after migrations when you want a clean starter dataset

`npx prisma migrate deploy`
- apply already-created migrations in production or hosted environments
- use this in Railway deployment flows

## Current Database-Backed Pages And Flows
These pages currently read real data from Prisma-backed route handlers:
- dashboard
- customers
- flocks
- birds
- bird profile
- pairings
- hatch groups
- chicks
- reservations
- orders
- analytics
- traits
- genetics
- AI tools placeholder context

These create flows currently write to PostgreSQL through Prisma:
- Add Customer
- Add Flock
- Add Bird
- Add Pairing
- Add Hatch Group
- Add Chick
- Add Reservation
- Add Order
- Add Trait

## Remaining Work
Remaining or partial areas:
- some editing flows are still local-state only rather than persisted back to Prisma, especially in genetics-heavy profile areas
- AI tools are still placeholder generation utilities, not real AI API integrations
- Stripe billing is wired, but production Stripe setup still depends on the correct live/test environment variables and webhook configuration in Railway/Stripe

Included now:
- authentication
- per-user data isolation
- Stripe billing and beta-access gating

Not included yet:
- real AI API integrations
- Stripe Connect or usage-based billing

## Security And SEO Foundations
The current app now includes a production-focused baseline for both private app security and public page SEO.

Security protections now in place:
- auth-protected app routes through `proxy.ts`
- admin-only protection through route/layout checks plus admin-scoped APIs
- user-scoped Prisma reads and writes through `lib/db.ts`
- same-origin mutation enforcement for authenticated and sensitive POST/PATCH flows
- starter rate limiting for login, signup, billing, and admin mutation routes
- hardened session cookies with `httpOnly`, `sameSite=lax`, `secure` in production, `priority=high`, and explicit expiry
- Stripe webhook signature verification using the raw request body
- stronger default security headers including CSP, `X-Content-Type-Options`, `Referrer-Policy`, clickjacking protection, permissions policy, COOP, CORP, and HSTS in production
- safer production error responses that avoid leaking stack traces or secrets
- audit logging for important billing/admin actions

Current Content Security Policy:
- default source is `'self'`
- Stripe domains are explicitly allowed where needed for billing redirects and hosted checkout/portal flows
- inline scripts/styles remain allowed only where needed for current Next.js behavior and styling
- future tightening should be done carefully against real production behavior

Current SEO behavior:
- public indexable pages:
  - `/`
  - `/pricing`
- public utility pages marked `noindex`:
  - `/login`
  - `/signup`
- protected/private pages marked `noindex` through response headers:
  - app routes such as dashboard, settings, analytics, genetics, AI, breeder records, billing-protected pages, and admin
- `robots.txt` and `sitemap.xml` only expose the intended public marketing URLs
- canonical metadata is set for public pages through Next.js metadata APIs

Known future hardening:
- replace the in-memory rate limiter with a shared/distributed store for multi-instance production use
- add stronger automated validation and security tests around auth, admin, and billing flows
- add centralized structured logging and alerting
- consider nonce-based CSP tightening after validating the current Next.js runtime requirements
- review and harden any future file upload flows before enabling them in production

Release checklist:
- see [docs/security-checklist.md](/C:/Users/Jordi/havenhatchr/docs/security-checklist.md)

## Monitoring And Observability
HavenHatchr now includes a lightweight observability foundation intended for beta support and future provider-backed monitoring.

Current monitoring approach:
- structured server-side operational logging through [lib/monitoring.ts](/C:/Users/Jordi/havenhatchr/lib/monitoring.ts)
- request correlation IDs added in [proxy.ts](/C:/Users/Jordi/havenhatchr/proxy.ts) and forwarded through app requests
- persisted operational event storage in Prisma through `OperationalEvent`
- safe client error capture via [app/api/monitoring/client-error/route.ts](/C:/Users/Jordi/havenhatchr/app/api/monitoring/client-error/route.ts)
- graceful UI error boundaries in [app/error.tsx](/C:/Users/Jordi/havenhatchr/app/error.tsx) and [app/global-error.tsx](/C:/Users/Jordi/havenhatchr/app/global-error.tsx)

Provider integration:
- no external monitoring dependency is required yet
- `MONITORING_PROVIDER=sentry` and `SENTRY_DSN` are reserved for a future real provider integration
- the current abstraction is designed so provider calls can be added in one place without rewriting route logic

Health route:
- [app/api/health/route.ts](/C:/Users/Jordi/havenhatchr/app/api/health/route.ts)
- returns a safe readiness response and checks database connectivity
- intended for Railway or operational checks, not public marketing use

Logging approach:
- auth, billing, admin, webhook, onboarding, AI workspace, and DNA request flows emit structured events
- operational events avoid logging passwords, tokens, secrets, webhook signatures, cookies, and similar sensitive values
- important admin and billing actions continue to be audit logged in Prisma

Tracked beta usage events:
- `beta.completed_signup`
- `beta.first_flock_created`
- `beta.first_bird_created`
- `beta.first_chick_created`
- `beta.first_pairing_created`
- `beta.first_reservation_created`
- `beta.opened_ai_tools`
- `beta.started_checkout`
- `beta.completed_tutorial`
- `beta.skipped_tutorial`

Current admin-side operational review:
- [app/admin/support/page.tsx](/C:/Users/Jordi/havenhatchr/app/admin/support/page.tsx) now includes recent operational events alongside account diagnostics, audit history, and recent usage

Future observability work recommended:
- add a real monitoring provider such as Sentry or OpenTelemetry export
- move structured logs into centralized aggregation instead of relying only on app logs and Prisma persistence
- add background job monitoring and alerting if asynchronous workflows grow
- add latency metrics and error-rate dashboards for critical API routes

## Troubleshooting
Common issues and checks:

Prisma client out of date:
- run `npx prisma generate`

`DATABASE_URL` missing:
- confirm `.env` exists locally
- confirm the Railway app service has `DATABASE_URL` in production

Migration errors:
- check that the database already has the expected prior migrations
- use `npx prisma migrate dev --name <name>` locally
- use `npx prisma migrate deploy` in hosted environments
- avoid `prisma db push` in Railway production unless you are intentionally doing manual schema recovery

Seed issues:
- confirm migrations are applied before running `npm run prisma:seed`
- check for legacy data assumptions if the schema changed recently

Build passes locally but production fails:
- confirm `DATABASE_URL` exists in the Railway app service
- confirm all Stripe variables exist in the Railway app service
- confirm production runs `prisma migrate deploy`
- confirm Prisma client generation is part of the build flow
- confirm the Stripe webhook endpoint points to `/api/stripe/webhook`
