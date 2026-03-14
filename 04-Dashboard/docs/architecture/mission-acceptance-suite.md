# Mission Acceptance Suite Architecture

## 150 Seeded Scenarios
10 scenarios per engine covering real-world requests:

Each case stores:
- engine, request, expected_deliverable
- expected_approval, expected_action
- required_tools, failure_if
- status (seeded/passed/failed/not_run)

## Example Cases
- Newsroom: "Get top 10 Hyderabad news" → ranked list with summaries and links
- Shopping: "Best glycolic acid cream" → top 3 with pros/cons and buy path
- Startup: "Add button to TopRanker" → code change with diff and approval
- Legal: "Draft complaint letter from 15 docs" → document with facts and evidence
- Calendar: "Find 3 deep-work slots" → time recommendations with approval

## API
- `GET /api/mission-acceptance` — suite summary
- `GET /api/mission-acceptance/:engineId` — cases for specific engine
