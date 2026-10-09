# Contact Admin CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add authenticated CRUD endpoints for MongoDB contact records while preserving the public contact form endpoint.

**Architecture:** Keep visitor submissions on `POST /api/contact`. Add a separate `/api/admin/contacts` router guarded by an environment-backed Bearer token, with controller operations against the existing Contact model. Validate payloads, IDs, and pagination; do not expose admin capabilities in the browser client.

**Tech Stack:** Express 5, Mongoose, Zod, Node.js crypto.

**Spec:** [2026-10-09-contact-crud-and-portfolio-content-design.md](../specs/2026-10-09-contact-crud-and-portfolio-content-design.md)

## Global Constraints

- Management endpoints operate only on Contact records.
- `CONTACT_ADMIN_TOKEN` is private server configuration and is never sent to or bundled with the frontend.
- The public contact route retains its current form validation, persistence, and email-notification behavior.
- Only `name`, `email`, `subject`, and `message` may be changed by an admin CRUD request.
- The server controls `notificationStatus` and timestamps; management creation or editing does not send email.
- List pagination defaults to page 1 and 25 records; pages are capped at 1,000,000 and limits at 100.
- Existing single-Web-Service Render deployment remains supported.

## Review Focus

- Missing or malformed Bearer token must not reach MongoDB queries.
- Missing `CONTACT_ADMIN_TOKEN` must fail closed without disabling public contact submission.
- Malformed ObjectIds and nonexistent IDs must return stable client errors rather than Mongoose cast errors.
- Update payloads must not override notification status or timestamps, and must reject empty/invalid data.
- Pagination must be bounded and deterministic, newest records first.

---

### Task 1: Add token configuration and admin authentication

**Files:**
- Modify: `server/src/config/env.js`
- Modify: `server/.env.example`
- Create: `server/src/middleware/adminAuth.js`

**Interfaces:**
- Produces: `adminAuth(config)` Express middleware. Reads `Authorization: Bearer <token>`, compares SHA-256 digests with `timingSafeEqual`, rejects absent configuration with 503, and rejects invalid credentials with 401.
- Produces: optional `contactAdminToken` value in parsed server config; empty/unset disables admin management routes while leaving the app able to start.

- [x] Add `CONTACT_ADMIN_TOKEN=` to the server env example and make it optional in environment parsing.
- [x] Implement reusable Bearer-token middleware using fixed-length digest comparison; do not log the submitted token.
- [x] Confirm configuration output contains the admin token only on the server-side config object.

### Task 2: Implement contact management controller and router

**Files:**
- Create: `server/src/controllers/contactAdminController.js`
- Create: `server/src/routes/contactAdminRoutes.js`
- Read: `server/src/models/Contact.js`
- Read: `server/src/validation/contactValidation.js`

**Interfaces:**
- Produces: `createContactAdminController({ ContactModel })`, with handlers for `create`, `list`, `read`, `update`, and `remove`.
- Produces: `createContactAdminRoutes({ adminAuth, controller })` exposing `POST /`, `GET /`, `GET /:id`, `PATCH /:id`, and `DELETE /:id`.

- [x] Define request validation for create and partial update using the existing field rules; whitelist `name`, `email`, `subject`, and `message` only.
- [x] Implement create using the Contact model defaults; do not send email from this management action.
- [x] Implement newest-first list with bounded `page` and `limit` query parameters and return pagination metadata.
- [x] Implement single-record read, partial update with Mongoose validators enabled, and delete; validate ObjectIds before database calls.
- [x] Return JSON DTOs with contact fields, status, and timestamps; avoid returning raw Mongoose objects or internal fields.
- [x] Use consistent 400/401/404/503 response messages and forward unexpected database errors to existing error middleware.

### Task 3: Mount protected routes and document API usage

**Files:**
- Modify: `server/src/app.js`
- Modify: `server/src/server.js`
- Modify: `README.md`

**Interfaces:**
- Consumes: `adminAuth(config)` and `createContactAdminRoutes(...)` from Tasks 1–2.
- Produces: admin routes mounted at `/api/admin/contacts`; existing health, public contact, and static frontend routes remain in place.

- [x] Construct the admin controller/router in the server application factory with the existing Contact model.
- [x] Mount the router under `/api/admin/contacts` behind the authentication middleware.
- [x] Document adding `CONTACT_ADMIN_TOKEN` to Render and provide example `curl` requests for list, create, read, update, and delete without embedding a real token.
- [x] Ensure unknown `/api` routes still return JSON 404 responses.

## Completion

- Confirm by code inspection that every route in `/api/admin/contacts` is behind authentication and no frontend bundle references `CONTACT_ADMIN_TOKEN`.
- Keep MongoDB access through the existing configured Atlas connection and do not run destructive requests against the production database during development.
