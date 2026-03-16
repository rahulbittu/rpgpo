# Subtask Output — Research REST API Best Practices
## Model: sonar
## Stage: report
## Date: 2026-03-16

## REST API Error Handling Best Practices
Use consistent error response structures with machine-readable codes, human-readable messages, request IDs, and optional field-level details. Return appropriate HTTP status codes (e.g., 400 for bad requests).[1]

**Real Example (Python Flask):**
```python
def error_response(code, message, details=None, status=400):
    body = {
        "error": {
            "code": code,
            "message": message,
            "request_id": generate_request_id(),
        }
    }
    if details:
        body["error"]["details"] = details
    return jsonify(body), status
```
Apply in routes for validation failures, like invalid sort parameters:
```python
@app.route("/api/v1/orders", methods=["GET"])
def list_orders():
    sort_field = request.args.get("sort", "created_at")
    if sort_field.startswith("-"):
        sort_direction = "DESC"
        sort_field = sort_field[1:]
    else:
        sort_direction = "ASC"
    allowed_sorts = {"created_at", "updated_at", "total", "status"}
    if sort_field not in allowed_sorts:
        return error_response("INVALID_SORT", f"Sort by {sort_field} is not allowed")
    # ... query and return data
```
**Source:** https://oneuptime.com/blog/post/2026-02-20-api-design-rest-best-practices/view[1]

## Response Formats Best Practices
Standardize responses with a consistent envelope (e.g., {"data": [...]}) for lists, using nouns for resources, proper HTTP methods (GET for lists, POST for creates), and standard status codes (200 OK, 201 Created). Implement pagination with query params like ?page=1&limit=20, sorting (?sort=-created_at for DESC), and filtering (?status=pending).[1]

Whitelist allowed fields to prevent injection attacks in queries.[1]
**Source:** https://oneuptime.com/blog/post/2026-02-20-api-design-rest-best-practices/view[1]

## API Versioning Best Practices
Use calendar-based versioning via headers (e.g., X-GitHub-Api-Version: 2026-03-10). Support old versions for 24+ months post-release; non-breaking changes apply across versions, breaking changes only in new ones. GitHub's 2026-03-10 version introduced breaking changes with upgrade docs.[2][4]

**Next Steps:** Review breaking changes docs before updating header; test via version picker in docs.
**Source:** https://github.blog/changelog/2026-03-12-rest-api-version-2026-03-10-is-now-available/[2]; https://docs.github.com/en/rest/about-the-rest-api/about-the-rest-api?apiVersion=2026-03-10[4]

## Retry Logic Best Practices
No specific current (post-2026-02-16) examples found in results for client-side retry logic. General inference: Pair with idempotent endpoints (using POST with client-generated IDs) and exponential backoff (e.g., 1s, 2s, 4s delays) on 5xx errors, per standard patterns not detailed here.[1] (Disclaimer: Not from live search results.)

## Client SDK Patterns
No direct SDK generation patterns in results. For testing/integration: Use libraries like REST Assured (Java) for fluent API tests with JSON/XML parsing, mock servers, JUnit integration—embed tests in app codebase for versioning. Supports realistic data-driven tests.[3]

**Example Use:** Write readable scripts like `given().queryParam("status", "pending").get("/orders").then().statusCode(200);`
**Best for:** Java teams building type-safe client tests.
**Source:** https://www.stackhawk.com/blog/top-api-testing-tools/[3]

**Actionable Next Steps:**
- Implement error_response helper in your API today (5-min copy-paste).[1]
- Add sorting/filtering with whitelists to one endpoint.[1]
- Migrate to GitHub API v2026-03-10 if using it: Update header, check breaking changes (10-15 min).[2]
- Integrate REST Assured for client tests if Java-based (npm install alternative: use Postman for quick validation).[3]
