#!/usr/bin/env python3
"""
Generate frontend/src/data/fallback.ts straight from the database.

This is the bridge for the "edit locally, deploy statically" workflow:

    1. You edit content via the local dashboard (local backend + local DB).
    2. You run this script against that same DB.
    3. It snapshots the current DB rows into the single static data file
       (frontend/src/data/fallback.ts) that the deployed Vercel site uses.

Because it imports the Flask app and calls each model's `to_dict()` — the
exact same code path the live `GET /api/portfolio` uses — the generated file
is guaranteed to match the shape the frontend already understands. No manual
copy/paste, no drift.

Usage (run from the backend/ directory so the `app` package is importable):

    # local SQLite (after `python seed.py --reset`)
    DATABASE_URL=sqlite:///dev.db python export_fallback.py

    # Supabase / any Postgres
    DATABASE_URL=postgresql://postgres:PASS@db.supabase.co:5432/postgres \\
        python export_fallback.py

    # preview to stdout instead of writing the file
    DATABASE_URL=sqlite:///dev.db python export_fallback.py --dry-run

Options:
    -o, --output PATH   Target file (default: ../frontend/src/data/fallback.ts)
    -d, --database-url  Database URL (default: $DATABASE_URL env var)
        --dry-run       Print the generated TypeScript to stdout, write nothing

Env:
    DATABASE_URL   required if --database-url is not passed
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone

# Make the `app` package importable when run as `python export_fallback.py`
# from inside backend/.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Backend-only timestamp fields the frontend never reads. Stripping them keeps
# the generated file identical in shape to the hand-written fallback.ts.
_STRIP_KEYS = {"created_at", "updated_at"}

# Values that would break on a deployed static site (no backend to serve them).
_LOCALHOST_HINTS = ("localhost", "127.0.0.1", "0.0.0.0")


def _repo_root() -> str:
    # This file lives at <repo>/backend/export_fallback.py
    return os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def _default_output() -> str:
    return os.path.join(_repo_root(), "frontend", "src", "data", "fallback.ts")


def _fix_localhost_urls(obj) -> None:
    """Replace localhost upload URLs with public /images/ paths when the file exists."""
    public_images_dir = os.path.join(_repo_root(), "frontend", "public", "images")
    public_files = {}
    if os.path.isdir(public_images_dir):
        for entry in os.listdir(public_images_dir):
            if os.path.isfile(os.path.join(public_images_dir, entry)):
                # Index both full name and stem (without extension)
                public_files[entry.lower()] = f"/images/{entry}"
                stem = os.path.splitext(entry)[0].lower()
                public_files.setdefault(stem, f"/images/{entry}")

    def _replace_url(url: str) -> str:
        if not isinstance(url, str) or not url.startswith("http"):
            return url
        if not any(h in url for h in _LOCALHOST_HINTS):
            return url
        basename = os.path.basename(url)
        if basename.lower() in public_files:
            return public_files[basename.lower()]
        stem = os.path.splitext(basename)[0].lower()
        for key, value in public_files.items():
            if stem.endswith(key) or key in stem:
                return value
        for public_name, value in public_files.items():
            public_stem = os.path.splitext(public_name)[0].lower()
            if public_stem in basename.lower() and basename.lower() != public_name.lower():
                return value
        return url

    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, str):
                obj[k] = _replace_url(v)
            elif isinstance(v, (dict, list)):
                _fix_localhost_urls(v)
    elif isinstance(obj, list):
        for item in obj:
            _fix_localhost_urls(item)


def _clean(obj):
    """Return a JSON-clean copy with backend-only timestamp keys removed."""
    if isinstance(obj, dict):
        return {k: _clean(v) for k, v in obj.items() if k not in _STRIP_KEYS}
    if isinstance(obj, list):
        return [_clean(v) for v in obj]
    return obj


def _to_json_literal(value) -> str:
    """json.dumps output is a valid TS object/array literal (JSON ⊂ JS)."""
    return json.dumps(value, indent=2, ensure_ascii=False)


def load_portfolio_snapshot(database_url: str) -> dict:
    """Import the Flask app and read every portfolio table via to_dict()."""
    os.environ["DATABASE_URL"] = database_url

    from app import create_app
    from app.extensions import db
    from app.models import (
        Profile,
        Experience,
        Project,
        SkillGroup,
        Education,
        Certification,
    )

    app = create_app()
    with app.app_context():
        profile = Profile.query.order_by(Profile.id).first()
        experiences = (
            Experience.query.order_by(Experience.sort_order, Experience.id).all()
        )
        projects = Project.query.order_by(Project.sort_order, Project.id).all()
        skill_groups = (
            SkillGroup.query.order_by(SkillGroup.sort_order, SkillGroup.id).all()
        )
        educations = (
            Education.query.order_by(Education.sort_order, Education.id).all()
        )
        certifications = (
            Certification.query.order_by(Certification.sort_order, Certification.id).all()
        )

        return {
            "profile": profile.to_dict() if profile else None,
            "experiences": [e.to_dict() for e in experiences],
            "projects": [p.to_dict() for p in projects],
            "skill_groups": [s.to_dict() for s in skill_groups],
            "skills": [s.to_dict() for s in skill_groups],  # alias, matches /api/portfolio
            "educations": [e.to_dict() for e in educations],
            "education": educations[0].to_dict() if educations else None,
            "certifications": [c.to_dict() for c in certifications],
        }


def _collect_localhost_urls(snapshot: dict) -> list[str]:
    """Find URLs in the snapshot that won't resolve on a deployed static site."""
    hits = []

    def walk(node):
        if isinstance(node, dict):
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)
        elif isinstance(node, str) and node.startswith("http"):
            if any(h in node for h in _LOCALHOST_HINTS):
                hits.append(node)

    walk(snapshot)
    # de-dup, preserve order
    return list(dict.fromkeys(hits))


