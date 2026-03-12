# Sprint 246 — Email Template Builder + Preview System

**Date**: 2026-03-09
**Theme**: Communication Infrastructure — Template Engine
**Story Points**: 10
**Tests Added**: 38 (sprint246-email-templates.test.ts)

---

## Mission Alignment

TrustMe's trust-first brand depends on consistent, professional communication at every touchpoint.
Welcome emails, claim approvals, tier promotions, weekly digests, and business outreach all carry
the brand voice. Until now, email content was either hardcoded or nonexistent — no templating, no
variable substitution, no preview capability. Sprint 246 introduces a production-grade template
engine with five built-in templates, dynamic variable substitution, preview mode with bracket
placeholders, and a full admin API for managing templates. This is the foundation for every
automated email TrustMe sends.

---

## Team Discussion

**Marcus Chen (CTO)**: "Email is our most direct communication channel with members and business
owners. Every transactional email — welcome, claim approval, tier promotion — is a trust signal.
If we send a broken email with `{{memberName}}` in the subject line, we instantly look amateur.
The template engine solves this structurally: variables are declared per-template, substitution is
regex-based and handles multiple occurrences, and the preview endpoint lets the marketing team
verify templates before they go live. The five built-in templates cover our critical paths:
onboarding, claim verification, weekly engagement, business upsell, and tier progression. The
admin API means marketing can iterate on copy without engineering involvement."

**Sarah Nakamura (Lead Engineer)**: "38 tests across four groups. The static analysis tests verify
every export, the built-in template count, MAX_TEMPLATES constant, logger tag, and variable syntax.
The runtime tests cover getTemplate for both known and unknown names, getAllTemplates count,
createTemplate with new and overwritten names, renderTemplate with full substitution, partial
substitution leaving placeholders, and multi-occurrence substitution. The previewTemplate tests
verify bracket placeholder generation. The integration tests confirm the wiring between routes.ts,
routes-admin-templates.ts, and email-templates.ts. The module follows our established pattern: pure
computation, no DB coupling, Map-based in-memory storage with a 200-template cap."

**Jasmine Taylor (Marketing)**: "This is exactly what I've been asking for. Right now, if I want
to change the welcome email copy, I have to file an engineering ticket and wait for a deploy. With
the template admin API, I can create and preview templates directly. The bracket placeholder
preview is perfect for stakeholder review — I can show Rachel and the board exactly what an email
will look like before we send it. The five categories — transactional, marketing, drip, digest,
outreach — map directly to our email strategy. Transactional emails have the highest open rates,
so the welcome and tier promotion templates are where we invest the most brand voice. The weekly
digest is our engagement lever: 'Hey [memberName], here's what's trending in [city]' is exactly
the personalization that drives repeat visits."

**Amir Patel (Architecture)**: "The module is stateless beyond the in-memory Map, which makes it
trivially testable and easy to migrate to database-backed storage when we need persistence across
restarts. The MAX_TEMPLATES cap with oldest-non-built-in eviction prevents unbounded memory growth.
The regex-based substitution is straightforward — no Handlebars or Mustache dependency, just native
RegExp with escaped double-braces. The admin routes follow our established pattern: thin HTTP layer
that delegates to the pure module. Five endpoints — list, get, create, preview, render — cover the
full template lifecycle. When we add Sendgrid or Postmark integration, the renderTemplate output
(subject, html, text) maps directly to their API payloads."

**Cole Anderson (Full-Stack Engineer)**: "The render endpoint accepting variables in the POST body
is the key integration point. When we build the notification pipeline — tier promotion, weekly
digest cron, claim approval webhook — each handler just calls renderTemplate with the user's data
and gets back ready-to-send content. The separation between template definition and rendering means
we can A/B test email copy by swapping template names without touching the sending logic. I'd also
like to add template versioning in a future sprint so we can track which version of the welcome
email a member received."

**Rachel Wei (CFO)**: "Email deliverability and quality directly impact our key metrics. The
welcome email drives Day-1 activation. The weekly digest drives weekly retention. The pro upgrade
outreach drives Business Pro conversion. Each of these is a revenue lever. Having a template
system means we can systematically test subject lines and copy variations against conversion
metrics. Jasmine's team can run A/B tests on email copy the same way we run experiments on the
product. The five built-in templates cover our four revenue-critical touchpoints: onboarding
(LTV), engagement (retention), business upsell (revenue), and tier promotion (credibility
investment). This is infrastructure that pays for itself."

---

## Changes

### New Files
| File | Lines | Purpose |
|------|-------|---------|
| `server/email-templates.ts` | ~135 | Template engine: CRUD, render, preview, 5 built-in templates |
| `server/routes-admin-templates.ts` | ~75 | Admin API: 5 endpoints for template management |
| `tests/sprint246-email-templates.test.ts` | ~230 | 38 tests across 4 groups |

### Modified Files
| File | Change |
|------|--------|
| `server/routes.ts` | Import + register `registerAdminTemplateRoutes` |

### API Endpoints Added
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/templates` | List all templates |
| GET | `/api/admin/templates/:name` | Get template by name |
| POST | `/api/admin/templates` | Create new template |
| GET | `/api/admin/templates/:name/preview` | Preview with bracket placeholders |
| POST | `/api/admin/templates/:name/render` | Render with provided variables |

---

## PRD Gap Impact

- **Email communication system**: Foundation now exists. Built-in templates cover onboarding,
  claim verification, weekly digest, business outreach, and tier promotion.
- **Marketing autonomy**: Admin API enables template management without engineering deploys.
- **Remaining gaps**: No Sendgrid/Postmark integration yet, no cron-based digest sending,
  no template versioning, no A/B testing on email copy.
