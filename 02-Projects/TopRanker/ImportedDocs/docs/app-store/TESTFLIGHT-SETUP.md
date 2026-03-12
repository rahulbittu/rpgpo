# TestFlight Beta Distribution Setup

**Last Updated:** 2026-03-11

---

## Overview

TestFlight allows distributing pre-release builds to up to 10,000 external testers. For TopRanker Phase 1 (Indian Dallas community), TestFlight is the fastest path to real user feedback before the public App Store launch.

---

## Step 1: Upload Build to App Store Connect

After EAS builds the production iOS binary:

```bash
# Option A: EAS Submit (automated)
npx eas-cli@latest submit --platform ios

# Option B: Manual upload
# Download the .ipa from EAS dashboard
# Upload via Transporter app (Mac App Store) or App Store Connect web
```

---

## Step 2: Configure TestFlight in App Store Connect

### Internal Testers (up to 25)

1. Go to App Store Connect → Your App → TestFlight
2. Click "Internal Testing" → "+"
3. Add team members by Apple ID
4. Internal testers get builds automatically — no Apple review needed

### External Testers (up to 10,000)

1. Click "External Testing" → "+" → "Create Group"
2. Name: "Dallas Beta Testers"
3. Add testers by email (they receive TestFlight invitation)
4. External testing requires **Beta App Review** by Apple (usually 24-48h)

---

## Step 3: Beta App Review

First external TestFlight build requires Apple review. Provide:

| Field | Value |
|-------|-------|
| What to Test | "Browse restaurant rankings, rate a business, explore the Discover map, and try a Challenger matchup." |
| Test Account | test@topranker.com / TestReviewer2026! |
| Contact | rahulpitta4@gmail.com |
| Privacy Policy | https://topranker.com/privacy |

---

## Step 4: Invite Testers

### Phase 1: Core Team (Internal)
- CEO, engineering team, immediate family
- 5-10 people for initial smoke testing

### Phase 2: Dallas Community (External)
- WhatsApp group leaders from Indian-American community
- 50-100 initial invites
- Link format: `https://testflight.apple.com/join/[CODE]`

### Public Link (Optional)
- Generate a public TestFlight link for broader distribution
- Share on WhatsApp groups, at temple events, cricket leagues
- Cap at 1,000 testers for Phase 1

---

## Step 5: Monitor Feedback

### In App Store Connect
- Crash reports (TestFlight tab → Crashes)
- Tester feedback (TestFlight tab → Feedback)
- Build install counts

### In-App
- Analytics events via our existing Analytics module
- Rating submissions per tester
- Screen engagement patterns

---

## Step 6: Iterate

1. Fix critical crashes within 24h
2. Push OTA updates for non-native changes:
   ```bash
   npx eas-cli@latest update --branch preview --message "Bug fix description"
   ```
3. For native changes, build and upload a new binary
4. TestFlight builds expire after 90 days

---

## TestFlight Checklist

- [ ] Production build uploaded to App Store Connect
- [ ] Internal testing group created with team members
- [ ] External testing group "Dallas Beta Testers" created
- [ ] Beta app review submitted and approved
- [ ] Public TestFlight link generated
- [ ] First 10 external testers invited
- [ ] Crash monitoring active
- [ ] Feedback collection process established

---

## OTA Updates via expo-updates

For JavaScript-only changes (no native module additions):

```bash
# Push update to preview channel
npx eas-cli@latest update --branch preview --message "Sprint N: description"

# Push update to production channel
npx eas-cli@latest update --branch production --message "Sprint N: description"
```

Users get the update next time they open the app. No TestFlight review needed.
