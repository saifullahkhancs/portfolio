# Portfolio images

Drop your image/PDF files **here** (in `frontend/public/images/`). Vite serves the
`public/` folder at the site root, so a file named `portrait.png` becomes
`/images/portrait.png` — which is exactly what the portfolio data references.

## Expected files

| File                        | Used for                                         |
|-----------------------------|--------------------------------------------------|
| `portrait.png`              | Your portrait (ID card / profile photo)          |
| `hero-banner.png`           | Hero banner background on the home page          |
| `resume.pdf`                | Downloadable résumé                              |
| `cert-hackerrank.png`       | HackerRank certificate image                     |
| `cert-javascript.jpg`       | Sololearn JavaScript certificate image           |
| `cert-azure.png`            | Microsoft Azure certificate image                |

The filenames must match the table above (they're referenced from
`backend/seed.py` → the DB → `frontend/src/data/fallback.ts`).

## ⚠️ Important — they must be committed to git

- For **local** viewing (`npm run dev`): just having the files in this folder is enough.
- For the **deployed** site (Vercel): the files must be **committed to the repo**.
  Vercel only builds what's in git — files that exist only on your machine are
  not deployed. So after dropping them here:

  ```bash
  git add frontend/public/images/*
  git commit -m "Add portfolio images"
  ```

## Updating them later

1. Replace the file(s) in this folder (keep the same names).
2. If the content text also changed, edit via the local dashboard, then run
   `python backend/export_fallback.py` to refresh `fallback.ts`.
3. Commit the changed images (and `fallback.ts` if regenerated).
