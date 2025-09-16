# POSRMS – Environment and Deployment

This document lists the required and recommended environment variables and provides a VS Code on Windows setup and deploy guide.

## Frontend (Vite) on Vercel

The frontend calls the backend at `/api/...`. In production, you must either:

- Option A (recommended): Add a rewrite in Vercel to proxy `/api` to your backend.
  - Example `vercel.json` (already present in this repo):
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

Optional: MongoDB

- Enable by setting `USE_MONGODB_ONLY=true` on the backend and providing:
  - MONGODB_URI = mongodb+srv://USER:PASS@CLUSTER/DB_NAME?retryWrites=true&w=majority
  - MONGODB_DB = posrms (database name, if not included in the URI)

## Quick Checklist

Frontend (Vercel):

- [ ] Set `VITE_API_BASE_URL` (if not using rewrites)
- [ ] (Recommended) Keep `vercel.json` rewrite for `/api` → Render backend

Backend (Render):

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET=<random-long-string>`
- [ ] `FRONTEND_URL=https://YOUR-FRONTEND.vercel.app`
- [ ] (Optional) `JWT_EXPIRES_IN`, `PING_MESSAGE`, `DB_PATH`, `USE_MONGODB_ONLY`, `MONGODB_URI`, `MONGODB_DB`

## Where these are used in code

- JWT secret/expiry: `server/routes/auth.ts` and `server/routes/mongoAuth.ts`
- FRONTEND_URL (QR links): `server/routes/tables.ts`
- DB_PATH (SQLite location): `server/database.ts`
- PING_MESSAGE: `server/index.ts` and `/api/ping`
- PORT: `server/node-build.ts`

---

## VS Code (Windows) – Setup & Deploy

Prerequisites
- Windows 10/11
- VS Code (latest)
- Git for Windows
- Node.js 20.x LTS (https://nodejs.org)
- Optional: Vercel VS Code extension or Vercel CLI

1) Clone the repo in VS Code
- Ctrl+Shift+P → “Git: Clone” → paste your repo URL → choose a folder → “Open” the project.

2) Open an integrated terminal (PowerShell)
- VS Code → Terminal → New Terminal (PowerShell).

3) Enable Corepack and activate pnpm 10.14.0
- corepack enable
- corepack prepare pnpm@10.14.0 --activate
- pnpm -v (should print 10.14.x)

4) Install dependencies
- pnpm install
- Commit the updated pnpm-lock.yaml (fixes CI “frozen lockfile” errors).

5) Run locally (dev)
- pnpm dev
- Open the local URL shown in the terminal.

6) Build locally (optional)
- pnpm build:client (generates `dist/spa`)
- pnpm build:server (generates `dist/server`)
- Start server locally (optional): node dist/server/node-build.mjs

7) Deploy to Vercel from VS Code
- Install “Vercel” extension → Sign in → “Link Project” → select your repo.
- This repo includes `vercel.json`, so build settings are preconfigured:
  - Install Command: pnpm install --no-frozen-lockfile
  - Build Command: pnpm build:client
  - Output Directory: dist/spa
- If you need backend rewrites, update `vercel.json` rewrites with your API URL.

8) Environment variables
- Frontend (Vercel): set `VITE_API_BASE_URL` only if not using rewrites.
- Backend (Render): set `JWT_SECRET`, `FRONTEND_URL`, and MongoDB vars if using Mongo.

Troubleshooting (Windows)
- ERR_PNPM_OUTDATED_LOCKFILE: run `pnpm install` and commit `pnpm-lock.yaml`.
- Node version mismatch: install Node 20.x; VS Code terminal `node -v` should be v20.
- pnpm not recognized: ensure `corepack enable` and `corepack prepare pnpm@10.14.0 --activate` ran without errors.
- Build fails loading vite.config.ts: CI uses `vite.config.mjs` via `pnpm build:client` in package.json.

---

Need help? Open an issue or use your hosting provider’s dashboard logs (Vercel/Render) to diagnose build/runtime errors.
