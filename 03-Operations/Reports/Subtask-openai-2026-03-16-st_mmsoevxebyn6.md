# Subtask Output — Write Guide on Implementing CSP
## Model: gpt-4o
## Stage: report
## Date: 2026-03-16

# Comprehensive Guide to Implementing Content Security Policies for Web Applications

Implementing a Content Security Policy (CSP) is crucial for enhancing the security of web applications by preventing unauthorized resource loading and protecting against cross-site scripting (XSS) and data injection attacks. This guide provides detailed, actionable steps for developers to implement CSP effectively.

## 1. CSP Header Delivery Methods

### HTTP Response Header (Recommended)

- **What to Do**: Set the `Content-Security-Policy` HTTP header on all responses. This method is preferred as it supports all CSP features and provides robust protection.
- **Why**: Ensures that all resources loaded by the browser adhere to the specified security policy.
- **Expected Outcome**: Enhanced security by preventing unauthorized scripts and resources from executing.
- **First Step**: Configure your web server (e.g., Apache, Nginx) to include the CSP header in all HTTP responses.

Example:
```http
Content-Security-Policy: script-src 'self' https://cdn.example.com/scripts/; object-src 'none'
```

### Meta Tag

- **What to Do**: Use `<meta http-equiv="Content-Security-Policy">` in the HTML document for static single-page applications without server infrastructure.
- **Why**: Provides a simple way to implement CSP for applications that cannot modify server headers.
- **Expected Outcome**: Basic CSP implementation, though with limited feature support.
- **First Step**: Insert the meta tag in the `<head>` section of your HTML file.

Example:
```html
<meta http-equiv="Content-Security-Policy" content="script-src 'self'; object-src 'none'">
```

## 2. Nonce-Based Script Implementation

### Automatic Nonce Generation

- **What to Do**: Generate a unique nonce for each HTTP request.
- **Why**: Allows inline scripts to execute securely by associating them with a nonce.
- **Expected Outcome**: Inline scripts execute only if they include the correct nonce, reducing XSS risks.
- **First Step**: Implement server-side logic to generate and attach a nonce to each request.

### Nonce Injection

- **What to Do**: Inject the nonce into script tags as an attribute.
- **Why**: Ensures that only scripts with the correct nonce can execute.
- **Expected Outcome**: Enhanced security for inline scripts.
- **First Step**: Modify your HTML or template rendering logic to include the nonce attribute in script tags.

Example:
```html
<script nonce="randomlyGeneratedNonce">console.log('Secure script execution');</script>
```

### Strict-Dynamic Directive

- **What to Do**: Use the `strict-dynamic` directive in your CSP.
- **Why**: Allows scripts with valid nonces or from trusted sources to execute, even if they are dynamically loaded.
- **Expected Outcome**: Flexible yet secure script execution policy.
- **First Step**: Add `strict-dynamic` to your CSP header.

Example:
```http
Content-Security-Policy: script-src 'nonce-randomlyGeneratedNonce' 'strict-dynamic'; object-src 'none'
```

## 3. Reporting Endpoints

### Setting Up Reporting

- **What to Do**: Configure a reporting endpoint to collect CSP violation reports.
- **Why**: Helps in monitoring and diagnosing CSP violations to improve policy effectiveness.
- **Expected Outcome**: Insight into potential security threats and misconfigurations.
- **First Step**: Set up a server endpoint to receive reports and update your CSP to include the `report-uri` or `report-to` directive.

Example:
```http
Content-Security-Policy: script-src 'self'; report-uri /csp-report-endpoint
```

### Handling Reports

- **What to Do**: Implement logic to process and analyze incoming CSP reports.
- **Why**: Enables you to take corrective actions based on the reports received.
- **Expected Outcome**: Continuous improvement of CSP policies and application security.
- **First Step**: Develop a backend service to parse and store CSP violation reports for analysis.

## Conclusion

Implementing CSP is a critical step in securing web applications against XSS and other injection attacks. By following the steps outlined in this guide, developers can effectively deploy CSP, utilize nonce-based scripts, and monitor security through reporting endpoints. This proactive approach will significantly enhance the security posture of any web application.

**Word Count**: 656
