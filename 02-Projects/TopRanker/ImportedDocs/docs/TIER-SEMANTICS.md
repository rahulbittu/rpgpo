# Tier Semantics

> Defines exactly where `members.credibilityTier` is snapshotted vs recomputed fresh, why, and how tests enforce that contract.

## Tier Data Model

The `members.credibilityTier` column in the database stores a snapshotted value of type `CredibilityTier` (`"community" | "city" | "trusted" | "top"`). This value is updated whenever one of the following code paths executes:

| Trigger | Code Path | Module |
|---------|-----------|--------|
| Rating submission | `recalculateCredibilityScore` + `checkAndRefreshTier` | `server/storage/members.ts`, `server/routes.ts` |
| Profile view (self) | `recalculateCredibilityScore` + `checkAndRefreshTier` | `server/routes.ts` (`GET /api/members/me`) |
| Session deserialization | `checkAndRefreshTier` | `server/auth.ts` (`passport.deserializeUser`) |
| Admin member list | `checkAndRefreshTier` | `server/routes-admin.ts` (`GET /api/admin/members`) |
| Public profile | `checkAndRefreshTier` | `server/routes.ts` (`GET /api/members/:username`) |
| GDPR export | `checkAndRefreshTier` | `server/routes.ts` (`GET /api/account/export`) |
| Batch cleanup | `refreshStaleTiers` | `server/tier-staleness.ts` |

The shared credibility functions live in `shared/credibility.ts` (single source of truth for both client and server). The staleness detection and refresh logic lives in `server/tier-staleness.ts`.

---

## Semantic Rules

### 1. FRESH Paths (tier is recomputed before use)

These paths recompute the tier from the current credibility score before returning it to the client. Any path that **exposes tier to the requesting user** or **uses tier for access control** must be FRESH.

| Path | Mechanism | Why |
|------|-----------|-----|
| `POST /api/ratings` | `submitRating` calls `recalculateCredibilityScore` (which persists the new score+tier), then `checkAndRefreshTier` verifies consistency in the response | Rating submission changes score; the response must reflect the new tier immediately |
| `GET /api/members/me` | `recalculateCredibilityScore` recomputes from scratch, then `checkAndRefreshTier` verifies | Profile page is the primary place users see their tier; must be authoritative |
| `GET /api/members/:username` | `checkAndRefreshTier(member.credibilityTier, member.credibilityScore)` | Public profiles must show correct tier to avoid trust confusion |
| `GET /api/account/export` | `checkAndRefreshTier(profile.credibilityTier, profile.credibilityScore)` | GDPR Art. 20 requires accurate data export |
| `GET /api/admin/members` | `checkAndRefreshTier` mapped over each member | Admins need accurate tier for moderation decisions |
| `passport.deserializeUser` | `checkAndRefreshTier(member.credibilityTier, member.credibilityScore)` on every auth request | Session user object feeds `req.user.credibilityTier` used by all authenticated endpoints |

### 2. SNAPSHOT Paths (tier is read from DB without recomputation)

These paths read the stored tier without recomputing. This is acceptable because they display historical or aggregate data where the tier at the time of the action is the correct value.

| Path | Why Snapshotting Is Acceptable |
|------|-------------------------------|
| `getBusinessRatings` (in `server/storage/businesses.ts`) | Displays historical ratings. The tier shown is the member's tier **at the time they submitted the rating**. Recomputing would falsify the historical record. |
| `getBadgeLeaderboard` (in `server/storage/badges.ts`) | Display-only leaderboard ranked by badge count. Tier is cosmetic context, not used for access control. Batch-corrected by `refreshStaleTiers`. |
| `getVoteWeight` (in `shared/credibility.ts`) | Uses score-derived weight directly (`credibilityScore` -> weight mapping). Does not read stored tier at all; the weight is computed from the numeric score. |

### 3. The Rule

