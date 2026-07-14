# Cove

Full-stack hotel booking portfolio app: **React (Vite) + Express + MongoDB**.

```
cove-booking/
├── frontend/     # React SPA
├── backend/      # Express REST API
└── package.json  # root scripts
```

## Features

### Auth
- Access + refresh JWT in **httpOnly cookies** (`cove_access`, `cove_refresh`)
- Refresh rotation, logout revocation, axios auto-refresh on 401

### Booking product
- Hotel search (city, dates, guests, price, type, **near-me / radius**)
- Availability calendar + conflict checks
- Reserve → **mock pay** → confirmation **email** (Ethereal in dev)
- Cancel with **flexible / moderate / strict** refund rules
- Service fee + tax breakdown
- Bookmarks + **shareable wishlist**
- Guest ↔ host **messaging**
- Host dashboard (create/edit/upload images)
- Admin panel
- EN/FA locale toggle (RTL for FA)

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

## Auth cookie flow

1. `POST /api/auth/login|register` sets `cove_access` (15m) + `cove_refresh` (7d)
2. Protected routes read access cookie (Bearer also supported)
3. `POST /api/auth/refresh` rotates refresh token
4. Frontend uses `withCredentials` and retries once after refresh on 401

## Deploy notes (portfolio)

Suggested free-tier layout:

- **MongoDB Atlas** → connection string in `MONGODB_URI`
- **Backend** → Render / Railway / Fly.io  
  Set `NODE_ENV=production`, `CLIENT_URL`, `JWT_SECRET`, cookie `secure` + `sameSite=none`
- **Frontend** → Vercel / Netlify  
  Proxy or set `VITE_API_URL` to the API origin  
  Enable HTTPS so Secure cookies work

Optional SMTP:

```
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

Without SMTP, confirmation emails use Ethereal test accounts (preview URL in API logs).

## Scripts

```bash
npm run test --prefix backend          # unit
npm run test:integration --prefix backend  # needs API up
npm run lint --prefix frontend
npm run build --prefix frontend
```

## Stack

**Frontend:** React 18, Vite, React Router, Axios, Leaflet  
**Backend:** Express, Mongoose, JWT cookies, bcrypt, multer, nodemailer, rate-limit  
**Database:** MongoDB
