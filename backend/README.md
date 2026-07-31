# Backend — Flask API (Full Portfolio CMS)

REST API for the portfolio, backed by PostgreSQL / Supabase. All portfolio content now lives in DB tables and is editable via dashboard.

## Tables (you can now see them in Supabase)

| Table | Purpose | Key fields |
|-------|---------|------------|
| `profiles` | **user_info** – name, title, description, profile image | `name`, `title`, `description`, `profile_image_url`, `hero_banner_url`, `resume_url`, `email`, `phone`, `location`, `linkedin`, `github` |
| `experiences` | Work history | `role`, `company`, `location`, `period`, `points` (JSON) |
| `projects` | Projects | `name`, `tagline`, `period`, `description`, `stack` (JSON), `project_url`, `video_url` |
| `skill_groups` | Technical stack groups | `group_name`, `items` (JSON) |
| `educations` | Education | `school`, `degree`, `period`, `cgpa`, `coursework` |
| `certifications` | Certificates | `name`, `issuer`, `year`, `detail`, `image_url`, `image_key` |
| `users` | Dashboard login | `email`, `password_hash` |
| `contact_messages` | Contact form submissions | `name`, `email`, `message` |

If you don't see tables in Supabase:
1. Make sure `DATABASE_URL` points to Supabase pooler/ direct connection.
2. The app now runs `db.create_all()` on startup, so tables are auto-created on first request / on `seed.py`.
3. Run seed: `DATABASE_URL=your-supabase-url python seed.py --reset`

## Endpoints

### Public (no auth, for portfolio frontend)
- `GET /api/health`
- `GET /api/portfolio` – aggregated: profile + experiences + projects + skills + educations + certifications (single call for frontend)
- `GET /api/profile` – first profile (user_info)
- `GET /api/profiles`, `GET /api/profiles/<id>`
- `GET /api/experiences`, `GET /api/experiences/<id>`
- `GET /api/projects`, `GET /api/projects/<id>`
- `GET /api/skill-groups` or `/api/skills`
- `GET /api/educations`, `GET /api/education`
- `GET /api/certifications`
- `POST /api/contact` – submit message
- `GET /api/contact` – list messages (protected if token provided, open otherwise)

### Protected (Bearer token, dashboard)
- `POST /api/auth/login`
- `POST /api/uploads` – multipart direct uploads for dashboard media (`file` + `kind=image|video|document`); returns a URL that can be saved in the existing image/video URL fields
- **Profiles**: `POST /api/profiles`, `PUT /api/profiles/<id>`, `PUT /api/profile`, `DELETE /api/profiles/<id>`
- **Experiences**: `POST /api/experiences`, `PUT /api/experiences/<id>`, `DELETE /api/experiences/<id>`
- **Projects**: `POST /api/projects`, `PUT /api/projects/<id>`, `DELETE /api/projects/<id>`
- **SkillGroups**: `POST /api/skill-groups`, `PUT /api/skill-groups/<id>`, `DELETE /api/skill-groups/<id>`
- **Educations**: `POST /api/educations`, `PUT /api/educations/<id>`, `DELETE /api/educations/<id>`
- **Certifications**: `POST /api/certifications`, `PUT /api/certifications/<id>`, `DELETE /api/certifications/<id>`

## Local development (one-go seed from resume)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# easiest: DATABASE_URL=sqlite:///dev.db

# create admin for dashboard
python create_admin.py admin@example.com yourpassword

# seed all tables from resume in one command
DATABASE_URL=sqlite:///dev.db python seed.py --reset
# or for Supabase:
# DATABASE_URL=postgresql://postgres:...@db.supabase.co:5432/postgres python seed.py --reset

python wsgi.py   # http://localhost:8000
# verify
curl http://localhost:8000/api/portfolio | jq
curl http://localhost:8000/api/profile | jq
```

Frontend will fallback to static `src/data/portfolio.ts` if API is unreachable, but when `VITE_API_URL` points to this backend it will use live DB data.

## Seeding through the API (no DB access needed)

`seed_via_api.py` pushes the same portfolio values into the database **over HTTP** — it logs in and POST/PUTs everything through the protected `/api/*` endpoints, so it works against a local or deployed backend without database credentials. Pure standard library (no `pip install`):

```bash
# backend must be running (python wsgi.py) and an admin must exist (create_admin.py)
python seed_via_api.py --email admin@example.com --password yourpassword

# against a deployed API, wiping existing rows first:
python seed_via_api.py --api-url https://your-api.com --reset \
  --email admin@example.com --password yourpassword
```

Config via env vars: `API_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `TOKEN` (existing Bearer token, skips login). If data already exists and `--reset` is not passed, the script aborts without changing anything (same contract as `seed.py`). `--reset` deletes all rows through the DELETE endpoints, then re-posts profile, experiences, projects, skill groups, education and certifications.

## Deploying to Supabase

1. Get connection string from Supabase Dashboard > Database > Connection string (use Session pooler or Direct).
2. Set in Cloud Run / service env: `DATABASE_URL=postgresql://postgres.PROJECT:PASSWORD@aws-0-...pooler.supabase.com:6543/postgres?pgbouncer=true`
3. Deploy backend. First request will auto-create tables via `db.create_all()`.
4. Run seed against Supabase DB from your machine:
   ```bash
   DATABASE_URL=postgresql://postgres... python seed.py --reset
   ```
   Now open Supabase Table Editor — you will see `profiles`, `experiences`, `projects`, `skill_groups`, `educations`, `certifications`.

## Deploying to Google Cloud Run + Cloud SQL (kept for reference)

Same as Supabase, just use Cloud SQL connection string. Auto table creation still works.

## Dashboard

- `/signin` – login with admin email/password
- `/dashboard` – tabs for Profile, Experiences, Projects, Skills, Education, Certifications, Messages
  - Profile photo, hero banner, certificate images and project demo videos now support either a direct file upload or a pasted URL. Direct uploads fill the URL field automatically; if no file is uploaded, the pasted URL is used.
  - All CRUD goes through protected APIs above.
  - Portfolio pages (`/`, `/experience`, `/projects`, `/contact`) fetch via `GET /api/portfolio` etc.

## Fix for ID Card drop

`IDCard.tsx` rewritten to use staged animation: `hidden → falling (1.45s ease) → caught (bounce) → swaying (idle 3.2s)`. Strips now form a perfect V from nail apex to card rivets, with flutter during fall. No more broken translate conflicts.
