# Portfolio Contact Flow Design

**Date:** October 9, 2026  
**Status:** Proposed for implementation  
**Scope:** Production-ready MVP contact flow plus the already-approved portfolio links and resume download

## Goal

Allow a portfolio visitor to submit their name, email address, subject, and message. The application must validate the submission, reject obvious automated abuse, save legitimate messages in MongoDB Atlas, and send Bradley a notification email without exposing database or email credentials to the browser.

The finished experience also includes Bradley's GitHub and LinkedIn links and a downloadable PDF resume.

## Architecture

The existing React/Vite application remains in `client/`. A new Node.js/Express application will live in `server/` and will be deployed to Render. MongoDB Atlas will store contact messages. Resend will send notification emails to Bradley's Proton inbox.

```text
Visitor
  -> React contact form
  -> POST /api/contact on Render
  -> validation, honeypot check, and rate limiting
  -> MongoDB Atlas contact record
  -> Resend notification email
  -> success or actionable error shown in React
```

The frontend receives only the public API base URL through `VITE_API_BASE_URL`. MongoDB and Resend credentials remain server-side environment variables.

## Frontend

The existing contact section in `client/src/App.jsx` will be replaced by the existing `ContactForm` component, restyled to match the current portfolio. The visible fields are:

- Name
- Email
- Subject
- Message

The hidden `website` honeypot field remains part of the request. The form will prevent duplicate submissions while a request is pending and provide accessible success and error feedback. A successful submission clears the form.

The frontend API helper will tolerate non-JSON server responses and network failures so visitors always receive a useful message.

The header or footer will include external links to:

- `https://github.com/NavarroSB`
- `https://www.linkedin.com/in/navarrosb/`

The supplied resume will be copied to `client/public/resume/Bradley-Navarro-Resume.pdf` and exposed through a download link. The PDF is intentionally public because it is a portfolio download.

## Backend API

### `GET /api/health`

Returns a small JSON response confirming the service is running. It does not expose secrets or detailed infrastructure information.

### `POST /api/contact`

Accepts JSON with:

```json
{
  "name": "Visitor Name",
  "email": "visitor@example.com",
  "subject": "Project inquiry",
  "message": "Message text",
  "website": ""
}
```

Validation rules:

- `name`: trimmed, required, maximum 80 characters
- `email`: trimmed, required, valid email, maximum 254 characters
- `subject`: trimmed, required, maximum 120 characters
- `message`: trimmed, required, 10 to 5,000 characters
- `website`: must be empty; a populated value is treated as automated spam
- unknown properties are discarded or rejected consistently by the validation schema

Responses use a stable JSON shape with a visitor-safe `message`. Validation failures return HTTP 400, rate-limit failures return HTTP 429, and unexpected failures return HTTP 500. Internal errors and secrets are never returned to the browser.

## Persistence and Email Behavior

Each accepted message is saved before the notification email is attempted. The MongoDB document contains:

- `name`
- `email`
- `subject`
- `message`
- `notificationStatus`: `pending`, `sent`, or `failed`
- timestamps

After insertion, the server asks Resend to send a notification. User-provided content is escaped before being included in HTML email, and the visitor's email is used as `replyTo`, not as the sender address.

If email succeeds, the record is marked `sent`. If email fails after the message is safely stored, the record is marked `failed`, the failure is logged without secrets, and the API still confirms that the message was received. This prevents a temporary email-provider failure from losing a genuine inquiry. Automatic retries and an admin dashboard are deferred beyond the MVP.

## Security and Abuse Controls

- Helmet security headers
- Explicit CORS allowlist from `CLIENT_ORIGINS`
- JSON body-size limit
- Per-IP rate limiting on the contact endpoint
- Honeypot spam field
- Server-side Zod validation
- HTML escaping for notification content
- Generic production error responses
- Environment-only credentials
- A least-privilege MongoDB database user

The application will trust Render's proxy configuration only as required for correct client IP handling and rate limiting.

## Configuration

The repository will include safe `.env.example` files only.

Backend variables:

```text
PORT
NODE_ENV
MONGODB_URI
CLIENT_ORIGINS
RESEND_API_KEY
CONTACT_TO_EMAIL
EMAIL_FROM
```

Frontend variable:

```text
VITE_API_BASE_URL
```

Local secrets remain in ignored `.env` files. Production secrets are entered in Render's environment settings. The deployed frontend URL is added to `CLIENT_ORIGINS`, and the deployed backend URL is added to the frontend's `VITE_API_BASE_URL`.

## Server Structure

```text
server/
  src/
    config/db.js
    controllers/contactController.js
    middleware/errorHandler.js
    models/Contact.js
    routes/contactRoutes.js
    services/emailService.js
    validation/contactValidation.js
    app.js
    server.js
  tests/
  .env.example
  package.json
```

`app.js` constructs the Express application without opening a network port, allowing endpoint tests to import it. `server.js` loads configuration, connects to MongoDB, and starts the process. Database, email, validation, and HTTP concerns remain separated so they can be tested independently.

## Testing and Verification

Implementation will be test-driven. Automated tests will cover:

- valid and invalid payload validation
- honeypot rejection behavior
- successful persistence and email notification
- persistence success with email failure
- visitor-safe error responses
- frontend form submission states where practical

Final verification includes server tests, client lint, client production build, and a local end-to-end submission against a test configuration. Deployment verification will check the health endpoint, allowed CORS origin, successful Atlas persistence, Resend delivery, and the resume download.

## Deployment Responsibilities

Bradley will create the MongoDB Atlas cluster, database user, and Render service, then enter secrets directly into their dashboards. Credentials will not be pasted into source code or chat.

The implementation will provide exact variable names, start commands, and deployment settings. Resend requires an API key and an authorized sender address. Until a custom sender domain is verified, development can use an allowed Resend test sender, but production notification delivery should use a verified domain.

## Deferred Work

The following are explicitly outside this MVP:

- Admin authentication or message dashboard
- Contact-message replies inside the portfolio
- File attachments
- CAPTCHA service
- Automated notification retries or queues
- Analytics
- Supabase integration

