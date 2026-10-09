// Add your public contact address when you are ready to accept inquiries.
export const profile = { email: 'NavarroSB@proton.me' }

// Copy an object to add a project. Each entry creates a card AND a details modal.
// Put screenshots in public/projects/ and use image: '/projects/your-image.webp'.
// Leave image and URLs empty until ready; no broken images or fake links appear.
export const projects = [
  {
    id: 'html-data-parser',
    title: 'HTML Data Parser',
    category: 'Data & tooling',
    status: 'Built',
    summary: 'Making sense of HTML, one piece of data at a time.',
    description: 'A project focused on parsing data from HTML. Screenshots, implementation details, and a closer look at the workflow are coming soon.',
    tags: ['HTML', 'Data parsing'],
    image: '',
    imageAlt: 'HTML Data Parser project screenshot',
    preview: 'parser',
    githubUrl: '',
    liveUrl: '',
  },
  {
    id: 'web-server',
    title: 'Web Server',
    category: 'Backend development',
    status: 'In progress',
    summary: 'Exploring what happens on the other side of a request.',
    description: 'A web server project currently in development. This space will document the implementation, technical decisions, and progress as the project takes shape.',
    tags: ['Web server', 'HTTP', 'Backend'],
    image: '',
    imageAlt: 'Web Server project screenshot',
    preview: 'server',
    githubUrl: '',
    liveUrl: '',
  },
]
