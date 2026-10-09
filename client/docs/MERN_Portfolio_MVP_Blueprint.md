# Full-Stack MERN Portfolio — MVP Blueprint

**Prepared:** September 18, 2026  
**Primary goal:** Ship a professional portfolio at your own domain that demonstrates the full MERN path end-to-end:

**React UI → Express API → MongoDB persistence → email notification → production deployment → custom domain**

---

## 0. MVP Definition

### What this MVP should do

Your first production version should:

- Display a polished React portfolio landing page.
- Present your skills, projects, background, and contact information.
- Include a working contact form.
- Validate contact requests on both the client and server.
- Save every legitimate contact request to MongoDB.
- Send a notification email to your Proton inbox.
- Deploy the frontend and backend publicly.
- Use your purchased custom domain.
- Use HTTPS.
- Keep all database credentials and email API keys on the server.
- Be structured well enough that you can extend it later with authentication, an admin dashboard, analytics, additional APIs, and more portfolio projects.

### What is intentionally **not** part of the first MVP

Do **not** let these delay the initial launch:

- Admin login/dashboard
- JWT authentication
- Blog/CMS
- WebSockets
- Complicated animations
- Multiple databases
- User accounts
- Contact-message replies from inside the website
- Docker
- Kubernetes
- Microservices

Those are excellent Phase 2 additions after the site is live.

---

# 1. Recommended MVP Architecture

```text
                     YOUR CUSTOM DOMAIN
                       yourname.com
                             |
                             v
                 +-----------------------+
                 |   React + Vite UI     |
                 |   Tailwind CSS        |
                 |   hosted on Vercel    |
                 +-----------+-----------+
                             |
                             | POST /api/contact
                             v
                 +-----------------------+
                 | Node.js + Express API |
                 | api.yourname.com      |
                 | hosted on Render      |
                 +-----+------------+----+
                       |            |
                       |            |
                       v            v
              +---------------+   +----------------+
              | MongoDB Atlas |   | Resend Email   |
              | Contact data  |   | Notification   |
              +---------------+   +-------+--------+
                                          |
                                          v
                                  Your Proton Inbox
```

### Recommended services

| Layer | Choice | Purpose |
|---|---|---|
| Frontend | React + Vite | UI/application |
| Styling | Tailwind CSS | Responsive UI |
| Backend | Node.js + Express | REST API |
| Database | MongoDB Atlas + Mongoose | Store contact submissions |
| Validation | Zod | Server-side payload validation |
| Email | Resend | Deliver contact notifications |
| Frontend hosting | Vercel | Deploy React/Vite frontend |
| Backend hosting | Render | Deploy Express API |
| Domain | Your registrar of choice | Own your professional URL |
| Email inbox | Proton Mail | Receive inquiries |
| Source control | GitHub | Portfolio source and deployment integration |

---

# 2. Recommended Repository Structure

Use one GitHub repository with separate frontend and backend directories.

```text
portfolio/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Skills.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ContactForm.jsx
│   │   │   └── Footer.jsx
│   │   │
│   │   ├── lib/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   └── contactController.js
│   │   │
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   │
│   │   ├── models/
│   │   │   └── Contact.js
│   │   │
│   │   ├── routes/
│   │   │   └── contactRoutes.js
│   │   │
│   │   ├── services/
│   │   │   └── emailService.js
│   │   │
│   │   ├── validation/
│   │   │   └── contactValidation.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── README.md
└── MVP_BLUEPRINT.md
```

This structure gives you a clean separation between UI, API routing, controller logic, database models, validation, and external services.

---

# 3. Phase 1 — Initialize the Project

## Step 1 — Create the repository directory

```bash
mkdir portfolio
cd portfolio
git init
```

Create a root `.gitignore`:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
.DS_Store
```

---

# 4. Phase 2 — Build the React Frontend

## 4.1 Create the React application with Vite

From the `portfolio/` root:

```bash
npm create vite@latest client -- --template react
cd client
npm install
```

> Current Vite versions require a modern Node.js release. If Vite warns about your Node version, update Node before continuing.

Run the starter application:

```bash
npm run dev
```

Vite normally serves the application locally at:

```text
http://localhost:5173
```

---

# 5. Understanding `index.html` in React + Vite

This is important:

**Do not build your entire portfolio directly inside `index.html`.**

With React + Vite:

```text
index.html
   |
   v
