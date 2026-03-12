# Retro 433: Rating History Export (CSV)

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Facilitator:** Sarah Nakamura

## What Went Well

**Rachel Wei:** "Data portability done right. No server changes, no new endpoints, no infrastructure cost. Client-side CSV from existing data — the simplest path to a high-trust feature."

**Amir Patel:** "escapeCSV is robust against edge cases (commas in business names, quotes in notes). The visit-type-aware dimension labels make the CSV self-documenting — users don't need a key to understand columns."

**Sarah Nakamura:** "143 LOC for a complete export feature. Platform branching (Blob vs Share) is clean. The function is pure and testable — ratingsToCSV takes data in, returns string out."

## What Could Improve

- **profile.tsx at 86.3%** — Getting heavy. The export button adds 5 LOC but we should plan the next extraction cycle if profile approaches 720.
- **No JSON export option** — Some users may want JSON for programmatic use. Easy to add alongside CSV.
- **Share API on native sends raw CSV text** — Ideally would share as a file attachment. Requires expo-file-system to write a temp file first.

## Action Items

- [ ] Begin Sprint 434 (leaderboard SubComponents extraction) — **Owner: Sarah**
- [ ] Consider temp file approach for native CSV export — **Owner: Amir (future)**

## Team Morale
**8/10** — Small, high-value feature. Data export is a trust pillar. The team appreciates the simplicity of client-side generation.
