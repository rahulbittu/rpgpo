# ECC Adoption Review — Honest Assessment

## Which adoption brought the most real value?

**Verification eval metrics (Pattern 2)** — This is the highest-value adoption because GPO had no automated quality measurement. Before this, "clean" meant "task status = done." Now it means "status = done AND output has measurable length, structure, and sources." The `first_pass_clean_rate` signal with quality metadata gives GPO its first real evaluation metric.

However, this value is still early-stage. The metric currently tracks completion quality, not semantic quality. A task that produces 7,000 characters of structured text with URLs is scored as "clean" even if the content is mediocre. True quality measurement requires human feedback (rewrites, rejections, satisfaction ratings).

## Which adoption is still mostly scaffolding?

**Signal reinforcement (Pattern 4)** — The `reinforced_count` field was added to the BehaviorSignal interface but is not yet populated by any logic. It's a type definition waiting for implementation. No signal currently has a reinforcement count. This is honest scaffolding — the interface is ready but the feature does not work yet.

**Session persistence (Pattern 1)** — Partially scaffolding. The save/restore mechanism works, but `loadSessionState()` only logs the prior session — it does not pre-warm any caches or restore runtime state. The value is currently limited to log visibility on restart.

## Which metrics are real vs proxy?

| Metric | Real or Proxy | Why |
|---|---|---|
| `first_pass_clean_rate` = 100% | **Proxy** | Measures completion rate, not output quality. Tasks auto-execute and rarely fail outright. Real quality requires human feedback. |
| `output_length` avg = 7,008 chars | **Real** | Measures actual output size. Longer is not always better, but <500 chars reliably indicates thin output. |
| `has_structure` = 100% | **Real** | Checks for `##` markdown headings. Reliable structural indicator. |
| `has_sources` = varies | **Real** | Checks for URL patterns. Indicates whether research subtasks produced citations. |
| `live_observed signal count` = 12 | **Real** | Counts signals derived from real workflow events, not seeded history. |
| `session-cache.json saved_at` | **Real** | Proves persistence mechanism runs. |
| `safety_warnings` = 0 | **Real but untested** | No warnings means either (a) no credential leaks or (b) regex patterns are too narrow. Needs deliberate testing with injected credentials. |

## What should be improved next?

### Priority 1: Make verification metrics meaningful
- Current 100% clean rate is a proxy, not a quality signal
- Need human feedback events (rewrites, rejections, satisfaction) to distinguish "completed" from "good"
- Until then, the metric measures reliability, not quality — which is honest but limited

### Priority 2: Implement signal reinforcement
- `reinforced_count` is scaffolding — needs logic to count stable derivation cycles
- Should detect when a signal value changes between derivations (contradiction)
- Should degrade confidence when contradicted

### Priority 3: Session persistence that actually restores state
- `loadSessionState()` should pre-warm the behavior signal cache
- Should log how long since last session and whether signals are stale
- Should warn if session gap > 24 hours (signals may be outdated)

### Priority 4: Test safety checks with real threats
- Inject fake API keys into task requests and verify detection
- Inject oversized prompts and verify warning
- Track `_safetyWarnings` across sessions (currently resets on restart)

### Priority 5: Engine-specific quality thresholds
- "length_adequate > 500 chars" is one-size-fits-all
- Research engine should require citations
- Travel engine should require day-by-day structure
- Health engine should require evidence basis and safety disclaimers
