# TOPRANKER — RATING INTEGRITY SYSTEM

**Deep Requirements & Thinking Framework for Claude Code**
**Owner:** Rahul Pitta (CEO)
**Classification:** Core Product Architecture — Do Not Deviate Without Discussion

---

## HOW TO READ THIS DOCUMENT

This is not a list of features to build. It is a thinking framework first,
and a technical specification second.

Every decision in this document exists because of a specific reasoning chain.
Before you implement anything, read the reasoning. If you find yourself about
to do something that contradicts the reasoning, stop and flag it — do not
silently override the philosophy with a simpler implementation.

The rating system is the product. The leaderboard is downstream of the rating
system. If the rating system is wrong, everything built on top of it is wrong.

---

## PART 1 — THE PHILOSOPHICAL FOUNDATION

### What is a rating on TopRanker?

A rating is a structured opinion from a real person about a real experience.
It is not a review. It is not a complaint. It is not a star count.

It is a signal. And signals have quality.

A signal from a person who ate at a restaurant last Tuesday and specifically
ordered the biryani is a high-quality signal about biryani quality.

A signal from a person who ordered delivery from that restaurant six months
ago and is rating "vibe" is a low-quality signal about vibe — they were
not physically present.

A signal from a person who has never interacted with the restaurant but
dislikes the owner is not a signal at all. It is noise that mimics signal.

The entire rating integrity system exists to do one thing:

> **AMPLIFY HIGH-QUALITY SIGNALS. ATTENUATE LOW-QUALITY SIGNALS. ELIMINATE NOISE.**

That is the mental model. Hold it for every decision in this document.

### The trap most platforms fall into

Most review platforms treat all ratings as equal and try to detect bad ones
after the fact, then delete them. This is the wrong architecture. It is
whack-a-mole. It damages user trust when people see ratings disappear.

TopRanker's architecture is different. We do not delete ratings. We weight
them. A low-quality rating does not disappear — it just contributes almost
nothing to the score. The rating still exists. The rater can see it. But
its influence on the leaderboard is proportional to its quality.

This means:
- We are not judges deciding who is lying and who is not.
- We are signal processors deciding how much each signal should influence
  the output.
- The output is a leaderboard that reflects the collective opinion of the
  most credible, most experienced raters.

### The trust contract with users

Every user who submits a rating must feel that their rating mattered AND
that the ranking they see is trustworthy. These two things seem to be in
tension but they are not.

A new user's rating matters — it contributes at 0.10x weight. That is real.
It is not zero. And as they rate more, their influence grows. That is the
incentive loop.

The ranking is trustworthy because it is dominated by the signals from
users who have rated many things accurately over time. New users cannot
swing a ranking dramatically. This protects the ranking while still
welcoming new contributors.

The trust contract must be explicit in the UI. Users should know how the
system works. "Your rating counts. Here's how much." Transparency is not
a weakness — it is the product's credibility.

---

## PART 2 — THE THREE RATER CATEGORIES

Every person who submits a rating falls into one of three categories.
The system must behave differently for each.

### Category A — Verified Experience Rater

**Definition:** A person who has genuine first-hand experience with the
specific thing they are rating.

For restaurants: They ate there. Dine-in or delivery, they consumed the food.

**Signals that suggest Category A:**
- Uploaded a photo with the rating (strongest signal — 85%+ correlation
  with genuine visit based on industry data)
- Rating submitted within 48 hours of a known service window
- Rating includes dimensional detail (not just sliders at max or min)
- Their credibility score is >=100 (Regular tier or above)
- Their previous ratings show variance — they don't always give 5s or 1s

**How to treat Category A:** Full weight as determined by credibility tier.
No friction. Fast submission flow.

### Category B — Legitimate but Limited Rater

**Definition:** A person with real experience but limited ability to rate
certain dimensions accurately.

**Primary case for restaurants:** Delivery customers. They genuinely ate the
food. They cannot meaningfully rate dine-in vibe, in-person service speed,
or table experience.

**Secondary case:** Someone who visited once, two years ago, and is rating
from memory. The signal degrades with time.

**Signals that suggest Category B:**
- Self-selected "delivery" on the visit type question
- Rating submitted significantly after the visit date they indicated
- Rating is for a dimension that doesn't apply to their stated experience

**How to treat Category B:** Accept the rating fully for applicable dimensions.
Exclude or heavily discount inapplicable dimensions. Explain why in the UI
("Your food score counts fully. Vibe score is only counted for dine-in visits.")

