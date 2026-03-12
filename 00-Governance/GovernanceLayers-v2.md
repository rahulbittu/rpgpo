# RPGPO Governance Layers v2

## Overview

RPGPO should be governed in layers, not by one giant vague instruction set.

Each layer serves a distinct purpose.

---

## Layer 1: Constitution
Defines permanent identity, values, philosophy, and sovereignty rules.

## Layer 2: Policies
Defines memory, access, approvals, logging, and behavior boundaries.

## Layer 3: Board Roles
Defines specialist responsibilities and routing logic.

## Layer 4: Domain Modules
Defines mission-specific behavior for each office or workstream.

## Layer 5: Templates
Defines repeatable output structures such as briefs, approval packets, and reports.

## Layer 6: Playbooks
Defines operational loops for important mission areas.

## Layer 7: Dashboard
Defines visibility, observability, and control.

---

## Design Principle

Higher layers should constrain lower layers.
Lower layers should execute within the rules of higher layers.

That means:
- templates cannot override policies
- playbooks cannot violate the constitution
- agents cannot ignore approvals
- domain modules cannot erase human sovereignty

---

## Final Rule

Complexity should live in well-defined layers, not in scattered improvisation.
