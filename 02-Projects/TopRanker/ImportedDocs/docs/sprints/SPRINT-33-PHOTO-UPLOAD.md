# Sprint 33 — Photo Upload on Ratings

## Mission Alignment
User-generated photos are the richest form of social proof. A photo of a perfectly smoked brisket at Pecan Lodge tells more than any 5-star score. Photos make ratings tangible, shareable, and trustworthy. They also create content for our social media marketing and make business profiles visually richer.

## Team Discussion

### Rahul Pitta (CEO)
"Yelp's power is their photo library. Every restaurant page has hundreds of user photos. We need that same visual proof. When a diner uploads a photo with their rating, it becomes content that attracts the next diner. Photos are our flywheel for content-driven growth."

### Jasmine Taylor (Marketing Director)
"User photos are social media gold. 'Rated 5/5 on TopRanker' with a gorgeous food photo — that's an Instagram post that writes itself. We'll feature the best user photos in our 'TopRanker Shots' weekly series."

### Kai Nakamura (Lead Motion Architect)
"The photo preview has a subtle border radius and shadow. When the user removes a photo, the dashed border returns with a fade. The camera icon in the empty state pulses gently to draw attention. Micro-interactions make optional features feel inviting, not obligatory."

### James Park (Frontend Architect)
"Used `expo-image-picker` (already installed) for photo selection. The picker launches the image library with 4:3 crop at 0.8 quality — optimal for food photos. The photo is stored as a URI in state. In production, we'll upload to a CDN and store the URL with the rating. The photo section sits between the note input and the summary card in step 6."

### Olivia Hart (Head of Copy & Voice)
"'Add a photo (optional)' — the parenthetical is deliberate. Photos should feel like a bonus, not a requirement. Users who don't have a photo shouldn't feel their rating is incomplete. The dashed border and muted text reinforce 'this is optional.'"

### Elena Torres (VP Design)
"The dashed border on the empty photo slot is a universal 'upload here' pattern — every user recognizes it instantly. The preview uses a 4:3 aspect ratio at 160px height — enough to see the food without overwhelming the summary card below. The remove button (X circle) uses a shadow for visibility over any photo."

### Carlos Ruiz (QA Lead)
"Verified: Camera button opens image picker. Photo appears in preview with remove button. Removing photo returns to empty state. Photo URI persists across step navigation. The photo doesn't block form submission (optional). TypeScript clean."

## Changes
- `app/rate/[id].tsx`:
  - Added `expo-image-picker` and `expo-image` imports
  - Added `photoUri` state
  - Photo section in step 6 between note input and summary card
  - Empty state: dashed border, camera icon, "Add a photo (optional)"
  - Preview state: 4:3 image with X remove button
  - Image picker: library source, 4:3 crop, 0.8 quality
  - Styles: `photoSection`, `photoAddBtn`, `photoAddText`, `photoPreview`, `photoImage`, `photoRemove`

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| James Park | Frontend Architect | Photo picker integration, state management | A |
| Elena Torres | VP Design | Photo slot design, dashed border, preview layout | A |
| Kai Nakamura | Lead Motion Architect | Photo transition animation spec | A |
| Olivia Hart | Head of Copy & Voice | Optional photo messaging, UX copy | A |
| Jasmine Taylor | Marketing Director | User photo content strategy | A |
| Carlos Ruiz | QA Lead | Photo upload/remove testing, state persistence | A |

## Sprint Velocity
- **Story Points Completed**: 5
- **Files Modified**: 1
- **Lines Changed**: ~50
- **Time to Complete**: 0.5 days
- **Blockers**: Photo CDN upload needs backend endpoint (store URI with rating)

## PRD Gaps Closed
- Photo upload on ratings (user-generated content, optional)
