#!/usr/bin/env bash
#
# Download the portfolio assets (portrait, hero banner, résumé PDF, certificate
# images) from the original Lovable asset host into frontend/public/images/.
#
# The deployed static site then serves these images locally — no external host
# dependency, and they work even if the original host disappears.
#
# Run ONCE from the repo root, then re-seed + regenerate the static data:
#
#     bash scripts/fetch_assets.sh
#     cd backend && source .venv/bin/activate
#     DATABASE_URL=sqlite:///dev.db python seed.py --reset
#     DATABASE_URL=sqlite:///dev.db python export_fallback.py
#
# Re-running is safe — existing files are overwritten.
#
set -euo pipefail

HOST="https://saif-portofolio.lovable.app"
OUT="frontend/public/images"
mkdir -p "$OUT"

# "source-path-on-host|local-filename"
declare -a ASSETS=(
  "f21d14cc-ba6a-4abe-b699-4f4e323f56a2/hero-banner.png|hero-banner.png"
  "728ff80c-dbea-4bb8-b824-f88615386187/saifullah-portrait.jpeg|portrait.jpeg"
  "6d656b6e-0513-40c3-a30a-03fc6c99c836/Saifullah_Khan_Resume.pdf|resume.pdf"
  "66495578-9a67-4d94-aabf-ac2cc3472fec/cert-azure.png|cert-azure.png"
  "dca8e020-cad0-4cd9-970f-5f290ab7e18c/cert-hackerrank.png|cert-hackerrank.png"
  "81ff7ef3-a02d-49d3-98ec-73e43dac5c87/cert-javascript.jpg|cert-javascript.jpg"
)

echo "Downloading portfolio assets into $OUT/ ..."
for entry in "${ASSETS[@]}"; do
  src="${entry%%|*}"
  dst="${entry##*|}"
  url="$HOST/__l5e/assets-v1/$src"
  echo "  ⬇  $dst"
  curl -fsSL --retry 3 -o "$OUT/$dst" "$url"
done

echo ""
echo "✅ Downloaded $(ls -1 "$OUT" | grep -v '^.gitkeep$' | wc -l) files into $OUT/"
ls -lh "$OUT" | grep -v '^.gitkeep$' || true
