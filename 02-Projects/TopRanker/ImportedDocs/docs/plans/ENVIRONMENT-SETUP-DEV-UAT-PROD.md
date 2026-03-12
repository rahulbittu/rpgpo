# Environment Setup Plan: Dev → UAT → Prod

**Date:** 2026-03-11
**Owner:** Rahul Pitta (CEO)
**Status:** Plan — awaiting manual Railway setup

---

## Why This Matters

Right now, everything runs on one Railway service with one database. That means:
- Dev code pushes can break production for real users
- No way to test migrations before they hit the live DB
- No staging URL for QA or investor demos
- One bad deploy = downtime for everyone

**Three environments fix this:**

| Environment | Purpose | Who Uses It | URL |
|-------------|---------|-------------|-----|
| **DEV** | Active development, feature testing | Engineers, Claude | `dev.topranker.io` or `topranker-dev.up.railway.app` |
| **UAT** | Pre-production QA, stakeholder review | CEO, QA, investors | `uat.topranker.io` or `topranker-uat.up.railway.app` |
| **PROD** | Live production | Real users | `topranker.io` / `topranker.com` |

---

## Architecture

```
GitHub main branch
       │
       ├── Push to main ──────────► DEV (auto-deploy)
       │                              │
       │                              ▼ (manual promote after QA)
       │                           UAT (manual deploy or branch-based)
       │                              │
       │                              ▼ (manual promote after sign-off)
       │                           PROD (manual deploy, never auto)
       │
       └── Each environment has its OWN:
           - Railway service (separate container)
           - PostgreSQL database (separate data)
           - Environment variables
           - Railway domain
```

---

## Step-by-Step Setup Instructions

### Prerequisites
- Railway account: https://railway.com (you already have this)
- Railway CLI (optional but helpful): `npm install -g @railway/cli`

---

### STEP 1: Create the DEV Environment on Railway

1. Go to https://railway.com/dashboard
2. Open your existing **topranker** project
3. Click **"+ New Service"** → **"GitHub Repo"** → select `rahulbittu/topranker`
4. Name it: **`topranker-dev`**
5. Railway will auto-deploy from `main` branch

**Add a PostgreSQL database for DEV:**
1. In the same project, click **"+ New Service"** → **"Database"** → **PostgreSQL**
2. Name it: **`postgres-dev`**
3. Copy the `DATABASE_URL` from the PostgreSQL service's **Variables** tab

**Set environment variables for topranker-dev:**

Click the `topranker-dev` service → **Variables** tab → Add these:

```
DATABASE_URL=<paste from postgres-dev>
SESSION_SECRET=<generate a new random string — run: openssl rand -hex 32>
PORT=8080
NODE_ENV=development
GOOGLE_CLIENT_ID=398463204542-83aqkprn9rvbkgkad9lnc770pl2mq4a0.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCJ_pqj90uhHEd9cYwqoLUb54Zbu36R-jM
CORS_ORIGINS=https://topranker-dev.up.railway.app,http://localhost:5000,http://localhost:5001
```

**Configure the service settings:**
1. Go to **Settings** tab
2. Set **Root Directory:** `/` (default)
3. Set **Build Command:** `npm run server:build`
4. Set **Start Command:** `PORT=8080 npm run server:prod`
5. Set **Watch Paths:** leave empty (deploys on every push)
6. Under **Networking** → click **"Generate Domain"** → you'll get `topranker-dev-xxxx.up.railway.app`
7. Note down this domain

**Push the schema to the DEV database:**
```bash
# From your local machine
DATABASE_URL="<paste postgres-dev URL here>" npx drizzle-kit push
```

