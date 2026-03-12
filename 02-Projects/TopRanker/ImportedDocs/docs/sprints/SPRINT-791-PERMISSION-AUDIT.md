# Sprint 791 — Full Permission Audit

**Date:** 2026-03-12
**Theme:** Comprehensive audit of all Android/iOS permissions against actual code usage
**Story Points:** 1 (hardening)

---

## Mission Alignment

- **App Store readiness:** Every declared permission must have corresponding code usage
- **Trust:** Users should only see permission prompts for features they'll actually use

---

## Audit Results

### Android Permissions (6 declared, all justified)

| Permission | Used By | Justified |
|-----------|---------|-----------|
| ACCESS_FINE_LOCATION | search.tsx, MapView.tsx | Yes — "find restaurants near you" |
| ACCESS_COARSE_LOCATION | search.tsx | Yes — city-level location fallback |
| CAMERA | RatingExtrasStep, PhotoUploadSheet, edit-profile | Yes — photo upload in rating flow + profile |
| READ_EXTERNAL_STORAGE | RatingExtrasStep, ReceiptUploadCard | Yes — pick photos from gallery |
| VIBRATE | haptic-patterns.ts | Yes — haptic feedback patterns |
| RECEIVE_BOOT_COMPLETED | notifications.ts | Yes — restart push notification listener |

### Android — NOT Declared (correct)

| Permission | Reason Not Included |
|-----------|-------------------|
| RECORD_AUDIO | Removed Sprint 789 — no audio recording |
| WRITE_EXTERNAL_STORAGE | Deprecated in Android 13+, not needed |
| INTERNET | Auto-granted, never declared explicitly |

### iOS Permissions (3 usage descriptions, all justified)

| Usage Description | Used By |
|------------------|---------|
| NSLocationWhenInUseUsageDescription | search.tsx, MapView.tsx |
| NSCameraUsageDescription | Image picker, profile photo |
| NSPhotoLibraryUsageDescription | Image picker, receipt upload |

### iOS Privacy Manifests (4 declared)

| API Category | Reason Code | Justification |
|-------------|-------------|---------------|
| UserDefaults | CA92.1 | AsyncStorage for city preference, bookmarks |
| FileTimestamp | DDA9.1 | Expo/Metro bundler file operations |
| SystemBootTime | 35F9.1 | Expo timer/performance metrics |
| DiskSpace | E174.1 | Expo/Metro cache management |

---

## Team Discussion

**Derek Okonkwo (Mobile):** "All 6 Android permissions map to real features. READ_EXTERNAL_STORAGE is the only one with deprecation concerns — Android 13+ uses granular media permissions, but expo-image-picker handles this automatically."

**Nadia Kaur (Cybersecurity):** "Clean bill of health. No permission declared without usage, no usage without declaration. The privacy manifests cover all the Apple-required API categories."

**Jordan Blake (Compliance):** "This audit is exactly what App Store review will check. We can now confidently fill in the permission justifications in App Store Connect."

**Sarah Nakamura (Lead Eng):** "19 automated tests ensure this audit stays valid. Any new permission or removed permission will fail the test."

---

## Changes

| File | Change |
|------|--------|
| `__tests__/sprint791-permission-audit.test.ts` | 19 tests — comprehensive permission audit |

---

## Tests

- **New:** 19 tests in `__tests__/sprint791-permission-audit.test.ts`
- **Total:** 13,366 tests across 595 files — all passing
- **Build:** 666.8kb (max 750kb)