### Category C — No-Experience Rater (Noise)

**Definition:** A person with no genuine experience submitting a rating
anyway. This includes: competitors, disgruntled ex-employees, people who
"heard bad things," people paid to game the ranking.

These people are invisible to simple detection. They look like real users.
Their account may have credibility history. They may write coherent text.
The system cannot always identify them individually.

**How to treat Category C:** The credibility weighting system is the primary
defense. A new account (0.10x weight) doing this has minimal impact.
An established account (1.00x weight) doing this is a real risk — but
requires significant platform investment before the account has that power,
making it economically unattractive to do at scale.

Secondary defenses are velocity detection, dimensional pattern analysis,
and behavioral signals. These are documented in Part 5.

> **CRITICAL PRINCIPLE:** Do not build a system that tries to definitively
> identify Category C raters and delete their ratings. You will be wrong
> sometimes and you will delete legitimate ratings. Instead, build a system
> where Category C ratings have negligible impact on outcomes even if they
> exist. Design for resilience, not purity.

---

## PART 3 — VISIT TYPE SEPARATION (THE DELIVERY VS DINE-IN PROBLEM)

### Why this matters deeply

Consider this scenario: a restaurant is excellent. Food is outstanding —
9.2 out of 10. But delivery packaging is terrible. The food arrives cold
and the containers leak. Delivery customers rate food 5/10 because of
the delivery experience, not the food itself.

Without visit type separation, the leaderboard says this restaurant's
food is 7.1/10. That is not true. The food is 9.2. The delivery logistics
are bad. These are different things.

Now consider the reverse: a restaurant has stunning ambience, great service,
but mediocre food. Dine-in customers give vibe 9/10, food 6/10. Delivery
customers give food 6/10 accurately. Dine-in customers give food 7/10
because the experience inflates their food perception (this is real —
environment affects taste perception, documented in food psychology research).

Without separation, you get a muddled signal. With separation, you get
the truth: this restaurant creates a great dine-in experience but the
food alone is average.

**This level of signal clarity is TopRanker's competitive advantage.
Yelp does not do this. Google does not do this. This is yours.**

### The implementation

The visit type question is the FIRST question in the rating flow.
Before any dimensions are shown, the user selects:

> "How did you experience this restaurant?"
> - Dined in
> - Ordered delivery
> - Takeaway / picked up

This selection gates which dimensions they see:

| Visit Type | Dimensions |
|---|---|
| **DINE-IN** | Food Quality + Service + Vibe |
| **DELIVERY** | Food Quality + Packaging Quality + Value for Money |
| **TAKEAWAY** | Food Quality + Wait Time Accuracy + Value for Money |

The dimension labels for delivery and takeaway replace service and vibe
with dimensions that are actually measurable from those contexts.

### Dimension definitions by visit type

**FOOD QUALITY** (all visit types)
- What it measures: The taste, preparation, authenticity, and presentation of the specific dish or meal ordered.
- Special field: "What did you order?" (the dish leaderboard input)
- Rating scale: 1-10, labeled: Poor (1-3) / Average (4-6) / Good (7-8) / Excellent (9-10)

**SERVICE** (dine-in only)
- What it measures: Attentiveness, accuracy of order, wait time, staff knowledge.
- Not a measure of friendliness alone — that is too subjective.
- Rating scale: 1-10

**VIBE** (dine-in only)
- What it measures: Ambience, cleanliness, noise level, overall atmosphere.
- This is intentionally subjective — different people want different vibes.
- Rating scale: 1-10

**PACKAGING QUALITY** (delivery only)
- What it measures: Did the food arrive intact? Was it the right temperature? Was it well-sealed? Did the portions hold their form?
- This is a signal about the restaurant's delivery-specific effort.
- Rating scale: 1-10

**VALUE FOR MONEY** (delivery and takeaway)
- What it measures: Given the price paid including delivery fees, was it worth it?
- Note: This includes delivery fees in user perception even though restaurants don't control third-party fees. UI should acknowledge this complexity.
- Rating scale: 1-10

**WAIT TIME ACCURACY** (takeaway only)
- What it measures: Was the food ready when they said it would be?
- Rating scale: 1-10

### Score calculation by visit type

The composite score for a restaurant uses a weighted average that reflects
what matters most for that visit type:

