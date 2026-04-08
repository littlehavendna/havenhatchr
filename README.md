# HavenHatchr

HavenHatchr is a Next.js breeder management app with polished workflows for customers, flocks, birds, pairings, hatch groups, chicks, reservations, orders, analytics, genetics, and AI placeholders.

The app is now set up to use PostgreSQL with Prisma, with Railway assumed as the hosted database provider.

## Railway PostgreSQL Setup

1. Create or open the HavenHatchr project in Railway.
2. Add a dedicated PostgreSQL service.
3. Copy the PostgreSQL connection string from Railway.
4. Set `DATABASE_URL` in a local `.env` file:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"
```

Railway usually exposes this value in the database service variables panel.

## Install And Generate Prisma

Install dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

## Run Migrations

Create and apply the local development migration:

```bash
npm run prisma:migrate -- --name init
```

This will:
- read `DATABASE_URL`
- create the PostgreSQL tables from `prisma/schema.prisma`
- regenerate the Prisma client if needed

## Seed Starter Data

Load realistic starter data for development:

```bash
npm run prisma:seed
```

The seed script populates:
- users
- customers
- flocks
- birds
- pairings
- hatch groups
- chicks
- reservations
- orders
- traits
- notes
- photos

## Run The App

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Current Database-Backed Areas

These pages now read real data from PostgreSQL through Prisma:
- Dashboard
- Customers
- Flocks
- Birds
- Pairings
- Hatch Groups
- Chicks
- Reservations
- Orders
- Analytics

These create flows now write to the real database:
- Add Customer
- Add Flock
- Add Bird
- Add Pairing
- Add Hatch Group
- Add Chick
- Add Reservation

## Prisma Files

Key database files:
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `lib/prisma.ts`
- `lib/db.ts`

## Notes

- Authentication is not added yet.
- Stripe is not added yet.
- Real AI API integration is not added yet.
- Some remaining pages still use placeholder or mock-backed logic where full DB migration was not part of the first pass.
