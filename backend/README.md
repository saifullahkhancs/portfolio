# Backend — Flask API

REST API for the portfolio's contact form, backed by PostgreSQL.

## Endpoints

| Method | Path           | Purpose                                   |
|--------|----------------|--------------------------------------------|
| GET    | `/api/health`  | Health check                              |
| POST   | `/api/contact` | Submit a contact message                  |
| GET    | `/api/contact` | List messages (add auth before production)|

## Local development

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# for local dev, simplest is: DATABASE_URL=sqlite:///dev.db

flask db init        # first time only
flask db migrate -m "init"
flask db upgrade

python wsgi.py        # runs on http://localhost:5000
```

## Deploying to Google Cloud Run + Cloud SQL (Postgres)

This assumes: Flask API on **Cloud Run**, database on **Cloud SQL for
PostgreSQL**, and (optionally) **Cloudflare** sitting in front of the Cloud
Run URL purely for DNS/CDN/proxying — Cloudflare itself can't run a Flask/WSGI
app or host managed Postgres, so the actual compute + database live on GCP.

### 1. Create the Cloud SQL Postgres instance

```bash
gcloud sql instances create portfolio-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=us-central1

gcloud sql databases create portfolio --instance=portfolio-db

gcloud sql users create portfolio-user \
  --instance=portfolio-db \
  --password=CHOOSE_A_STRONG_PASSWORD
```

Note the connection name shown in the output, e.g.
`your-project:us-central1:portfolio-db`.

### 2. Build and push the container

```bash
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/portfolio-api
```

### 3. Deploy to Cloud Run, attached to Cloud SQL

```bash
gcloud run deploy portfolio-api \
  --image gcr.io/YOUR_PROJECT_ID/portfolio-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances YOUR_PROJECT_ID:us-central1:portfolio-db \
  --set-env-vars "DATABASE_URL=postgresql://portfolio-user:CHOOSE_A_STRONG_PASSWORD@/portfolio?host=/cloudsql/YOUR_PROJECT_ID:us-central1:portfolio-db" \
  --set-env-vars "ALLOWED_ORIGINS=https://your-app.vercel.app"
```

Cloud Run gives you a URL like `https://portfolio-api-xxxxx-uc.a.run.app` —
put that in the frontend's `VITE_API_URL`.

### 4. Run migrations against the deployed database

Easiest path: run migrations locally through the Cloud SQL Auth Proxy, or
add a one-off Cloud Run job that runs `flask db upgrade` before first use.

```bash
# in another terminal
cloud-sql-proxy YOUR_PROJECT_ID:us-central1:portfolio-db &

DATABASE_URL=postgresql://portfolio-user:CHOOSE_A_STRONG_PASSWORD@127.0.0.1:5432/portfolio \
  flask db upgrade
```

### 5. (Optional) Put Cloudflare in front

Point a CNAME at the Cloud Run URL through Cloudflare (proxied, orange
cloud), which gets you a custom domain, TLS and caching without changing any
app code. Update `ALLOWED_ORIGINS` and the frontend's `VITE_API_URL` to that
custom domain once it's set up.

## Alternative: any other Postgres provider

The app only needs a standard `DATABASE_URL` connection string, so it works
unmodified against Supabase, Neon, Railway, RDS, or Cloudflare Hyperdrive
pointed at any of those — swap the value and redeploy.