**DINE-IN composite:**
- Food Quality x 0.50
- Service x 0.25
- Vibe x 0.25

**DELIVERY composite:**
- Food Quality x 0.60
- Packaging Quality x 0.25
- Value for Money x 0.15

**TAKEAWAY composite:**
- Food Quality x 0.65
- Wait Time Accuracy x 0.20
- Value for Money x 0.15

**OVERALL RESTAURANT SCORE:**
The leaderboard score is the credibility-weighted average of ALL composites
from ALL visit types. Dine-in composites and delivery composites are treated
as equivalent inputs to the overall score, each weighted by the submitter's
credibility tier.

This means a restaurant cannot be artificially elevated by having great
ambience if the food is mediocre. Food carries the most weight across all
visit types (50%, 60%, 65%). Everything else matters, but food is the truth.

### What to show in the UI

On the restaurant profile page, show separate score breakdowns:

| Label | Description |
|---|---|
| **Overall Score: 8.4** | The leaderboard number |
| **Dine-in Experience: 8.7** | Average of dine-in composites |
| **Delivery Experience: 7.9** | Average of delivery composites |
| **Food Score: 8.8** | Food quality dimension only, all visit types |

This level of transparency is a feature. It tells the user: "This place
is better in person than for delivery. Plan accordingly." That is useful.
No other platform tells you this clearly.

---

## PART 4 — VISIT VERIFICATION (THE HONEST SIGNAL BOOST)

### Core principle

Visit verification is **OPTIONAL** and **ADDITIVE**. It is never a gate.

A user who submits a rating without any verification still submits a valid
rating. We do not penalize the absence of verification. We reward its presence.

**Why:** Making verification mandatory kills contribution volume by 60-80%
based on industry data. Most legitimate users do not keep receipts or
remember to check in. Mandatory verification selects for a different
kind of user — the meticulous one — not necessarily the most representative one.

### Verification methods and their signal value

Each method has a "verification confidence" score from 0 to 1.
When a verification signal is present, the rating's weight is multiplied
by (1 + verification_boost). The boost adds to credibility weight, not
replaces it.

**METHOD 1 — Photo Upload** (confidence: 0.75, boost: +15%)
- A photo uploaded alongside the rating strongly correlates with genuine visit. People who never went somewhere rarely have a photo of the food.
- The photo does not need to be verified by a human. Its presence alone is the signal.
- Implementation: image upload in rating flow, stored in CDN.
- UI: "Add a photo to earn a Verified Visit badge on your rating."

**METHOD 2 — Self-Declaration with Detail** (confidence: 0.40, boost: +5%)
- User indicates specific dish ordered (the special field).
- This is weaker than a photo but stronger than no signal.
- Someone fabricating a rating often does not bother to invent a dish name.
- Implementation: the "What did you order?" field is already part of the dish leaderboard feature. Completing it adds a minor verification signal.

**METHOD 3 — Receipt/Order Confirmation** (confidence: 0.95, boost: +25%)
- Strongest verification method. User uploads a photo of receipt or screenshots a Uber Eats / DoorDash confirmation.
- Implementation: optional upload field in rating flow.
- DO NOT build automated receipt parsing in V1. A human review flag is sufficient initially. In V2, automated receipt parsing can be added.
- UI: "Upload your receipt for a Verified Purchase badge."

**METHOD 4 — Time-of-Visit Plausibility** (confidence: 0.30, boost: +5%)
- System check: was the rating submitted during or shortly after normal service hours? A rating submitted at 3am for a restaurant that closes at 10pm is slightly suspicious. This is a weak signal but adds up with other signals.
- Implementation: server-side check, no UI required.
- Do not penalize for submitting late — many people rate after they get home. Only apply the boost when timing is plausible. Never apply a penalty.

### The Verified Visit badge

When a rating has any verification method present, display a small badge:
"Verified Visit" next to the rating in the review list.
The specific method is not displayed — just the badge.

This is purely a trust signal for readers. A restaurant page where 70% of
ratings show "Verified Visit" looks more trustworthy than one with 10%.
That difference is real and users understand it intuitively.

### What NOT to build

Do not build a system that:
- **Requires a Foursquare-style check-in using GPS location.** Reason: people often rate later, at home. GPS check-in at the restaurant is friction that prevents legitimate users from contributing.
- **Cross-references with third-party order APIs (Uber Eats, DoorDash).** Reason: privacy overreach. Users will not authorize this.
- **Shows a lower visual rating for unverified ratings.** Reason: this punishes legitimate users who simply didn't take a photo and damages the trust contract explained in Part 1.

