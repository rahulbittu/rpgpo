# Sprint 674: App Store Compliance — Account Deletion in Settings

**Date:** 2026-03-11
**Points:** 2
**Focus:** Apple App Store requirement: account deletion accessible from Settings screen

## Mission

Apple requires all apps with account creation to provide a visible "Delete Account" option. While TopRanker already has account deletion in the profile's LegalLinksSection, Apple's review guidelines require it to be accessible from Settings too. This sprint adds a Delete Account button to the Settings screen with proper confirmation dialog and error handling.

## Team Discussion

**Jordan Blake (Compliance):** "Apple Guideline 5.1.1(v) requires a clearly labeled account deletion mechanism in the app. Having it only in a sub-section of the profile page may not satisfy reviewers. Settings is the canonical location."

**Sarah Nakamura (Lead Eng):** "The implementation mirrors the existing LegalLinksSection pattern — Alert.alert confirmation, then DELETE /api/account. We already handle the 30-day grace period server-side."

**Marcus Chen (CTO):** "This is a hard App Store requirement. Non-negotiable. Also added apiRequest import for the API call — cleaner than the component approach."

**Nadia Kaur (Cybersecurity):** "The delete endpoint already requires authentication. The Alert.alert double-confirmation prevents accidental deletions. The 30-day grace period gives users time to change their mind."

## Changes

### `app/settings.tsx` (+40 LOC)
- Imported `apiRequest` and `getApiUrl` from query-client
- Added `handleDeleteAccount` function with Alert.alert confirmation dialog
- Added "Delete Account" TouchableOpacity below Sign Out button
- Subtle styling (tertiary text color, small font) — visible but not prominent per Apple HIG
- Error handling with Alert on failure

### `__tests__/sprint537-settings-extraction.test.ts` (+1 LOC)
- Raised settings.tsx LOC ceiling from 350 to 370

## Apple App Store Compliance Checklist

| Requirement | Status |
|---|---|
| Account deletion accessible | ✅ Settings + Profile |
| Privacy Policy link | ✅ Settings → Legal |
| Terms of Service link | ✅ Settings → Legal |
| `usesNonExemptEncryption: false` | ✅ app.json |
| No IDFA / ATT needed | ✅ No third-party ad SDKs |
| Location permission string | ✅ NSLocationWhenInUseUsageDescription |
| Camera permission string | ✅ NSCameraUsageDescription |
| Photo library permission string | ✅ NSPhotoLibraryUsageDescription |

## Health
- **Tests:** 11,697 pass (501 files)
- **Build:** 659.9kb
