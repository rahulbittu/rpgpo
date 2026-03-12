# Public Launch Checklist

**Created:** Sprint 208 (2026-03-09)
**Owner:** Marcus Chen (CTO)
**Target Decision:** Sprint 210 SLT Meeting

## Engineering Readiness

### Infrastructure
- [x] Express.js + Drizzle ORM production-ready
- [x] PostgreSQL with backup automation (daily cron)
- [x] Redis caching for rate limiting
- [x] CDN cache headers configured
- [x] Error tracking and logging
- [x] Performance monitoring middleware
- [x] Analytics persistence pipeline
- [ ] Railway production deployment validated
- [ ] Domain SSL/TLS configured
- [ ] Database connection pooling tuned for load

### Testing
- [x] 3,614+ tests across 137 files, all passing
- [x] Load test infrastructure (50 concurrent, 30s duration)
- [x] Performance validation endpoint
- [x] CI pipeline with automated checks
- [ ] End-to-end smoke tests on production
- [ ] Load test against production (100 concurrent)

### Security
- [x] Rate limiting (Redis-backed)
- [x] CSP headers
- [x] CORS configuration
- [x] Input sanitization
- [x] Email verification
- [x] Admin auth with rate limiting
- [x] Demo credentials hidden behind __DEV__
- [ ] Security audit by Nadia Kaur (pre-launch)
- [ ] Penetration test results reviewed

### Monitoring
- [x] Performance stats dashboard
- [x] Error dashboard
- [x] Analytics conversion funnel
- [x] Active user tracking (DB-backed)
- [x] Auto-refresh dashboard
- [ ] Alerting for downtime
- [ ] Alerting for error rate spikes

## Product Readiness

### Core Features
- [x] Rankings leaderboard with city picker
- [x] Business detail pages with trust explainer
- [x] Rating submission with credibility weighting
- [x] Challenger head-to-head battles
- [x] User profiles with tier progression
- [x] Search/Discover with maps
- [x] Referral system with rewards
- [x] Bookmarks and saved places
- [x] Push notifications

### Beta Validation
- [x] Wave 1 (25 users) sent
- [x] Wave 2 (50 users) sent
- [x] Wave 3 (100 users) ready
- [ ] Invite-to-rating conversion > 15%
- [ ] 2 weeks of Wave 3 data collected
- [ ] User feedback incorporated

## Business Readiness

### Revenue
- [x] Stripe payment integration
- [x] Challenger creation ($99)
- [x] Business Pro subscription ($49/mo)
- [x] Featured placement system
- [ ] Revenue projection model validated
- [ ] Break-even confirmed ($247/mo)

### Legal & Compliance
- [x] Privacy policy current
- [x] Terms of service current
- [x] GDPR deletion flow
- [x] Data retention policy (90-day analytics, 365-day invites)
- [x] Email consent compliance
- [ ] Legal review of app store listing

### Marketing
- [x] Brand system (amber, navy, Playfair Display)
- [x] Referral invite email template
- [x] Join landing page
- [ ] Marketing website at topranker.com
- [ ] Social media accounts set up
- [ ] Press kit prepared
- [ ] Launch PR strategy finalized

### App Store
- [ ] iOS App Store listing (see APP-STORE-METADATA.md)
- [ ] Google Play listing (see APP-STORE-METADATA.md)
- [ ] Screenshots captured
- [ ] App review notes with demo credentials
- [ ] Production EAS build submitted

## Launch Day Plan

### T-7 Days
- Final security audit
- Load test production
- All app store listings submitted

### T-3 Days
- App store approvals confirmed
- Marketing site live
- Social media posts scheduled

### T-1 Day
- Final smoke test
- Team briefing
- Support email monitored

### Launch Day
- App store releases coordinated
- Marketing push
- Team monitoring dashboard
- Hourly check-ins for first 8 hours

### T+1 Day
- Metrics review
- Bug triage
- User feedback review