---

## PART 5 — ANTI-GAMING LAYERS

### Layer 1 — Credibility Tier Weighting (already built, maintain correctly)

The existing tier system is the primary defense:

| Tier | Score Range | Weight |
|---|---|---|
| New Member | 10-99 | 0.10x |
| Regular | 100-299 | 0.35x |
| Trusted | 300-599 | 0.70x |
| Top Judge | 600+ | 1.00x |

This means a brand new account submitting a 1-star rating contributes
0.10x to the score. To meaningfully impact a restaurant with 50 ratings,
an attacker would need to create approximately 500 coordinated accounts,
all at New Member tier, all submitting bad ratings simultaneously.
The cost and effort of this attack exceeds the benefit in almost all cases.

A single established Top Judge account can swing a score more than 10 New
Member accounts. This is intentional. Earning trust has value.

### Layer 2 — Velocity Detection (build in V1)

Detect abnormal rating volume and flag for review.

**Rules to implement:**

- **RULE V1:** More than 5 ratings for the same restaurant from the same IP address within 24 hours -> flag the session, reduce weight of all ratings from that session to 0.05x, alert Nadia Kaur (cybersecurity).

- **RULE V2:** A single account submitting more than 10 ratings in any 1-hour window -> flag the account, reduce all ratings from that hour to 0.05x, queue for review.

- **RULE V3:** More than 20 New Member accounts submitting ratings for the same restaurant within 12 hours -> flag the restaurant, alert operations team, display no visible change on the leaderboard until reviewed.

- **RULE V4:** An account that has been inactive for more than 30 days and returns to rate only one specific restaurant with an extreme score (1 or 10) -> flag for review, reduce weight to 0.05x.

**IMPORTANT:** Flagging does not mean rejection. Flagged ratings still exist
in the database. They are just weight-reduced and queued for review.
If review determines they are legitimate, weight is restored. This approach
prevents legitimate users from feeling punished without explanation.

### Layer 3 — Dimensional Pattern Detection (build in V1)

Abnormal patterns in how a rating is distributed across dimensions
suggest fabrication:

**Pattern A — All maximums or all minimums.**
A rating with Food=10, Service=10, Vibe=10 is statistically unusual.
Genuine raters almost always see nuance. Apply a 0.80x multiplier to
ratings where all dimensions are at maximum or all at minimum.
Exception: if the account has a history of similarly extreme ratings
that are consistent over time, this may be their genuine rating style.
Check history before applying multiplier.

**Pattern B — Contradictory dimensional scores.**
Food=10, Service=1, Vibe=10 is unusual but plausible (great food,
terrible service). Food=1, Service=10 is highly unusual (terrible food,
perfect service — how?). Flag for soft review but do not reduce weight
automatically. Use this as supporting signal only.

**Pattern C — Dimension completed in under 3 seconds total.**
Track time-on-page for the rating flow. Completing a multi-dimensional
rating in under 3 seconds means the user did not read the questions.
Apply a 0.60x multiplier to these ratings.
Exception: Trusted and Top Judge tier users have established genuine
behavior. Only apply this to New Member and Regular tier accounts.

### Layer 4 — Account Age and History Analysis (build in V2)

Do not build this in V1. Capture the data now so it is available later.

**Data to capture that enables V2 detection:**
- Account creation date
- Time between account creation and first rating
- Number of unique restaurants rated
- Geographic spread of ratings (all in same neighborhood vs spread across city)
- Rating variance over time (do their scores change or are they static?)

A legitimate user who has rated 20 restaurants over 6 months with
natural variance is a different profile from an account created 3 days
ago that has rated the same restaurant 5 times.

### Layer 5 — Business Owner Self-Rating Prevention

A business owner who claims their profile must be prevented from rating
their own restaurant. This is obvious but must be explicitly implemented.

**Implementation:**
When a business is claimed by a user, store `claimed_by_user_id`.
In the rating submission endpoint, check: does the submitting user
match `claimed_by_user_id` OR is the submitter listed as an employee
of the business? If yes, block submission with message:
"As the business owner, you cannot rate your own restaurant. We want
to keep rankings fair for everyone."

Also check: does the submitting user's IP match the IP used to claim
the business? Flag as potential self-rating even if accounts differ.

