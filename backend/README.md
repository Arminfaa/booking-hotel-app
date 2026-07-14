# Cove API

Express + MongoDB backend for the Cove booking app.

## Setup

```bash
cp .env.example .env
npm install
# ensure MongoDB is running
npm run seed
npm run dev
```

## Scripts

- `npm run dev` — start API with `--watch`
- `npm start` — production start
- `npm run seed` — reset and seed demo data

## Domain models

- **User** — guest / host / admin
- **Hotel** — listing with geo Point, amenities, pricing
- **Booking** — stay reservation with overlap prevention
- **Review** — per-user rating per hotel
- **Bookmark** — saved hotels per user