**Seed the DEV database (optional):**
```bash
DATABASE_URL="<paste postgres-dev URL here>" npm run db:seed
```
(If you have a seed script. If not, DEV starts empty — that's fine.)

---

### STEP 2: Create the UAT Environment on Railway

Repeat the same steps as DEV but with these differences:

1. **Service name:** `topranker-uat`
2. **Database name:** `postgres-uat`
3. **Environment variables:**

```
DATABASE_URL=<paste from postgres-uat>
SESSION_SECRET=<generate ANOTHER new random string — openssl rand -hex 32>
PORT=8080
NODE_ENV=production
GOOGLE_CLIENT_ID=398463204542-83aqkprn9rvbkgkad9lnc770pl2mq4a0.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCJ_pqj90uhHEd9cYwqoLUb54Zbu36R-jM
CORS_ORIGINS=https://topranker-uat.up.railway.app,https://uat.topranker.io
```

> **IMPORTANT:** UAT uses `NODE_ENV=production` so it behaves exactly like prod (security headers, CORS restrictions, etc.)

**Generate domain:** `topranker-uat-xxxx.up.railway.app`

**Push the schema:**
```bash
DATABASE_URL="<paste postgres-uat URL here>" npx drizzle-kit push
```

**Disable auto-deploy for UAT:**
1. Go to `topranker-uat` service → **Settings**
2. Under **Source** → turn OFF **"Auto Deploy"**
3. UAT should only be deployed manually after DEV passes QA

---

### STEP 3: Update the Existing PROD Environment

Your existing `topranker-production` service stays as-is. Just add/update these variables:

```
NODE_ENV=production
CORS_ORIGINS=https://topranker.io,https://www.topranker.io,https://topranker.com,https://www.topranker.com
```

**Disable auto-deploy for PROD:**
1. Go to `topranker-production` service → **Settings**
2. Under **Source** → turn OFF **"Auto Deploy"**
3. PROD should ONLY be deployed after UAT sign-off

---

### STEP 4: Custom Domains (Optional but Recommended)

In Namecheap (where topranker.io DNS is managed):

| Subdomain | Type | Value |
|-----------|------|-------|
| `dev.topranker.io` | CNAME | `topranker-dev-xxxx.up.railway.app` |
| `uat.topranker.io` | CNAME | `topranker-uat-xxxx.up.railway.app` |

Then in Railway for each service:
1. Go to **Settings** → **Networking** → **Custom Domain**
2. Add `dev.topranker.io` or `uat.topranker.io`
3. Railway handles SSL automatically

---

### STEP 5: Update CORS in Code

After setup, tell me the Railway domains for DEV and UAT. I'll update `server/security-headers.ts` to include them in the CORS allow-list. Or you can set them via the `CORS_ORIGINS` env var (comma-separated) which already works.

---

### STEP 6: Update EAS Build Profiles

After environments are set up, I'll add EAS build profiles that point to each environment:

```json
// eas.json (I'll update this)
{
  "build": {
    "development": {
      "env": { "EXPO_PUBLIC_API_URL": "https://dev.topranker.io" }
    },
    "preview": {
      "env": { "EXPO_PUBLIC_API_URL": "https://uat.topranker.io" }
    },
    "production": {
      "env": { "EXPO_PUBLIC_API_URL": "https://topranker.io" }
    }
  }
}
```

---

## Deployment Workflow (After Setup)

### Daily development:
```bash
git push origin main          # Auto-deploys to DEV
                               # Test at dev.topranker.io
```

### Promote to UAT (when DEV looks good):
```bash
# In Railway dashboard:
# 1. Go to topranker-uat service
# 2. Click "Deploy" → select the commit you want
# OR use Railway CLI:
railway service topranker-uat
railway up
```

### Promote to PROD (after UAT sign-off):
```bash
# In Railway dashboard:
# 1. Go to topranker-production service
# 2. Click "Deploy" → select the SAME commit that passed UAT
# OR use Railway CLI:
railway service topranker-production
railway up
```

---

## Database Migration Workflow

**CRITICAL: Always migrate DEV → UAT → PROD in order. Never skip.**

```bash
# 1. Generate migration locally
npx drizzle-kit generate

# 2. Apply to DEV first
DATABASE_URL="<dev-db-url>" npx drizzle-kit push

# 3. Test on DEV — verify everything works

# 4. Apply to UAT
DATABASE_URL="<uat-db-url>" npx drizzle-kit push

# 5. Test on UAT — CEO sign-off

# 6. Apply to PROD
DATABASE_URL="<prod-db-url>" npx drizzle-kit push
```

---

## Cost Estimate

| Service | Railway Plan | Est. Cost/Month |
|---------|-------------|-----------------|
| **PROD server** | Already running | ~$5-10 |
| **PROD database** | Already running | ~$5-10 |
| **DEV server** | Hobby/Pro | ~$5 |
| **DEV database** | Hobby/Pro | ~$5 |
| **UAT server** | Hobby/Pro | ~$5 |
| **UAT database** | Hobby/Pro | ~$5 |
| **Total new cost** | | ~$20/month additional |

Railway's Hobby plan ($5/month) includes 8GB RAM, 8 vCPU. More than enough for DEV/UAT.

---

## Environment Variable Reference

Every environment needs these variables. Copy this checklist:

| Variable | DEV | UAT | PROD |
|----------|-----|-----|------|
| `DATABASE_URL` | ✅ unique | ✅ unique | ✅ existing |
| `SESSION_SECRET` | ✅ unique | ✅ unique | ✅ existing |
| `PORT` | `8080` | `8080` | `8080` |
| `NODE_ENV` | `development` | `production` | `production` |
| `GOOGLE_CLIENT_ID` | same | same | same |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | same | same | same |
| `CORS_ORIGINS` | dev domains | uat domains | prod domains |
| `RESEND_API_KEY` | optional | optional | ✅ required |
| `STRIPE_SECRET_KEY` | test key | test key | live key |
| `R2_*` (file storage) | optional | optional | ✅ required |

---

## What I Can Do vs. What You Need to Do

### You (Railway Dashboard — manual):
1. Create 2 new services + 2 new PostgreSQL databases on Railway
2. Set environment variables on each service
3. Generate Railway domains
4. (Optional) Add CNAME records in Namecheap for custom domains
5. Run `npx drizzle-kit push` with each DATABASE_URL
6. Disable auto-deploy on UAT and PROD

### I (Code changes — after you're done):
1. Update `server/security-headers.ts` with new CORS domains
2. Update `eas.json` with environment-specific API URLs
3. Add deploy scripts to `package.json` for convenience
4. Update `.env.example` with all required variables documented
5. Write deployment runbook for the team

---

## Timeline

| Step | Time | Blocker |
|------|------|---------|
| Create DEV service + DB | 10 min | Railway dashboard access |
| Create UAT service + DB | 10 min | Railway dashboard access |
| Set env vars (both) | 10 min | Copy-paste from this doc |
| Push schema to both DBs | 5 min | Terminal access |
| Custom domains (optional) | 15 min | Namecheap DNS propagation (up to 24h) |
| **Total active time** | **~45 min** | |

---

## After You're Done

Come back and tell me:
1. The Railway domain for DEV (e.g., `topranker-dev-xxxx.up.railway.app`)
2. The Railway domain for UAT (e.g., `topranker-uat-xxxx.up.railway.app`)
3. The DATABASE_URLs for DEV and UAT (so I can verify schema push)

I'll then update the codebase to wire everything together.
