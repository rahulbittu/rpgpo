# TopRanker API Reference

**Base URL**: `http://localhost:5000/api`
**Auth**: Session-based (Passport.js + express-session)
**Content-Type**: `application/json`

---

## Health

### GET /api/health
Health check with process vitals. No auth required.

**Response** `200`
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600,
  "timestamp": "2026-03-09T00:00:00.000Z",
  "nodeVersion": "v20.11.0",
  "memoryUsage": 52428800,
  "memory": { "heapUsed": 50, "heapTotal": 58, "rss": 78 }
}
```

---

## Server-Sent Events

### GET /api/events
Real-time event stream (SSE). No auth required. Max 5 concurrent connections per IP; 30-minute timeout per connection.

**Headers**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Events**
- `connected` — sent on open
- `rating_submitted` — when any rating is submitted
- `ranking_updated` — when rankings change
- `featured_updated` — when featured placements change
- Keep-alive ping every 30s

**Errors**
- `429` — Too many SSE connections from this IP

---

## Authentication

### POST /api/auth/signup
Create a new account.

**Rate Limited**: 10 attempts/min per IP

**Body**
```json
{
  "displayName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "city": "Dallas"
}
```

**Validation**
- `username`: 2-30 chars, alphanumeric + underscore only
- `email`: Valid email format
- `displayName`: 1-50 characters
- `password`: 8+ characters, must contain at least one number

**Response** `201`
```json
{
  "data": {
    "id": "uuid",
    "displayName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "city": "Dallas",
    "credibilityScore": 0,
    "credibilityTier": "community"
  }
}
```

**Errors**
- `400` — Validation error, email in use, username taken
- `429` — Rate limited

### POST /api/auth/login
Email/password login. Creates session.

**Rate Limited**: 10 attempts/min per IP

**Body**
```json
{ "email": "john@example.com", "password": "securePassword123" }
```

**Response** `200`
```json
{ "data": { "id": "uuid", "displayName": "John Doe", ... } }
```

**Errors**
- `401` — Invalid credentials
- `429` — Rate limited

### POST /api/auth/google
Google OAuth login. Creates or links account.

**Rate Limited**: 10 attempts/min per IP

**Body**
```json
{ "idToken": "google-id-token-string" }
```

**Response** `200` — Same as login

### POST /api/auth/logout
End current session.

**Response** `200`
```json
{ "data": { "message": "Logged out" } }
```

### GET /api/auth/me
Check current session.

**Response** `200` (authenticated)
```json
{ "data": { "id": "uuid", "displayName": "John Doe", ... } }
```

**Response** `200` (not authenticated)
```json
{ "data": null }
```

---

## Leaderboard

### GET /api/leaderboard
Get ranked businesses with photo URLs.

**Query Parameters**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `city` | string | "Dallas" | City filter |
| `category` | string | "restaurant" | Category filter |
| `limit` | number | 50 | Max results (1-100) |

**Response** `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Franklin Barbecue",
      "slug": "franklin-barbecue",
      "score": 94.2,
      "rank": 1,
      "previousRank": 2,
      "category": "restaurant",
      "city": "Austin",
      "photoUrl": "https://...",
      "photoUrls": ["https://..."],
      "ratingCount": 156
    }
  ]
}
```

### GET /api/leaderboard/categories
Get available categories with counts for a city.

**Query Parameters**
| Param | Type | Default |
|-------|------|---------|
| `city` | string | "Dallas" |

**Response** `200`
```json
{
  "data": [
    { "category": "restaurant", "count": 45 },
    { "category": "cafe", "count": 12 }
  ]
}
```

---

## Featured

### GET /api/featured
Get active featured business placements for a city.

**Query Parameters**
| Param | Type | Default |
|-------|------|---------|
| `city` | string | "Dallas" |

**Response** `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Franklin Barbecue",
      "slug": "franklin-barbecue",
      "category": "restaurant",
      "photoUrl": "https://...",
      "weightedScore": 94.2,
      "tagline": "Top restaurant in Austin",
      "totalRatings": 156,
      "expiresAt": "2026-03-16T00:00:00Z"
    }
  ]
}
```

---

## Businesses

### GET /api/businesses/search
Search businesses by name or query.

**Query Parameters**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query |
| `city` | string | City filter (default "Dallas") |
| `category` | string | Category filter |

**Response** `200`
```json
{
  "data": [
    { "id": "uuid", "name": "...", "slug": "...", "photoUrls": ["..."], ... }
  ]
}
```

### GET /api/businesses/:slug
Get business profile by URL slug. Includes recent ratings, dishes, and photos. Fetches Google Places photos on-demand if none exist.

**Response** `200`
```json
{
  "data": {
    "id": "uuid",
    "name": "Franklin Barbecue",
    "slug": "franklin-barbecue",
    "description": "...",
    "score": 94.2,
    "foodScore": 96.1,
    "serviceScore": 91.3,
    "vibeScore": 95.2,
    "rank": 1,
    "category": "restaurant",
    "city": "Austin",
    "address": "900 E 11th St, Austin, TX 78702",
    "photoUrls": ["https://..."],
    "ratingCount": 156,
    "wouldReturnPercent": 94,
    "recentRatings": [...],
    "dishes": [...]
  }
}
```

### GET /api/businesses/:id/ratings
Get paginated ratings for a business.

**Query Parameters**
| Param | Type | Default |
|-------|------|---------|
| `page` | number | 1 |
| `per_page` | number | 20 (max 50) |

### GET /api/businesses/:id/rank-history
Get historical rank data for charts.

**Query Parameters**
| Param | Type | Default |
|-------|------|---------|
| `days` | number | 30 (7-90) |

### POST /api/businesses/:slug/claim
Submit a business ownership claim. **Requires auth**.

**Body**
```json
{
  "role": "Owner",
  "phone": "555-123-4567"
}
```

**Response** `200`
```json
{ "data": { "id": "uuid", "status": "pending" } }
```

**Errors**
- `400` — Role is required
- `404` — Business not found
- `409` — Already have a pending or approved claim

### GET /api/businesses/:slug/dashboard
Get business dashboard analytics. **Requires auth** (business owner).

**Response** `200`
```json
{
  "data": {
    "totalRatings": 156,
    "avgScore": 4.2,
    "rankPosition": 3,
    "rankDelta": -2,
    "wouldReturnPct": 94,
    "topDish": { "name": "Brisket", "votes": 42 },
    "ratingTrend": [4.1, 4.3, 4.2],
    "recentRatings": [
      { "id": "uuid", "user": "JohnD", "score": 4.5, "tier": "city", "note": "Great!", "date": "2026-03-08T..." }
    ]
  }
}
```

---

## Ratings

### POST /api/ratings
Submit a rating. **Requires auth**.

**Rate Gating**: Account must be 3+ days old.

**Body**
```json
{
  "businessId": "uuid",
  "foodScore": 8,
  "serviceScore": 7,
  "vibeScore": 9,
  "wouldReturn": true,
  "dishName": "Brisket",
  "note": "Best BBQ in Texas"
}
```

**Validation** (Zod schema)
- `foodScore`, `serviceScore`, `vibeScore`: 1-10 integer
- `wouldReturn`: boolean
- `businessId`: required UUID
- `dishName`, `note`: optional strings
- `score`: sanitized to 1-5 range

**Response** `201`
```json
{
  "data": {
    "rating": { ... },
    "newRank": 3,
    "previousRank": 5,
    "credibilityDelta": 3,
    "newTier": "city",
    "tierUpgraded": false,
    "newCredibilityScore": 120
  }
}
```

Tier values: `"community"` | `"city"` | `"trusted"` | `"top"` (see [Credibility Tiers](#credibility-tiers)).

**Errors**
- `400` — Validation error
- `401` — Not authenticated
- `403` — Account too new (3+ days required), or account suspended
- `409` — Already rated this business

---

## Members

### GET /api/members/me
Current user's full profile with credibility breakdown, rating history, and seasonal stats. **Requires auth**.

**Response** `200`
```json
{
  "data": {
    "id": "uuid",
    "displayName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "city": "Dallas",
    "avatarUrl": "https://...",
    "credibilityScore": 120,
    "credibilityTier": "city",
    "totalRatings": 15,
    "totalCategories": 3,
    "distinctBusinesses": 12,
    "isFoundingMember": false,
    "joinedAt": "2026-01-01T...",
    "daysActive": 68,
    "ratingVariance": 1.2,
    "credibilityBreakdown": { ... },
    "ratingHistory": [...]
  }
}
```

### PUT /api/members/me
Update current user's profile. **Requires auth**.

**Body** (all fields optional, at least one required)
```json
{
  "displayName": "New Name",
  "username": "new_username"
}
```

**Validation**
- `displayName`: 1-50 characters
- `username`: 3-30 alphanumeric or underscore characters

**Response** `200`
```json
{ "data": { "id": "uuid", "displayName": "New Name", "username": "new_username", ... } }
```

**Errors**
- `400` — Validation error or no valid fields
- `404` — Member not found

### PUT /api/members/me/email
Update current user's email address. **Requires auth**.

**Body**
```json
{ "email": "new@example.com" }
```

**Response** `200`
```json
{ "data": { "email": "new@example.com" } }
```

**Errors**
- `400` — Invalid email format
- `404` — Member not found
- `409` — Email already in use

### POST /api/members/me/avatar
Upload a new profile avatar. **Requires auth**. Accepts `multipart/form-data` with an `avatar` file field.

**Constraints**
- Allowed types: `image/jpeg`, `image/png`, `image/webp`
- Max size: 2 MB

**Response** `200`
```json
{ "data": { "avatarUrl": "https://..." } }
```

**Errors**
- `400` — Not multipart, no file, or unsupported image type
- `404` — Member not found
- `413` — Image exceeds 2 MB limit

### POST /api/members/me/push-token
Register a push notification token for the current user. **Requires auth**.

**Body**
```json
{ "pushToken": "ExponentPushToken[xxx]" }
```

**Response** `200`
```json
{ "ok": true }
```

### GET /api/members/me/notification-preferences
Get notification preferences for the current user. **Requires auth**.

**Response** `200`
```json
{
  "data": {
    "ratingResponses": true,
    "tierUpgrades": true,
    "challengerResults": true,
    "newChallengers": true,
    "weeklyDigest": false,
    "marketingEmails": false
  }
}
```

### PUT /api/members/me/notification-preferences
Update notification preferences. **Requires auth**.

**Body** (all fields optional; omitted fields default to `true` for core notifications, `false` for marketing)
```json
{
  "ratingResponses": true,
  "tierUpgrades": true,
  "challengerResults": true,
  "newChallengers": true,
  "weeklyDigest": false,
  "marketingEmails": false
}
```

**Response** `200`
```json
{ "data": { ... } }
```

### GET /api/members/me/impact
Rating impact statistics for the current user. **Requires auth**.

### GET /api/members/:username
Public member profile. No auth required.

**Response** `200`
```json
{
  "data": {
    "displayName": "John Doe",
    "username": "johndoe",
    "credibilityTier": "city",
    "totalRatings": 15,
    "joinedAt": "2026-01-01T..."
  }
}
```

---

## Challengers

### GET /api/challengers/active
Get active challenger events.

**Query Parameters**
| Param | Type | Default |
|-------|------|---------|
| `city` | string | "Dallas" |
| `category` | string | — |

**Response** `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "business1": { "id": "uuid", "name": "...", "votes": 42 },
      "business2": { "id": "uuid", "name": "...", "votes": 38 },
      "status": "active",
      "endsAt": "2026-03-10T00:00:00Z"
    }
  ]
}
```

---

## Dishes

### GET /api/dishes/search
Search dishes for a specific business.

**Query Parameters**
| Param | Type | Description |
|-------|------|-------------|
| `business_id` | string | **Required.** Business UUID |
| `q` | string | Search query |

**Errors**
- `400` — business_id required

---

## Trending

### GET /api/trending
Get trending businesses (most rating activity in last 7 days).

**Query Parameters**
| Param | Type | Default |
|-------|------|---------|
| `city` | string | "Dallas" |
| `limit` | number | 3 (max 10) |

---

## Photos

### GET /api/photos/proxy
Proxy for Google Places photos (avoids CORS issues on mobile).

**Query Parameters**
| Param | Type | Description |
|-------|------|-------------|
| `ref` | string | Google Places photo reference |
| `maxwidth` | number | Max image width |

---

## Badges

### GET /api/members/:id/badges
List earned badges for a member. No auth required.

**Response** `200`
```json
{ "data": [{ "badgeId": "first_rating", "badgeFamily": "milestones", "earnedAt": "2026-03-01T..." }] }
```

### POST /api/badges/award
Award a badge to the authenticated user. **Requires auth**.

**Body**
```json
{ "badgeId": "first_rating", "badgeFamily": "milestones" }
```

**Response** `200`
```json
{ "data": { ... }, "awarded": true }
```

**Errors**
- `400` — badgeId and badgeFamily are required

### GET /api/badges/earned
Get earned badge IDs for the authenticated user. **Requires auth**.

**Response** `200`
```json
{ "data": { "badgeIds": ["first_rating", "ten_ratings"], "badgeCount": 2 } }
```

### GET /api/badges/leaderboard
Top members ranked by badge count. No auth required.

**Query Parameters**
| Param | Type | Default |
|-------|------|---------|
| `limit` | number | 20 (max 50) |

**Response** `200`
```json
{ "data": [{ "memberId": "uuid", "displayName": "...", "badgeCount": 12 }] }
```

### GET /share/badge/:badgeId
Server-rendered HTML page with Open Graph meta tags for social sharing of a badge. Returns HTML, not JSON.

---

## Experiments

### GET /api/experiments
List all active experiments. No auth required. Rate limited.

**Response** `200`
```json
{
  "data": [
    { "id": "confidence_tooltip", "description": "Show info icon tooltip on confidence badge vs no tooltip", "variants": ["control", "treatment"] }
  ]
}
```

### GET /api/experiments/assign
Get variant assignment for an experiment. Authenticated users receive a deterministic variant; unauthenticated users receive default `"control"`. Rate limited.

**Query Parameters**
| Param | Type | Description |
|-------|------|-------------|
| `experimentId` | string | **Required.** Experiment ID |
| `context` | string | Optional context label (default "api") |

**Response** `200`
```json
{ "data": { "experimentId": "confidence_tooltip", "variant": "treatment", "isDefault": false } }
```

**Errors**
- `400` — experimentId query parameter is required

---

## Payments

All payment routes are rate limited (20 req/min per IP). All **require auth**.

### POST /api/payments/challenger
Create a Challenger entry payment.

**Body**
```json
{ "businessName": "Franklin Barbecue", "slug": "franklin-barbecue" }
```

**Response** `200`
```json
{ "data": { "id": "pi_xxx", "amount": 9900, "status": "succeeded", "metadata": { ... } } }
```

**Errors**
- `400` — businessName and slug are required
- `404` — Business not found

### POST /api/payments/dashboard-pro
Subscribe a business to Dashboard Pro.

**Body**
```json
{ "slug": "franklin-barbecue" }
```

**Response** `200`
```json
{ "data": { "id": "pi_xxx", "amount": 4900, "status": "succeeded", "metadata": { ... } } }
```

**Errors**
- `400` — slug is required
- `404` — Business not found

### POST /api/payments/featured
Purchase a Featured Placement for a business (7-day window).

**Body**
```json
{ "slug": "franklin-barbecue" }
```

**Response** `200`
```json
{ "data": { "id": "pi_xxx", "amount": 9900, "status": "succeeded", "metadata": { ... } } }
```

**Errors**
- `400` — slug is required
- `404` — Business not found

### POST /api/payments/cancel
Cancel a payment or subscription. Checks ownership before mutation. **Requires auth**.

**Body**
```json
{ "paymentId": "uuid" }
```

**Response** `200`
```json
{ "data": { "id": "uuid", "status": "cancelled" } }
```

**Errors**
- `400` — paymentId is required
- `403` — Not authorized to cancel this payment
- `404` — Payment not found

### GET /api/payments/history
Get payment history for the authenticated user. **Requires auth**.

**Query Parameters**
| Param | Type | Default |
|-------|------|---------|
| `limit` | number | 20 (max 50) |

**Response** `200`
```json
{ "data": [{ "id": "uuid", "type": "challenger_entry", "amount": 9900, "status": "succeeded", "createdAt": "..." }] }
```

---

## Category Suggestions

### POST /api/category-suggestions
Submit a new category suggestion. **Requires auth**.

**Body** — validated by `insertCategorySuggestionSchema`
```json
{ "name": "food trucks", "reason": "Many food trucks in Dallas" }
```

**Response** `201`
```json
{ "data": { "id": "uuid", "name": "food trucks", "status": "pending", ... } }
```

### GET /api/category-suggestions
Get all pending category suggestions. No auth required.

---

## Account Management (GDPR / CCPA)

### GET /api/account/export
Export all user data in machine-readable JSON format (GDPR Art. 20 data portability). **Requires auth**.

**Response** `200` — `Content-Disposition: attachment`
```json
{
  "data": {
    "exportDate": "2026-03-09T...",
    "format": "GDPR Art. 20 compliant",
    "profile": { "displayName": "...", "credibilityTier": "city", ... },
    "ratings": [...],
    "impact": { ... },
    "seasonalActivity": [...],
    "badges": [...]
  }
}
```

### DELETE /api/account
Request account deletion with 30-day grace period. **Requires auth**.

**Response** `200`
```json
{
  "data": {
    "message": "Account scheduled for deletion",
    "deletionDate": "2026-04-08T...",
    "gracePeriodDays": 30,
    "note": "You can cancel this request by logging in within 30 days."
  }
}
```

### POST /api/account/schedule-deletion
Schedule account for GDPR deletion with 30-day grace period (persisted to database). **Requires auth**.

**Response** `200`
```json
{
  "data": {
    "message": "Account deletion scheduled",
    "scheduledAt": "2026-03-09T...",
    "deleteAt": "2026-04-08T...",
    "gracePeriodDays": 30,
    "status": "pending"
  }
}
```

### GET /api/account/deletion-status
Check current deletion schedule status. **Requires auth**.

**Response** `200` (no pending deletion)
```json
{ "data": { "hasPendingDeletion": false } }
```

**Response** `200` (pending)
```json
{
  "data": {
    "hasPendingDeletion": true,
    "scheduledAt": "2026-03-09T...",
    "deleteAt": "2026-04-08T...",
    "status": "pending"
  }
}
```

### POST /api/account/cancel-deletion
Cancel a previously scheduled account deletion. **Requires auth**.

**Response** `200`
```json
{ "data": { "cancelled": true } }
```

**Errors**
- `404` — No pending deletion request found

---

## Webhooks

### POST /api/webhook/stripe
Stripe webhook for async payment status updates. Called by Stripe, not by clients.

### POST /api/webhook/deploy
GitHub deploy webhook for auto-rebuild on push.

### GET /api/deploy/status
Get current deployment status.

---

## Admin Endpoints

All admin endpoints require **authentication + admin email whitelist** (checked via `shared/admin.ts`). Admin routes are rate limited at 30 req/min per IP.

### Category Suggestions

#### PATCH /api/admin/category-suggestions/:id
Approve or reject a category suggestion.

**Body**
```json
{ "status": "approved" }
```
Status must be `"approved"` or `"rejected"`.

### Seed Cities

#### POST /api/admin/seed-cities
Seed multi-city business data from Google Places.

**Response** `200`
```json
{ "data": { "message": "Cities seeded successfully" } }
```

### Google Places Photos

#### POST /api/admin/fetch-photos
Fetch Google Places photos for businesses that don't have any.

**Body**
```json
{ "city": "Austin", "limit": 20 }
```

**Response** `200`
```json
{
  "data": {
    "message": "Fetched photos for 5 businesses",
    "fetched": 23,
    "results": [{ "name": "Franklin Barbecue", "photos": 5 }]
  }
}
```

### Claims

#### GET /api/admin/claims
Get all pending business claims.

#### PATCH /api/admin/claims/:id
Approve or reject a business claim.

**Body**
```json
{ "status": "approved" }
```
Status must be `"approved"` or `"rejected"`.

#### GET /api/admin/claims/count
Get count of pending claims.

**Response** `200`
```json
{ "data": { "count": 5 } }
```

### Flags

#### GET /api/admin/flags
Get all pending content flags.

#### PATCH /api/admin/flags/:id
Confirm or dismiss a content flag.

**Body**
```json
{ "status": "confirmed" }
```
Status must be `"confirmed"` or `"dismissed"`.

#### GET /api/admin/flags/count
Get count of pending flags.

**Response** `200`
```json
{ "data": { "count": 3 } }
```

### Members

#### GET /api/admin/members
List members with admin details and freshness-corrected tiers.

**Query Parameters**
| Param | Type | Default |
|-------|------|---------|
| `limit` | number | 50 (max 100) |

#### GET /api/admin/members/count
Get total member count.

**Response** `200`
```json
{ "data": { "count": 1200 } }
```

### Webhook Events

#### GET /api/admin/webhooks
Get recent webhook events.

**Query Parameters**
| Param | Type | Default |
|-------|------|---------|
| `source` | string | "stripe" |
| `limit` | number | 50 (max 100) |

#### POST /api/admin/webhooks/:id/replay
Replay a webhook event (re-process the payload).

**Response** `200`
```json
{ "data": { "id": "uuid", "replayed": true } }
```

**Errors**
- `400` — Unsupported webhook source
- `404` — Webhook event not found

### Performance

#### GET /api/admin/perf
Get server performance statistics (request timing, p50/p95/p99).

### Revenue

#### GET /api/admin/revenue
Get aggregate revenue metrics.

#### GET /api/admin/revenue/monthly
Get monthly revenue breakdown.

**Query Parameters**
| Param | Type | Default |
|-------|------|---------|
| `months` | number | 6 (max 24) |

### Analytics

#### GET /api/admin/analytics
Get analytics funnel stats and recent events.

**Response** `200`
```json
{
  "data": {
    "funnel": { "signup_completed": 50, "first_rating": 20, ... },
    "recentEvents": [...]
  }
}
```

#### GET /api/admin/analytics/dashboard
Get analytics dashboard with conversion funnel and rates.

**Response** `200`
```json
{
  "data": {
    "overview": { "totalEvents": 1234, "uniqueEventTypes": 8 },
    "funnel": {
      "pageViews": 500, "signups": 50, "firstRatings": 20,
      "challengerEntries": 10, "dashboardSubs": 2,
      "signupRate": "10.0%", "ratingRate": "40.0%"
    },
    "recentActivity": [...],
    "generatedAt": "2026-03-08T00:00:00.000Z"
  }
}
```

### Metrics & Health

#### GET /api/admin/metrics
Server metrics snapshot.

**Response** `200`
```json
{
  "data": {
    "uptime": 3600,
    "memoryUsage": 52428800,
    "nodeVersion": "v20.11.0",
    "requestCount": 150,
    "errorCount": 3
  }
}
```

#### GET /api/admin/health/detailed
Detailed system health dashboard with memory, CPU, and feature flags.

**Response** `200`
```json
{
  "data": {
    "uptime": 3600,
    "memory": { "heapUsed": 40000000, "heapTotal": 60000000, "rss": 80000000 },
    "nodeVersion": "v20.11.0",
    "platform": "linux",
    "cpuUsage": { "user": 500000, "system": 100000 },
    "activeConnections": 0,
    "featureFlags": [
      { "name": "dark_mode", "enabled": true, "description": "Dark mode theme support", "createdAt": 1709827200000 }
    ],
    "generatedAt": "2026-03-08T00:00:00.000Z"
  }
}
```

### Confidence Thresholds

#### GET /api/admin/confidence-thresholds
Get category confidence thresholds (read-only).

**Response** `200`
```json
{
  "data": {
    "thresholds": { ... },
    "defaults": { ... }
  }
}
```

### Experiments (Admin)

#### GET /api/admin/experiments/metrics
Get experiment exposure and outcome statistics with Wilson score confidence intervals. **Requires auth + admin**.

**Query Parameters**
| Param | Type | Description |
|-------|------|-------------|
| `experimentId` | string | Optional. Omit to get stats for all active experiments. |

**Response** `200` (single experiment)
```json
{
  "data": {
    "experimentId": "confidence_tooltip",
    "description": "...",
    "active": true,
    "exposure": { ... },
    "outcomes": { ... },
    "dashboard": { ... }
  }
}
```

**Response** `200` (all experiments, when `experimentId` is omitted)
```json
{
  "data": [
    { "experimentId": "confidence_tooltip", "description": "...", "exposure": { ... }, "outcomes": { ... }, "dashboard": { ... } }
  ]
}
```

---

## Credibility Tiers

Tier names and score thresholds (from `shared/credibility.ts`):

| Tier | Score Threshold | Vote Weight |
|------|-----------------|-------------|
| `community` | 0+ | 0.100x |
| `city` | 100+ | 0.350x |
| `trusted` | 300+ | 0.700x |
| `top` | 600+ | 1.000x |

Full tier promotion also requires activity gates (total ratings, categories, days active, rating variance, zero flags for `top` tier). See `shared/credibility.ts` for exact thresholds.

Tier freshness is enforced at the API level: all endpoints returning tier data verify that the stored tier matches the current score and correct any staleness before responding.

---

## Error Format

All errors follow this format:
```json
{ "error": "Human-readable error message" }
```

Common HTTP status codes:
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (ratings, signups) |
| 400 | Bad request / validation error |
| 401 | Authentication required |
| 403 | Forbidden (not admin, account too new, suspended) |
| 404 | Not found |
| 409 | Conflict (duplicate rating, email in use, existing claim) |
| 413 | Payload too large (avatar upload) |
| 429 | Rate limited |
| 500 | Server error |
