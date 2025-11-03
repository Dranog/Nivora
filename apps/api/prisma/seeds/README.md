# Database Seeds

This directory contains seed scripts to populate the database with initial data.

## Running Seeds

```bash
cd apps/api
npx ts-node prisma/seeds/seed.ts
```

## What Gets Seeded

- **Categories**: 10 default categories (Fashion, Fitness, Gaming, etc.)
- **Test Users**:
  - Creator: `creator@oliver.test`
  - Fan: `fan@oliver.test`
- **Sample Marketplace Listings**: 2 example listings

## Notes

- Seeds use `upsert` to avoid duplicates
- Passwords should be properly hashed in production
- This is for development/testing only
