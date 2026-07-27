# GeoPharma

Two separate apps, meant to be deployed as two separate Vercel projects:

- `client/` — Vite + React frontend
- `server/` — Node/Express API, deployed as Vercel serverless functions

## 1. Rotate your credentials first

Before doing anything else: rotate the Google service account key, the Google OAuth
client secret, the GitHub OAuth client secret, and the Neon DB password — all of these
were pasted into a chat at some point and should be treated as burned. Never put real
secrets in a prompt, a repo, or `client/`. They only belong in `server/.env` (local) or
your Vercel project's environment variables (deployed).

## 2. Neon database

1. Create a Neon project (or reuse one) and grab the pooled connection string.
2. `cd server && cp .env.example .env`, fill in `DATABASE_URL` and the rest.
3. `npm install`
4. `npm run db:init` — creates the `users` and `prescriptions` tables.

## 3. Google Cloud / Vertex AI

1. In the Google Cloud project you want to bill, enable the **Vertex AI API**.
2. Create (or reuse) a service account with the **Vertex AI User** role.
3. Generate a fresh JSON key for it.
4. Paste the full JSON as a single line into `GOOGLE_SERVICE_ACCOUNT_JSON` in `server/.env`
   (and later into the Vercel project's env vars — never commit the key file itself).
5. Set `GOOGLE_PROJECT_ID` to that project's ID.

## 4. Run locally

```bash
cd server && npm install && npm run dev   # http://localhost:5000
cd client && npm install && npm run dev   # http://localhost:5173, proxies /api to the server
```

## 5. Deploy to Vercel

**Server:** `cd server && vercel` — set `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_PROJECT_ID`,
`GOOGLE_LOCATION`, and `GOOGLE_SERVICE_ACCOUNT_JSON` as environment variables in the
Vercel dashboard, not in a file that gets committed. Note the deployed URL.

**Client:** `cd client && vercel` — set `VITE_API_URL` to `https://<your-server-project>.vercel.app/api`.

## Notes

- Auth is currently plain email/password + JWT (7-day expiry, stored in `localStorage`).
  You mentioned wanting to swap this out later — an OAuth + httpOnly-cookie approach
  (like your SYSAUTH project) would be a solid upgrade when you get to it.
- `/api/ocr` works for both logged-in and guest users; results only get saved to the
  `prescriptions` table when a valid JWT is attached.
