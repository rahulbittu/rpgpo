# Google Play Store Metadata — TopRanker

**Last Updated:** 2026-03-11
**Status:** Draft — ready for review

---

## Play Console Setup

### Step 1: Create App

1. Go to [play.google.com/console](https://play.google.com/console)
2. Click "Create app"
3. Fill in:
   - **App name:** TopRanker — Best In Your City
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free
4. Accept Developer Program Policies and US export laws
5. Click "Create app"

---

### Step 2: Store Listing

#### Short Description (80 chars max)
Trustworthy restaurant rankings powered by credibility-weighted ratings.

#### Full Description (4000 chars max)
TopRanker helps you find the best specific thing in your city — Best biryani in Irving, Best chai in Plano, Best tacos in Dallas.

Unlike review sites where anyone can post anything, TopRanker uses a credibility-weighted rating system where every rating has a visible consequence on the live leaderboard.

HOW IT WORKS:
• Rate restaurants on food quality, service, and vibe with a quick structured rating
• Your credibility grows as you rate — trusted raters carry more weight
• Watch live rankings shift in real time as the community votes
• Discover top dishes, not just top restaurants
• Challenge the #1 spot with head-to-head Challenger matchups

WHY TOPRANKER IS DIFFERENT:
• No fake reviews — credibility weighting attenuates noise
• No pay-to-play — rankings are earned, not bought
• Specific rankings — "Best biryani in Irving" not "Best restaurant in Dallas"
• Real consequences — every rating moves the leaderboard
• Transparent methodology — see why each place is ranked where it is

Currently serving Dallas-Fort Worth. More cities coming soon.

#### Category
Food & Drink

#### Tags
Restaurants, Food, Rankings, Reviews, Dallas

---

### Step 3: Graphics

| Asset | Spec | Source |
|-------|------|--------|
| App icon | 512 × 512 PNG | `assets/images/icon.png` |
| Feature graphic | 1024 × 500 PNG | (Need to create) |
| Phone screenshots | Min 2, max 8 | Same 5 as iOS |
| 7" tablet | Optional | Defer |
| 10" tablet | Optional | Defer |

---

### Step 4: Content Rating

1. Go to "Content Rating" in Play Console
2. Complete IARC questionnaire:
   - Violence: No
   - Sexual content: No
   - Language: No
   - Controlled substance: No (beer/wine info is informational, not promotional)
   - User interaction: Yes (ratings, but no user-to-user messaging)
   - Shares location: Yes (for finding nearby restaurants)
   - Contains ads: No
3. Expected rating: **Everyone**

---

### Step 5: Data Safety

| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Email address | Yes | No | Account |
| Name | Yes | No | Account, display |
| Approximate location | Yes | No | Nearby restaurants |
| Photos | Yes (optional) | No | Profile, ratings |
| App interactions | Yes | No | Analytics |
| Other user-generated content | Yes | No | Ratings |

- **Data encrypted in transit:** Yes (HTTPS)
- **Users can request data deletion:** Yes (Settings → Delete Account)
- **Privacy policy:** https://topranker.com/privacy

---

### Step 6: App Access (for Review)

- App requires sign-in for rating but allows browsing without account
- Test credentials: test@topranker.com / TestReviewer2026!

---

### Step 7: Build & Release

```bash
# Build Android AAB
npx eas-cli@latest build --profile production --platform android

# Submit to Play Store (requires google-services.json)
npx eas-cli@latest submit --platform android
```

**Note:** Google Play Console requires a one-time $25 developer registration fee.

---

### Step 8: Release Track

- **Internal testing** first (up to 100 testers)
- Then **Closed testing** (alpha)
- Then **Open testing** (beta)
- Then **Production** release

Recommended: Start with Internal Testing track, promote to Production after 7 days with no critical issues.

---

## Feature Graphic Design Brief

- 1024 × 500 px, PNG or JPEG
- Navy background (#0D1B2A)
- TopRanker logo centered
- Tagline: "Best In Your City"
- Amber accent (#C49A1A)
- No screenshots in feature graphic (they appear separately)
