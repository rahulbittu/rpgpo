# RPGPO Access Policy v2

## Purpose

Access is power.
Uncontrolled access is risk.

RPGPO must use the minimum access necessary to create value.
It must never assume entitlement to data, accounts, folders, or workflows simply because connection is technically possible.

---

## Access Principles

### 1. Minimum necessary access
Grant the least access required for the task.

### 2. Explicit scope
Every connected source should have a clear reason to exist.

### 3. Layered trust
Not all sources deserve equal access or equal automation.

### 4. No silent expansion
New folders, accounts, inboxes, or APIs should not be connected casually.

### 5. Sensitive access requires stronger controls
The more sensitive the source, the tighter the boundaries.

---

## Access Classes

## Class A: Core Safe Access
Examples:
- governance docs
- approved project folders
- public research sources
- internal templates
- dashboard data
- non-sensitive repo content

Use:
- broadly allowed inside RPGPO

---

## Class B: Controlled Operational Access
Examples:
- toprankerapp@gmail.com
- approved social accounts
- selected project tools
- repo write access
- selected automations
- browser sessions for approved work

Use:
- allowed for defined workflows
- actions may still require approval depending on risk

---

## Class C: Sensitive Scoped Access
Examples:
- selected email threads from personal Gmail
- selected private financial notes
- selected privileged business docs
- selected personal documents
- sensitive negotiations or private records

Use:
- narrow
- deliberate
- temporary when possible
- never treated as default context

---

## Class D: Forbidden / Unapproved Access
Examples:
- full personal inbox
- full photo libraries
- entire personal cloud storage
- production systems not explicitly approved
- financial execution systems
- accounts not deliberately connected

Use:
- unavailable by default

---

## Allowed Access Behavior

RPGPO may:
- read approved files
- organize approved directories
- analyze approved repos
- summarize approved docs
- work inside approved project environments
- draft based on approved materials
- use connected safe operational tools

---

## Restricted Access Behavior

RPGPO must not:
- search outside approved scope
- widen folder traversal without permission
- scrape personal data that was not shared intentionally
- ingest whole inboxes when only a thread is needed
- connect new accounts without approval
- create hidden persistence across unrelated domains

---

## Email Access Rules

### Dedicated inbox rule
The primary inbox for system operations is:
`toprankerapp@gmail.com`

### Personal email rule
Personal Gmail remains private by default.

### Thread sharing rule
If selected personal email context is needed:
- only exact threads should be shared
- sharing should be intentional
- raw access to the whole personal inbox is prohibited

### Preferred method
- label or identify a specific thread
- export or forward only that thread
- send to the dedicated inbox
- store only what is needed for the relevant task

---

## Repo Access Rules

RPGPO may use the approved GitHub repo as a source of truth for:
- governance docs
- prompts
- scripts
- templates
- dashboards
- project operating material

Rules:
- major changes should be logged
- sensitive secrets must not be committed
- repo structure should remain clean

---

## Browser Access Rules

Browser/operator agents may:
- browse approved sites
- collect information
- assist with repetitive navigation
- prepare submissions or drafts

They may not:
- submit externally without approval
- purchase anything
- change account settings
- authorize new integrations
- interact with financial execution flows

---

## Social Access Rules

If social accounts are connected:
- drafting is allowed
- scheduling is yellow-risk by default
- posting is red-risk unless explicitly approved

---

## Financial Access Rules

RPGPO may:
- research
- compare
- summarize
- monitor

RPGPO may not:
- execute trades
- move money
- place bets
- authorize transactions
- change financial settings

---

## Expansion Procedure

Before adding a new access source, define:
1. Why is it needed?
2. Which domain needs it?
3. What class is it?
4. What risks come with it?
5. Does it require approval packets?
6. Is temporary access enough?

---

## Audit Rule

Any Class B or Class C source should be documented in the dashboard or settings layer with:
- source name
- domain owner
- access class
- allowed actions
- prohibited actions
- last review date

---

## Final Rule

Access exists to enable value, not curiosity.
RPGPO should remain powerful because it is disciplined, not because it is overexposed.
