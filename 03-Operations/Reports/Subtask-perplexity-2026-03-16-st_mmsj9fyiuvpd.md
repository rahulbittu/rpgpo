# Subtask Output — Research API Documentation Best Practices
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Formatting Code Examples

Provide code samples for each endpoint in multiple languages (e.g., Java, JavaScript) to enable copy-paste usage and demonstrate API potential.[1] Place code prominently, such as front-and-center with navigation aids like side contents and search bars, as in Google Maps API docs.[3] Use side-by-side code with non-scrolling text for parallel viewing, like Plaid's approach where code stays visible during explanations.[3]

- **Line length**: Limit to 132 characters max (180 not recommended) for readability; exception for language string files.[2]
- **Indentation**: Use 4 spaces; avoid indenting inside `script` or `address` blocks.[6]
- **Examples**:
  ```
  if (($userenrol->timestart && $userenrol->timestart < $limit) ||
     (!$userenrol->timestart && $userenrol->timecreated < $limit)) {
    return false;
  }
  ```[2] (Preferred: readable multi-line conditions)
  ```
  $iscourseorcategoryitem = ($element['object']->is_course_item() || $element['object']->is_category_item());
  $usesscaleorvalue = in_array($element['object']->gradetype, [GRADE_TYPE_SCALE, GRADE_TYPE_VALUE]);
  ```[2] (Break complex conditions into variables)

Inline code for functions like `WP_Query` or commands like `dig`, preserving case.[4]

**Next step**: Audit your API docs; add curl + 2 language samples per endpoint using tools like Swagger UI for interactive previews.

## Writing Error Messages

Include error handling examples in every reference section, showing common responses alongside successful calls.[1] Document authentication, authorization limits, and restrictions explicitly with code snippets.[3]

- Cover typical errors in use-case sections (e.g., invalid params, rate limits).[1]
- Use troubleshooting sections in guides with numbered steps and visuals.[4]
- **Twilio example**: Blends reference errors with tutorials, e.g., formatting HTTP 4xx/5xx responses with JSON bodies like `{"code": 40001, "message": "Invalid parameter"}`.[5]

**Next step**: List top 5 errors from your API logs; add JSON examples with HTTP status codes to each endpoint doc.

## Documenting Changelogs

No direct examples found in results for changelog-specific formatting. General best practice: Integrate into interactive sections with clear language and examples for changes impacting calls/responses.[1][3]

**Next step**: Use tools like Changeset or GitHub Releases; structure as `## [Version] - [Date]` with `### Added`, `### Changed`, `### Deprecated` bullets, tested via search queries: "API changelog best practices 2026", "REST API versioning changelog examples".

**Sources**:
- [1] https://document360.com/blog/api-documentation/
- [2] https://moodledev.io/general/development/policies/codingstyle
- [3] https://www.archbee.com/blog/api-documentation-examples
- [4] https://developer.woocommerce.com/docs/contribution/contributing-docs/style-guide/
- [5] https://technicalwriterhq.com/documentation/documentation-formatting-examples/
- [6] https://aptos.dev/build/smart-contracts/book/coding-conventions
