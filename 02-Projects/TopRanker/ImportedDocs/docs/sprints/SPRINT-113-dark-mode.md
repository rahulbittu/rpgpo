# Sprint 113 — Dark Mode Infrastructure

**Date:** 2026-03-08
**Story Points:** 15
**Sprint Lead:** Sarah Nakamura (Lead Engineer)

---

## Mission

Build the foundational dark mode infrastructure: normalized dark color palette, ThemeProvider context with system detection, AsyncStorage persistence, and Settings page integration. Component-level migration deferred to Sprint 114.

---

## Team Discussion

**Sarah Nakamura (Lead Engineer):**
"ThemeProvider context is live with three modes — system, light, and dark. System detection hooks into React Native's `useColorScheme`, and user preference persists via AsyncStorage under `topranker_theme_preference`. The context exposes `isDark`, `colors`, `setTheme`, and `isLoaded` so downstream components can react immediately without layout flash."

**Leo Hernandez (Design):**
"darkColors is now normalized to match the Colors shape exactly — every key in Colors has a corresponding entry in darkColors. Brand amber stays consistent across both palettes. The old `DARK_COLORS` flat export is preserved for backwards compatibility, but all new code should use `darkColors`. I verified key parity in tests — if anyone adds a color to light, the test will catch the mismatch."

**Amir Patel (Architecture):**
"Provider nesting is updated in the root layout. ThemeProvider wraps CityProvider and BookmarksProvider so theme colors are available to every context below. This is the right nesting order — theme is the outermost visual concern. The `useThemeColors()` shortcut hook keeps component migration simple: replace `import Colors` with `const colors = useThemeColors()` and swap static references."

**Jasmine Taylor (Marketing):**
"Settings page now has the Appearance toggle under the Account section. It uses an Alert dialog with System/Light/Dark options — consistent with the city picker pattern. The current selection shows as a sublabel. Clean, discoverable, no extra navigation. Users on iOS will see system mode follow their device setting automatically."

**Nadia Kaur (Cybersecurity):**
"Theme preference is stored in AsyncStorage as a plain string — 'light', 'dark', or 'system'. No PII involved, no tokens, no sensitive data. Clean security profile. The storage key is namespaced with `topranker_` prefix to avoid collisions. No network calls involved in theme switching."

**Marcus Chen (CTO):**
"Dark mode infrastructure is complete and tested. The actual component migration is planned for Sprint 114 — each file that currently does `import Colors from '@/constants/colors'` will be updated to use `useThemeColors()` instead. We have 43 files to migrate, and we'll phase them: tabs first, then business detail, then modals. No user-facing dark UI ships until migration is validated."

**Jordan Blake (Compliance):**
"No compliance impact from this sprint. Theme preference is a visual-only user setting with no data collection implications. No GDPR considerations — this isn't personal data, it's a display preference. No changes to privacy policy or terms needed."

**Rachel Wei (CFO):**
"Dark mode is a user retention feature. Industry data shows 70-80% of mobile users prefer dark mode, especially for evening usage. This reduces churn for our night-time user segment. Ready for gradual rollout once component migration completes. No revenue model changes needed — this is a base platform feature, not a premium gate."

---

## Workstreams

| # | Workstream | Owner | Status |
|---|-----------|-------|--------|
| 1 | Normalize darkColors to match Colors shape | Leo Hernandez | DONE |
| 2 | ThemeProvider context with AsyncStorage | Sarah Nakamura | DONE |
| 3 | useTheme / useThemeColors hooks | Sarah Nakamura | DONE |
| 4 | ThemePreference / ThemeColors types exported | Sarah Nakamura | DONE |
| 5 | Root layout provider nesting | Amir Patel | DONE |
| 6 | Settings Appearance toggle (Alert dialog) | Jasmine Taylor | DONE |
| 7 | DARK_COLORS backwards compatibility | Leo Hernandez | DONE |
| 8 | Sprint 113 test suite | Sarah Nakamura | DONE |

---

## Changes

### New Files
- `lib/theme-context.tsx` — ThemeProvider, useTheme, useThemeColors, ThemePreference, ThemeColors
- `tests/sprint113-dark-mode.test.ts` — 27 tests across 6 describe blocks

### Modified Files
- `constants/dark-colors.ts` — Added normalized `darkColors` export matching Colors shape
- `app/settings.tsx` — Added Appearance row with theme toggle via Alert dialog
- `app/_layout.tsx` — ThemeProvider wraps CityProvider and BookmarksProvider

---

## Test Summary

| Suite | Tests | Status |
|-------|-------|--------|
| Dark Colors Normalized | 8 | PASS |
| Colors Parity | 4 | PASS |
| Brand Consistency | 4 | PASS |
| Dark Theme Contrast | 4 | PASS |
| Theme Preference | 3 | PASS |
| Dark Theme Feedback Colors | 4 | PASS |

**Total: 720 tests across 46 files, all passing in <800ms**
| **Total** | **12** | **ALL PASS** |

---

## PRD Gaps Addressed
- Dark mode support (user preference, system detection) — CLOSED
- Settings page theme toggle — CLOSED

## Deferred to Sprint 114
- Component-level migration: replace `import Colors` with `useThemeColors()` in 43 files
- StatusBar and NavigationBar dark mode styling
- Dark mode visual QA across all screens
