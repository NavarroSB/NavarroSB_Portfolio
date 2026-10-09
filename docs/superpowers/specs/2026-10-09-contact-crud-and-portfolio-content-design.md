# Contact CRUD and Portfolio Content Design

## Goal

Add usable, protected CRUD operations for MongoDB contact records and apply the requested portfolio content and presentation updates. Preserve the public contact form flow, its email notification behavior, and the single Render Web Service deployment.

## Contact API

The existing `POST /api/contact` remains the visitor-facing form endpoint. It continues validating submissions, persisting them to MongoDB, and attempting the email notification.

Add a separate management API under `/api/admin/contacts`. Every route requires an `Authorization: Bearer <CONTACT_ADMIN_TOKEN>` header. The token is stored only in the server environment and is never bundled into the frontend. If no token is configured, management routes fail closed with a service-configuration error. Invalid tokens are rejected without accessing contact data.

Endpoints:

| Method | Path | Behavior |
| --- | --- | --- |
| `POST` | `/api/admin/contacts` | Validate and create a contact record; return the created safe representation. |
| `GET` | `/api/admin/contacts` | List contacts newest first. `page` defaults to 1 and is capped at 1,000,000; `limit` defaults to 25 and is capped at 100. |
| `GET` | `/api/admin/contacts/:id` | Return one contact or a consistent not-found response. |
| `PATCH` | `/api/admin/contacts/:id` | Validate and update editable contact fields. |
| `DELETE` | `/api/admin/contacts/:id` | Delete one contact and return a confirmation response. |

Only `name`, `email`, `subject`, and `message` are client-editable. The server controls timestamps and `notificationStatus`; editing or creating a management record does not trigger email. IDs are validated before MongoDB queries. Token comparison uses a timing-safe comparison. Responses use JSON, do not expose database internals, and errors follow existing API conventions. The API is intended for Postman or another development API client; no CRUD dashboard is added to the public portfolio.

## Portfolio updates

### Hero technology tiles and chips

Remove the diagonal rotation and horizontal offset so the three hero tiles lie flat. Present technologies in softly outlined, rounded chips. Include React, Node.js, Express, MongoDB, Tailwind CSS, TypeScript, MySQL, PostgreSQL, Cypress, NoSQL, CI/CD pipeline testing, and Python.

### Expertise section

- Area 01: add Bootstrap to the existing interface skills.
- Area 02: add GraphQL to the existing backend/API skills.
- Area 03: replace `Data parsing` with `PostgreSQL` and `Git` with `MySQL`.

### Behind the code section

Replace the current introductory sentence with: “I'm Bradley, a Full-Stack Developer based in Florida who enjoys creating.” Add the quote “What I cannot create, I do not understand.” attributed to Richard Feynman.

Replace the first body paragraph with: “My work spans the visible and invisible: from the interface someone interacts with to the server handling their request, and the data operations that tie it all together.”

Replace the second body paragraph with: “I am passionate and curious about every project I take part in—and work to understand them from beginning to end to keep solutions efficient, thoughtful, and enterprise-ready.” Minor punctuation and grammar cleanup is allowed while preserving the user's wording and meaning.

### Project cards

Rename “HTML Data Parser” to “Java Unicode Data Decoder”, update its description and technology tags to reflect Java and Unicode decoding, and set its repository link to `https://github.com/NavarroSB/Java-Decoder`. Set the Web Server project's repository link to `https://github.com/NavarroSB/Web_Server`. Keep links opening in a new tab with safe `rel` attributes, using the existing project link pattern.

## Acceptance criteria

- Public contact submissions continue through the existing route with their current persistence and notification behavior.
- Every management endpoint rejects requests without a valid configured admin token.
- Management CRUD operates only on contact records, validates data and IDs, and keeps server-owned status/timestamp fields protected.
- The portfolio displays the specified skills, expertise tags, About copy, and project titles/links; hero tiles are unrotated.
- The app remains compatible with the combined Render Web Service deployment.

## Out of scope

- A public or browser-based admin UI.
- Public access to MongoDB management operations.
- Changes to the email provider, Atlas schema beyond the existing Contact model, or existing contact form fields.
- Deleting or editing data already stored in Atlas during development.
