# Saifullah Khan — Portfolio (React + Flask + Supabase)

Migrated from Lovable/TanStack Start into plain React (Vite) + Flask + PostgreSQL. **Now fully backend-driven** – all content editable via dashboard, no more hardcoded frontend data.

```
.
├── frontend/   React + Vite + TS + Tailwind — deploy to Vercel
└── backend/    Flask + SQLAlchemy + PostgreSQL — deploy to Cloud Run / any PaaS, Supabase DB
```

## What’s new in this iteration (fixes your requests)

### 1. Tables visible in DB + user_info
- Created explicit tables you can see in Supabase Table Editor:
  - `profiles` (your requested `user_info`) – `name`, `title`, `description`, `profile_image_url`, etc.
  - `experiences`, `projects`, `skill_groups`, `educations`, `certifications`, `users`, `contact_messages`
- `app/__init__.py` now runs `db.create_all()` on startup, so tables auto-appear in Supabase even without `flask db migrate`.
- If you still don’t see them: run `DATABASE_URL=... python seed.py --reset` – it creates tables + seeds resume data in one go.

### 2. Backend owns data, not frontend
- Old: `frontend/src/data/portfolio.ts` static.
- New: `GET /api/portfolio` returns everything from DB. Frontend pages (`Home`, `Experience`, `Projects`, `Contact`, `SiteShell`) fetch from API with fallback to static file.
- Resume provided seeded via `backend/seed.py` in one command – no manual entry needed, but you can edit afterwards via dashboard.

### 3. Full CRUD APIs for dashboard
- Public GET: `/api/profile`, `/api/experiences`, `/api/projects`, `/api/skill-groups`, `/api/educations`, `/api/certifications`, `/api/portfolio`
- Protected POST/PUT/DELETE (Bearer token) for all:
  - `POST /api/profile` / `PUT /api/profile`
  - `POST /api/experiences`, `PUT /api/experiences/<id>`, `DELETE ...`
  - Same for projects, skill-groups, educations, certifications
- Dashboard (`/dashboard`) now has tabs for **Profile, Experiences, Projects, Skills, Education, Certifications, Messages** – all wired to those APIs.

### 4. Card drop-down fixed
- Rewrote `IDCard.tsx`: staged animation `hidden → falling (1.45s cubic-bezier) → caught → swaying idle`.
- Strips form perfect V from nail apex to brass rivets on card, flutter during fall via `animate-flutter`, impact ring on catch.
- CSS in `styles.css` simplified: `sway-idle`, fixed `flutter`/`flutter-right`, no infinite fall loop.
- `Home.tsx` now shows the ID card (with your portrait from backend) rather than separate static circle + broken BUILD card.

### 5. One-go seed
```bash
cd backend
DATABASE_URL=sqlite:///dev.db python seed.py --reset          # local
DATABASE_URL=postgresql://postgres:PASS@db.supabase.co:5432/postgres python seed.py --reset   # Supabase
```
Creates 8 tables, inserts:
- 1 profile (user_info)
- 3 experiences
- 5 projects
- 8 skill groups
- 1 education
- 3 certifications
Tables immediately visible in Supabase Table Editor.

## Running locally

```bash
# backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set DATABASE_URL=sqlite:///dev.db and SECRET_KEY
python create_admin.py admin@example.com strongpass
python seed.py --reset
python wsgi.py           # http://localhost:5000

# frontend
cd ../frontend
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:5000
npm run dev              # http://localhost:5173
# login at http://localhost:5173/signin -> /dashboard to edit
```

## Deploying

- **Backend → Cloud Run / Render / Railway**: set `DATABASE_URL` to Supabase pooler URL, `ALLOWED_ORIGINS` to Vercel URL, `SECRET_KEY` random. Auto-creates tables on boot. Then run seed once against Supabase.
- **Frontend → Vercel**: set `VITE_API_URL` to backend URL. Build passes (`vite build`).

## Stack
- Flask, SQLAlchemy, Flask-Migrate, Flask-CORS, psycopg
- React, Vite, Tailwind v4, React Router
- Supabase Postgres (or any Postgres)
