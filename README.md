# Cove

Full-stack hotel booking portfolio app: **React (Vite) + Express + MongoDB**.

```
cove-booking/
├── frontend/     # React SPA
├── backend/      # Express REST API
└── package.json  # root scripts
```

## Features

- Auth: register / login / JWT / profile update
- Hotel search: city, dates, guests, price, property type
- Availability checks (server-side booking conflicts)
- Reserve stays with pricing breakdown
- Cancel upcoming bookings
- Bookmarks (saved stays)
- Reviews + rating averages
- Map view (Leaflet)
- Seeded demo data

## Quick start

### 1. MongoDB

```bash
# Option A: Docker
cd backend && docker compose up -d

# Option B: local mongod on mongodb://127.0.0.1:27017
```

### 2. Install

```bash
npm install
npm run install:all
```

### 3. Backend env

```bash
cp backend/.env.example backend/.env
```

### 4. Seed + run

```bash
npm run seed
npm run dev
```

- Web: http://localhost:5173  
- API: http://localhost:5000/api/health  

### Demo accounts

| Role  | Email            | Password      |
|-------|------------------|---------------|
| Guest | guest@cove.dev   | password123   |
| Host  | host@cove.dev    | password123   |
| Admin | admin@cove.dev   | password123   |

## API overview

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| GET | `/api/auth/me` | JWT |
| GET | `/api/hotels` | — |
| GET | `/api/hotels/:id` | — |
| GET | `/api/hotels/:id/availability` | — |
| POST | `/api/bookings` | JWT |
| GET | `/api/bookings/me` | JWT |
| PATCH | `/api/bookings/:id/cancel` | JWT |
| GET/POST/DELETE | `/api/bookmarks` | JWT |
| GET/POST | `/api/hotels/:id/reviews` | JWT for write |

## Stack

**Frontend:** React 18, Vite, React Router, Axios, Leaflet, date-fns  
**Backend:** Express, Mongoose, JWT, bcrypt, express-validator  
**Database:** MongoDB
