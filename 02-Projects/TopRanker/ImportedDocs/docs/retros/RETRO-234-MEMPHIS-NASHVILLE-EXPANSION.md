# Retro 234: Memphis + Nashville Expansion

**Date:** 2026-03-09
**Duration:** 1 day
**Story Points:** 13
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Cole Anderson (City Growth):** "The seed data pattern we established with OKC and NOLA made Memphis and Nashville almost mechanical to add. Having a clear template for neighborhoods, area codes, and business categories meant I could focus on curating the right businesses instead of figuring out the data shape."

**Amir Patel (Architecture):** "The expansion pipeline module came together cleanly. Keeping it in-memory with no DB dependency was the right call — it lets us iterate on the stage model without migration overhead. The tagged logger integration was trivial since we already had the pattern."

**Sarah Nakamura (Lead Eng):** "Test coverage is strong — 40+ new tests plus updates to 3 existing test files. The static analysis pattern (readFile + toContain) continues to work well for seed data validation without pulling in DB dependencies."

---

## What Could Improve

- **City template generator:** We're now at 8 cities with very similar data shapes. A script to scaffold a new city's seed array from a CSV or JSON input would save time and reduce copy-paste errors.
- **Pipeline persistence:** The in-memory expansion pipeline is fine for now, but we should plan the Drizzle migration before we hit 15+ cities. Stage transitions are valuable audit data.
- **Automated city count assertions:** Three test files had to be manually updated for the "N cities" string. A shared constant or computed value would eliminate this maintenance burden.

---

## Action Items

| Action | Owner | Target Sprint |
|--------|-------|---------------|
| Create city seed scaffolding script | Cole Anderson | 236 |
| Design Drizzle schema for expansion pipeline persistence | Amir Patel | 238 |
| Extract city count to shared constant to avoid test breakage | Sarah Nakamura | 235 |
| Begin Memphis local business outreach | Cole Anderson | 235 |
| Draft Nashville market entry messaging | Jasmine Taylor | 236 |

---

## Team Morale

**8/10** — Strong momentum from Tennessee expansion. Team is confident in the repeatable city launch pattern. The expansion pipeline module gives everyone visibility into where each city stands. Excitement about entering a new state beyond Texas/Oklahoma/Louisiana.