### Layer 6 — Competitor Rating Detection (build in V2)

The hardest problem. A legitimate competitor customer who genuinely dined
and gives a bad rating is allowed. A competitor owner who creates accounts
to attack rivals is not.

**Pattern to detect in V2:**
Account X submits a rating for Restaurant A and also claims or is
associated with Restaurant B in the same category and city.
Flag this relationship. The rating from Account X for Restaurant A
is not automatically invalid, but it is tagged and scrutinized.

---

## PART 6 — THE SCORE CALCULATION ENGINE

This section defines precisely how every number on the leaderboard is computed.

### Step 1 — Individual Rating Composite Score

For each individual rating submission, compute a composite score
based on visit type (see Part 3 for weights):

```
composite_score = (dimension_1 x weight_1) + (dimension_2 x weight_2) + (dimension_3 x weight_3)
```

### Step 2 — Apply Verification Boost

```
boosted_score = composite_score  (verification boost does not change the score)
```

**IMPORTANT CLARIFICATION:** Verification does not change the composite score
number itself. It changes the effective credibility weight used in Step 3.
A verified rating from a New Member is weighted at 0.10x x 1.15 = 0.115x.
The score stays the same. The influence changes.

### Step 3 — Apply Credibility Weight

```
effective_weight = credibility_tier_weight x (1 + verification_boost)
```

Where `verification_boost` is the sum of all applicable boosts from Part 4:
- 0.15 for photo
- 0.05 for dish detail
- 0.25 for receipt
- 0.05 for time plausibility

Maximum combined boost: **0.50** (cap it — a single rating cannot be more than
1.50x its tier weight regardless of how many verification signals it has).

### Step 4 — Apply Anti-Gaming Multipliers

If any Layer 2-3 flags are active, apply the multiplier:

```
adjusted_weight = effective_weight x gaming_multiplier
```

(where `gaming_multiplier` is between 0.05 and 1.00, default 1.00)

### Step 5 — Apply Temporal Decay

Ratings become less relevant over time. A rating from 3 years ago should
not have the same influence as a rating from last week.

```
decay_factor = e^(-lambda x days_since_rating)
where lambda = 0.003 (approximately 50% weight after 231 days / about 7.5 months)
```

This means:
- Rating from today: 100% weight
- Rating from 3 months ago: 75% weight
- Rating from 6 months ago: 57% weight
- Rating from 1 year ago: 33% weight
- Rating from 2 years ago: 11% weight

A restaurant that was excellent 2 years ago but has declined is
demoted organically as old high ratings decay and new lower ratings
dominate. A restaurant that improved recently rises as fresh good
ratings outweigh old bad ratings.

### Step 6 — Compute Restaurant Score

For each restaurant, the score is:

```
                    SUM(composite_score_i x adjusted_weight_i x decay_factor_i)
restaurant_score = ─────────────────────────────────────────────────────────────
                         SUM(adjusted_weight_i x decay_factor_i)
```

This is a weighted average where the weights incorporate credibility,
verification, anti-gaming flags, and temporal decay simultaneously.

### Step 7 — Minimum Rating Threshold

A restaurant does not appear on the leaderboard until it has:
- At least 3 unique raters (not 3 ratings — 3 different accounts)
- At least 1 dine-in rating (delivery-only rated restaurants are shown in search but not ranked on the main leaderboard)
- Credibility-weighted sum >= 0.5 (prevents a single Top Judge rating from dominating the leaderboard before real density exists)

Below this threshold, the restaurant is listed with: "Not enough ratings yet.
Be one of the first to rate this restaurant."

### Step 8 — Rank Calculation

After computing `restaurant_score` for all qualifying restaurants in a city
and category, rank them 1 to N by descending score.

**Tiebreaker rule:** if two restaurants have scores within 0.05 of each other,
rank by total number of credibility-weighted raters (more raters = higher
position). This rewards participation.

---

## PART 7 — DATABASE SCHEMA REQUIREMENTS

The existing ratings table must be extended. Do not rebuild from scratch.
Add columns incrementally.

### Additions to the ratings table

