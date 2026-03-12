# RPGPO Dashboard PRD

## Purpose

The RPGPO Dashboard is the main operating view for Rahul.
It should function as the command center for the governed private office.

The dashboard exists to provide:
- visibility
- control
- priorities
- approvals
- logs
- mission status
- decision readiness

It should reduce friction, not create it.

---

## Product Goals

1. Show what matters now
2. Show what changed recently
3. Show what requires Rahul’s approval
4. Show status across major mission domains
5. Show logs and auditability
6. Show where work is blocked
7. Make next action obvious

---

## Core Sections

## 1. Home
Purpose:
- immediate overview

Should show:
- today’s brief
- top priorities
- recent wins
- current blockers
- pending approvals
- alerts

---

## 2. Missions
Purpose:
- show the state of the major operating areas

Should include:
- TopRanker
- Career Engine
- Founder2Founder
- Wealth Research
- Creative / Other

Each mission card should show:
- current status
- key metric
- top blocker
- recommended next step

---

## 3. Approvals
Purpose:
- centralized human control over risky actions

Should show:
- pending approval packets
- risk level
- proposed action
- deadline or urgency if relevant
- approve / reject / revise options

---

## 4. Research Queue
Purpose:
- active investigations and open questions

Should show:
- currently researched topics
- priority level
- source status
- ready summaries
- unresolved unknowns

---

## 5. Projects
Purpose:
- workstream execution tracking

Should show:
- active projects
- status by project
- blockers
- last updated
- next milestone

---

## 6. Comms
Purpose:
- draft and message control

Should show:
- email drafts
- X drafts
- Instagram drafts
- high-priority messages
- status of each draft

---

## 7. Logs
Purpose:
- auditability and trust

Should show:
- latest agent runs
- task performed
- domain
- risk level
- result
- failure notes if any

---

## 8. Settings / Governance
Purpose:
- visibility into the rules of the system

Should show:
- connected sources
- access classes
- active specialists
- last governance updates
- memory review status

---

## MVP Requirements

The first version should:
- be local-first
- be simple
- read from files or lightweight JSON
- be viewable from Rahul’s machine
- prioritize clarity over beauty

---

## MVP Inputs
Possible data sources:
- markdown files
- JSON status files
- log files
- approval packet files
- project summaries
- daily brief files

---

## MVP Outputs
- home overview
- mission cards
- approvals list
- logs list
- research queue
- project status

---

## Design Principles
- calm
- uncluttered
- high signal
- quick to scan
- low friction
- no decorative complexity

---

## Non-Goals for v1
- full automation control center
- real-time distributed orchestration
- complex analytics
- heavy role-based access
- fancy visualizations for their own sake

---

## Success Standard
The dashboard is successful if Rahul can open it and know:
- what matters
- what changed
- what needs approval
- what is blocked
- what should happen next
within a minute.
