# POSRMS – Deployment & Environment Variables

This document lists the required and recommended environment variables for deploying the POSRMS app. The current backend uses SQLite (better-sqlite3) and bcryptjs for hashing (to avoid native build issues on hosts). MongoDB is optional and would require code changes.

## Frontend (Vite) on Vercel

The frontend calls the backend at `/api/...`. In production, you must either:

- Option A (recommended): Add a rewrite in Vercel to proxy `/api` to your backend.
  - Example `vercel.json` (add in project root):
    {
    "rewrites": [{ "source": "/api/(.*)", "destination": "https://YOUR-BACKEND.onrender.com/api/$1" }]
    }
- Option B: Use an absolute API base URL in the app (requires minimal code change to prepend `import.meta.env.VITE_API_BASE_URL` to fetch calls).

Environment variables to set in Vercel (Project Settings → Environment Variables):

- VITE_API_BASE_URL = https://YOUR-BACKEND.onrender.com
  - Only needed if you choose Option B or want to generate absolute links from the client.

Notes:

- Vite exposes only variables prefixed with `VITE_` to the browser.
- No secrets should use the `VITE_` prefix unless they are safe to expose publicly.

## Backend (Express) on Render

The backend exposes `/api` routes and WebSocket server. Configure the following env vars in Render (Dashboard → Service → Environment):

Required:

- NODE_ENV = production
- JWT_SECRET = <a long, random secret>
- FRONTEND_URL = https://YOUR-FRONTEND.vercel.app
  - Used to generate QR order links in `/api/tables/qr-codes`.

Optional:

- JWT_EXPIRES_IN = 24h (default: 24h)
- PING_MESSAGE = pong (used by `/api/ping`)
- DB_PATH = /var/data/posrms.db
  - Set when using a persistent disk on Render; otherwise defaults to `./data/posrms.db` (ephemeral).
- PORT = (Render sets this automatically; the server reads `process.env.PORT`.)

CORS:

- The server enables CORS by default via `cors()`; no env configuration required.

## Database

Current default: SQLite via better-sqlite3

- Location configurable with `DB_PATH` (see above).

Optional: MongoDB (not implemented yet)

- If you want MongoDB, you’ll need code changes to connect and use it (e.g., Mongoose/official driver/Prisma Mongo). When switching, use these standard env vars:
  - MONGODB_URI = mongodb+srv://USER:PASS@CLUSTER/DB_NAME?retryWrites=true&w=majority
  - MONGODB_DB = posrms (database name, if not included in the URI)
  - (Optional) MONGODB_USER, MONGODB_PASSWORD, MONGODB_REPLICA_SET
- We can implement MongoDB support on request.

## Quick Checklist

Frontend (Vercel):

- [ ] Set `VITE_API_BASE_URL` (if not using rewrites)
- [ ] (Recommended) Add `vercel.json` rewrite for `/api` → Render backend

Backend (Render):

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET=<random-long-string>`
- [ ] `FRONTEND_URL=https://YOUR-FRONTEND.vercel.app`
- [ ] (Optional) `JWT_EXPIRES_IN`, `PING_MESSAGE`, `DB_PATH`

MongoDB (optional):

- [ ] `MONGODB_URI`, `MONGODB_DB` (plus optional credentials) – requires code changes.

## Where these are used in code

- JWT secret/expiry: `server/routes/auth.ts`
- FRONTEND_URL (QR links): `server/routes/tables.ts`
- DB_PATH (SQLite location): `server/database.ts`
- PING_MESSAGE: `server/index.ts` and `/api/ping`
- PORT: `server/node-build.ts`

If you want, I can wire the client to `VITE_API_BASE_URL` or add a `vercel.json` for rewrites.