```sql
visit_type          ENUM('dine_in', 'delivery', 'takeaway') NOT NULL

-- Dimensional scores (nullable based on visit type)
food_score          DECIMAL(3,1) NOT NULL        -- all visit types
service_score       DECIMAL(3,1) NULLABLE        -- dine_in only
vibe_score          DECIMAL(3,1) NULLABLE        -- dine_in only
packaging_score     DECIMAL(3,1) NULLABLE        -- delivery only
wait_time_score     DECIMAL(3,1) NULLABLE        -- takeaway only
value_score         DECIMAL(3,1) NULLABLE        -- delivery + takeaway

-- Visit type specific
dish_ordered        VARCHAR(200) NULLABLE        -- the special field

-- Verification signals (booleans, not the actual files)
has_photo           BOOLEAN DEFAULT FALSE
has_receipt         BOOLEAN DEFAULT FALSE
dish_field_completed BOOLEAN DEFAULT FALSE
submitted_during_hours BOOLEAN DEFAULT FALSE     -- computed at submission

-- Computed at submission time, stored for performance
verification_boost  DECIMAL(4,3) DEFAULT 0.000  -- sum of applicable boosts
composite_score     DECIMAL(4,2)                 -- computed score
effective_weight    DECIMAL(6,4)                 -- credibility x boost

-- Anti-gaming
gaming_flag         BOOLEAN DEFAULT FALSE
gaming_multiplier   DECIMAL(3,2) DEFAULT 1.00
gaming_reason       VARCHAR(500) NULLABLE        -- internal notes

-- Timestamps
visit_date_estimated DATE NULLABLE              -- user-provided, not required
submitted_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
time_on_page_ms     INTEGER NULLABLE            -- time spent in rating flow
```

### New table: rating_photos

```sql
id                  UUID PRIMARY KEY
rating_id           UUID REFERENCES ratings(id)
photo_url           TEXT NOT NULL
cdn_key             TEXT NOT NULL
is_verified_receipt BOOLEAN DEFAULT FALSE
uploaded_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
```

### Index requirements (do not skip these — they are critical for performance)

```sql
CREATE INDEX idx_ratings_business_active ON ratings(business_id)
  WHERE gaming_flag = FALSE;

CREATE INDEX idx_ratings_submitted_at ON ratings(submitted_at DESC);

CREATE INDEX idx_ratings_business_visit_type ON ratings(business_id, visit_type);

CREATE INDEX idx_ratings_user_business ON ratings(user_id, business_id);
  -- Used for duplicate submission check and self-rating detection
```

---

## PART 8 — API REQUIREMENTS

### POST /api/ratings — Submit a rating

**Request body must include:**
- `business_id` — UUID required
- `visit_type` — string required, enum: `dine_in` | `delivery` | `takeaway`
- `food_score` — number required, 1-10
- `service_score` — number, required if visit_type=dine_in
- `vibe_score` — number, required if visit_type=dine_in
- `packaging_score` — number, required if visit_type=delivery
- `wait_time_score` — number, required if visit_type=takeaway
- `value_score` — number, required if visit_type=delivery or takeaway
- `dish_ordered` — string optional
- `visit_date_estimated` — date optional
- `time_on_page_ms` — number optional, sent by client

