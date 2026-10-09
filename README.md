# Bradley Navarro Portfolio

This repository contains a Vite/React portfolio (`client/`) and an Express contact API (`server/`). Contact submissions are validated, saved to MongoDB Atlas, and sent to `navarrosb@proton.me` through Resend.

## Run locally

Run the following commands from the Portfolio project root, the directory that contains both `client/` and `server/`.

1. Install client dependencies: `npm ci --prefix client`.
2. Install server dependencies: `npm ci --prefix server`.
3. Copy `server/.env.example` to `server/.env` and fill in the Atlas URI and Resend API key. The local `server/.env` is ignored by Git.
4. In one terminal, run `npm run dev --prefix server`.
5. In another terminal, copy `client/.env.example` to `client/.env` and run `npm run dev --prefix client`.

The server listens on port 3000 by default. Its health endpoint is `http://localhost:3000/api/health`.

## Deploy the API to Render

Create a **Web Service** connected to this repository with:

| Setting | Value |
| --- | --- |
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

Add these environment variables in the Render service's Environment settings:

| Key | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Full Atlas connection string, including the `portfolio` database path |
| `CLIENT_ORIGINS` | The deployed frontend origin, for example `https://your-portfolio.onrender.com` |
| `RESEND_API_KEY` | Your Resend API key |
| `CONTACT_TO_EMAIL` | `navarrosb@proton.me` |
| `EMAIL_FROM` | `Portfolio Contact <onboarding@resend.dev>` for initial testing, or an address on a verified Resend domain |

Render sets `PORT` automatically. Do not add MongoDB or Resend credentials to the client service or frontend variables.

## Deploy the frontend to Render

Create a **Static Site** from the same repository with:

| Setting | Value |
| --- | --- |
| Root Directory | `client` |
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |

Set `VITE_API_BASE_URL` to the API service's public URL, without a trailing slash (for example, `https://your-contact-api.onrender.com`). After Render assigns the frontend URL, set the API's `CLIENT_ORIGINS` to that exact origin and redeploy the API.

## MongoDB Atlas connection string

Use the URI form below, substituting the Atlas database username and password. The `/portfolio` segment selects the database used for contact records. Percent-encode reserved characters in the password before placing it in a URI.

```text
mongodb+srv://<MONGODB_USERNAME>:<URL_ENCODED_MONGODB_PASSWORD>@contactcluster.n6ralei.mongodb.net/portfolio?retryWrites=true&w=majority
```

In Atlas, allow network access from the deployed Render service (or use Atlas's appropriate production network configuration), and ensure the database user has the permissions needed to read and write the `contacts` collection.

## Resend delivery

The server sends notifications to `CONTACT_TO_EMAIL` and sets the visitor's address as `replyTo`. Keep `RESEND_API_KEY` server-side. Resend requires at least one verified domain to send email; before production, verify a domain you own and set `EMAIL_FROM` to an address on it. `onboarding@resend.dev` is shown in Resend's integration examples, but the production sender should use your verified domain. See [Resend's verified-domain requirements](https://resend.com/docs/dashboard/domains/introduction) and [Express integration](https://resend.com/express).

## Checks

```sh
npm test --prefix server
npm run lint --prefix client
npm run build --prefix client
```
