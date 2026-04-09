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

## Current Database Status
The richer Prisma schema in [prisma/schema.prisma](/C:/Users/Jordi/havenhatchr/prisma/schema.prisma) is the current source of truth for the application.

Key schema notes:
- the schema keeps the current product surface for birds, pairings, hatch groups, chicks, reservations, orders, traits, notes, photos, and genetics fields
- orders now use a real join model through `OrderChick` instead of relying only on `chickIds` as a string array
- `Note` and `Photo` still keep practical entity metadata, but now also support optional relations for the major entities the app works with most
- the schema is intentionally richer than a minimal CRUD model because the current UI already depends on genetics fields, reservation request fields, pairing goals, chick detail fields, and analytics-ready records

Important database files:
- [prisma/schema.prisma](/C:/Users/Jordi/havenhatchr/prisma/schema.prisma)
- [prisma/seed.ts](/C:/Users/Jordi/havenhatchr/prisma/seed.ts)
- [lib/prisma.ts](/C:/Users/Jordi/havenhatchr/lib/prisma.ts)
- [lib/db.ts](/C:/Users/Jordi/havenhatchr/lib/db.ts)

## Environment Setup
Create a local `.env` file in the project root with:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"
```

For Railway, use the PostgreSQL connection string exposed by the Railway database service.

Required environment variable:
- `DATABASE_URL`

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
2. use the same Railway PostgreSQL connection string for the app service
3. run production migrations with `prisma migrate deploy`

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

Production should use:

```bash
npx prisma migrate deploy
```

Do not use `prisma migrate dev` in production.

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
- pairings
- hatch groups
- chicks
- reservations
- orders
- analytics

These create flows currently write to PostgreSQL through Prisma:
- Add Customer
- Add Flock
- Add Bird
- Add Pairing
- Add Hatch Group
- Add Chick
- Add Reservation

## Remaining Work
The app is partially migrated to the real database foundation, but not every screen is fully Prisma-backed yet.

Remaining or partial areas:
- some pages still rely on mock-backed or placeholder logic where full DB migration was not completed yet
- bird detail and some feature-specific screens still need deeper Prisma-backed read/write support
- genetics and AI surfaces are still primarily placeholder-oriented and not real AI-integrated

Not included yet:
- authentication
- Stripe
- real AI API integrations

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

Seed issues:
- confirm migrations are applied before running `npm run prisma:seed`
- check for legacy data assumptions if the schema changed recently

Build passes locally but production fails:
- confirm `DATABASE_URL` exists in the Railway app service
- confirm production runs `prisma migrate deploy`
- confirm Prisma client generation is part of the build flow
