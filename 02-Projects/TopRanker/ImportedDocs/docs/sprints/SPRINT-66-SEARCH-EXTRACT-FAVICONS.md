# Sprint 66 — Search Extraction (N1/N6) + Rich Favicons + Legal Team Activation

## Mission Alignment
Sprint 66 directly addresses three audit findings and a CEO directive: (1) N1/N6 file size reduction by extracting search.tsx components, (2) replacement of all placeholder/default favicon assets with rich brand-aligned PNGs at multiple sizes, (3) activation of legal team responsibilities that have been dormant since Sprint 55.

## CEO Directives
> "I need rich favicons at all costs."
> "Why is the legal team not working since many sprints?"

## Backlog Refinement (Pre-Sprint)
**Attendees**: ALL team members — Rahul (CEO), Marcus (CTO), Suki (Design), James (Frontend), Mei Lin (Types), Carlos (QA), Sage (Backend), Nadia (Security), Priya (RBAC)

**Selected**:
- N1/N6: Extract search.tsx sub-components into dedicated module (5 pts)
- Rich multi-size favicon generation pipeline from SVG source (5 pts)
- Legal/compliance team activation and roadmap (3 pts)
- Favicon generation tooling: `scripts/generate-favicons.js` (2 pts)

**Total**: 15 story points

## Team Discussion — Every Member Speaks

### Rahul Pitta (CEO)
"Two things. First: the favicon situation is embarrassing. Our favicon is still the default Expo blue chevron. When someone has 30 tabs open and they see a blue arrow instead of our gold podium, we've lost them. I need rich favicons at all costs — every size, every platform, every context. Apple touch icon, Android adaptive icon, PWA manifest icons, everything.

Second: where is the legal team? We haven't had legal input since Sprint 55. Nadia, as VP Security, you overlap with legal compliance. I want a legal compliance roadmap: terms of service, privacy policy, GDPR/CCPA readiness, content moderation policy, and restaurant data usage rights. Every serious app has these. We can't launch without them."

### Suki (Design Lead)
"The favicon redesign is my top priority this sprint. I created a rich SVG with the full brand mark — navy gradient background, gold podium bars with shine gradients, rank numbers embedded, a star/crown accent with glow effects, and proper shadow depth. This isn't a simple icon — it's a miniature artwork that communicates our brand at 32px.

The SVG source is 512x512 and scales cleanly to all target sizes: 32px tab favicon, 48px standard, 180px Apple touch, 192px PWA, and 512px splash. The `sharp` pipeline ensures pixel-perfect PNG output at every size. No more crude blocky podiums or default Expo chevrons.

**My domain commitment update**: The favicon was the last placeholder asset. With this sprint, every user-facing asset is brand-aligned."

### James Park (Frontend Architect)
"The search.tsx extraction follows the proven pattern from business/[id].tsx. I extracted `DiscoverPhotoStrip`, `BusinessCard`, `MapBusinessCard`, and `haversineKm` into `components/search/SubComponents.tsx`. The parent file drops from 1,159 to 833 LOC — a 28% reduction.

The extraction is clean: each component carries its own styles, the imports are minimal, and the parent only references the components by name. The `MapView` component stays in search.tsx because it's tightly coupled to the Google Maps initialization state.

I also cleaned up unused imports — `Animated`, `useWindowDimensions`, `Linking`, `usePressAnimation`, `useBookmarks` — all moved to SubComponents where they're actually consumed.

**My domain commitment update**: search.tsx is now under 1,000 LOC. Three files remain above 1,000: rate/[id].tsx (1,104), profile.tsx (1,056), index.tsx (1,031). I'll tackle rate/[id].tsx next sprint."

### Marcus Chen (CTO)
"The favicon generation pipeline is important infrastructure. `scripts/generate-favicons.js` uses `sharp` to convert our SVG master at 6 target sizes. This means any future brand updates to the SVG automatically propagate to all PNG assets with a single `node scripts/generate-favicons.js` command. No more manual asset creation.

The +html.tsx now includes proper multi-size favicon declarations: SVG for modern browsers, 32px/48px PNG fallbacks, 192px for PWA, and 180px Apple touch icon. This is production-grade favicon support.

**Architecture note**: search.tsx extraction reduces the largest frontend file from 1,159 to 833 LOC. We now have only 3 files above 1,000 LOC, down from 5 at Sprint 60."

### Mei Lin (Type Safety Lead)
"The extraction removed zero `as any` casts from search.tsx — the remaining 33 are in other files. But the extraction creates cleaner component boundaries that will make future type improvements easier.

**My domain commitment update**: 33 casts remaining. I'll target the 14 React Native `width` casts next — they can be resolved with proper `DimensionValue` typing."

### Carlos Ruiz (QA Lead)
"114 tests all passing. TypeScript: 0 errors. The extraction is a pure refactor — no logic changes — so existing tests cover the same behavior. I verified the component interfaces match between the old inline definitions and the new SubComponents exports.

**My domain commitment update**: I need to add component render tests for the extracted SubComponents to prevent regression."

### Sage (Backend Engineer #2)
"No backend changes this sprint, but the favicon generation script runs server-side with `sharp`, which I helped configure. The npm permissions issue from Sprint 62 recurred — we used `--cache /tmp/npm-cache` again. We should document this workaround.

**My domain commitment update**: API response time logging is my next sprint deliverable. I've been saying this for two sprints — I'll prioritize it."

### Nadia Kaur (VP Security + Legal Compliance)
"The CEO is right to call this out. Legal compliance has been dormant and that's unacceptable. Here's my activation plan:

**Immediate (Sprint 67)**:
- Draft Terms of Service
- Draft Privacy Policy (CCPA-compliant for Texas/US users)
- Add legal page stubs to the app

