# Sprint 178: QR Code Generation for Businesses

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** In-venue QR code system for businesses — generation, scan tracking, conversion analytics

---

## Mission Alignment
QR codes solve the cold-start problem for individual businesses. An owner puts a table tent or sticker in their venue — customers scan, rate, and the business builds ranking data. This is the bridge between physical venues and digital rankings. It's also a powerful differentiator vs Yelp: TopRanker ratings happen at the point of experience.

---

## Team Discussion

**Marcus Chen (CTO):** "P1 from SLT-175 delivered. Three endpoints: (1) QR data generation with styling config, (2) scan recording with conversion tracking, (3) scan analytics for owners. The existing `qrScans` table and `qrScanId` in rating submission were already wired — this sprint adds the generation and analytics layer."

**Sarah Nakamura (Lead Eng):** "The QR endpoint returns a JSON config compatible with qr-code-styling library (already used in our landing page). The client renders the QR code locally — no server-side image generation needed. The print template data helps owners create branded table tents."

**Amir Patel (Architecture):** "New route module `routes-qr.ts` at 121 lines. Clean domain separation. The stats endpoint does 5 queries but they're all simple indexed counts — no performance concern. The `markQrScanConverted` function is called from rating submission when `source=qr_scan`."

**Rachel Wei (CFO):** "QR codes are a retention tool for Business Pro. Owners who see scan-to-rating conversion data want to keep their subscription. This completes the owner value loop: claim → subscribe → respond to ratings → distribute QR codes → get more ratings."

**Priya Sharma (Design):** "The QR styling uses our brand colors — navy dots with amber corners. The print template includes a headline, subline, and footer so owners can create consistent table tents. We'll ship a downloadable PDF generator in a future sprint."

**Nadia Kaur (Security):** "The scan endpoint accepts anonymous scans (no auth required) because we want maximum data capture. The stats endpoint is owner-gated with admin bypass. No PII exposed in QR codes — just the business slug and source parameter."

---

## Changes

### New Files
| File | Lines | Purpose |
|------|-------|---------|
| `server/routes-qr.ts` | 121 | QR generation, scan recording, scan analytics |
| `server/storage/qr.ts` | 88 | recordQrScan, getQrScanStats, markQrScanConverted |

### Modified Files
| File | Change |
|------|--------|
| `server/routes.ts` | Register QR routes |
| `server/storage/index.ts` | Export QR storage functions |

### API Endpoints (New)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/businesses/:slug/qr` | Public | QR code data + styling config |
| POST | `/api/qr/scan` | Optional | Record scan event |
| GET | `/api/businesses/:slug/qr-stats` | Owner/Admin | Scan analytics |

### Analytics
| Metric | Description |
|--------|-------------|
| Total scans | All-time scan count |
| Unique members | Distinct logged-in scanners |
| Conversions | Scans that led to ratings |
| Conversion rate | Conversions / Total scans |
| Last 7 days | Recent scan velocity |
| Last 30 days | Monthly scan volume |

---

## Test Results
- **33 new tests** for QR code generation
- Full suite: **2,636 tests** across 111 files — all passing, <1.8s
