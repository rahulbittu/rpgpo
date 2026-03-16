# Subtask Output — Research OpenAPI 3.0 Documentation Standards
## Model: sonar
## Stage: report
## Date: 2026-03-16

## OpenAPI 3.0 Key Sections
OpenAPI 3.0 specifications require core sections like `openapi`, `info`, `paths`, `components`, and optional `servers`, `security`, `tags`. The `openapi` field must be set to `"3.0.0"`, `info` includes `title` and `version`, `paths` defines operations, and `components` holds reusable schemas.[4]

- **openapi**: `"3.0.0"` or `"3.0.3"` for compatibility.[3][4]
- **info**: Object with `title` (e.g., "User Service"), `version` (e.g., "1.0.0").[4]
- **paths**: Maps endpoints to methods like GET/POST, each with `summary`, `operationId`, `parameters`, `requestBody`, `responses`.[1][2][4]
- **components**: Reusable `schemas` (e.g., Pet with `id`, `name`), `responses`, `parameters`; reference via `$ref` (e.g., `#/components/schemas/Pet`).[2]
- **tags**: Group operations (e.g., "Books"); apply via `@Operation` annotations or `tags` array.[1][3]

## Best Practices
- **Use operationId**: Unique string per operation (e.g., `listInvoices`, `createInvoice`) for SDK generation.[2]
- **Define schemas with enums and examples**: Use `enum` for status (e.g., `["draft", "sent", "paid"]`), `example` on fields for mock data, `required` arrays.[2]
- **Reusable components**: Define schemas once in `components/schemas` (e.g., Error with `code`, `message`), reference everywhere to stay DRY.[2]
- **Responses with codes**: Include `@ApiResponses` for 200, 201, 400, 404; specify `content` with `mediaType: "application/json"` and schema refs.[1]
- **RequestBody details**: Add `description`, `required: true`, `content` with schema and `examples` (e.g., `{"title": "New Book", "author": "Author Name"}`).[1]
- **Tags and summaries**: Annotate controllers/methods with `@Operation(summary="Create a new book")` and `tags`.[1][3]
- **Pagination**: Use cursor-based (e.g., `PaginationMeta` schema) over page numbers for dynamic data.[2]
- **Nullable (3.0 limit)**: Use `nullable: true`; upgrade to 3.1 for `type: ["string", "null"]` if possible.[2][5]

## Real Examples
### Pet Schema (components/schemas)
```
components:
  schemas:
    Pet:
      type: object
      required: [id, name]
      properties:
        id: {type: integer, format: int64}
        name: {type: string}
        tag: {type: string}
```
References: `Pets: {type: array, items: {$ref: "#/components/schemas/Pet"}}`.[2]

### Spring Boot Endpoint Annotation
```
@Operation(summary = "Create a new book")
@ApiResponses({
  @ApiResponse(responseCode = "201", description = "Book created",
    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Book.class))),
  @ApiResponse(responseCode = "400", description = "Invalid input")
})
@PostMapping("/")
public Book createBook(@RequestBody(description = "Book to create", required = true,
  content = @Content(mediaType = "application/json",
    schema = @Schema(implementation = Book.class),
    examples = @ExampleObject(value = "{\"title\": \"New Book\", \"author\": \"Author Name\"}")))
  Book book) { return repository.save(book); }
```
Generates detailed docs with examples and validation.[1]

### Istio ConfigMap for User Service
```
{
  "openapi": "3.0.0",
  "info": {"title": "User Service", "version": "1.0.0"},
  "paths": {
    "/users": {
      "get": {
        "summary": "List all users",
        "responses": {"200": {"description": "A list of users"}}
      }
    }
  }
}
```
Serve via VirtualService at `/specs/` with caching headers.[4]

## Concrete Next Steps
1. Validate spec: Use online tools like Swagger Editor with your YAML/JSON.
2. Generate docs: Add SpringDoc (`springdoc-openapi-starter-webmvc-ui`) for `/v3/api-docs` endpoint.[1]
3. Test examples: Paste Pet schema into Swagger UI; confirm mock data renders.
4. Migrate if needed: Check OpenAPI Generator for 3.0 support (e.g., Spring: supports DateTime, enums; lacks cookies).[5]
5. Deploy: Expose JSON/YAML at `/openapi.json` like Fiber example (`http://localhost:3000/openapi-3.0.json`).[3]