src/main.jsx
   |
   v
src/App.jsx
   |
   v
React components
```

Your `index.html` is the browser entry point and HTML shell.

React controls the actual application inside:

```html
<div id="root"></div>
```

## Recommended `client/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <meta
      name="description"
      content="Full-stack software developer portfolio showcasing MERN applications, backend development, APIs, databases, and web projects."
    />

    <meta name="author" content="YOUR NAME" />

    <title>YOUR NAME | Full-Stack Developer</title>
  </head>

  <body>
    <div id="root"></div>

    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

Later, replace `YOUR NAME` and the description with your final branding.

---

# 6. Configure React Entry Point

## `client/src/main.jsx`

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

# 7. Add Tailwind CSS

For this MVP, Tailwind is a strong fit because:

- It works well with component-based React development.
- It keeps most layout/styling decisions close to the component.
- It makes responsive design fast.
- It is widely recognizable to employers.
- It avoids spending the entire project building custom CSS infrastructure.

## Install Tailwind

Inside `client/`:

```bash
npm install tailwindcss @tailwindcss/vite
```

## Update `client/vite.config.js`

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
});
```

## Replace `client/src/index.css`

```css
@import "tailwindcss";

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-width: 320px;
}
```

For the MVP, you do **not** need to over-configure Tailwind before you start building.

---

# 8. Build Your Landing Page as React Components

## Recommended page order

Your `App.jsx` should eventually render:

```text
Navbar
Hero
About
Skills
Projects
Contact
Footer
```

## `client/src/App.jsx`

```jsx
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
}

export default App;
```

---

# 9. Build Order for Frontend Sections

Build these in this order.

## 9.1 Navbar

Include anchor links:

```text
Home
About
Skills
Projects
Contact
GitHub
LinkedIn
```

For a one-page MVP, regular anchor links are enough:

```jsx
<a href="#projects">Projects</a>
```

You do not need React Router unless you add separate pages.

---

## 9.2 Hero Section

The hero should immediately answer:

1. Who are you?
2. What do you do?
3. What technologies do you work with?
4. What should the visitor do next?

Example content structure:

```text
YOUR NAME
Full-Stack Software Developer

I build responsive web applications, REST APIs, backend services,
and database-driven applications using the MERN stack.

[View Projects] [Contact Me]
```

---

## 9.3 About Section

Keep it concise.

Focus on:

- Full-stack development
- MERN
- Backend/API work
- Database development
- Software development education
- QA/process experience where relevant
- Continuous learning

---

## 9.4 Skills Section

Organize skills instead of dumping every technology into one list.

Example:

```text
Frontend
- React
- JavaScript
- HTML5
- CSS3
- Tailwind CSS

Backend
- Node.js
- Express
- REST APIs

Database
- MongoDB
- Mongoose
- MySQL
- PostgreSQL

Development
- Git
- GitHub
- Insomnia
- Postman-style API testing
- Render
- Vercel
```

---

## 9.5 Projects Section

Each project card should contain:

- Project name
- Screenshot
- Short problem statement
- Technologies used
- Key technical features
- GitHub link
- Live demo link
- Optional "Read More"

Your web-server project should be one of the featured projects.

Do not describe only what the UI looks like.

Describe technical work such as:

```text
Created custom routing and middleware behavior.
Designed REST endpoints.
Integrated database persistence.
Implemented error handling and validation.
Deployed the application to a production environment.
```

---

# 10. Phase 3 — Create the Contact Form

The form should collect:

```text
Name
Email
Subject
Message
```

Optional:

```text
Company
```

Do **not** ask visitors for unnecessary personal information.

---

# 11. Frontend API Configuration

Never hardcode your production backend URL throughout your components.

Create:

## `client/.env.example`

```env
VITE_API_BASE_URL=http://localhost:5000
```

Create your local untracked `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

> Important: Variables prefixed with `VITE_` are bundled into frontend code and are visible to visitors.
>
> **Never place passwords, MongoDB credentials, Resend API keys, Proton credentials, or other secrets in a Vite environment variable.**

---

# 12. Create a Small Frontend API Helper

## `client/src/lib/api.js`

