# Critique Request — Sprints 751-754

**Date:** 2026-03-12
**Requesting:** External critique of operational readiness cycle

---

## Context

Sprints 751-754 shifted from security hardening to operational readiness for Railway deployment and TestFlight submission. No new features were added — these sprints fixed deployment configuration issues and validated build configs.

**Key numbers:** 13,031 tests, 664.9kb build, /_health + /_ready probes, CORS production-ready, EAS config validated.

---

### 1. Operational Testing Without Deployment

We've added /_health and /_ready endpoints, fixed CORS headers, and validated EAS config — all without actually deploying to Railway or building with EAS. Is this "testing in a vacuum" a risk? Should we have deployed first and fixed issues as they appeared, rather than trying to anticipate all problems from code alone?

### 2. CORS Wildcard Expansion

Sprint 753 added `*.up.railway.app` to CSP connect-src, which allows any Railway app to be a connection target. Is this overly permissive? Should we restrict to only our specific Railway subdomain (`topranker-production.up.railway.app`) instead of using a wildcard?

### 3. Unauthenticated Operational Endpoints

Both `/_health` and `/_ready` are unauthenticated. The readiness probe reveals whether the database is connected. Could an attacker use `/_ready` to detect database outages and time attacks accordingly? Should operational endpoints have IP-based restrictions?

### 4. EAS Config as Code vs Environment

The `EXPO_PUBLIC_API_URL` is hardcoded in eas.json rather than being an EAS secret. If we need to change the API URL (e.g., Railway domain change), we'd need to rebuild the app instead of just updating a secret. Is this the right tradeoff for a pre-launch beta?

### 5. Engineering-Operations Gap

The team has completed 14 sprints (741-754) of engineering work while CEO operational tasks (Railway deploy, App Store Connect, TestFlight) remain undone. What process changes could ensure operational tasks keep pace with engineering, especially as the team scales?