**Server-side on receipt:**
1. Validate all required fields for the given visit_type
2. Check: has this user already rated this business in the past 7 days? If yes: allow but flag as potential duplicate, surface to user: "You've rated this place recently. Are you sure you want to submit again?" Do not block — the user may have visited twice. Just confirm intent.
3. Check: is the submitting user the business owner? If yes: block with message from Part 5 Layer 5.
4. Run all velocity checks (Layer 2 rules) asynchronously. Do not block submission on velocity check. Run after submission and update gaming_flag + gaming_multiplier if triggered.
5. Compute composite_score based on visit_type weights.
6. Compute verification_boost based on available signals. Note: has_photo and has_receipt cannot be confirmed until after photo upload completes. Store provisional boost, update on photo confirmation webhook.
7. Store submitted_during_hours: check current server time against business hours if available.
8. Trigger async score recalculation for the business. DO NOT block the API response on score recalculation. Return 201 immediately. Recalculate in background.
9. Emit event to analytics system (Aria's domain).

**Response on success (201):**

```json
{
  "rating_id": "uuid",
  "composite_score": 8.4,
  "credibility_weight": 0.35,
  "effective_weight": 0.4025,
  "message": "Your rating has been submitted. Your influence on this ranking: [weight as percentage]."
}
```

The message showing the user their effective weight is intentional.
It makes the credibility system tangible and motivates tier advancement.

### POST /api/ratings/:id/photo — Upload rating photo

Accepts multipart form data.
Stores to CDN. Updates `ratings.has_photo = TRUE`.
Recomputes verification_boost.
Triggers business score recalculation.

### GET /api/businesses/:id/score-breakdown

Returns the full score breakdown for UI display:

```json
{
  "overall_score": 8.4,
  "rank": 3,
  "rank_change_7d": 1,
  "total_raters": 47,
  "credibility_weighted_raters": 23.4,

  "by_visit_type": {
    "dine_in": {
      "composite_score": 8.7,
      "rating_count": 31,
      "food_score": 8.8,
      "service_score": 8.6,
      "vibe_score": 8.4
    },
    "delivery": {
      "composite_score": 7.9,
      "rating_count": 16,
      "food_score": 8.2,
      "packaging_score": 7.4,
      "value_score": 7.8
    }
  },

  "food_score_only": 8.6,

  "verified_rating_percentage": 62,

  "score_trend": [
    { "week": "2026-01-13", "score": 8.1 },
    { "week": "2026-01-20", "score": 8.2 }
  ]
}
```

---

## PART 9 — UI/UX REQUIREMENTS FOR THE RATING FLOW

The rating flow is the product's most critical interaction. Every friction
point here reduces rating volume. Every ambiguity here reduces signal quality.
Both are unacceptable.

### Screen 1 — Visit Type Selection

Full screen. Single question. No other content.

> "How did you experience [Restaurant Name]?"
>
> [ Dined in ] [ Ordered delivery ] [ Picked up / takeaway ]

Large tap targets. Icons for each. No subtext needed.
User cannot proceed without selecting one.

### Screen 2 — What Did You Order? (Special Field)

Full screen. Single question. This is optional but strongly encouraged.

> "What did you order?"
> [Text field with placeholder: "e.g. Butter Chicken, Biryani, Dosa..."]
>
> [Skip] [Continue]

If the user types a dish name, auto-suggest from known dishes for this
restaurant if available. This improves dish leaderboard data quality.

Visual prompt if they skip: "Sharing what you ordered helps rank the
best dishes in Dallas. Skip if you'd rather not."

### Screen 3 — Dimension Rating

Three sliders (or tappable 1-10 scale) for the applicable dimensions
based on visit type.

Each dimension has:
- A clear label (Food Quality, Service, Vibe, etc.)
- A one-line explanation of what to rate
- The scale labels: Poor (1-2) / Below Average (3-4) / Average (5-6) / Good (7-8) / Excellent (9-10)

**DO NOT default sliders to 5.** Default to nothing. Force the user to
actively choose. Pre-selecting 5 biases ratings toward the middle.

Show all three dimensions on one screen if possible. If not, paginate
one per screen — but the single-screen approach reduces drop-off.

### Screen 4 — Photo Upload (Optional)

> "Add a photo of your meal?"
>
> [Take Photo] [Choose from Library] [Skip]

Below the options: "Photos earn you a Verified Visit badge and help
others see what to order. Verified ratings appear first in listings."

This screen must load fast. Photo upload should be async — show a
spinner, allow submission to proceed while photo uploads in background.

### Screen 5 — Confirmation

> "Rating submitted!"

Show:
- Composite score (the number they effectively gave)
- Their current credibility tier and weight
- "Your rating is influencing the ranking right now."
- If they are close to a tier upgrade: "X more credible ratings and your voice will count [Y]x more."
- Share button: "Share that you rated [Restaurant Name]"

The share mechanic is the viral loop. "I just helped rank the best
biryani in Irving" is a shareable moment if the UI creates it.

---

## PART 10 — WHAT NOT TO BUILD (ANTI-REQUIREMENTS)

These are explicitly out of scope and should not be built without
direct discussion with Rahul.

- **DO NOT** build a report/flag system that hides individual ratings. Reason: creates adversarial dynamic. Weight reduction handles this.

- **DO NOT** build a human moderation queue for individual ratings. Reason: does not scale. Anti-gaming layers handle systematic issues. Exception: business owners can flag specific ratings as potentially fraudulent, which adds them to a review queue for the operations team.

- **DO NOT** require email or phone verification before submitting a rating. Reason: kills contribution volume. The credibility weight system is the verification mechanism, not a gate.

- **DO NOT** build a "helpful" / "not helpful" upvote for ratings. Reason: this is a Yelp mechanic. On TopRanker, all ratings contribute to the mathematical score. A rating does not need to be upvoted to matter. It already matters through the weighting system.

- **DO NOT** show the exact weight of every individual rating publicly. Reason: sophisticated bad actors would reverse-engineer the system to maximize their attack weight. Show tier weight to the rater themselves (in their own profile). Do not show on the public restaurant page.

- **DO NOT** build a leaderboard of "most helpful raters" that shows individual weight scores publicly. Reason: creates a target for social engineering. Instead, show the Top Judge badge which indicates tier without showing the exact weight.

- **DO NOT** allow a restaurant to respond to or dispute individual ratings in V1. Reason: builds false equivalence between business defense and rater honesty. Business owner tools come in V2, scoped carefully.

---

## PART 11 — HOW CLAUDE CODE SHOULD THINK ABOUT THIS

This section is written directly for you, the implementing engineer.

When you are about to make a decision about the rating system and it
is not covered in this document, ask yourself these questions in order:

1. **Does this decision AMPLIFY high-quality signals or ATTENUATE low-quality ones?**
   If neither, it is probably not a rating integrity decision.

2. **Does this decision make it HARDER to game the leaderboard without making it HARDER to submit a genuine rating?**
   If it makes both harder, reject it. The contribution cost is too high.
   If it makes gaming harder without touching legitimate users, build it.

3. **Does this decision preserve the TRUST CONTRACT with users?**
   Users must feel their rating mattered AND that the ranking they see
   is trustworthy. If the decision improves one at the expense of the other,
   flag it for discussion before building.

4. **Is this decision TRANSPARENT to the user?**
   Everything about how ratings are weighted should be explainable to a
   user in one sentence. "Your vote counts more as you rate more accurately
   over time." If you cannot explain a decision that simply, it may be
   too complex.

5. **Does this decision create a PERVERSE INCENTIVE?**
   Example: if you reward users financially for submitting ratings, you
   incentivize submitting ratings just for the reward, not for the signal.
   That degrades quality. Check every incentive against this filter.

6. **What is the WORST CASE if this system is wrong?**
   If a flag incorrectly reduces a legitimate rating to 0.05x weight,
   what is the impact? (Small — one rating among many.) If a missing
   check allows a coordinated attack to tank a restaurant's ranking,
   what is the impact? (Serious — potentially damages a real business.)
   Build the system to fail gracefully toward the less harmful outcome.

7. **Are you building for NOW or for SCALE?**
   At 500 users and 50 restaurants, many anti-gaming layers are overkill.
   At 50,000 users and 5,000 restaurants, they are essential. Build the
   data capture now so the logic can be added later. Do not add complex
   logic now that adds latency and complexity before the scale justifies it.

**When in doubt:** weight, don't delete. Be transparent, not paternalistic.
Serve the rater and the reader equally. Never let gaming the ranking be
easier than being a genuine customer.

---

## PART 12 — IMPLEMENTATION PRIORITY

Build in this order. Do not start Phase 2 until Phase 1 is complete and tested.

### PHASE 1 — Core integrity (build now, Sprint 86-88)
- Visit type selection in rating flow (dine-in / delivery / takeaway)
- Dimension gating by visit type
- Score calculation engine with all weights
- Business owner self-rating block
- Minimum rating threshold for leaderboard appearance
- Database schema additions (visit_type, dimensional scores, composite_score)

### PHASE 2 — Verification and pattern detection (Sprint 89-92)
- Photo upload in rating flow
- Verification boost computation
- Verified Visit badge display
- Velocity detection (Layer 2 rules V1-V4)
- Dimensional pattern detection (Layer 3 patterns A and C)
- Time-on-page tracking in client
- Score breakdown API endpoint

### PHASE 3 — Transparency and polish (Sprint 93+)
- User-facing weight disclosure on submission confirmation
- Score trend sparkline on restaurant profile
- Tier upgrade nudge in confirmation flow
- Delivery vs dine-in score separation display
- Share mechanic on confirmation screen

### PHASE 4 — Advanced detection (when scale justifies it)
- Account age and history analysis (Layer 4)
- Competitor rating detection (Layer 6)
- Receipt OCR verification
- Business owner response tools

---

**END OF DOCUMENT**

Save this file as: `/docs/architecture/RATING-INTEGRITY-SYSTEM.md`
Reference it in `ARCHITECTURE.md` under the Rating System section.
Every sprint that touches ratings must reference this document.
Do not implement rating-adjacent features without checking against
the principles in Part 11.