```js
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function submitContactForm(payload) {
  const response = await fetch(`${API_BASE_URL}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to send your message.");
  }

  return data;
}
```

---

# 13. Contact Form Component

## `client/src/components/ContactForm.jsx`

```jsx
import { useState } from "react";
import { submitContactForm } from "../lib/api";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setStatus("submitting");
      setFeedback("");

      const result = await submitContactForm(form);

      setStatus("success");
      setFeedback(result.message);
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setFeedback(error.message);
    }
  }

  return (
    <section
      id="contact"
      className="mx-auto max-w-3xl px-6 py-24"
    >
      <h2 className="text-3xl font-bold">
        Contact Me
      </h2>

      <p className="mt-3 text-slate-400">
        Have an opportunity, project, or question? Send me a message.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        <div>
          <label
            htmlFor="name"
            className="mb-2 block font-medium"
          >
            Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            maxLength={80}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block font-medium"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            maxLength={254}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="subject"
            className="mb-2 block font-medium"
          >
            Subject
          </label>

          <input
            id="subject"
            name="subject"
            type="text"
            value={form.subject}
            onChange={handleChange}
            required
            maxLength={120}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-2 block font-medium"
          >
            Message
          </label>

          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            minLength={10}
            maxLength={5000}
            rows={7}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
          />
        </div>

        {/* Honeypot field. Hide visually, but leave it in the request. */}
        <div
          aria-hidden="true"
          className="absolute left-[-9999px]"
        >
          <label htmlFor="website">
            Website
          </label>

          <input
            id="website"
            name="website"
            type="text"
            tabIndex="-1"
            autoComplete="off"
            value={form.website}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-lg bg-slate-100 px-6 py-3 font-semibold text-slate-950 disabled:opacity-60"
        >
          {status === "submitting"
            ? "Sending..."
            : "Send Message"}
        </button>

        {feedback && (
          <p
            role="status"
            className="text-sm text-slate-300"
          >
            {feedback}
          </p>
        )}
      </form>
    </section>
  );
}

export default ContactForm;
```

---

# 14. Phase 4 — Create the Express Backend

Return to the project root:

```bash
cd ..
mkdir server
cd server
npm init -y
```

Install the backend packages:

```bash
npm install express mongoose cors dotenv helmet express-rate-limit zod resend
npm install --save-dev nodemon
```

---

# 15. Configure `server/package.json`

Add ES modules and scripts:

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

Keep the dependencies npm adds automatically.

---

# 16. Server Environment Variables

Create:

## `server/.env.example`

```env
PORT=5000

MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/portfolio

CLIENT_ORIGINS=http://localhost:5173

RESEND_API_KEY=re_your_api_key

CONTACT_TO_EMAIL=your-proton-address@proton.me

EMAIL_FROM=Portfolio Contact <portfolio@send.yourdomain.com>
```

Then create a local `server/.env` with your actual values.

Never commit `.env`.

---

# 17. Create MongoDB Atlas Database

## Step-by-step

1. Create or sign in to MongoDB Atlas.
2. Create a project for the portfolio.
3. Create a cluster suitable for development/MVP usage.
4. Create a database user.
5. Give the user only the database access the application needs.
6. Configure Atlas network access.
7. Open the Atlas **Connect** workflow.
8. Choose the Node.js/application connection option.
9. Copy the `mongodb+srv://...` connection string.
10. Replace the username and password placeholders.
11. Add the database name:

```text
portfolio
```

Example format:

```text
mongodb+srv://USERNAME:PASSWORD@cluster.example.mongodb.net/portfolio?retryWrites=true&w=majority
```

Store it only in:

```text
server/.env
```

---

# 18. MongoDB Connection Module

## `server/src/config/db.js`

```js
import mongoose from "mongoose";

export async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}
```

---

# 19. Create the Contact Database Model

## `server/src/models/Contact.js`

```js
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    status: {
      type: String,
      enum: ["new", "read", "replied"],
      default: "new",
    },

    notificationStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },

    notificationId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Contact", contactSchema);
```

MongoDB will now maintain:

```text
createdAt
updatedAt
```

automatically.

---

# 20. Validate Incoming Requests

Frontend validation improves UX.

Backend validation protects your application.

You need both.

## `server/src/validation/contactValidation.js`

```js
import { z } from "zod";

export const contactRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(80),

  email: z
    .string()
    .trim()
    .email()
    .max(254),

  subject: z
    .string()
    .trim()
    .min(2)
    .max(120),

  message: z
    .string()
    .trim()
    .min(10)
    .max(5000),

  // Hidden honeypot field.
  website: z
    .string()
    .optional()
    .default(""),
});
```