**Near-term (Sprint 68-70)**:
- Content moderation policy (for user-submitted ratings and reviews)
- Restaurant data usage policy (Google Places data attribution requirements)
- Cookie consent banner for web
- DMCA takedown process

**Ongoing**:
- Audit data collection practices quarterly
- Monitor state-level privacy law changes (Texas Data Privacy and Security Act)

I take full responsibility for the gap. Security work is not an excuse to neglect legal compliance — they go hand in hand.

**My domain commitment update**: Legal compliance is now part of my domain alongside security. No more gaps."

### Priya Sharma (RBAC Lead)
"The admin panel redesign will need to include legal admin capabilities — managing reported content, processing takedown requests, and viewing compliance dashboards. I'll coordinate with Nadia on the RBAC requirements.

**My domain commitment update**: Admin panel design mockups will align with Nadia's legal requirements."

## Changes

### Modified Files
- `app/(tabs)/search.tsx`
  - Removed inline `DiscoverPhotoStrip`, `BusinessCard`, `MapBusinessCard`, `haversineKm`
  - Added import from `@/components/search/SubComponents`
  - Removed unused imports: `Animated`, `useWindowDimensions`, `Linking`, `usePressAnimation`, `useBookmarks`
  - Removed ~75 unused styles (card*, discover*, mapCard*, mapList*, mapPin*, verifiedPill, activityPill)
  - **1,159 LOC -> 833 LOC (-28%)**

- `app.json`
  - Changed favicon from `.svg` to `.png` (Expo doesn't support SVG favicons)

- `app/+html.tsx`
  - Added multi-size favicon declarations (32px, 48px, 192px)
  - Added `apple-touch-icon` pointing to new 180px branded PNG
  - SVG favicon kept as progressive enhancement for modern browsers

- `assets/images/favicon.svg`
  - Complete redesign: navy gradient background, gold podium bars with shine gradients, star/crown accent, rank numbers, shadows, glow effects

### New Files
- `components/search/SubComponents.tsx` (314 LOC)
  - `DiscoverPhotoStrip` — photo carousel with swipe dots
  - `BusinessCard` — full search result card with photo, rank, bookmark, metadata
  - `MapBusinessCard` — compact card for map split view
  - `haversineKm` — distance calculation utility
  - Own StyleSheet with all extracted styles

- `scripts/generate-favicons.js`
  - Converts SVG master to 6 PNG sizes: 32, 48, 180, 192, 512 (x2)
  - Uses `sharp` for high-quality SVG -> PNG rendering

- `assets/images/favicon.png` (48x48) — **replaces default Expo blue chevron**
- `assets/images/favicon-32.png` (32x32) — tab favicon
- `assets/images/favicon-192.png` (192x192) — PWA icon
- `assets/images/favicon-512.png` (512x512) — high-res
- `assets/images/apple-touch-icon.png` (180x180) — iOS home screen
- `assets/images/splash-icon.png` (512x512) — **replaces crude blocky podium**

## Design System Updates
| Element | Before | After |
|---------|--------|-------|
| favicon.png | Default Expo blue chevron | Rich gold podium on navy |
| splash-icon.png | Crude blocky podium | Rich gold podium with star accent |
| Apple touch icon | Generic icon.png | Dedicated 180px branded icon |
| Favicon sizes | 1 size (48px) | 5 sizes (32, 48, 180, 192, 512) |
| SVG source | Simple 3 bars + circle | Gradients, shadows, glow, rank numbers |

## N1/N6 Progress
| File | Audit #3 LOC | Sprint 66 LOC | Change |
|------|-------------|---------------|--------|
| search.tsx | 1,159 | 833 | -28% |
| rate/[id].tsx | 1,104 | 1,104 | Next sprint |
| profile.tsx | 1,056 | 1,056 | Sprint 68 |
| index.tsx | 1,031 | 1,031 | Sprint 69 |

## Legal Compliance Roadmap (New)
| Deliverable | Owner | Target Sprint | Status |
|-------------|-------|---------------|--------|
| Terms of Service | Nadia | 67 | PLANNED |
| Privacy Policy | Nadia | 67 | PLANNED |
| Legal page stubs | Priya | 67 | PLANNED |
| Content moderation policy | Nadia | 68 | PLANNED |
| Data usage/attribution policy | Nadia | 69 | PLANNED |
| Cookie consent (web) | James | 69 | PLANNED |
| DMCA process | Nadia | 70 | PLANNED |

## Test Results
```
114 tests | 9 test files | 231ms
TypeScript: 0 errors
```

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| Suki | Design Lead | Rich SVG favicon design, multi-size asset pipeline | A+ |
| James Park | Frontend Architect | search.tsx extraction (-28% LOC), import cleanup | A+ |
| Marcus Chen | CTO | Architecture review, favicon pipeline design | A |
| Nadia Kaur | VP Security + Legal | Legal compliance activation, accountability taken | A |
| Carlos Ruiz | QA Lead | Regression verification, test stability | A |
| Mei Lin | Type Safety Lead | Extraction analysis, future type improvement plan | A- |
| Priya Sharma | RBAC Lead | Admin/legal RBAC planning | A- |
| Sage | Backend Engineer #2 | sharp configuration, npm cache fix | B+ (response time logging overdue) |

## Sprint Velocity
- **Story Points Completed**: 15
- **Files Modified**: 3 (search.tsx, app.json, +html.tsx)
- **Files Created**: 8 (SubComponents, favicon script, 6 PNG assets)
- **LOC Reduced**: 326 (search.tsx: 1159 -> 833)
- **Tests**: 114 (stable)
- **TypeScript Errors**: 0
