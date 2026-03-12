# App Store Connect Setup Checklist

**Last Updated:** 2026-03-11

---

## Step 1: Create App in App Store Connect

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Platform:** iOS
   - **Name:** TopRanker — Best In Your City
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** com.topranker.app (should appear in dropdown)
   - **SKU:** topranker-ios-v1
   - **User Access:** Full Access
4. Click "Create"
5. **Note the App ID** (numeric, e.g., 6738472901) — update `eas.json` `ascAppId`

---

## Step 2: App Information

| Field | Value |
|-------|-------|
| Name | TopRanker — Best In Your City |
| Subtitle | Trustworthy restaurant rankings |
| Category | Food & Drink |
| Secondary Category | Lifestyle |
| Content Rights | Does not contain third-party content |
| Age Rating | 4+ (no objectionable content) |

---

## Step 3: Pricing and Availability

| Field | Value |
|-------|-------|
| Price | Free |
| Availability | United States (initially) |
| Pre-Order | No |

---

## Step 4: Version Information (1.0.0)

### Description
(Copy from APP-STORE-METADATA.md)

### Keywords
best restaurants, food rankings, restaurant ratings, biryani, chai, Indian food, Dallas restaurants, Irving food, Plano restaurants, Frisco dining, restaurant finder, food discovery, trustworthy reviews, restaurant leaderboard, food ratings

### Support URL
https://topranker.com/support

### Marketing URL
https://topranker.com

### What's New
Welcome to TopRanker! Find the best specific thing in your city with credibility-weighted rankings.

---

## Step 5: App Review Information

| Field | Value |
|-------|-------|
| First Name | Rahul |
| Last Name | Pitta |
| Phone | (your phone number) |
| Email | rahulpitta4@gmail.com |
| Demo Account | test@topranker.com |
| Demo Password | TestReviewer2026! |
| Notes | See APP-STORE-METADATA.md review notes section |

---

## Step 6: Build

1. Run `npx eas-cli@latest build --profile production --platform ios`
2. Run `npx eas-cli@latest submit --platform ios` (or upload build in App Store Connect)
3. Select the build in the "Build" section of version 1.0.0

---

## Step 7: Screenshots

Upload 5 screenshots for each required device size.
See SCREENSHOT-MAPPING.md for the mapping.

---

## Step 8: App Privacy

### Data Collection Disclosures

| Data Type | Collected | Linked to User | Used for Tracking |
|-----------|-----------|-----------------|-------------------|
| Email Address | Yes | Yes | No |
| Name | Yes | Yes | No |
| Location (Coarse) | Yes | No | No |
| Photos | Yes (optional) | Yes | No |
| User Content (Ratings) | Yes | Yes | No |
| Usage Data | Yes | No | No |

### Privacy Policy URL
https://topranker.com/privacy

---

## Step 9: Submit for Review

1. Verify all sections show green checkmarks
2. Click "Submit for Review"
3. Answer questionnaire:
   - Uses IDFA? No
   - Uses encryption? No (marked in app.json)
   - Content rights? Original content
4. Wait 24-48h for review (first submission may take longer)

---

## Post-Approval

1. Set release date (manual or automatic)
2. Monitor Crash Reports in App Store Connect
3. Set up App Analytics
4. Respond to any App Store reviews
