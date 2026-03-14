# Runbook: E2E Flow Troubleshooting

## Common Issues
| Step Status | Meaning | Fix |
|-------------|---------|-----|
| pass | Step works end-to-end | No action |
| partial | API works but UI not reflecting | Add UI result refresh |
| fail | Not connected | Wire API call to UI action |

## Per-Workflow
1. Check `GET /api/e2e-flow/:flowId` for last run
2. Find failing steps
3. Verify API endpoint responds: call directly
4. Add UI action button and refresh handler
