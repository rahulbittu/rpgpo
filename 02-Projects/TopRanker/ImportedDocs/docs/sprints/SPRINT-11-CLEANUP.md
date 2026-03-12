# Sprint 11: Codebase Cleanup & Hardening (v1.11-Cleanup)

**Sprint Goal:** Address technical debt from audit — unused imports, accessibility gaps, hardcoded values, user-facing error messages.

**Status:** Complete
**Tag:** `v1.11-Cleanup`

---

## Architecture Council Discussion

**Carlos Ruiz (QA Lead):** I ran a full audit. Found unused imports, hardcoded values, missing accessibility labels, and a technical error message shown to end users.

**James Park (Frontend Arch):** The `Image` import from expo-image is dead in index.tsx — we migrated to SafeImage. The getItemLayout uses a magic number 222 that should be a named constant.

**Mei Lin (Mobile Arch):** Accessibility is non-negotiable for a platform that wants millions of users. Missing labels mean screen reader users can't navigate. Every interactive element needs a role and label.

**Elena Torres (VP Design):** The Google Maps error message was developer-facing — "Go to console.cloud.google.com..." — users should never see that. Simplified to "Map temporarily unavailable. Please try the list view."

**Marcus Chen (CTO):** Good catches. Quick fix sprint, high polish impact.

---

## Tickets

### TICKET-11.1: Remove Unused Imports
- **Owner:** Ryan Mitchell (Sr Frontend)
- **Files Modified:** `app/(tabs)/index.tsx`
- **Changes:** Removed unused `import { Image } from "expo-image"` — all photo rendering now uses SafeImage component.

### TICKET-11.2: Accessibility Improvements
- **Owner:** Tommy Nguyen (Frontend)
- **Files Modified:** `app/(tabs)/index.tsx`
- **Changes:** Added `accessibilityRole="link"` and `accessibilityLabel` to hero "View Profile" button.

### TICKET-11.3: Extract Magic Constants
- **Owner:** Ryan Mitchell (Sr Frontend)
- **Files Modified:** `app/(tabs)/index.tsx`
- **Changes:** Extracted hardcoded `222` in `getItemLayout` to `RANKED_CARD_HEIGHT` constant.

### TICKET-11.4: User-Friendly Error Messages
- **Owner:** Tommy Nguyen (Frontend)
- **Files Modified:** `app/(tabs)/search.tsx`
- **Changes:** Simplified Google Maps auth failure message from technical console instructions to "Map temporarily unavailable. Please try the list view."

### TICKET-11.5: Signup City Integration
- **Owner:** Lisa Kim (Backend/Frontend)
- **Files Modified:** `app/auth/signup.tsx`
- **Changes:** Signup now reads city from CityContext instead of hardcoded "Dallas". Subtitle dynamically shows "Join the {city} ranking community".

---

## Release Checklist
- [x] Unused Image import removed
- [x] Accessibility labels added
- [x] Magic constants extracted
- [x] Error messages user-friendly
- [x] Signup uses dynamic city
- [x] TypeScript clean
