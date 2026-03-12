# TopRanker

Community-ranked local business leaderboard. Users rate restaurants, cafes, bars, bakeries, street food, and fast food using a credibility-weighted voting system. Higher-credibility members have more influence on rankings. Live challenger events let businesses compete head-to-head.

## Quick Start

```bash
# Install dependencies
npm install

# Set required environment variables
export DATABASE_URL="postgres://..."
export SESSION_SECRET="your-secure-secret"

# Run database migrations
npm run db:push

# Seed city data (Dallas + Austin, Houston, San Antonio, Fort Worth)
npm run seed:cities

# Start development
npm run server:dev   # Express API (port 5000)
npm run expo:dev     # Expo client (separate terminal)

# Run tests
npm test
```

## Architecture

| Layer | Technology | Details |
|-------|-----------|---------|
| Mobile App | Expo Router (React Native) | File-based routing, TypeScript |
| Backend API | Express.js | REST API on port 5000 |
| Database | PostgreSQL | 34 tables via Drizzle ORM |
| Auth | Passport.js | Local + Google OAuth strategies |
| State | React Query | Server state management |
| Testing | Vitest | 10,827 tests across 462 files, ~2.7s execution |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed system design.

## Project Structure

```
app/                    # Expo Router screens
  (tabs)/               # Tab-based navigation
    index.tsx           # Leaderboard
    challenger.tsx      # Live challenges
    search.tsx          # Discover/search
    profile.tsx         # Member profile
  business/[id].tsx     # Business profile
  rate/[id].tsx         # Rating flow (2 screens)
  admin/index.tsx       # Admin dashboard
  auth/                 # Login/signup
server/                 # Express.js backend
  routes.ts             # API endpoints
  storage.ts            # Database operations (Drizzle)
  auth.ts               # Authentication (Passport.js)
  config.ts             # Centralized env config
  schema (shared/)      # Drizzle schema + shared types
shared/                 # Shared between client/server
  schema.ts             # Database schema (34 tables, Drizzle)
  credibility.ts        # Single source of truth: tier thresholds, vote weights, temporal decay
  admin.ts              # Admin email whitelist
  city-config.ts        # City registry (active, beta, planned)
  thresholds.json       # File health thresholds (LOC, build size, test count)
constants/              # App constants
  brand.ts              # Brand system (colors, fonts)
  colors.ts             # Color palette
lib/                    # Client-side utilities
  data.ts               # UI display constants, re-exports from shared/credibility.ts
  tier-perks.ts         # Gamification perks engine
  auth-context.tsx      # Auth state provider
tests/                  # Test suite (Vitest)
docs/                   # Sprint docs, retros, audits
  process/              # Process documentation
  retros/               # Sprint retrospectives
  audits/               # Architectural audits
```

## Core Systems

### Credibility Scoring
Members earn credibility through consistent, high-quality ratings. Score determines tier (New Member -> Regular -> Trusted -> Top Judge) which determines vote weight (0.10x to 1.00x). Source of truth: `shared/credibility.ts` (tier logic, vote weights, temporal decay). UI display constants in `lib/data.ts`.

### Rating Flow
2-screen flow: Screen 1 captures 3 scores (food, service, vibe) + would-return. Screen 2 captures optional dish vote, note, and photo. Ratings include temporal decay — recent ratings weight more.

### Challenger Events
Businesses compete head-to-head with vote-based resolution. Countdown timer, VS layout, winner reveal with confetti.

### Rate Gating
Accounts must be 3+ days old to submit ratings. Prevents drive-by manipulation.

## Environment Variables

### Required
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Session signing secret (no fallback — server crashes without it) |

### Optional
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | (disabled) |
| `STRIPE_SECRET_KEY` | Stripe payments | (mock mode) |
| `RESEND_API_KEY` | Email sending | (console mode) |
| `GOOGLE_MAPS_API_KEY` | Google Maps/Places | (disabled) |

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/leaderboard` | Rankings by city/category |
| GET | `/api/leaderboard/categories` | Available categories |
| GET | `/api/businesses/search` | Search businesses |
| GET | `/api/businesses/:slug` | Business profile |
| GET | `/api/businesses/:id/ratings` | Business ratings |
| GET | `/api/dishes/search` | Search dishes |
| GET | `/api/challengers/active` | Active challenger events |
| GET | `/api/trending` | Trending businesses |
| GET | `/api/members/:username` | Public member profile |

### Authenticated
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ratings` | Submit a rating |
| GET | `/api/members/me` | Current user profile |
| GET | `/api/members/me/impact` | Rating impact stats |

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register new account |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/logout` | End session |
| GET | `/api/auth/me` | Current session |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/seed-cities` | Seed multi-city data |
| GET | `/api/admin/analytics/dashboard` | Analytics dashboard with conversion rates |
| GET | `/api/admin/confidence-thresholds` | Confidence threshold configuration |
| GET | `/api/admin/analytics/funnel` | Funnel analytics data |
| POST | `/api/admin/analytics/flush` | Flush analytics buffer |

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

10,827 tests across 462 files, covering credibility scoring, tier semantics, auth validation, GDPR, security, analytics, notifications, A/B experiments, file health thresholds, and 570+ sprint-specific feature tests.

## Brand System

| Element | Value |
|---------|-------|
| Primary (Amber) | `#C49A1A` |
| Secondary (Navy) | `#0D1B2A` |
| Background | `#F7F6F3` |
| Heading Font | Playfair Display 900 |
| Body Font | DM Sans |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — System design, data flow, security model
- [API Reference](docs/API.md) — Endpoint specifications
- [Contributing](CONTRIBUTING.md) — Development workflow, coding standards
- [Changelog](CHANGELOG.md) — Version history
- Sprint docs: `docs/sprints/SPRINT-N-*.md` (569 sprints)
- Retrospectives: `docs/retros/RETRO-N-*.md`
- Audits: `docs/audits/ARCH-AUDIT-N.md` (every 5 sprints)
- Process: `docs/process/BACKLOG-REFINEMENT.md`

## Cities

**Active (5):** Dallas, Austin, Houston, San Antonio, Fort Worth (Texas)
**Beta (6):** Oklahoma City, New Orleans, Memphis, Nashville, Charlotte, Raleigh

## License

Proprietary. All rights reserved.
