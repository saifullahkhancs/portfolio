# Frontend — React + Vite

## Local development

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your Flask backend (http://localhost:8000)
npm run dev             # http://localhost:5173  (frontend), backend on 8000
```

- Frontend dev server: **http://localhost:6175**
- Backend API: **http://localhost:5175**

If port 6175 is busy, Vite will fallback if `strictPort` is false, but config sets `strictPort: true` so free the port.

## Deploying to Vercel

### Option A — CLI

```bash
npm install -g vercel
vercel                  # first deploy, follow prompts
vercel env add VITE_API_URL production   # paste your Cloud Run URL
vercel --prod
```

### Option B — Dashboard

1. Push this repo to GitHub
2. Import the `frontend/` directory as a new Vercel project (set **Root Directory** to `frontend` if the repo contains both `frontend/` and `backend/`)
3. Framework preset: **Vite**
4. Add an environment variable: `VITE_API_URL` = your deployed Flask API URL
   (e.g. `https://portfolio-api-xxxxx-uc.a.run.app`)
5. Deploy

`vercel.json` is already set up to rewrite all routes to `index.html` so
client-side routing (`/experience`, `/projects`, `/contact`) works on page
refresh/direct links.

## Custom domain via Cloudflare

If your domain's DNS is on Cloudflare, add a CNAME record pointing at the
Vercel-provided domain (`cname.vercel-dns.com`), then add the custom domain
in the Vercel project settings. Keep the Cloudflare proxy (orange cloud) off
initially until Vercel confirms the domain, then you can turn it back on.
