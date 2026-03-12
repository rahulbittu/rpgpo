# Sprint 668: EAS Preview Build + iOS Testing Setup

**Date:** 2026-03-11
**Points:** 3
**Focus:** Configure EAS preview builds so the CEO can test the native iOS app on their iPhone

## Mission

The CEO has been unable to test the production-quality iOS build on their physical iPhone. The web version (topranker.io) works but the native iOS experience differs significantly in UI. This sprint configures EAS Build preview profile to produce installable .ipa files and sets up OTA updates so future code changes auto-deploy without rebuilding.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The eas.json preview profile was already scaffolded but never wired to production. We need EXPO_PUBLIC_API_URL pointing to Railway so the native app talks to the real backend, not localhost."

**Amir Patel (Architecture):** "EAS Build runs in the cloud — no local Xcode needed. The preview profile uses 'internal' distribution which means ad-hoc provisioning. The CEO registers their device UUID once, then every build is installable via QR code."

**Marcus Chen (CTO):** "This is overdue. We can't ship to the App Store without thorough native testing. The web-to-native UI differences need to be caught and fixed before submission."

**Nadia Kaur (Cybersecurity):** "Internal distribution is safe — only registered devices can install. The preview build still uses HTTPS to Railway. No credentials are baked into the binary."

## Changes

### `eas.json` (+1 LOC)
- Added `EXPO_PUBLIC_API_URL: "https://topranker-production.up.railway.app"` to preview build env
- Preview builds now connect to production Railway backend

### Setup Steps (Manual — CEO)
1. `npx eas-cli@latest login` — authenticate with Expo account
2. `npx eas-cli@latest init` — link project to Expo, get real project UUID
3. `npx eas-cli@latest build --profile preview --platform ios` — trigger cloud build
4. Install via QR code on iPhone
5. Future updates: `npx eas-cli@latest update --branch preview` — OTA, no rebuild

## Health
- **Tests:** 11,697 pass (501 files)
- **Build:** 655.5kb (server unchanged — client-only config)
