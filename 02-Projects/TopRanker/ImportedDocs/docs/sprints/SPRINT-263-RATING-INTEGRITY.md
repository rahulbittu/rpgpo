# Sprint 263 — Rating Integrity Checks (Phase 1c) — Owner Block + Thresholds + Velocity

**Date**: 2026-03-09
**Theme**: Rating Integrity Phase 1c
**Story Points**: 10
**Tests Added**: 5228 total passing

---

## Mission Alignment

Built the anti-gaming layers that protect ranking fairness. Rating Integrity Part 5 + Part 6 Step 7. The principle: flagged ratings are weight-reduced to 0.05x, NEVER deleted. Design for resilience, not purity.

---

## Changes

- **Owner self-rating prevention (Layer 5)**: blocks owner account + matching IP
- **Leaderboard eligibility thresholds (Step 7)**: 3 unique raters, 1 dine-in, weighted sum >= 0.5
- **Velocity detection (Layer 2)**: 4 rules
  - V1: IP burst — same IP, multiple ratings in short window
  - V2: Account burst — single account rating too many businesses too fast
  - V3: Business flood — many new accounts rating same business
  - V4: Dormant reactivation — inactive account suddenly active with ratings
- **CRITICAL PRINCIPLE**: flagged ratings are weight-reduced to 0.05x, NEVER deleted

---

## Team Discussion

**Nadia Kaur (Cybersecurity)**: "Four velocity rules cover the most common attack patterns. Rule V1 (same IP burst) catches the lazy attacker. Rule V3 (business flood from new accounts) catches coordinated campaigns."

**Amir Patel (Architecture)**: "The 'weight don't delete' principle is now in code. A flagged rating exists at 0.05x — the rater can see it, but it barely moves the needle."

**Sarah Nakamura (Lead Eng)**: "Owner self-rating block checks both account ID AND IP address. A restaurant owner can't create a second account from the same WiFi to rate themselves."

**Jordan Blake (Compliance)**: "This is legally sound. We're not censoring speech — we're applying mathematical weighting. The rating is still there."

**Marcus Chen (CTO)**: "Leaderboard threshold prevents ghost restaurants. You need real humans, including at least one who dined in, to appear on the leaderboard."

**Rahul (CEO)**: "Rating Integrity Part 1 says 'design for resilience, not purity.' This module embodies that. We don't try to be perfect judges — we make gaming economically unattractive."

---

## Tests

- 5228 passing
- Core loop: YES — protects ranking fairness without censorship
