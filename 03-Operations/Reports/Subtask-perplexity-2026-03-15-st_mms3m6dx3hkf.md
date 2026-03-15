# Subtask Output — Research Data Privacy Laws and Best Practices
## Model: sonar
## Stage: audit
## Date: 2026-03-15

## Key Data Privacy Laws for Mobile Apps Collecting Location Data (2026)

Mobile apps collecting location data must comply with region-specific laws emphasizing consent, data minimization, localization, and restrictions on sharing, with enforcement actions like $200M FCC fines on carriers and FTC orders on GM highlighting risks.[3]

### US Laws and Enforcement
- **20 US states** enforce comprehensive privacy laws requiring data mapping, user consent for location collection, and restrictions on sales to third parties; apps on App Store/Google Play face multi-state exposure without geo-restrictions.[1]
- **FCC Penalties (2024, under Supreme Court review 2026)**: $200 million fines on Verizon, AT&T, T-Mobile, Sprint for selling customer location data to aggregators without consent; case challenges FCC's in-house enforcement.[3]
- **FTC Consent Order with GM/OnStar (finalized 2026)**: 5-year ban on sharing geolocation/driver data with reporting agencies; 20-year requirement for affirmative express consent before collection/use/sharing (exceptions for emergencies); mandates data access, deletion, opt-out, and disable precise location where feasible.[3]
- **Montana Law (2025)**: First state to block government purchases of sensitive location data without warrants, closing data broker loopholes.[2]
- **Federal Agency Issues**: DHS/CBP/ICE/USSS used commercial location data (from ad SDKs/RTB) without required Privacy Impact Assessments (PIAs) under E-Government Act of 2002; audit found non-compliance with privacy policies.[2][4]

**Source**: https://www.blankrome.com/publications/br-privacy-security-download-february-2026[3]

### EU and Global Laws
- **GDPR (ongoing)**: Applies to apps handling EU residents' location data; requires explicit consent for processing, data minimization, breach notifications within 72 hours, and user rights (access/deletion/portability); TikTok fined €530 million for mishandling location data across EU/China rules.[1][5]
- **EU AI Act (full implementation August 2026)**: Mandates compliance for location-based AI in apps, including risk assessments for high-risk processing.[1]
- **China PIPL/Cybersecurity Law**: Mandatory data localization—location data on Chinese residents must store in China; non-compliance risks fines.[1]
- **ePrivacy Directive**: Requires prior, explicit, specific consent for location tracking via cookies/SDKs in EU apps; easy withdrawal option mandatory.[5]

**Source**: https://www.dogtownmedia.com/data-sovereignty-101-for-mobile-apps-navigating-the-2026-regulations-on-where-your-mobile-data-lives/[1]

## Best Practices for Mobile Apps Collecting Location Data
- **Obtain Granular Consent**: Limit to "while using app" or approximate location; review/revoke permissions regularly; essential for weather/navigation/dating/fitness apps using SDKs.[2]
- **Data Minimization**: Collect only necessary location data (e.g., no precise tracking for flashlight apps); disable sharing with brokers/ad networks.[6]
- **Data Mapping and Sovereignty**: Identify user locations, storage regions (e.g., AWS/Azure), third-party processors; comply with localization (China) and cross-border rules (GDPR).[1]
- **Transparency and Controls**: Provide data access/deletion/opt-out; notify on SDK/RTB sharing risks; avoid selling to aggregators.[3]
- **Limit Government/Data Broker Exposure**: Block sales to brokers; support warrants for sensitive queries; monitor DHS-style commercial data procurement risks.[2][4]

**Source**: https://www.eff.org/deeplinks/2026/03/targeted-advertising-gives-your-location-government-just-ask-cbp[2]

## Actionable Next Steps
- Map your app's user base, data flows, and storage (use tools like AWS regions checker); consult attorney for 20-state US + GDPR/PIPL compliance matrix—start here: identify top 5 user jurisdictions via analytics.[1]
- Audit SDKs for RTB/location sharing; implement consent banners compliant with ePrivacy (test via CookieScript tools).[5]
- Add in-app toggles for precise location opt-out and data deletion, mirroring GM FTC order; test on iOS/Android permission APIs.[3]
- Monitor updates: EU AI Act (Aug 2026), Supreme Court FCC case (2026); subscribe to Blank Rome newsletter for monthly enforcement news.[3]
