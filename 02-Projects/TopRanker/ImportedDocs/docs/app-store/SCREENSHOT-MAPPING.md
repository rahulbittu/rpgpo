# App Store Screenshot Mapping

**Last Updated:** 2026-03-11

---

## Existing Screenshots → App Store Slots

### iPhone 6.7" Display (Required)

| Slot | Source File | Caption |
|------|------------|---------|
| 1 | `screenshots/01-leaderboard.png` | "Live rankings. Every rating counts." |
| 2 | `screenshots/06-business-profile-top.png` | "See why it's #1. Transparent scoring." |
| 3 | (Need: rating flow screenshot) | "Rate in 30 seconds. Quick & structured." |
| 4 | `screenshots/03-discover.png` | "Find the best near you." |
| 5 | `screenshots/05-challenger.png` | "Challenge the #1 spot." |

### Notes

- Screenshots are from web browser (March 7). Need fresh captures from iOS device once build is installed.
- Rating flow screenshot missing — need to capture the rate modal in action.
- Apple requires 6.7" (1290 × 2796) for iPhone 15 Pro Max.
- Apple requires 6.5" (1284 × 2778) for iPhone 14 Plus (or 6.1" for older).
- Screenshots must be captured on device or simulator at exact resolution.

### Capture Checklist

- [ ] Rankings tab with populated leaderboard
- [ ] Business detail page with scores, hours, service flags
- [ ] Rating flow modal (step 1 or step 2)
- [ ] Discover tab with map and cards
- [ ] Challenger tab with active matchup

### How to Capture (Once App is on Device)

1. Install preview build on iPhone via EAS link
2. Navigate to each screen with good data
3. Take screenshots (Side button + Volume Up)
4. Transfer to Mac via AirDrop
5. Name as `appstore-01-rankings.png`, `appstore-02-business.png`, etc.
6. Upload to App Store Connect under "App Preview and Screenshots"
