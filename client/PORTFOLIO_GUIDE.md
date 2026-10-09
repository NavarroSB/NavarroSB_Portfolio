# Personalizing your portfolio

Run `npm run dev` from `client/`. Production check: `npm run build`. Code check: `npm run lint`.

## Add screenshots

1. Place a screenshot in [public/projects](./public/projects/), ideally a 1600 × 1000 WebP, JPG, or PNG.
2. Open [src/data/projects.js](./src/data/projects.js).
3. Set the project's `image` to `/projects/your-filename.webp` and write an accurate `imageAlt`.

The card and modal use the same screenshot. Images crop to a 16:10 frame. Empty or broken image paths show the styled placeholder instead.

## Add another project card and modal

Copy one object in the `projects` array in [src/data/projects.js](./src/data/projects.js) and give it a unique `id`:

```js
{
  id: 'my-next-project',
  title: 'My Next Project',
  category: 'Web application',
  status: 'In progress',
  summary: 'A short description of the problem this project solves.',
  description: 'Explain the problem, your implementation, and what you learned.',
  tags: ['React', 'Node.js'],
  image: '/projects/my-next-project.webp',
  imageAlt: 'Describe the actual screenshot here',
  preview: 'parser', // Placeholder artwork: 'parser' or 'server'; ignored when image is set.
  githubUrl: '', // Add the full https:// repository URL when ready.
  liveUrl: '', // Add the full https:// deployed URL when ready.
},
```

Cards automatically arrange into two columns on desktop and one on mobile. Each entry gets its own details in the shared accessible modal. No component changes are needed. The modal closes with its close button, Escape, or the backdrop; the browser contains keyboard focus while it is open.

## Enable contact

Set `profile.email` in [src/data/projects.js](./src/data/projects.js) to your public email address. The contact button then opens the visitor's email application. An empty address displays an honest coming-soon state.

The Express/MongoDB/Resend contact form from the MVP blueprint is a separate, unfinished milestone. This landing page does not save or send form submissions.

## Update branding and copy

- Page sections and copy: [src/App.jsx](./src/App.jsx).
- Colors, shared Tailwind styles, reduced-motion support: [src/index.css](./src/index.css).
- Project cards and modal: [src/components/Projects.jsx](./src/components/Projects.jsx).
- Browser title and description: [index.html](./index.html).

Before publishing, add screenshots, accurate technical descriptions, repository/demo links, and a public contact address. Current project descriptions deliberately avoid claiming unverified implementation details.
