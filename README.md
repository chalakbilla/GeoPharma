# GeoPharma

One repo, one Vercel project: React frontend (`client/`) + Express API (`server/`, exposed through `api/index.js`).

```
api/index.js      Vercel serverless entry -> server/src/app.js
server/src/       Express app, routes, Gemini (Vertex AI) + Neon DB code
client/           Vite + React + Tailwind v4
vercel.json       build + rewrites (/api/* -> function, everything else -> SPA)
.env              local secrets (git-ignored)   |   .env.example  template
```

## Run locally
```bash
npm run install:all     # root + client dependencies
npm run db:init         # creates / upgrades tables in Neon
npm run dev             # API on :5000, site on http://localhost:5173
```
Check `http://localhost:5000/api/health` — it should show `"ai": true, "db": true`.

## Secrets
Everything lives in the root `.env` (already in `.gitignore`, as are `service-account*.json`, `*-authenticator.json`, `want.txt`).
`GOOGLE_SERVICE_ACCOUNT_JSON` is the whole service-account JSON on one line, in single quotes.
Model: `gemini-2.5-flash-lite` (cheapest 2.5 model) via Vertex AI — change with `GEMINI_MODEL`.
The service account needs the **Vertex AI User** role and the Vertex AI API enabled on its project.

## Deploy on Vercel
1. Push the repo (make sure `.env` is NOT committed).
2. Import it in Vercel — leave Framework Preset as **Other**; `vercel.json` sets everything.
3. Add these Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_PROJECT_ID`, `GOOGLE_LOCATION`,
   `GEMINI_MODEL`, `GOOGLE_SERVICE_ACCOUNT_JSON` (paste the one-line JSON **without** the outer quotes), `DRUG_DB_API_KEY` (optional).
4. Run `npm run db:init` once locally (it uses the same Neon DB).
5. Deploy. `VITE_API_URL` is not needed — the API is on the same domain.

Vercel limits request bodies to ~4.5MB, so uploads are capped at 4MB and photos are compressed in the browser first.

## What's in the app
- AI prescription reader (image / PDF) -> patient, doctor, validity checklist, medicines, dose schedule, same-salt alternatives, interaction warnings
- Daily routine + one-click calendar reminders (.ics) + print / save as PDF
- Streaming AI pharmacist chat (English / Hindi, voice input) that knows the uploaded prescription
- Medicine explorer (search box -> details), My Rx history for logged-in users
- Emergency page with corrected Indian helplines, Offers, Help/FAQ, Login / Sign up

## Rotate these keys
The service-account key, Neon password, drug-database key and the OAuth/AWS/OpenAI keys that were in the old files
were shared in chats / loose files — rotate them once the site is live.
