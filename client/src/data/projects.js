// Add your public contact address when you are ready to accept inquiries.
export const profile = {
  email: 'NavarroSB@proton.me',
  githubUrl: 'https://github.com/NavarroSB',
  linkedinUrl: 'https://www.linkedin.com/in/navarrosb/',
}

// Copy an object to add a project. Each entry creates a card AND a details modal.
// Put screenshots in public/projects/ and use image: '/projects/your-image.webp'.
// Leave image and URLs empty until ready; no broken images or fake links appear.
export const projects = [
  {
    id: 'java-unicode-data-decoder',
    title: 'Java Unicode Data Decoder',
    category: 'Data & tooling',
    status: 'Built',
    summary: 'Turning escaped Unicode data into readable text.',
    description: 'A Java utility for decoding Unicode escape sequences into readable text.',
    tags: ['Java', 'Unicode', 'Data decoding'],
    image: '',
    imageAlt: 'Java Unicode Data Decoder project screenshot',
    preview: 'decoder',
    githubUrl: 'https://github.com/NavarroSB/Java-Decoder',
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
    githubUrl: 'https://github.com/NavarroSB/Web_Server',
    liveUrl: '',
  },
]
