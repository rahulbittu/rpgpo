# Railway Migration Guide — Replacing Replit

## Why Railway
- $5-10/month vs $200/2 days on Replit
- Auto-deploy from GitHub (push → deploy)
- PostgreSQL addon included
- SSE/real-time connections supported
- Zero code changes needed

## Step-by-Step Migration

### 1. Create Railway Project
1. Go to [railway.app](https://railway.app) (you're already logged in with GitHub)
2. Click **"New Project"**
3. Select **"Deploy from GitHub Repo"**
4. Choose `rahulbittu/topranker`
5. Railway will auto-detect Node.js and use the `railway.toml` config

### 2. Add PostgreSQL
1. In your Railway project, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway creates a PostgreSQL instance and auto-sets `DATABASE_URL`
3. The database is ready in ~30 seconds

### 3. Set Environment Variables
In Railway project settings → Variables tab, add:

**Required:**
```
SESSION_SECRET=<generate a random 64-char string>
NODE_ENV=production
```

**Optional (for full features):**
```
GOOGLE_MAPS_API_KEY=<your Google Maps API key>
STRIPE_SECRET_KEY=<your Stripe secret key>
RESEND_API_KEY=<your Resend email API key>
GOOGLE_CLIENT_ID=<your Google OAuth client ID>
```

**Note:** `DATABASE_URL` is auto-set by Railway when you add PostgreSQL.

### 4. Deploy
Railway auto-deploys on every push to main. The build process:
1. `npm install` (auto-detected)
2. `npm run server:build` (esbuild bundles server)
3. `npm run server:prod` (runs production server on port 5000)

### 5. Get Your Public URL
- Railway gives you a URL like `topranker-production.up.railway.app`
- Go to Settings → Networking → Generate Domain

### 6. Push Database Schema
After first deploy, push the schema:
```bash
# From your local machine
DATABASE_URL="<railway-database-url>" npx drizzle-kit push
```

Or use Railway CLI:
```bash
npm install -g @railway/cli
railway login
railway link
railway run npx drizzle-kit push
```

### 7. Migrate Data from Replit (Optional)
If you have data in Replit's PostgreSQL:
```bash
# On Replit: export database
pg_dump $DATABASE_URL --no-owner --no-privileges > db_dump.sql

# Download db_dump.sql to your machine

# Import to Railway
psql "<railway-database-url>" < db_dump.sql
```

### 8. Update Expo App to Point to Railway
In your `.env` or environment:
```
EXPO_PUBLIC_API_URL=https://topranker-production.up.railway.app
```

### 9. Test on iPhone
1. Install **Expo Go** from App Store
2. Run `npx expo start` locally
3. Scan the QR code with your iPhone camera
4. The app connects to Railway backend via the public URL

## Cost Breakdown
| Item | Monthly Cost |
|------|-------------|
| Railway Hobby Plan | $5 |
| PostgreSQL (included) | ~$1-5 based on usage |
| **Total** | **~$5-10/month** |

vs Replit: ~$100/day = ~$3,000/month

## Replit-Specific Code to Remove
After migration, these Replit env vars in `server/config.ts` can be removed:
- `REPLIT_DEV_DOMAIN`
- `REPLIT_DOMAINS`

And in `package.json`, the `expo:dev` script references `$REPLIT_DEV_DOMAIN` which can be simplified.

## Troubleshooting
- **Build fails:** Check Railway logs. Most common: missing env vars.
- **Database connection fails:** Ensure `DATABASE_URL` is set (auto by Railway PostgreSQL addon).
- **CORS errors:** Update CORS config in `server/routes.ts` to allow your Railway domain.
- **SSE disconnects:** Railway supports long-running connections on Hobby plan. No special config needed.