---

# 21. Email Strategy

## Recommended MVP

Use:

```text
Express API
    |
    v
Resend
    |
    v
Your Proton inbox
```

Your Proton address can simply be the destination:

```env
CONTACT_TO_EMAIL=yourname@proton.me
```

The visitor does **not** need to know your private email address.

---

# 22. Configure Resend

## Initial setup

1. Create a Resend account.
2. Generate an API key.
3. Add it to the backend only:

```env
RESEND_API_KEY=re_xxxxxxxxx
```

## Development

Use Resend's development/testing sender configuration while you build.

## Production recommendation

After buying your domain, verify a sending **subdomain** such as:

```text
send.yourdomain.com
```

Then use a sender similar to:

```env
EMAIL_FROM=Portfolio Contact <portfolio@send.yourdomain.com>
```

Using a sending subdomain keeps your application's transactional-email configuration separate from your root-domain mailbox configuration.

---

# 23. Email Service

## `server/src/services/emailService.js`

```js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactNotification(contact) {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,

    to: [
      process.env.CONTACT_TO_EMAIL,
    ],

    replyTo: contact.email,

    subject: `Portfolio inquiry: ${contact.subject}`,

    text: [
      "New portfolio contact request",
      "",
      `Name: ${contact.name}`,
      `Email: ${contact.email}`,
      `Subject: ${contact.subject}`,
      "",
      "Message:",
      contact.message,
      "",
      `Submission ID: ${contact._id}`,
      `Submitted: ${contact.createdAt}`,
    ].join("\n"),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

### Why `replyTo` matters

The email itself is sent by your verified application sender.

But when you press **Reply** in Proton, the reply can target the visitor's email address.

That is better than attempting to spoof the visitor's address as the sender.

---

# 24. Contact Controller

The safest MVP flow is:

```text
1. Validate request
2. Reject obvious bot submission
3. Save submission to MongoDB
4. Attempt email notification
5. Update notification status
6. Return success to visitor
```

Saving to MongoDB **before** sending the email means the inquiry is not lost merely because the mail provider temporarily fails.

## `server/src/controllers/contactController.js`

```js
import Contact from "../models/Contact.js";
import { contactRequestSchema } from "../validation/contactValidation.js";
import { sendContactNotification } from "../services/emailService.js";

export async function createContactRequest(req, res, next) {
  try {
    const parsed = contactRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Please check the contact form and try again.",
      });
    }

    const {
      website,
      ...contactData
    } = parsed.data;

    // Honeypot: bots commonly fill hidden form fields.
    if (website) {
      return res.status(200).json({
        message: "Thanks. Your message has been received.",
      });
    }

    const contact = await Contact.create(contactData);

    try {
      const email = await sendContactNotification(contact);

      contact.notificationStatus = "sent";
      contact.notificationId = email?.id || null;

      await contact.save();
    } catch (emailError) {
      contact.notificationStatus = "failed";
      await contact.save();

      console.error(
        "Contact email notification failed:",
        emailError.message
      );
    }

    return res.status(201).json({
      message: "Thanks. Your message has been received.",
    });
  } catch (error) {
    next(error);
  }
}
```

---

# 25. Contact Route

## `server/src/routes/contactRoutes.js`

```js
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createContactRequest } from "../controllers/contactController.js";

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/",
  contactLimiter,
  createContactRequest
);

export default router;
```

This limits simple automated abuse of the contact endpoint.

---

# 26. Error Handler

## `server/src/middleware/errorHandler.js`

```js
export function errorHandler(error, req, res, next) {
  console.error(error);

  return res.status(500).json({
    message: "Something went wrong. Please try again later.",
  });
}
```

Do not send raw stack traces or infrastructure details to users.

---

# 27. Create the Express Server

## `server/src/server.js`

```js
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { connectDatabase } from "./config/db.js";
import contactRoutes from "./routes/contactRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

const PORT = process.env.PORT || 5000;

const allowedOrigins = (
  process.env.CLIENT_ORIGINS || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      // Allows non-browser requests such as curl/Insomnia.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Origin not allowed by CORS")
      );
    },
  })
);

app.use(
  express.json({
    limit: "20kb",
  })
);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.use(
  "/api/contact",
  contactRoutes
);

