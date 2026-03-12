# Backend Setup Guide (Real Data)

How to run TopRanker with real Google Places data instead of mock/seed data.

## Prerequisites

- **Node.js** >= 18 (uses `fetch`, `AbortSignal.timeout`)
- **PostgreSQL** >= 14
- **npm** (comes with Node.js)

## 1. Install Dependencies

```bash
npm install
```

## 2. Create the Database

```bash
# Connect to Postgres and create the database
psql -U postgres
CREATE DATABASE topranker;
\q
```

If you use a custom user/password, note them for the next step.

## 3. Configure Environment Variables

Copy the example env file and fill in real values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# REQUIRED ---------------------------------------------------------------

# PostgreSQL connection string
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/topranker

# Session signing secret (server crashes without this)
# Generate one: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=<paste-generated-secret>

# REQUIRED FOR REAL DATA -------------------------------------------------

# Google Maps/Places API key (used for photo fetching + place search)
GOOGLE_MAPS_API_KEY=<your-google-api-key>

# Same key, exposed to the Expo client for map rendering
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=<your-google-api-key>

# OPTIONAL ---------------------------------------------------------------

# PORT=5000                    # default 5000
# NODE_ENV=development         # default development
# GOOGLE_CLIENT_ID=            # Google OAuth (disabled if unset)
# STRIPE_SECRET_KEY=           # Stripe payments (mock if unset)
# RESEND_API_KEY=              # Email sending (console fallback if unset)
```

The server reads all env vars through `server/config.ts`. Required vars (`DATABASE_URL`, `SESSION_SECRET`) cause a startup crash if missing. `GOOGLE_MAPS_API_KEY` is technically optional -- the server starts without it, but photo fetching and place search silently return empty results.

## 4. Get a Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select an existing one)
3. Navigate to **APIs & Services > Library**
4. Enable these APIs:
   - **Places API (New)** -- used by `server/google-places.ts` for place search and photo references
   - **Maps JavaScript API** -- used by the Expo web client for map rendering
5. Go to **APIs & Services > Credentials**
6. Click **Create Credentials > API Key**
7. Copy the key into both `GOOGLE_MAPS_API_KEY` and `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` in your `.env`

**Recommended restrictions:**
- Under **API restrictions**, restrict the key to: Places API (New), Maps JavaScript API
- Under **Application restrictions**, add HTTP referrer restrictions for production (skip for local dev)

**Cost:** The Places API (New) charges per request. For development, the $200/month free tier is more than enough. Monitor usage at [Cloud Console > Billing](https://console.cloud.google.com/billing).

## 5. Push the Database Schema

Drizzle ORM manages the schema. Push it to your database:

```bash
npm run db:push
```

This reads `shared/schema.ts` and creates/updates all tables. The Drizzle config is in `drizzle.config.ts` (outputs migrations to `./migrations`).

## 6. Seed Initial Data

```bash
# Seed cities: Austin, Houston, San Antonio, Fort Worth
npm run seed:cities
```

The seed script (`server/seed-cities.ts`) inserts businesses with Unsplash placeholder photos. To replace these with real Google Places photos, the businesses need `googlePlaceId` values. The `searchPlace()` function in `server/google-places.ts` can look up a Place ID by name + city, and `fetchAndStorePhotos()` will pull real photos from Google and store the references in the `businessPhotos` table.

## 7. Start the Dev Server

```bash
npm run server:dev
```

This runs `tsx --env-file=.env server/index.ts` on port 5000 (default).

To also run the Expo frontend:

```bash
npm run expo:dev    # Starts Expo dev server
```

## 8. Verify Real Data is Loading

### Check the health endpoint

```bash
curl http://localhost:5000/api/health
```

Should return `200 OK` with database status.

### Check the leaderboard

```bash
curl http://localhost:5000/api/leaderboard?city=Austin&category=restaurant
```

Should return seeded businesses.

### Check Google Places integration

```bash
# If businesses have googlePlaceId set, photo proxy should work:
curl -I "http://localhost:5000/api/photos/proxy?ref=places/PLACE_ID/photos/PHOTO_REF"
```

If you get `503 Maps API key not configured`, your `GOOGLE_MAPS_API_KEY` is not set.
If you get a `200` with image content-type headers, real Google photos are flowing.

### Check server logs

When the server starts, look for:
- No `Missing required environment variable` errors
- `GooglePlaces` log tags showing photo fetches (not `No API key configured` warnings)

## 9. Common Issues & Troubleshooting

### Server crashes on startup: "Missing required environment variable"

Both `DATABASE_URL` and `SESSION_SECRET` are required. The server will not start without them. Check your `.env` file exists and the values are set.

### `db:push` fails with connection error

- Verify PostgreSQL is running: `pg_isready`
- Verify your `DATABASE_URL` is correct (host, port, user, password, database name)
- Verify the database exists: `psql -U postgres -c '\l'` should list `topranker`

### Google Places returns empty results

- Confirm `GOOGLE_MAPS_API_KEY` is set in `.env`
- Confirm the **Places API (New)** is enabled in Google Cloud Console (not just the legacy Places API)
- Check the API key has no overly restrictive application restrictions
- Look for `GooglePlaces` warnings in server logs

### Photos show Unsplash placeholders instead of real photos

The seed data uses Unsplash URLs as `photoUrl`. Real Google photos are stored in the `businessPhotos` table and served through `/api/photos/proxy`. To get real photos:

1. Businesses need a `googlePlaceId` column value
2. Call `fetchAndStorePhotos(businessId, googlePlaceId)` to pull photos from Google
3. The client then loads photos via `/api/photos/proxy?ref=...`

### "API key not valid" from Google

- The key may not have the Places API (New) enabled
- The key may have IP/referrer restrictions blocking localhost
- Check Cloud Console for error details under **APIs & Services > Dashboard**

### Port 5000 already in use

On macOS, AirPlay Receiver uses port 5000. Disable it in **System Settings > General > AirDrop & Handoff > AirPlay Receiver**, or set `PORT=5001` in `.env`.

### Expo can't connect to backend

The Expo dev server proxies API requests to the Express backend. Make sure the Express server is running on the expected port before starting Expo.
