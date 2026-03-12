# External Critique Request — Sprints 235-239 External Critique

## Verified wins
- Test count increased from 4,394 to 4,555 across the block: +161 tests and +4 test files.
- Memphis moved from planned to beta in Sprint 237, and the seed validator reportedly caught 2 incomplete Memphis entries before promotion.
- A concrete claim verification backend was shipped in Sprint 238: explicit state machine, expiring single-use codes, admin review queue, and audit trail.
- Admin/security tooling expanded in Sprint 236 with a rate limit dashboard, abuse detection module, and alerting.
- Audit #30 reviewed Sprint 236-239 additions and rated them GOOD, with no critical/high/medium findings.

## Contradictions / drift
- Proposed Sprint 241 is overloaded. The packet lists Nashville promotion, WebSocket notifications, and CDN setup in 8 points. That does not match the pattern of recent 8-point sprints, each of which shipped one main module.
- Core-loop focus drift is visible. Across five sprints, only one item is clearly revenue-critical to the marketplace loop: claim verification. The rest are admin/process/security/platform features plus one city promotion.
- City expansion is being described as momentum, but only one city advanced in this 5-sprint block: Memphis from planned to beta. Nashville remained planned.
- Auto-gate promotion is presented as validated, but only a single promotion event is cited. That is not strong evidence the pipeline is robust across cities.
- In-memory storage risk is acknowledged as growing to 5 modules, yet two new modules were still added to that pattern this quarter. That is deliberate debt expansion, not just deferred cleanup.
- Abuse detection and reputation v2 are being shipped as meaningful systems, but both are admitted to be untuned/theoretical. That means capability exists, but effectiveness is unverified.
- Claim verification is called shipped and revenue-critical, while the packet also states the end-to-end business owner UX is backend-only and not user-tested. That is not complete delivery from a user perspective.
- Cross-city reputation transfer currently gives full credit into a new beta city, while the packet itself flags distortion risk. Shipping that without a cap is product-policy drift.

## Unclosed action items
- Nashville seed validation + beta promotion is still open and slipped past this block despite city expansion being a stated theme.
- CDN setup is still open after 3 audits. This is now repeated carry-forward, not a fresh task.
- Redis migration feasibility remains deferred to Sprint 244 despite in-memory stores increasing to 5 in the current block.
- WebSocket notification system is only at design stage but is already in the next sprint proposal alongside other major work.
- Content policy rules RFC is still open while abuse detection and moderation-adjacent systems are expanding.
- Privacy policy update remains open even though upcoming business analytics/dashboard work depends on it.
- Review moderation queue spec remains open despite abuse detection shipping first.

## Core-loop focus score
**4/10**
- 1 of 5 sprints clearly strengthened a direct marketplace/revenue path: business claim verification.
- 1 sprint was a process/review sprint with no product movement.
- 2 sprints prioritized platform/security/admin capabilities whose user impact is indirect and still partly unvalidated.
- 1 sprint advanced expansion, but only by promoting a single city from planned to beta.
- Several shipped systems lack calibration or end-to-end validation, so even the shipped work is not fully closed-loop.
- Next sprint proposal continues splitting focus across expansion, infrastructure, and real-time systems instead of tightening one core loop.

## Top 3 priorities for next sprint
1. **Finish the claim verification loop end-to-end**
   - Complete and test the actual owner flow: code delivery, entry, confirmation, failure states, and admin exception handling.
   - Do not treat the backend state machine as “done” until the user path is validated.

2. **Reduce risk in reputation and abuse systems before adding more surface area**
   - Put abuse detection in shadow mode or staged rollout and measure false positives/negatives.
   - Add a cap or discount to cross-city reputation transfer before it distorts new-city rankings.
   - Treat current decay weights and thresholds as provisional, not settled.

3. **Stop carrying obvious infrastructure debt while adding more modules**
   - Do CDN in Sprint 241 since it is already 3 audits old.
   - Lock a concrete Redis migration plan/scope now, not a vague feasibility reminder for Sprint 244.
   - Do not add WebSockets on top of 5 in-memory stores without a persistence/scaling path.

**Verdict:** This block shipped real backend capability and kept quality signals clean, but it also spread effort across admin tooling, algorithms, expansion, and infrastructure without closing the user-facing loop on the most important feature. The main pattern is partial completion: claim verification is not end-to-end, abuse/reputation are not empirically validated, city expansion advanced only once, and in-memory debt kept growing while Redis was deferred again. Sprint 241 should not be another three-theme sprint.