app.use(errorHandler);

await connectDatabase();

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Server running on port ${PORT}`
    );
  }
);
```

---

# 28. Start the Backend

Inside `server/`:

```bash
npm run dev
```

Test:

```text
GET http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "ok"
}
```

---

# 29. Test the Contact API Before Connecting React

Use Insomnia, Postman, or `curl`.

Example request:

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Portfolio Test",
    "message": "Testing the portfolio contact endpoint.",
    "website": ""
  }'
```

Expected response:

```json
{
  "message": "Thanks. Your message has been received."
}
```

Now verify all three:

- [ ] API returned success.
- [ ] MongoDB contains a new contact document.
- [ ] Proton received the email notification.

Do not move on until all three work.

---

# 30. Phase 5 — Connect React to Express Locally

Run two terminals.

## Terminal 1

```bash
cd portfolio/server
npm run dev
```

## Terminal 2

```bash
cd portfolio/client
npm run dev
```

Your local flow becomes:

```text
http://localhost:5173
        |
        v
POST http://localhost:5000/api/contact
        |
        +--> MongoDB
        |
        +--> Proton notification
```

Test the form directly in your browser.

---

# 31. Phase 6 — Deployment Strategy

Recommended production layout:

```text
Frontend:
https://yourdomain.com

Backend:
https://api.yourdomain.com

Database:
MongoDB Atlas

Email:
Resend -> Proton
```

This setup makes the architecture easy to explain in interviews.

---

# 32. Push the Project to GitHub

From the root:

```bash
git add .
git commit -m "Initialize MERN portfolio MVP"
```

Create a GitHub repository and connect it:

```bash
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git branch -M main
git push -u origin main
```

Before pushing, verify:

```bash
git status
```

and make sure `.env` files are not tracked.

---

# 33. Deploy Backend to Render

## Recommended Render configuration

Create a new **Web Service** connected to the GitHub repository.

Use:

```text
Root Directory:
server

Build Command:
npm install

Start Command:
npm start
```

Add these environment variables in Render:

```env
MONGODB_URI=...
CLIENT_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RESEND_API_KEY=...
CONTACT_TO_EMAIL=your-proton-address@proton.me
EMAIL_FROM=Portfolio Contact <portfolio@send.yourdomain.com>
```

Render will provide a temporary URL similar to:

```text
https://your-service.onrender.com
```

Test:

```text
https://your-service.onrender.com/api/health
```

Then test the production contact endpoint before attaching your domain.

---

# 34. Deploy Frontend to Vercel

Create a Vercel project connected to the same GitHub repository.

Set:

```text
Root Directory:
client

Framework:
Vite
```

Add:

```env
VITE_API_BASE_URL=https://your-service.onrender.com
```

Deploy.

Vercel will provide a temporary URL similar to:

```text
https://your-project.vercel.app
```

Test the entire contact flow again.

---

# 35. Phase 7 — Purchase and Connect Your Domain

After purchasing the domain, your final architecture should look like:

```text
yourdomain.com
      |
      +--> Vercel frontend

api.yourdomain.com
      |
      +--> Render backend

send.yourdomain.com
      |
      +--> Resend email authentication

Optional:
contact@yourdomain.com
      |
      +--> Proton Mail
```

---

# 36. DNS Plan

The exact DNS values will come from Vercel, Render, Resend, and optionally Proton.

Do **not** guess the DNS targets.

Copy the exact values shown by each provider.

Conceptually your DNS will resemble:

| Host | Record | Used by | Purpose |
|---|---|---|---|
| `@` | A / provider-required record | Vercel | Root portfolio website |
| `www` | CNAME | Vercel | `www` portfolio URL |
| `api` | CNAME | Render | Express backend |
| `send` | TXT/CNAME records | Resend | Transactional-email authentication |
| `@` | MX records | Proton, optional | Custom-domain email |
| `@` or provider-specified host | TXT | Proton, optional | SPF/domain verification |
| provider-specified DKIM hosts | CNAME/TXT | Proton, optional | DKIM |
| `_dmarc` | TXT | Mail configuration | DMARC policy |

Your website and email can use the **same domain** because different DNS record types serve different purposes.

---

# 37. Connect the Root Domain to Vercel

Inside your Vercel project:

```text
Project
→ Settings
→ Domains
→ Add yourdomain.com
```

Vercel will tell you which DNS records your registrar needs.

Add those records at the registrar/DNS provider.

Also configure:

```text
www.yourdomain.com
```

Choose one canonical address.

For example:

```text
yourdomain.com
```

and redirect:

```text
www.yourdomain.com
```

to it.

---

# 38. Connect `api.yourdomain.com` to Render

Inside Render:

```text
Web Service
→ Settings
→ Custom Domains
→ Add Custom Domain
```

Add:

```text
api.yourdomain.com
```

Render will provide the DNS value required for your provider.

At your DNS provider, create the required record for:

```text
api
```

After Render verifies it, HTTPS should be provisioned automatically.

Test:

```text
https://api.yourdomain.com/api/health
```

---

# 39. Update Production Environment Variables

Once the backend custom domain works, update Vercel:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

Redeploy the frontend.

Then ensure Render allows your frontend origins:

```env
CLIENT_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

