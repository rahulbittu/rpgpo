# Subtask Output — Identify API Endpoints
## Model: gpt-4o
## Stage: audit
## Date: 2026-03-13

To list all API endpoints in the TopRanker application that handle database interactions, you need to conduct a thorough review of the backend codebase, focusing on the Express.js REST API. Follow these steps:

1. **Access the Codebase**: Ensure you have access to the source code repository where the backend services are maintained.

2. **Identify the API Layer**: Locate the directory or files where the Express.js server and routes are defined. These are typically organized in a folder named `routes`, `controllers`, or similar.

3. **Review Route Definitions**: Examine the route definitions to identify endpoints that interact with the database. Look for HTTP methods (GET, POST, PUT, DELETE) and their corresponding paths.

4. **Check Database Interaction**: For each endpoint, trace the logic to determine if it involves database operations. This can be done by identifying calls to the Drizzle ORM or any direct SQL queries.

5. **Document the Endpoints**: Create a list of endpoints with details such as:
   - HTTP Method (e.g., GET, POST)
   - Endpoint Path (e.g., `/api/v1/rankings`)
   - Description of the operation (e.g., "Fetches current rankings")
   - Database tables involved (e.g., `rankings`, `users`)

6. **Verify with ORM Models**: Cross-reference with ORM models to ensure all database interactions are captured.

7. **Consult Documentation**: If available, review any existing API documentation or comments within the code for additional context.

8. **Collaborate with Developers**: If necessary, consult with the development team for insights on less obvious database interactions or newly added endpoints.

By following these steps, you will compile a comprehensive list of API endpoints in the TopRanker application that handle database interactions.
