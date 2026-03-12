# Sprints 646-649 External Critique

## Verified wins
- Sprint 646: share improved from clipboard-only to native `Share.share()` with fallback. That is a real UX improvement.
- Sprint 647: search/filter state syncing to URL via `history.replaceState` is a concrete usability win for bookmarkable views and reload persistence.
- Sprint 648: reminder push respects the `ratingReminders` preference. That is table-stakes, but verified in the packet.
- Sprint 649: claim verification added actual controls beyond a bare code flow: 48-hour expiry, 5-attempt lockout, dedicated verify endpoint, branded email.

## Contradictions / drift
- Sprint 647 claim says URL sync “enables browser back/forward,” but the implementation uses `history.replaceState`. Replace updates the current entry; it does not create navigation history for each filter change. Bookmarkable/reloadable: yes. Back/forward through filter changes: no, or only weakly depending on prior navigation.
- Sprint 648 is framed as a reminder for inactivity after 7+ days, but the described logic sends daily once the threshold is crossed. That is not a “7-day reminder”; it is a daily nag loop gated by a 7-day inactivity check.
- Sprint 649 calls email verification “proof of ownership,” but sending a code to the business email is only proof of access to that inbox. For role accounts or generic Gmail addresses, ownership assurance is weak.
- Sprint 646 profile sharing uses static text without a profile destination. That is share UX progress, but not a complete share loop because the recipient has nowhere specific to land.
- Four sprints cover share, URL sync, reminders, and claim verification. That is broad surface-area work, not tight iteration on one measurable core loop.

## Unclosed action items
- Define the ownership standard for business claims. Decide whether business-email access alone is sufficient, and for which classes of email addresses it is not.
- Fix or restate the URL sync behavior. If back/forward through filter edits is desired, `pushState` needs to be considered at least for meaningful changes like query/location.
- Set reminder frequency limits. Daily repeats after 7 inactive days need an explicit product decision, cooldown, and likely cap.
- Resolve the missing destination problem for profile shares. Either add public/deep-linkable profile URLs or stop pretending profile share is complete.
- Build-size question is unclosed because no evidence is provided beyond aggregate growth. There is no attribution, budget, or threshold in the packet.

## Core-loop focus score
**4/10**
- Work shipped across four unrelated areas: sharing, web URL state, push reminders, and claims. That is fragmented.
- Only Sprint 648 directly targets repeat rating behavior, but even there the cadence logic is unresolved and risks harming user experience.
- Sprint 647 supports search discoverability/returnability, which can help the loop indirectly.
- Sprint 646 and 649 feel adjacent/platform/admin rather than concentrated improvement of the primary user rating loop.
- There is no reported metric movement tied to any of these changes, so “focus” is mostly asserted, not demonstrated.

## Top 3 priorities for next sprint
1. **Close the reminder policy gap.** Change rating reminders from daily-after-day-7 to a defined cooldown model, then measure opt-out, open, and rating conversion.
2. **Correct the URL-history mismatch.** Decide the intended browser UX and implement it consistently: `replaceState` for ephemeral tweaks, `pushState` for meaningful search transitions, or stop claiming back/forward support.
3. **Harden business claim verification.** Treat business-email verification as inbox access, not ownership proof. Add risk rules for generic/free-form addresses or require secondary evidence/manual review for weak claims.

**Verdict:** There are some real incremental wins here, but the packet overstates at least one of them (`replaceState` does not deliver true back/forward history), leaves major product-policy decisions unresolved (daily reminder spam, what counts as ownership), and spreads effort across unrelated surfaces instead of tightening one loop and proving impact.
