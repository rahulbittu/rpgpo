# SPRINT-751-754 External Critique

## Verified wins
- `/_health` and `/_ready` endpoints were added.
- CORS headers were fixed.
- EAS config was validated.
- No feature churn is claimed; scope stayed on deployment/build readiness work.
- The packet is explicit about the key unresolved boundary: none of this was validated by actual Railway deployment or EAS build.

## Contradictions / drift
- The stated goal was “operational readiness for Railway deployment and TestFlight submission,” but the packet admits there was no Railway deployment and no EAS build. That is not operational readiness; it is preflight configuration work.
- “Production-ready” CORS is asserted, while also questioning whether `*.up.railway.app` is overly permissive. Those two positions conflict.
- “Validated build configs” is overstated if the configs were not exercised by a real EAS build.
- “No new features were added” is directionally fair, but adding unauthenticated operational endpoints is still surface-area expansion and should be treated as such.
- The team shifted away from security hardening, yet introduced a live question about permissive CSP/CORS scope and public readiness signaling. That is security drift in the name of ops prep.
- The packet frames code-side anticipation versus deploy-first as an open question, but by sprint end the only thing proven is code compiles/tests pass. The actual deployment bottleneck remains with CEO-owned operations, so the work optimized for the wrong constraint.

## Unclosed action items
- Railway deployment remains undone.
- EAS build remains undone.
- TestFlight submission remains undone.
- App Store Connect operational setup remains undone.
- Decision on wildcard Railway domain allowance vs exact subdomain restriction remains unresolved.
- Decision on whether `/_health` and `/_ready` need IP restrictions, reduced detail, or other hardening remains unresolved.
- Decision on hardcoded `EXPO_PUBLIC_API_URL` in `eas.json` vs environment/secret strategy remains unresolved.
- The engineering-operations handoff/process gap remains unresolved despite being the main systemic blocker.

## Core-loop focus score
**4/10**

- The sprint targeted the stated near-term release path, which is better than feature drift.
- But the core loop here is not “write more config”; it is “deploy, build, submit, observe failures, fix them.” The packet shows that loop was not completed even once.
- Work produced readiness signals without exercising the real environments, so confidence is mostly inferred rather than demonstrated.
- Security/ops tradeoffs were introduced but not closed, which weakens launch readiness.
- The main bottleneck was operational execution, and the sprint did not remove that bottleneck.

## Top 3 priorities for next sprint
1. **Execute the real release path end-to-end**
   - Deploy to Railway.
   - Run live checks against deployed `/_health` and `/_ready`.
   - Produce at least one actual EAS build.
   - Submit to TestFlight or document the exact blocking failure.

2. **Close the open security/ops decisions before exposure**
   - Replace `*.up.railway.app` with the exact production domain unless a concrete multi-subdomain need exists.
   - Review `/_ready` output and access policy; minimize disclosed state and restrict access if feasible.
   - Stop calling CORS/CSP “production-ready” until these decisions are closed.

3. **Fix ownership of operational tasks**
   - Assign a single directly responsible owner for Railway deploy, App Store Connect, and TestFlight.
   - Add sprint-level acceptance criteria that require real environment evidence, not config-only validation.
   - Do not let engineering mark “readiness” complete while CEO-side operational tasks remain externalized and untracked.

**Verdict:** These sprints produced preparatory config work, not operational readiness. The main claim is inflated by the absence of a real Railway deploy and a real EAS build, and several security-sensitive decisions were opened without being resolved. The biggest problem is not code quality; it is that the team spent four sprints polishing assumptions while the actual release path remained blocked by unexecuted operational work.
