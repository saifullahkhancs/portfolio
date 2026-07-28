# Saifullah Khan — Portfolio (React + Flask)

Migrated from the original Lovable/TanStack Start project into a plain
React (Vite) frontend and a Flask + PostgreSQL backend, ready to deploy to
Vercel (frontend) and Google Cloud Run + Cloud SQL (backend).

```
.
├── frontend/   React + Vite + TypeScript + Tailwind — deploy to Vercel
└── backend/    Flask + SQLAlchemy + PostgreSQL — deploy to Cloud Run
```

## What changed vs. the Lovable version

- **Routing**: `@tanstack/react-router` → `react-router-dom` (plain Vite app,
  no server-side rendering needed for a static portfolio)
- **Contact page**: was static contact links only. It now also has a real
  form (name/email/message) that `POST`s to `/api/contact` on the Flask
  backend and stores submissions in Postgres — that's the actual
  frontend↔backend wiring you asked for
- **Content**: `profile`, `experience`, `projects`, `skills`, `education`,
  `certifications` ported as-is into `frontend/src/data/portfolio.ts`
- **Design**: same dark theme, same OKLCH color tokens, same panel/reveal/
  skill-backdrop styling — ported 1:1 into a Tailwind v4 stylesheet

## Before you deploy — swap the placeholder assets

The hero banner, portrait, résumé PDF and certificate images in
`frontend/src/data/portfolio.ts` (`assets` object) currently still point at
the **live Lovable deployment** (`saif-portofolio.lovable.app`) as a
stopgap, since I could not download binary files from that host in this
environment. Before shipping:

1. Download each file from `https://saif-portofolio.lovable.app` (open the
   URLs directly in a browser, e.g.
   `https://saif-portofolio.lovable.app/__l5e/assets-v1/f21d14cc-ba6a-4abe-b699-4f4e323f56a2/hero-banner.png`)
2. Save them into `frontend/src/assets/`
3. Replace the `assets` export in `portfolio.ts` with local imports, e.g.
   ```ts
   import heroBanner from "@/assets/hero-banner.png";
   ```

## Running locally

```bash
# backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # DATABASE_URL=sqlite:///dev.db is fine for local dev
flask db init && flask db migrate -m "init" && flask db upgrade
python wsgi.py          # http://localhost:5000

# frontend (new terminal)
cd frontend
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:5000
npm run dev              # http://localhost:5173
```

## Deploying

- **Frontend → Vercel**: see `frontend/README.md`
- **Backend → Google Cloud Run + Cloud SQL Postgres**: see `backend/README.md`

Deploy the backend first so you have its URL for the frontend's
`VITE_API_URL`, then deploy the frontend, then go back and set the
backend's `ALLOWED_ORIGINS` to the final Vercel URL.