HEADER_COMMENT = """/**
 * ⚠️  AUTO-GENERATED by backend/export_fallback.py — DO NOT EDIT BY HAND.
 *
 * Generated: {ts}
 * Source DB:  {db}
 *
 * This file is the SINGLE SOURCE OF TRUTH for the deployed (static) site.
 * Workflow:
 *   1. Edit content via the local dashboard (local backend + local DB).
 *   2. Re-run `DATABASE_URL=... python backend/export_fallback.py`.
 *   3. Commit this file and redeploy the frontend (Vercel).
 *
 * Regenerate after any dashboard edit so the static site stays in sync.
 */

import type {{ PortfolioData }} from "@/lib/api";

export const fallbackProfile = {profile};

export const fallbackExperiences = {experiences};

export const fallbackProjects = {projects};

export const fallbackSkills = {skills};

export const fallbackEducations = {educations};

export const fallbackCertifications = {certifications};

export const fallbackPortfolio: PortfolioData = {{
  profile: fallbackProfile as any,
  experiences: fallbackExperiences as any,
  projects: fallbackProjects as any,
  skill_groups: fallbackSkills as any,
  skills: fallbackSkills as any,
  educations: fallbackEducations as any,
  education: (fallbackEducations[0] || null) as any,
  certifications: fallbackCertifications as any,
}};
"""


def render(snapshot: dict, database_url: str) -> str:
    clean = _clean(snapshot)
    # Display-safe DB string: hide the password if present.
    db_display = database_url
    if "@" in db_display and "://" in db_display:
        scheme, rest = db_display.split("://", 1)
        if ":" in rest.split("@", 1)[0]:
            creds, host = rest.split("@", 1)
            user = creds.split(":", 1)[0]
            db_display = f"{scheme}://{user}:***@{host}"

    return HEADER_COMMENT.format(
        ts=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        db=db_display,
        profile=_to_json_literal(clean["profile"]),
        experiences=_to_json_literal(clean["experiences"]),
        projects=_to_json_literal(clean["projects"]),
        skills=_to_json_literal(clean["skill_groups"]),
        educations=_to_json_literal(clean["educations"]),
        certifications=_to_json_literal(clean["certifications"]),
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate frontend/src/data/fallback.ts from the database.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "-o", "--output",
        default=_default_output(),
        help=f"Target .ts file (default: {_default_output()})",
    )
    parser.add_argument(
        "-d", "--database-url",
        default=os.environ.get("DATABASE_URL"),
        help="Database URL (default: $DATABASE_URL env var)",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Print the generated TypeScript to stdout; write nothing.",
    )
    args = parser.parse_args()

    if not args.database_url:
        parser.error(
            "DATABASE_URL is required. Pass --database-url or set the DATABASE_URL env var."
        )

    print(f"Reading from DB: {args.database_url}", file=sys.stderr)
    snapshot = load_portfolio_snapshot(args.database_url)
    # Fix any localhost URLs by mapping them to public /images/ paths.
    _fix_localhost_urls(snapshot)

    counts = {
        "profile": 1 if snapshot["profile"] else 0,
        "experiences": len(snapshot["experiences"]),
        "projects": len(snapshot["projects"]),
        "skill_groups": len(snapshot["skill_groups"]),
        "educations": len(snapshot["educations"]),
        "certifications": len(snapshot["certifications"]),
    }
    print(f"Snapshot rows: {counts}", file=sys.stderr)

    localhost_urls = _collect_localhost_urls(snapshot)
    if localhost_urls:
        print("\n⚠️  WARNING: the DB contains local/private URLs that will NOT work "
              "on the deployed static site (no backend to serve them):", file=sys.stderr)
        for url in localhost_urls:
            print(f"   - {url}", file=sys.stderr)
        print("Replace them with public absolute URLs (e.g. hosted images) before "
              "deploying, then re-run this script.\n", file=sys.stderr)

    output = render(snapshot, args.database_url)

    if args.dry_run:
        print(output)
        return 0

    out_path = os.path.abspath(args.output)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(output)
        if not output.endswith("\n"):
            f.write("\n")
    print(f"✅ Wrote {out_path}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