Your final contact request should now travel:

```text
https://yourdomain.com

        ↓

https://api.yourdomain.com/api/contact

        ↓

MongoDB Atlas

        +

Resend

        ↓

Proton
```

---

# 40. Recommended Email Configuration

## Simplest MVP

Keep your existing Proton address private:

```text
Visitor
   |
   v
yourdomain.com
   |
   v
Express API
   |
   v
Resend
   |
   v
your-current-address@proton.me
```

The visitor never needs to see the destination email address.

---

# 41. Optional Upgrade — `contact@yourdomain.com` with Proton

If you have a paid Proton Mail plan and want a professional custom-domain inbox:

```text
contact@yourdomain.com
```

you can connect your domain to Proton.

Proton will provide the exact DNS values for:

- Domain verification
- MX
- SPF
- DKIM
- DMARC

Your DNS can still simultaneously host:

```text
yourdomain.com        -> Vercel
api.yourdomain.com    -> Render
contact@yourdomain.com -> Proton
```

These services do not need to fight over the domain.

---

# 42. Optional Upgrade — Send Through Proton SMTP Instead of Resend

This is **not required for the MVP**.

Proton currently supports SMTP submission for paid Proton plans with custom-domain addresses.

The general configuration is:

```text
SMTP host:
smtp.protonmail.ch

Port:
587

Encryption:
STARTTLS

Authentication:
Proton SMTP token
```

Do **not** use your normal Proton account password in the application.

If you choose this approach later, you could replace Resend with Nodemailer:

```bash
npm uninstall resend
npm install nodemailer
```

Your architecture would then become:

```text
Express
   |
   v
Proton SMTP
   |
   v
Your mailbox
```

For the first launch, Resend is simpler and keeps your portfolio application's email delivery independent from your mailbox provider.

---

# 43. Security Checklist Before Launch

## Backend

- [ ] `.env` is ignored by Git.
- [ ] MongoDB password is strong and unique.
- [ ] Database user has only required privileges.
- [ ] MongoDB network access is configured intentionally.
- [ ] CORS allows only your real frontend origins in production.
- [ ] `helmet()` is enabled.
- [ ] JSON payload size is limited.
- [ ] Contact endpoint is rate-limited.
- [ ] Server validates all input.
- [ ] Email/API errors do not leak credentials.
- [ ] Production uses HTTPS.
- [ ] No secret uses a `VITE_` prefix.

## Frontend

- [ ] Form labels are accessible.
- [ ] Form displays loading state.
- [ ] Form displays success state.
- [ ] Form displays failure state.
- [ ] Submit button cannot be spam-clicked while submitting.
- [ ] Mobile layout works.
- [ ] Links use correct destinations.
- [ ] Images have `alt` text.
- [ ] Project screenshots are optimized.

---

# 44. Spam Protection Roadmap

Start with:

```text
Honeypot
+
Rate limiting
+
Server validation
```

If spam becomes a real problem, add a challenge system such as Cloudflare Turnstile later.

Do not add complexity before you need it.

---

# 45. Database Data You Will Have

A legitimate MongoDB contact record should resemble:

