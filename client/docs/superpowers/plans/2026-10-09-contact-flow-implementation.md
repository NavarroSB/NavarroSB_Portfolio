# Portfolio Contact Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a tested React-to-Express contact flow that stores inquiries in MongoDB Atlas, sends best-effort Resend notifications, and adds the approved portfolio social and resume links.

**Architecture:** The React/Vite client posts to a separately deployed Express service. The service validates and rate-limits input, persists each accepted message before attempting a notification, and exposes a minimal health endpoint for Render. MongoDB and Resend are isolated behind model and service modules so endpoint behavior can be tested with controlled mocks.

**Tech Stack:** React 19, Vite 8, Node.js, Express, MongoDB Atlas, Mongoose, Zod, Resend, Helmet, CORS, express-rate-limit, Vitest, Supertest

**Spec:** `docs/superpowers/specs/2026-10-09-contact-flow-design.md`

## Global Constraints

- Visible form fields are exactly name, email, subject, and message; `website` remains a hidden honeypot.
- Validation limits are name 80, email 254, subject 120, and message 10-5,000 characters.
- Persist accepted messages before attempting notification delivery.
- Never expose or commit MongoDB credentials, Resend credentials, or internal error details.
- Initial email sender is `Portfolio Contact <onboarding@resend.dev>`; changing to a future verified domain is configuration-only.
- Render's generated URL is sufficient for the backend; no custom domain is required.
- Preserve the existing portfolio's responsive layout, colors, accessibility behavior, and reduced-motion support.

## Review Focus

- A malformed or non-JSON API response must still produce a useful frontend error; Task 4 tests this.
- A request with extra properties must fail validation instead of silently persisting unexpected data; Task 1 tests this.
- A filled honeypot must receive a generic success response without persistence or email; Task 2 tests this.
- A Resend failure after successful persistence must mark the record failed and still acknowledge receipt; Task 2 tests this.
- A request from an origin outside `CLIENT_ORIGINS` must be rejected while health checks remain available; Task 3 tests this.

---

## File Map

- `server/package.json`: server scripts and runtime/test dependencies.
- `server/.env.example`: safe environment-variable contract.
- `server/src/config/db.js`: MongoDB connection helper.
- `server/src/config/env.js`: parse and validate server configuration.
- `server/src/models/Contact.js`: persisted contact schema.
- `server/src/validation/contactValidation.js`: strict Zod payload schema.
- `server/src/services/emailService.js`: Resend notification and HTML escaping.
- `server/src/controllers/contactController.js`: persistence-first request workflow.
- `server/src/routes/contactRoutes.js`: contact route composition.
- `server/src/middleware/errorHandler.js`: visitor-safe errors.
- `server/src/app.js`: Express application factory and middleware.
- `server/src/server.js`: startup, database connection, and graceful shutdown.
- `server/tests/*.test.js`: unit and HTTP behavior tests.
- `client/src/lib/api.js`: robust contact API client.
- `client/src/components/ContactForm.jsx`: portfolio-styled form and status UI.
- `client/src/App.jsx`: mount contact form and add external/download links.
- `client/src/data/projects.js`: central profile URLs and email.
- `client/public/resume/Bradley-Navarro-Resume.pdf`: public resume asset.
- `client/.env.example`: frontend API URL contract.
- `README.md`: local setup and Render/Atlas deployment instructions.

### Task 1: Server Foundation, Configuration, Validation, and Model

**Files:**
- Create: `server/package.json`
- Create: `server/.gitignore`
- Create: `server/.env.example`
- Create: `server/src/config/env.js`
- Create: `server/src/config/db.js`
- Create: `server/src/models/Contact.js`
- Create: `server/src/validation/contactValidation.js`
- Create: `server/tests/contactValidation.test.js`

**Interfaces:**
- Produces: `parseEnvironment(source)`, `connectDatabase(uri)`, Mongoose `Contact`, and `contactSchema.safeParse(payload)`.
- Consumes: no application interfaces.

- [ ] **Step 1: Create server package metadata and install dependencies**

Define `dev`, `start`, and `test` scripts; install Express, Mongoose, CORS, dotenv, Helmet, express-rate-limit, Zod, Resend, and escape-html, plus Vitest and Supertest as development dependencies.

- [ ] **Step 2: Write failing validation tests**

