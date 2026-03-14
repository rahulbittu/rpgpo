# Runbook: Escalation Handling

## Overview

When the system detects a condition matching an escalation rule, it fires an event and takes the specified action. This runbook covers how to handle each action type.

## Action Handling

### notify_operator
- **Severity:** Low
- **Behavior:** Event logged, shown in Governance tab and live feed
- **Operator response:** Review at convenience, no blocking

### require_operator_approval
- **Severity:** Medium
- **Behavior:** Execution pauses at the current gate/node until operator approves
- **Operator response:** Review the escalation detail, approve or reject in the approval gate UI

### board_reopen
- **Severity:** Medium
- **Behavior:** Task is sent back to the Board of AI for re-deliberation
- **Operator response:** Wait for new board result, review updated plan

### require_second_provider_review
- **Severity:** Medium
- **Behavior:** A second AI provider is asked to review the conflicting output
- **Operator response:** Review both opinions, make final decision

### pause_execution
- **Severity:** High
- **Behavior:** All running nodes stop, graph status set to paused
- **Operator response:** Investigate the trigger (usually privacy risk), resolve, then resume

### downgrade_to_advisory
- **Severity:** Low
- **Behavior:** Provider recommendations become non-binding suggestions
- **Operator response:** No action needed — system continues with advisory-only mode

## Trigger-Specific Guidance

### low_confidence (threshold: 50%)
Check the dossier's risks and unresolved items. If many reviews failed or nodes failed, consider rework.

### review_conflict
Two reviews disagree (pass vs fail). Read both review notes. If the conflict is about architecture, prefer the architecture reviewer. If about quality, get a second opinion.

### privacy_risk
Execution is paused. Check which provider was about to receive data from an isolated mission. Do not resume until the privacy concern is resolved.

### retry_exhaustion
Three or more nodes have failed. The task may need re-planning. Consider sending back to Board.

### documentation_gap
Required docs are missing. Create the docs or waive the requirement (dev lane only).
