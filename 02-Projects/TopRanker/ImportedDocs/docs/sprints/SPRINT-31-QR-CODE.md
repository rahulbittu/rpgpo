# Sprint 31 — QR Code Scan Flow

## Mission Alignment
The QR code bridges offline and online. When a diner scans a QR code at a restaurant's table, they go directly from "eating dinner" to "rating on TopRanker." This is the most natural, lowest-friction way to grow our rating volume — and more ratings mean more trustworthy rankings.

## Team Discussion

### Rahul Pitta (CEO)
"This is how we get ratings from people who would never download a rating app. They're sitting at Pecan Lodge, they see a table tent with a QR code, they scan it, they rate. No app download required on web. This is our highest-leverage growth tool for Dallas restaurants."

### Ben Kowalski (Partnerships)
"I've been waiting for this. The QR code is the #1 ask from restaurant owners. 'How do I get my customers to rate us on TopRanker?' — now I hand them a printable QR code. Table tents, receipt inserts, menu inserts. Every touchpoint becomes a rating opportunity."

### Olivia Hart (Head of Copy & Voice)
"The QR page copy is action-oriented: 'Display this code for diners to scan and rate.' Not 'generate a QR code' — that's tech speak. 'Diners scan' is the mental model. The info card copy guides owners: 'Print this QR code and display it at your register, tables, or entrance.' Specific locations, not vague instructions."

### James Park (Frontend Architect)
"The QR screen displays a visual QR placeholder with the business URL. In production, we'll swap in a real QR code image generated server-side. The Share button sends the URL via native share sheet. The Print button triggers `window.print()` on web for instant printable QR codes."

### Sofia Morales (Sr Visual Designer)
"The QR code display has a navy border, white background, and subtle shadow — it looks like an actual printable card. The grid pattern behind the QR icon creates visual texture. This is designed to look good printed at any size from table tent to poster."

### Jasmine Taylor (Marketing Director)
"We'll create QR code table tent templates for partner restaurants. 'Rate us on TopRanker — Scan to share your experience.' The QR flow feeds our '1000 ratings in 30 days' launch goal. If 50 restaurants display QR codes and each gets 1 scan/day, that's 1500 ratings/month."

### Carlos Ruiz (QA Lead)
"Verified: QR screen loads with correct business name and URL. Share button opens native share sheet with formatted message. Print button works on web. QR placeholder renders correctly. All navigation (back, share) functional. TypeScript clean."

## Changes
- `app/business/qr.tsx` (NEW): QR code display and share screen
  - Business name, URL, visual QR placeholder
  - Info card with printing/display instructions
  - Benefits list (4 items)
  - Share Link and Print buttons
- `app/_layout.tsx`: Added `business/qr` Stack.Screen

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| James Park | Frontend Architect | QR screen implementation, share/print flow | A |
| Sofia Morales | Sr Visual Designer | QR card visual design, print-ready layout | A |
| Olivia Hart | Head of Copy & Voice | QR page copy, owner-facing instructions | A |
| Ben Kowalski | Partnerships | QR distribution strategy, restaurant touchpoints | A+ |
| Jasmine Taylor | Marketing Director | Table tent template planning, launch metrics | A |
| Carlos Ruiz | QA Lead | QR screen testing, share/print verification | A |

## Sprint Velocity
- **Story Points Completed**: 5
- **Files Modified**: 2 (1 new)
- **Lines Changed**: ~170
- **Time to Complete**: 0.5 days
- **Blockers**: Real QR image generation needs server-side library (qrcode npm package)

## PRD Gaps Closed
- QR code scan flow for offline-to-online conversion
- Business owner QR code generation and sharing