Test the exact valid payload, all four field boundaries, invalid email, non-empty honeypot handling metadata, and rejection of unknown properties.

- [ ] **Step 3: Run the validation test and verify failure**

Run: `npm test --prefix server -- contactValidation.test.js`

Expected: FAIL because `contactValidation.js` does not exist.

- [ ] **Step 4: Implement `contactSchema` and environment parsing**

Use a strict Zod object with trimmed strings and the exact limits. Implement `parseEnvironment(source)` to return normalized `port`, `nodeEnv`, `mongodbUri`, `clientOrigins`, `resendApiKey`, `contactToEmail`, and `emailFrom`, defaulting `EMAIL_FROM` to `Portfolio Contact <onboarding@resend.dev>`.

- [ ] **Step 5: Implement MongoDB connection and Contact model**

`connectDatabase(uri)` calls Mongoose once. The `Contact` schema contains the four visitor fields, `notificationStatus` with `pending|sent|failed`, and timestamps.

- [ ] **Step 6: Run tests**

Run: `npm test --prefix server -- contactValidation.test.js`

Expected: PASS.

- [ ] **Step 7: Commit the server foundation**

Commit message: `feat: add contact server foundation`

### Task 2: Persistence-First Contact Workflow and Email Notification

**Files:**
- Create: `server/src/services/emailService.js`
- Create: `server/src/controllers/contactController.js`
- Create: `server/tests/contactController.test.js`
- Modify: `server/src/models/Contact.js`

**Interfaces:**
- Consumes: `contactSchema`, `Contact`, and normalized email configuration from Task 1.
- Produces: `createEmailService(config)` with `sendContactNotification(contact)`, and `createContactController({ ContactModel, emailService, logger })` returning an Express handler.

- [ ] **Step 1: Write failing controller and email-service tests**

Test successful save/send/status update, database failure, email failure after save, HTML escaping, visitor email as `replyTo`, and a populated honeypot returning generic success without calling dependencies.

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm test --prefix server -- contactController.test.js`

Expected: FAIL because the controller and service do not exist.

- [ ] **Step 3: Implement the email service**

Create a Resend client from injected configuration, escape every visitor-controlled HTML value, send to `CONTACT_TO_EMAIL`, use `EMAIL_FROM` as sender, and use the visitor email as `replyTo`.

- [ ] **Step 4: Implement the contact controller**

Validate input, silently acknowledge honeypot submissions, create a `pending` record, attempt email, set `sent` or `failed`, and return HTTP 201 after persistence. Forward database/validation-independent internal errors to Express error handling.

- [ ] **Step 5: Run the tests**

Run: `npm test --prefix server -- contactController.test.js`

Expected: PASS.

- [ ] **Step 6: Commit the workflow**

Commit message: `feat: persist and notify contact submissions`

### Task 3: Express API, Security Middleware, and Render Startup

**Files:**
- Create: `server/src/routes/contactRoutes.js`
- Create: `server/src/middleware/errorHandler.js`
- Create: `server/src/app.js`
- Create: `server/src/server.js`
- Create: `server/tests/app.test.js`

**Interfaces:**
- Consumes: controller factory, email service, environment parser, and database connector from Tasks 1-2.
- Produces: `createApp({ config, contactHandler, contactLimiter })` and executable `server.js`.

- [ ] **Step 1: Write failing HTTP tests**

Use Supertest to assert health JSON, POST route wiring, 16 KB body limit, rejected disallowed origin, accepted allowlisted origin, 404 JSON, safe 500 JSON, and HTTP 429 when the injected limiter threshold is crossed.

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm test --prefix server -- app.test.js`

Expected: FAIL because the app factory does not exist.

- [ ] **Step 3: Implement routes, middleware, and application factory**

Apply Helmet, explicit CORS, `express.json({ limit: '16kb' })`, proxy trust for one Render proxy hop, health and contact routes, JSON 404 handling, and a generic error handler.

- [ ] **Step 4: Implement process startup and shutdown**

Load `.env`, validate configuration, connect MongoDB before listening, honor Render's `PORT`, and close HTTP/Mongoose resources on `SIGTERM` and `SIGINT`.

- [ ] **Step 5: Run all server tests**

Run: `npm test --prefix server`

Expected: PASS.