```json
{
  "_id": "ObjectId(...)",
  "name": "Jane Recruiter",
  "email": "jane@example.com",
  "subject": "Software Developer Opportunity",
  "message": "I came across your portfolio...",
  "status": "new",
  "notificationStatus": "sent",
  "notificationId": "email-provider-id",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

This is more valuable for your portfolio than a contact form that simply opens `mailto:`.

It demonstrates actual data persistence and backend processing.

---

# 46. Recommended Development Sequence for Today

Work in this order.

## Milestone 1 — Scaffold

- [ ] Create root repo.
- [ ] Create Vite React client.
- [ ] Install Tailwind.
- [ ] Create Express server.
- [ ] Add `/api/health`.

## Milestone 2 — Static Landing Page

- [ ] Navbar
- [ ] Hero
- [ ] About
- [ ] Skills
- [ ] Projects
- [ ] Contact shell
- [ ] Footer

Do not wait for the site to be perfectly designed.

## Milestone 3 — Database

- [ ] Create MongoDB Atlas project.
- [ ] Connect Express to Atlas.
- [ ] Create `Contact` model.
- [ ] Verify connection.

## Milestone 4 — Contact API

- [ ] Add Zod validation.
- [ ] Add `POST /api/contact`.
- [ ] Test in Insomnia/curl.
- [ ] Confirm MongoDB insertion.

## Milestone 5 — Email

- [ ] Create Resend account.
- [ ] Add API key.
- [ ] Create email service.
- [ ] Send notification to Proton.
- [ ] Set visitor as `replyTo`.
- [ ] Confirm Proton receives it.

## Milestone 6 — React Integration

- [ ] Connect form to API.
- [ ] Test valid request.
- [ ] Test invalid email.
- [ ] Test empty fields.
- [ ] Test long message.
- [ ] Test loading state.
- [ ] Test error state.

## Milestone 7 — Deployment

- [ ] Push GitHub repository.
- [ ] Deploy backend to Render.
- [ ] Test production API.
- [ ] Deploy frontend to Vercel.
- [ ] Set production API URL.
- [ ] Test complete flow.

## Milestone 8 — Domain

- [ ] Purchase domain.
- [ ] Connect root domain to Vercel.
- [ ] Connect `www`.
- [ ] Connect `api` to Render.
- [ ] Verify HTTPS.
- [ ] Configure Resend sending subdomain.
- [ ] Update final environment variables.
- [ ] Test again.

---

# 47. Production Test Matrix

Before placing the portfolio on your resume, test:

| Test | Expected Result |
|---|---|
| Load root domain | React site loads |
| Mobile screen | Layout remains usable |
| `/api/health` | Returns `200` |
| Valid form | Returns success |
| Valid form | Creates MongoDB record |
| Valid form | Sends Proton notification |
| Reply in Proton | Goes to visitor address |
| Invalid email | Rejected |
| Empty message | Rejected |
| Oversized message | Rejected |
| Repeat submissions | Rate limiter eventually responds |
| Wrong CORS origin | Backend blocks browser request |
| HTTPS | Both frontend and API use HTTPS |
| GitHub repository | No `.env` secrets are committed |

---

# 48. Suggested Git Commit Sequence

Use commits that tell the story of the build.

```text
chore: initialize React and Express applications

feat: add portfolio landing page sections

style: configure Tailwind responsive layout

feat: add MongoDB contact model

feat: add contact REST endpoint

feat: add server-side validation

feat: add contact email notifications

security: add helmet and contact rate limiting

feat: connect React contact form to API

deploy: configure production frontend and backend

chore: connect custom domain
```

A clean commit history itself becomes part of the portfolio.

---

# 49. README Architecture Section

Your final project README should include something similar to:

```text
Frontend
React + Vite + Tailwind CSS

API
Node.js + Express

Database
MongoDB Atlas + Mongoose

Validation
Zod

Email
Resend -> Proton Mail

Hosting
Vercel + Render

Architecture
Browser -> React -> Express REST API -> MongoDB
                                 |
                                 -> Email notification