> Any path that **exposes tier to a user** or **uses tier for access control** must be FRESH.
> Paths that show **historical or aggregate data** may use snapshots.

---

## Tier Computation Stack

There are two tier computation functions in `shared/credibility.ts`:

1. **`getCredibilityTier(score)`** -- Simple score-to-tier mapping. Used by `checkAndRefreshTier` for staleness detection. Thresholds:
   - `community`: score < 100
   - `city`: score >= 100
   - `trusted`: score >= 300
   - `top`: score >= 600

2. **`getTierFromScore(score, totalRatings, totalCategories, daysActive, ratingVariance, activeFlagCount)`** -- Full tier with activity gates. Used by `recalculateCredibilityScore` as the authoritative tier. Requires both score thresholds AND activity thresholds (e.g., top requires 80+ ratings, 4+ categories, 90+ days, variance >= 1.0, zero flags).

The gate-based tier (`getTierFromScore`) is always stricter than the simple mapping (`getCredibilityTier`). When `recalculateCredibilityScore` runs, it uses the gate-based tier as the final persisted value. The `checkAndRefreshTier` function uses the simple mapping for quick staleness detection -- if the simple mapping disagrees with the stored tier, it logs the drift and returns the simple mapping. This is safe because:
- If the gate-based tier was more restrictive (e.g., score qualifies for "trusted" but activity gates keep it at "city"), the next `recalculateCredibilityScore` call will re-apply the gates.
- `checkAndRefreshTier` only runs on FRESH paths that either also call `recalculateCredibilityScore` or are display-only contexts where the simple mapping is a reasonable approximation.

---

## Enforcement

### Runtime Enforcement

- `checkAndRefreshTier` must be called before any response that includes `credibilityTier` for the requesting user or any user displayed in a list.
- Historical tier in ratings is intentionally snapshotted (tier at time of rating).
- `refreshStaleTiers` runs as a batch cleanup for display-only paths (badge leaderboard).

### Testing Contract

The testing contract is enforced by structural assertions in `tests/sprint142-tier-semantics-enforcement.test.ts`:

1. **Every FRESH path** has a test asserting that:
   - The source file imports `checkAndRefreshTier` from `./tier-staleness`
   - The route handler calls `checkAndRefreshTier` within proximity of the endpoint definition
   - For paths that also recompute, `recalculateCredibilityScore` is imported and called

2. **Every SNAPSHOT path** has a test documenting:
   - Which function reads tier from DB
   - Why snapshotting is acceptable (with inline comment)

3. **No route file defines its own tier computation** -- all tier logic must flow through `shared/credibility.ts` and `server/tier-staleness.ts`.

4. **`shared/credibility.ts` exports are used consistently** -- no inline reimplementation of tier thresholds.

### Tier Semantics Contract Object

The `TIER_SEMANTICS` constant in `server/tier-staleness.ts` enumerates all tier-reading paths programmatically. This serves as a machine-readable registry that tests can validate against the actual source code.

---

## Related Files

| File | Purpose |
|------|---------|
| `shared/credibility.ts` | Single source of truth for tier thresholds, vote weights, temporal decay |
| `server/tier-staleness.ts` | Staleness detection, `checkAndRefreshTier`, `refreshStaleTiers`, `TIER_SEMANTICS` contract |
| `server/storage/members.ts` | `recalculateCredibilityScore` -- full recomputation with activity gates |
| `server/auth.ts` | `passport.deserializeUser` -- session-level tier freshness |
| `server/routes.ts` | FRESH paths: `/api/ratings`, `/api/members/me`, `/api/members/:username`, `/api/account/export` |
| `server/routes-admin.ts` | FRESH path: `/api/admin/members` |
| `tests/sprint141-tier-path-coverage.test.ts` | Structural assertions for tier freshness (Sprint 141) |
| `tests/sprint142-tier-semantics-enforcement.test.ts` | Comprehensive tier semantics enforcement tests (Sprint 142) |