- [ ] **Step 6: Commit the HTTP service**

Commit message: `feat: expose secure contact API`

### Task 4: Frontend Contact Experience

**Files:**
- Create: `client/.env.example`
- Create: `client/src/lib/api.test.js`
- Modify: `client/src/lib/api.js`
- Modify: `client/src/components/ContactForm.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- Consumes: `POST /api/contact` contract from Task 3.
- Produces: `submitContactForm(payload)` and the mounted accessible contact form.

- [ ] **Step 1: Add the client test runner and write failing API-helper tests**

Test successful JSON, server JSON error, non-JSON error response, and network failure. Add the minimal Vitest configuration through the existing Vite setup.

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test --prefix client -- api.test.js`

Expected: FAIL for non-JSON and network cases.

- [ ] **Step 3: Harden `submitContactForm(payload)`**

Normalize the base URL, safely inspect response content type, preserve server messages, and return a stable fallback error for malformed/network responses.

- [ ] **Step 4: Restyle and mount the contact form**

Match the existing mint/dark design, keep exactly four visible fields plus honeypot, disable while submitting, use `aria-live` feedback, and replace the current mailto-only contact section in `App.jsx`.

- [ ] **Step 5: Run frontend tests, lint, and build**

Run: `npm test --prefix client`

Run: `npm run lint --prefix client`

Run: `npm run build --prefix client`

Expected: all pass.

- [ ] **Step 6: Commit the contact UI**

Commit message: `feat: connect portfolio contact form`

### Task 5: Resume, Social Links, and Profile Configuration

**Files:**
- Create: `client/public/resume/Bradley-Navarro-Resume.pdf`
- Modify: `client/src/data/projects.js`
- Modify: `client/src/App.jsx`
- Modify: `client/PORTFOLIO_GUIDE.md`

**Interfaces:**
- Consumes: supplied PDF and approved public URLs.
- Produces: centralized `profile` values for email, GitHub, LinkedIn, and resume path.

- [ ] **Step 1: Add profile constants and links**

Set GitHub to `https://github.com/NavarroSB`, LinkedIn to `https://www.linkedin.com/in/navarrosb/`, and resume path to `/resume/Bradley-Navarro-Resume.pdf`; render external links safely and add a download link.

- [ ] **Step 2: Copy and verify the resume asset**

Copy the supplied PDF from `C:/Users/bradl/OneDrive/Documents/Work things/Bradley Resume 2026.pdf`, verify the destination exists and is non-empty, and confirm Vite includes it in `dist/resume/`.

- [ ] **Step 3: Update portfolio guidance**

Document how to replace the public resume and update profile URLs without editing components.

- [ ] **Step 4: Run frontend lint and build**

Run: `npm run lint --prefix client`

Run: `npm run build --prefix client`

Expected: PASS, with the resume present in the build output.

- [ ] **Step 5: Commit portfolio links and resume**

Commit message: `feat: add portfolio links and resume`

### Task 6: Deployment Guide and Full Verification

**Files:**
- Create: `README.md`
- Modify: `server/.env.example`
- Modify: `client/.env.example`

**Interfaces:**
- Consumes: all earlier tasks.
- Produces: exact local, Atlas, Render, Resend, and frontend deployment instructions.

- [ ] **Step 1: Write setup and deployment documentation**

Include the exact MongoDB URI form with `/portfolio` before the query string, URL-encoding guidance for passwords, local `.env` locations, Render root directory/build/start/health settings, environment variables, CORS setup, and the `onboarding@resend.dev` bootstrap sender.

- [ ] **Step 2: Run the complete automated verification**

Run: `npm test --prefix server`

Run: `npm test --prefix client`

Run: `npm run lint --prefix client`

Run: `npm run build --prefix client`

Expected: all commands pass.

- [ ] **Step 3: Run local smoke checks**

With local environment variables, verify `/api/health`, one valid contact submission, one invalid submission, MongoDB persistence, notification status, and the built resume path. If live credentials are not yet available, record those checks as pending deployment verification instead of inserting placeholders.

- [ ] **Step 4: Review repository secrets and status**

Confirm no `.env` file or credential is tracked, inspect `git diff --check`, and preserve unrelated existing changes.

- [ ] **Step 5: Commit deployment documentation**

Commit message: `docs: add portfolio deployment guide`

