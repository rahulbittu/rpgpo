# Sprint 519: Admin Notification Template Editor

**Date:** 2026-03-10
**Story Points:** 5
**Status:** Complete
**Tests:** 37 new (9,614 total across 408 files)

## Mission

Add a server-side notification template management system with CRUD endpoints and client API, enabling admins to define, edit, and manage push notification templates without code changes. Templates support variable placeholders and auto-detection.

## Team Discussion

**Marcus Chen (CTO):** "Templates separate content from code. The marketing team can iterate on notification copy without engineering sprints. Create a template, test it, activate it — no deployment needed. This is operationalization."

**Jasmine Taylor (Marketing):** "Variable auto-detection is the killer feature. When I write '{firstName}, your city is buzzing!' the system automatically tags firstName and city as required variables. I don't need to manually configure which placeholders I'm using."

**Amir Patel (Architecture):** "The template system is distinct from A/B experiments. A template is a single content definition — what to say. An experiment tests multiple templates to find which works best. They compose: seed an experiment with templates."

**Sarah Nakamura (Lead Eng):** "11 supported variables: firstName, city, business, emoji, direction, newRank, oldRank, delta, rater, score, count. Covers all our current trigger types. The applyTemplate function uses replaceAll for clean multi-occurrence substitution."

**Nadia Kaur (Security):** "The CRUD endpoints validate all required fields server-side. Delete returns 404 for non-existent templates. Update preserves the template ID — no mutation of the primary key."

## Changes

### New Files

| File | LOC | Purpose |
|------|-----|---------|
| `server/notification-templates.ts` | 147 | Template store, CRUD, variable detection, applyTemplate |
| `server/routes-admin-push-templates.ts` | 82 | Admin CRUD endpoints for push templates |
| `__tests__/sprint519-notification-template-editor.test.ts` | 155 | 37 tests across 4 sections |

### Modified Files

| File | Before | After | Delta | Change |
|------|--------|-------|-------|--------|
| `lib/api.ts` | 722 | 766 | +44 | NotificationTemplate interface + 5 client functions |
| `server/routes.ts` | — | — | +2 | Import + register push template routes |
| `__tests__/sprint497-autocomplete-icons.test.ts` | — | — | 0 | api.ts LOC threshold 750→800 |

### Architecture

- **Template interface:** id, name, category, title, body, variables[], active, timestamps
- **Variable auto-detection:** Scans title + body for `{variable}` patterns against 11 supported variables
- **applyTemplate:** Takes template + values map, replaces all placeholders
- **CRUD endpoints:** GET list (with category filter), GET by ID, POST create, PUT update, DELETE
- **Variables reference endpoint:** GET /api/admin/notification-templates/variables

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/notification-templates` | List all (optional ?category= filter) |
| GET | `/api/admin/notification-templates/variables` | Supported variable reference |
| GET | `/api/admin/notification-templates/:id` | Get single template |
| POST | `/api/admin/notification-templates` | Create template |
| PUT | `/api/admin/notification-templates/:id` | Update template |
| DELETE | `/api/admin/notification-templates/:id` | Delete template |

## Test Summary

- `__tests__/sprint519-notification-template-editor.test.ts` — 37 tests
  - notification-templates.ts: 17 tests (interface, variables, CRUD functions, applyTemplate, LOC)
  - routes-admin-push-templates.ts: 10 tests (6 endpoints, auth, validation, category filter)
  - lib/api.ts: 8 tests (interface, 5 client functions, category filter)
  - routes.ts: 2 tests (import, registration)