```

Also include:

- Live site
- GitHub repository
- Screenshots
- Features
- Local installation instructions
- Environment variable names
- API endpoints
- Architecture explanation
- Challenges/decisions
- Future improvements

Never include actual credentials in README examples.

---

# 50. How This Complements Your Web-Server Project

Keep the two projects conceptually distinct.

## Portfolio application

Purpose:

```text
Demonstrate that you can ship a complete production MERN application.
```

It proves:

- React
- Responsive UI
- REST integration
- Express
- MongoDB
- Validation
- API security basics
- Third-party API integration
- Environment variables
- Deployment
- DNS/custom domains

## Web-server project

Purpose:

```text
Demonstrate that you understand what happens underneath higher-level web frameworks.
```

That project can continue progressing through:

```text
HTTP handling
→ routing
→ middleware
→ REST
→ MongoDB
→ authentication
→ streams
→ WebSockets
→ caching
→ tests
→ Docker/deployment
```

Together, the projects tell a stronger story than two similar CRUD applications.

---

# 51. Phase 2 Ideas After MVP Launch

After the portfolio is live, consider these in roughly this order:

1. Add automated API tests.
2. Add frontend component/form tests.
3. Add GitHub Actions CI.
4. Add a protected admin dashboard.
5. Add JWT authentication for the admin area.
6. Display stored contact requests in the dashboard.
7. Add `read` / `replied` status management.
8. Pull GitHub repository data into the Projects section.
9. Add project-detail routes.
10. Add structured metadata/SEO improvements.
11. Add analytics.
12. Add Turnstile if spam requires it.
13. Add Docker.
14. Add uptime/error monitoring.

---

# 52. MVP Definition of Done

The MVP is finished when all of the following are true:

- [ ] `https://yourdomain.com` loads your React portfolio.
- [ ] The site is responsive on desktop and mobile.
- [ ] Hero clearly identifies you as a developer.
- [ ] Skills are organized.
- [ ] At least 2–3 strong projects are presented.
- [ ] Contact form works from the live site.
- [ ] Contact request reaches Express.
- [ ] Express validates the request.
- [ ] Request is stored in MongoDB.
- [ ] You receive the notification in Proton.
- [ ] Replying from Proton targets the visitor.
- [ ] Backend is available through `https://api.yourdomain.com`.
- [ ] Both frontend and backend use HTTPS.
- [ ] Secrets exist only in server/provider environment configuration.
- [ ] Repository has a professional README.
- [ ] No production credential is committed to GitHub.

At that point, **ship it and place the domain on your resume**.

Do not postpone launch because every future feature has not been implemented.

---

# 53. Exact First Commands to Run

If you are starting fresh later today:

```bash
mkdir portfolio
cd portfolio
git init

npm create vite@latest client -- --template react

cd client
npm install
npm install tailwindcss @tailwindcss/vite

cd ..
mkdir server
cd server
npm init -y

npm install express mongoose cors dotenv helmet express-rate-limit zod resend
npm install --save-dev nodemon
```

Then build in this order:

```text
1. React shell
2. Tailwind
3. Portfolio sections
4. Express health route
5. MongoDB connection
6. Contact model
7. Contact POST endpoint
8. Email notification
9. React form integration
10. Deployment
11. Domain
```

---

# 54. Official Documentation References

These are the main docs to keep nearby while building.

## React

Creating a React app:

https://react.dev/learn/creating-a-react-app

Building from scratch:

https://react.dev/learn/build-a-react-app-from-scratch

## Vite

Getting started:

https://vite.dev/guide/

## Tailwind CSS

Vite installation:

https://tailwindcss.com/docs/installation/using-vite

## MongoDB Atlas

Connect via client libraries:

https://www.mongodb.com/docs/atlas/driver-connection/

## Resend

Node.js:

https://resend.com/nodejs

Express:

https://resend.com/express

## Render

Web services:

https://render.com/docs/web-services

Custom domains:

https://render.com/docs/custom-domains

## Vercel

Custom domain setup:

https://vercel.com/docs/domains/set-up-custom-domain

## Proton Mail

Custom-domain setup:

https://proton.me/support/custom-domain

SMTP submission:

https://proton.me/support/smtp-submission

---

# 55. Final MVP Architecture

```text
                         INTERNET
                            |
                            v
                 https://yourdomain.com
                            |
                            v
                +----------------------+
                | React + Vite         |
                | Tailwind CSS         |
                | Vercel               |
                +----------+-----------+
                           |
                           |
                           | HTTPS POST
                           | /api/contact
                           v
              https://api.yourdomain.com
                           |
                +----------+-----------+
                | Node.js + Express    |
                | Validation           |
                | Rate limiting        |
                | Helmet / CORS        |
                | Render               |
                +-------+---------+----+
                        |         |
                        |         |
                        v         v
                 MongoDB Atlas   Resend
                                   |
                                   v
                              Proton Mail
```

That is a legitimate full-stack portfolio application, not simply a static developer homepage.
