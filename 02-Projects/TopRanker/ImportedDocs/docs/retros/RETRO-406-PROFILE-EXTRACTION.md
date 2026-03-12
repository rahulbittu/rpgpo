# Retro 406: Profile Breakdown Extraction

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "profile.tsx dropped from 92% to 85% of threshold. That's exactly the headroom we needed. The extraction boundary was clean — self-contained state, self-contained styles, self-contained rendering. No parent state coupling."

**Sarah Nakamura:** "One test cascade, one-line fix. The sprint181 decomposition test expected BreakdownRow in profile.tsx — updated to ScoreBreakdownCard. Zero other cascades. The extraction pattern is well-established."

**Marcus Chen:** "profile.tsx was our highest-threshold key file. Now it's fifth out of six at 85%. Only rate/[id].tsx at 90% remains in WATCH status. The extraction backlog is nearly clear."

## What Could Improve

- **rate/[id].tsx at 90%** — Still in WATCH zone. Visit type step extraction is the candidate but hasn't been scheduled yet.
- **ScoreBreakdownCard could show score trends** — Currently static breakdown. A mini-sparkline showing score movement over time would add value.
- **Penalty display is basic** — Just shows `-N` for flag penalties. Could show what triggered the penalty.

## Action Items

- [ ] Monitor rate/[id].tsx at 90% — extraction candidate identified (visit type step) — **Owner: Amir**
- [ ] Consider score trend visualization in breakdown card — **Owner: Priya (future sprint)**

## Team Morale
**8/10** — Clean extraction sprint. profile.tsx out of danger zone. Solid architectural progress with zero user-facing changes.
