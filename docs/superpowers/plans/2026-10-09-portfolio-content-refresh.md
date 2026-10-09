# Portfolio Content Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the portfolio's hero technology presentation, expertise tags, About copy, and project repository links to match Bradley's requested content.

**Architecture:** Keep presentation data in the existing React page and project data modules. Remove decorative transforms from the hero cards, render technologies as reusable existing-style tag pills, and use the existing project source-link pattern.

**Tech Stack:** React, Tailwind CSS, Vite.

**Spec:** [2026-10-09-contact-crud-and-portfolio-content-design.md](../specs/2026-10-09-contact-crud-and-portfolio-content-design.md)

## Global Constraints

- Preserve the current single-page structure, section ordering, and responsive layout.
- Hero tiles must have no diagonal rotation or intentional horizontal offset.
- Requested technologies are React, Node.js, Express, MongoDB, Tailwind CSS, TypeScript, MySQL, PostgreSQL, Cypress, NoSQL, CI/CD pipeline testing, and Python.
- Use the existing soft rounded outline style for technology chips.
- Project repository links open in a new tab with safe `rel` attributes.
- Preserve all unrelated project copy and the portfolio contact flow.

## Review Focus

- Narrow screens must wrap the expanded technology chip set without overflow.
- All requested technology labels must be present and correctly spelled.
- Quote and author attribution remain visibly paired in the About section.
- Project titles, IDs, tags, summaries, and repository destinations consistently identify the Java decoder and web server projects.
- No external link should open without `noopener noreferrer`.

---

### Task 1: Flatten hero tiles and update technology chips

**Files:**
- Modify: `client/src/App.jsx`

**Interfaces:**
- No API changes. Use the existing `tag` class for outlined technology chips.

- [x] Remove `-rotate-6` from the hero tile group and remove the middle-card `translate-x-5` offset.
- [x] Keep the three cards aligned flat while retaining their icon, title, number, border, and shadow treatment.
- [x] Replace the plain hero technology text row with rounded outlined chips for all twelve technologies in the approved spec.
- [x] Keep chip wrapping responsive and avoid forced horizontal scrolling.

### Task 2: Refresh expertise tags and About copy

**Files:**
- Modify: `client/src/App.jsx`

**Interfaces:**
- No API changes; preserve current section identifiers and navigation anchors.

- [x] Add Bootstrap to area 01 and GraphQL to area 02.
- [x] In area 03 replace `Data parsing` with `PostgreSQL` and `Git` with `MySQL`.
- [x] Replace the About intro with “I'm Bradley, a Full-Stack Developer based in Florida who enjoys creating.”
- [x] Add “What I cannot create, I do not understand.” with attribution to Richard Feynman.
- [x] Replace the two About paragraphs with the user-approved copy in the spec, keeping punctuation readable and meaning unchanged.

### Task 3: Correct project identity and repository destinations

**Files:**
- Modify: `client/src/data/projects.js`
- Modify: `client/src/components/Projects.jsx`

**Interfaces:**
- Consumes: existing project object fields `id`, `title`, `summary`, `description`, `tags`, `githubUrl`, and `preview`.
- Produces: the Web Server and Java Unicode Data Decoder project cards with their correct GitHub destinations.

- [x] Rename the HTML parser project to Java Unicode Data Decoder; update ID, summary, description, tags, image alt text, and placeholder preview to match Java Unicode decoding.
- [x] Set the decoder repository URL to `https://github.com/NavarroSB/Java-Decoder`.
- [x] Set the Web Server repository URL to `https://github.com/NavarroSB/Web_Server`.
- [x] Preserve the existing source-link rendering, external target behavior, and safe `rel` attributes.

## Completion

- Review the rendered copy and project card data against the approved spec.
- Confirm all requested skills and both repository URLs are represented exactly.
