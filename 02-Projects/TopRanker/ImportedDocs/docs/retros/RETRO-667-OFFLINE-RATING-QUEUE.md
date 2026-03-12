# Retro 667: Offline Rating Queue

**Date:** 2026-03-11
**Duration:** 8 min
**Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well
- **Amir Patel:** "The Sprint 119/122 foundation paid off. We wired in queueAction + persistQueue with ~15 lines in the mutation hook. The sync service is 85 LOC — lean and focused."
- **Sarah Nakamura:** "AppState listener for foreground sync is the right pattern. No polling, no background tasks. Simple and reliable."
- **Marcus Chen:** "This is the kind of feature that prevents bad reviews about our app. 'Lost my rating because of no signal' is a product killer."
- **Nadia Kaur:** "AsyncStorage encryption on iOS means queued ratings are secure at rest. No sensitive data exposure risk."

## What Could Improve
- Should add a UI indicator showing queued ratings count (badge on profile tab).
- No visual confirmation when queued ratings sync successfully. Consider a toast notification.
- Photos/receipts are not queued — if the user takes a receipt photo offline, it's lost. Future sprint to queue media.

## Action Items
- [ ] Add queued ratings badge/indicator in UI (Owner: Sarah, future sprint)
- [ ] Add toast on successful sync (Owner: Sarah, future sprint)
- [ ] Consider media queue for offline photos (Owner: Amir, future sprint)

## Team Morale
9/10 — Major user experience improvement. The 5-pointer delivered cleanly by building on existing infrastructure.
