# POSRMS – Step-by-step Deployment (Render + MongoDB + Vercel)

This guide walks you through deploying the backend to Render (with optional MongoDB connection) and the frontend to Vercel.

Note: The app currently stores data in SQLite. MongoDB is connected for health/status only unless we refactor routes to use Mongo. If you want full Mongo storage, ask and we’ll implement it next.

---

## 1) Backend on Render (Express)

1. Create a Web Service
   - Render Dashboard → New → Web Service → Connect your GitHub repo → Branch: main
2. Set Build & Start
   - Build Command: `pnpm install --no-frozen-lockfile && pnpm build:server`
   - Start Command: `node dist/server/node-build.mjs`
   - Node version: Render reads package.json "engines". This repo pins `"node": "20.x"` to ensure better-sqlite3 prebuilds are available.
3. Add Environment Variables (Settings → Environment)
   - Required
     - NODE_ENV = `production`
     - JWT_SECRET = `your-long-random-secret` (keep private)
     - FRONTEND_URL = `https://YOUR-FRONTEND.vercel.app` (update after Vercel deploy)
   - MongoDB (optional, enabled if you set USE_MONGODB)
     - USE_MONGODB = `true`
     - MONGODB_URI = `mongodb+srv://...` (paste your Atlas URI; keep it secret)
     - MONGODB_DB = `posrms` (or your DB name)
   - Optional (SQLite persistence + misc)
     - DB_PATH = `/var/data/posrms.db` (set this if you add a persistent disk)
     - JWT_EXPIRES_IN = `24h`
     - PING_MESSAGE = `pong`
     - PORT = (Render sets automatically)
4. (Optional) Add Persistent Disk
   - Settings → Disks → Add Disk → Mount Path: `/var/data` → Size: e.g. 1GB
   - Ensure `DB_PATH=/var/data/posrms.db` is set
5. Deploy
   - Click Deploy → Copy your Render URL (e.g. `https://your-api.onrender.com`)
6. Verify Health
   - Open `https://your-api.onrender.com/api/health`
   - Expected JSON: `{ status: "healthy", database: "connected", websocket: "active", mongo: "connected|disabled|disconnected" }`

---

## 2) MongoDB Atlas (already created)

1. Ensure Network Access allows your backend (0.0.0.0/0 for quick testing or restrict to Render egress)
2. Create DB user (Username/Password) and get the connection string from Atlas
3. In Render → Environment, set:
   - USE_MONGODB = `true`
   - MONGODB_URI = `YOUR_ATLAS_URI` (keep secret)
   - MONGODB_DB = `posrms`
4. Redeploy Render
5. Re-check `GET /api/health` → `mongo` should report `connected`

---

## 3) Frontend on Vercel (Vite SPA)

Project is preconfigured via vercel.json (no dashboard tweaks needed for build):
- Install Command: `pnpm install --no-frozen-lockfile` (fixes outdated lockfile CI error)
- Build Command: `pnpm build:client`
- Output Directory: `dist/spa`

Steps:
1. Vercel Dashboard → New Project → Import your repo
2. Deploy (build settings are read from vercel.json)

Optional: If your API runs elsewhere (e.g., Render) and you want `/api/*` calls from the frontend to hit it, add a rewrite in vercel.json using your actual API URL.

Option B: Env Var base URL

1. Vercel → Project Settings → Environment Variables
2. Add: `VITE_API_BASE_URL = https://your-api.onrender.com`
3. Build Command: `pnpm build:client` | Output: `dist/spa`
4. Deploy

After deploy

- Set `FRONTEND_URL` in Render to your Vercel domain (if you haven’t yet)
- Open your Vercel site → `Home`, `Order`, `Login` should work

---

## 4) Quick Checklist

Backend (Render)

- [ ] Build: `pnpm install --no-frozen-lockfile && pnpm build:server`
- [ ] Start: `node dist/server/node-build.mjs`
- [ ] Env: `NODE_ENV`, `JWT_SECRET`, `FRONTEND_URL`
- [ ] (Mongo) `USE_MONGODB=true`, `MONGODB_URI`, `MONGODB_DB`
- [ ] (SQLite disk) `DB_PATH=/var/data/posrms.db` + Persistent Disk

Frontend (Vercel)

- [ ] Option A: `vercel.json` rewrites for `/api` → Render
- [ ] Option B: `VITE_API_BASE_URL` env var
- [ ] Build `pnpm build:client` → `dist/spa`

Verification

- [ ] Render: `/api/health` returns `mongo: connected|disabled`
- [ ] Vercel app loads and calls `/api/*` successfully

---

## 5) Security Notes

- Never commit secrets (JWT_SECRET, MONGODB_URI) to Git—store them in Render/Vercel env settings.
- Prefer `vercel.json` rewrites to avoid exposing API URLs in client env vars.

Need full MongoDB data storage? Say the word and I’ll migrate routes/models from SQLite to MongoDB.
