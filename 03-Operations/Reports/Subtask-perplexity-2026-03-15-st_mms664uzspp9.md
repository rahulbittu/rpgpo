# Subtask Output — Research Node.js REST API Security Best Practices
## Model: sonar
## Stage: report
## Date: 2026-03-15

## Finding 1: Helmet Middleware for Secure HTTP Headers
Use **Helmet** package to set security headers preventing XSS, clickjacking, and MIME sniffing. Configure headers like:
- **Strict-Transport-Security** (HSTS) to enforce HTTPS.
- **X-Content-Type-Options: nosniff** to block MIME type changes.
- **Content-Security-Policy** (CSP) to mitigate XSS and data injection.
- **Access-Control-Allow-Origin**, **Server**, **Referrer-Policy** for origin control and info leakage prevention.
**Next step**: Install via `npm i helmet`, then `app.use(helmet());` in Express app.[1]

Source: https://www.tatvasoft.com/blog/node-js-best-practices/

## Finding 2: Input Validation with Joi or AJV
Validate request bodies/parameters using **Joi** (open-source) or **AJV** (JSON Schema validator) to reject malicious input before logic execution. Example AJV schema for user object:
```
const userSchema = {
  type: 'object',
  required: ['id', 'name', 'email', 'role'],
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    role: { type: 'string', enum: ['developer', 'lead', 'admin'] }
  }
};
```
Test returns 400 for invalid/missing fields, 409 for duplicates; sanitizes against injection.[1][2]

Source: https://www.tatvasoft.com/blog/node-js-best-practices/
Source: https://qodex.ai/blog/rest-api-testing-guide

## Finding 3: Rate Limiting to Prevent DoS Attacks
Implement **express-rate-limit** middleware: 100 max requests per IP every 15 minutes (windowMs: 15*60*1000). For scale, use **rate-limiter-flexible**, Nginx, or cloud firewalls/load balancers. Custom response: `{ status: 'fail', message: 'Too many requests' }`. Test: legit users get service, attacks trigger 429.[1][4]

Source: https://www.tatvasoft.com/blog/node-js-best-practices/
Source: https://oneuptime.com/blog/post/2026-02-20-nodejs-express-production/view

## Finding 4: Secure API Key Storage and Management
Store keys in **environment variables** or secrets managers (e.g., AWS KMS); never hardcode or commit to repo. Encrypt at rest (AES) and transit (HTTPS/TLS, RSA). Rotate keys regularly, use separate keys per env (dev/staging/prod), IP whitelisting, short expiration (e.g., AWS STS 15 minutes). Monitor spikes via SIEM; tools like **Blackbox** or **Git Crypt** for small projects.[3]

Source: https://www.reform.app/blog/best-practices-storing-api-keys-securely

## Finding 5: Authentication/Authorization Testing Standards
Test: 401 for no/expired token, 403 for insufficient perms, 200 for valid. Use env vars for tokens (no hardcoding). Isolate test data (create/cleanup per test). Covers SQL injection, broken auth, rate limits, CORS in security checklist.[2]

Source: https://qodex.ai/blog/rest-api-testing-guide

## Production Checklist from Feb 20, 2026 Guide
- Error handling, validation, **security middleware** (Helmet, rate-limit), structured logging, graceful shutdown.
- Author: Nawaz Dhandala, OneUptime (open-source editable post).[4]

Source: https://oneuptime.com/blog/post/2026-02-20-nodejs-express-production/view

No additional 2026-specific standards found beyond these; results emphasize middleware integration over new protocols. For full API Security Guide 2026 (PDF), covers JWT, auth (limited access).[6]

Source: https://siit.co/blog/how-to-develop-secure-node-js-applications-in-2026/51857 (contextual)
Source: https://www.scribd.com/document/1003515899/API-Security-Guide-2026-Best-Practices
