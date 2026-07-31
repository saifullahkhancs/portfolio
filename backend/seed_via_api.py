#!/usr/bin/env python3
"""
Seed the portfolio database through the REST API.

Unlike ``seed.py`` (which writes rows directly with SQLAlchemy), this script
talks to a *running* backend over HTTP: it logs in, then POST/PUTs every
portfolio value through the same ``/api/*`` endpoints the dashboard uses.
That means it works against local or deployed APIs (Cloud Run, Supabase-backed,
etc.) without needing database credentials — only the admin login.

Usage:
    python seed_via_api.py --email admin@example.com --password secret
    python seed_via_api.py --api-url https://your-api.com --email a@b.com --password secret --reset

Options can also come from environment variables:
    API_URL           (default: http://localhost:5175 — matches wsgi.py)
    ADMIN_EMAIL       dashboard/admin login email (see create_admin.py)
    ADMIN_PASSWORD    dashboard/admin login password
    TOKEN             existing Bearer token (skips the login call)

The values below mirror seed.py / frontend/src/data/portfolio.ts — the content
rendered by the portfolio site (profile, experiences, projects, skill groups,
education, certifications). Pure standard library: runs anywhere Python does,
no pip install required.

Behaviour:
    * If the database already has portfolio data, the script aborts and tells
      you to pass --reset (same contract as seed.py) so it never duplicates.
    * --reset first deletes every existing row (via the DELETE endpoints),
      then re-posts everything.
    * The profile is a singleton: it is always upserted with PUT /api/profile.
"""

import argparse
import getpass
import json
import os
import sys
import urllib.error
import urllib.request

# ---------------------------------------------------------------------------
# Values used by the portfolio (kept in sync with seed.py / frontend data)
# ---------------------------------------------------------------------------

ASSET_HOST = "https://saif-portofolio.lovable.app"
ASSETS = {
    "heroBanner": f"{ASSET_HOST}/__l5e/assets-v1/f21d14cc-ba6a-4abe-b699-4f4e323f56a2/hero-banner.png",
    "portrait": f"{ASSET_HOST}/__l5e/assets-v1/728ff80c-dbea-4bb8-b824-f88615386187/saifullah-portrait.jpeg",
    "resume": f"{ASSET_HOST}/__l5e/assets-v1/6d656b6e-0513-40c3-a30a-03fc6c99c836/Saifullah_Khan_Resume.pdf",
    "certAzure": f"{ASSET_HOST}/__l5e/assets-v1/66495578-9a67-4d94-aabf-ac2cc3472fec/cert-azure.png",
    "certHackerrank": f"{ASSET_HOST}/__l5e/assets-v1/dca8e020-cad0-4cd9-970f-5f290ab7e18c/cert-hackerrank.png",
    "certJavascript": f"{ASSET_HOST}/__l5e/assets-v1/81ff7ef3-a02d-49d3-98ec-73e43dac5c87/cert-javascript.jpg",
}

PROFILE_DATA = {
    "name": "Saifullah Khan",
    "title": "Software Engineer | Full Stack Developer",
    "description": "Full Stack Developer with professional experience building web applications, REST APIs, and data-driven systems using Python, .NET, JavaScript and React. Experienced in backend development with Flask, FastAPI, Django, ASP.NET and microservice-based architectures — API design, authentication and authorization (JWT, RBAC), database design, and integrating frontend applications with backend services across MySQL, PostgreSQL, MongoDB, Elasticsearch, Neo4j and Kafka.",
    "email": "saifullahkhank66@gmail.com",
    "phone": "03007117755",
    "location": "Lahore, Pakistan",
    "linkedin": "https://linkedin.com/in/saifullah-khan",
    "github": "https://github.com/saifullahkhancs",
    "profile_image_url": ASSETS["portrait"],
    "hero_banner_url": ASSETS["heroBanner"],
    "resume_url": ASSETS["resume"],
}

EXPERIENCES = [
    {
        "role": "Software Engineer",
        "company": "Technogenics",
        "location": "Lahore, Pakistan",
        "period": "Aug 2024 – Jan 2026",
        "points": [
            "Developed and maintained Python backend services and RESTful APIs using Flask and FastAPI within a microservice-based architecture.",
            "Maintained a CMS built on Django REST Framework and React, backed by MongoDB and Neo4j, managing data spanning millions of URLs, IPs and domains plus thousands of ransomware, malware and threat-actor records.",
            "Built REST APIs, GraphQL endpoints and Kafka consumer pipelines for automated ingestion across 4 databases (MySQL, MongoDB, Elasticsearch, Neo4j).",
            "Developed and customized Scrapy crawlers running weekly to collect and process PSIRT advisory data for the intel system.",
            "Worked with Docker-based development environments for building, running and debugging backend services.",
        ],
        "sort_order": 0,
    },
    {
        "role": "Associate Software Engineer",
        "company": "DSME Global Links",
        "location": "Lahore, Pakistan",
        "period": "Oct 2023 – Aug 2024",
        "points": [
            "Developed and maintained backend web and mobile applications using ASP.NET, C# and MySQL.",
            "Contributed to workflow-driven features including scheduling, reporting, booking and user management modules.",
            "Performed API testing and validation using Postman and custom Python scripts.",
            "Collaborated directly with clients to translate business needs into technical solutions.",
        ],
        "sort_order": 1,
    },
    {
        "role": "Research Engineer",
        "company": "Valyrian System Incorporation",
        "location": "Remote",
        "period": "Aug 2022 – Aug 2023",
        "points": [
            "Conducted research on high-performance packet processing using XDP and DPDK in Linux environments.",
            "Evaluated network performance and throughput using iperf, TRex and mpstat.",
            "Participated in experiments demonstrating packet filtering and rerouting at multi-million packet throughput.",
            "Studied Linux networking internals and system performance optimization techniques.",
        ],
        "sort_order": 2,
    },
]

# Note: POST /api/projects currently stores name, tagline, period, description,
# stack, project_url and video_url. "featured" / "sort_order" are kept here for
# parity with seed.py; the endpoint ignores unknown fields, and rows are
# returned in creation order, so posting in list order preserves display order.
PROJECTS = [
    {
        "name": "LinkeFlow",
        "tagline": "LinkedIn Automation Platform",
        "period": "May 2026 – Present",
        "description": "Backend automation platform that schedules and executes LinkedIn actions with human-mimicking browser behavior and per-account rate limiting. JWT auth with RBAC, AES-256-GCM credential encryption and a Redis-backed daily action limiter. Deployed on an Azure VM with Nginx and systemd.",
        "stack": ["FastAPI", "Celery", "Redis", "PostgreSQL", "Playwright", "Azure"],
        "project_url": "",
        "video_url": "",
        "sort_order": 0,
        "featured": True,
    },
    {
        "name": "Job Easy",
        "tagline": "Job Application Automation Platform",
        "period": "Personal Project",
        "description": "Job-application automation platform with a FastAPI backend and React/Vite frontend. SQLAlchemy and Alembic for data modeling and migrations, JWT-based auth and a role-based approval workflow (visitor → customer → admin) gating email-sending features with encrypted credential storage.",
        "stack": ["FastAPI", "React", "SQLAlchemy", "Alembic", "JWT"],
        "project_url": "",
        "video_url": "",
        "sort_order": 1,
        "featured": True,
    },
    {
        "name": "Strike Ready",
        "tagline": "Cybersecurity Intelligence Platform",
        "period": "Technogenics",
        "description": "Contributed to backend services and data ingestion workflows. Managed ingestion from crawler systems, multiple databases and research sources into Elasticsearch and Neo4j, maintaining pipelines across several microservices.",
        "stack": ["Python", "Elasticsearch", "Neo4j", "Kafka", "Scrapy"],
        "project_url": "",
        "video_url": "",
        "sort_order": 2,
        "featured": False,
    },
    {
        "name": "OOMS",
        "tagline": "Online Order Management System",
        "period": "Mar 2026 – Apr 2026",
        "description": "Scalable architecture for an online food ordering system using .NET 10 and Clean Architecture, with authentication, authorization and role-based access control for user permissions.",
        "stack": [".NET 10", "Clean Architecture", "RBAC"],
        "project_url": "",
        "video_url": "",
        "sort_order": 3,
        "featured": False,
    },
    {
        "name": "Social Media Platform",
        "tagline": "Twitter Clone",
        "period": "Personal Project",
        "description": "Twitter-like web application with user authentication, tweets, likes, sharing and follow functionality, plus clean UI layouts and lightweight animations.",
        "stack": ["Flask", "JavaScript", "MySQL"],
        "project_url": "",
        "video_url": "",
        "sort_order": 4,
        "featured": False,
    },
]

SKILL_GROUPS = [
    {"group": "Programming Languages", "items": ["Python", "C#", "JavaScript"], "sort_order": 0},
    {"group": "Backend Frameworks", "items": ["Flask", "FastAPI", "Django", "Django REST Framework", "Scrapy", "ASP.NET Core"], "sort_order": 1},
    {"group": "Databases", "items": ["MySQL", "PostgreSQL", "MongoDB", "Elasticsearch", "Neo4j", "Redis"], "sort_order": 2},
    {"group": "Messaging & Realtime", "items": ["Kafka"], "sort_order": 3},
    {"group": "Frontend", "items": ["React", "HTML/CSS"], "sort_order": 4},
    {"group": "Architecture", "items": ["Microservices", "Clean Architecture", "MVC", "MVT"], "sort_order": 5},
    {"group": "Auth & Security", "items": ["JWT", "Role-Based Access Control", "API Security", "Rate Limiting"], "sort_order": 6},
    {"group": "Familiar With", "items": ["Docker", "Kubernetes", "Azure", "Playwright", "Celery"], "sort_order": 7},
]

EDUCATION = [
    {
        "school": "Namal University, Mianwali",
        "degree": "Bachelor of Computer Science",
        "period": "Jul 2019 – Jul 2023",
        "cgpa": "3.42 / 4.0",
        "coursework": "Artificial Intelligence, Machine Learning, Database Management, Software Engineering, Computer Networks, Operating Systems, Data Analysis, Human Computer Interaction",
        "sort_order": 0,
    }
]

CERTIFICATIONS = [
    {
        "name": "Software Engineer",
        "issuer": "HackerRank",
        "year": "14 Jul 2026",
        "detail": "Passed the HackerRank Software Engineer role certification test (ID 9E9A5564F2E7).",
        "image_url": ASSETS["certHackerrank"],
        "image_key": "hackerrank",
        "sort_order": 0,
    },
    {
        "name": "Introduction to JavaScript",
        "issuer": "Sololearn",
        "year": "20 Jul 2026",
        "detail": "Course certificate CC-C9GOLPIL — theoretical and practical understanding of JavaScript.",
        "image_url": ASSETS["certJavascript"],
        "image_key": "javascript",
        "sort_order": 1,
    },
    {
        "name": "Introduction to Cloud Infrastructure: Describe cloud concepts",
        "issuer": "Microsoft",
        "year": "10 Jun 2026",
        "detail": "Azure cloud fundamentals — core cloud concepts and infrastructure services.",
        "image_url": ASSETS["certAzure"],
        "image_key": "azure",
        "sort_order": 2,
    },
]

# (label, list endpoint, items) in creation order
SECTIONS = [
    ("experiences", "/api/experiences", EXPERIENCES),
    ("projects", "/api/projects", PROJECTS),
    ("skill groups", "/api/skill-groups", SKILL_GROUPS),
    ("education", "/api/educations", EDUCATION),
    ("certifications", "/api/certifications", CERTIFICATIONS),
]

# ---------------------------------------------------------------------------
# Tiny HTTP client (stdlib only)
# ---------------------------------------------------------------------------


class ApiError(RuntimeError):
    pass


def http(method, url, payload=None, token=None):
    headers = {"Accept": "application/json"}
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            body = res.read()
            return res.status, (json.loads(body) if body else None)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", "replace")
        try:
            message = json.loads(raw).get("message", raw)
        except ValueError:
            message = raw or exc.reason
        raise ApiError(f"{method} {url} -> HTTP {exc.code}: {message}") from None
    except urllib.error.URLError as exc:
        raise ApiError(
            f"Cannot reach {url} ({exc.reason}). Is the backend running? "
            "Start it with `python wsgi.py` or pass --api-url."
        ) from None


def wipe(base_url, token):
    """Delete every existing row through the DELETE endpoints."""
    print("Resetting: deleting existing portfolio data via API...")
    deleted = 0
    for _, path, _ in reversed(SECTIONS):
        _, items = http("GET", base_url + path, token=token)
        for item in items or []:
            http("DELETE", f"{base_url}{path}/{item['id']}", token=token)
            deleted += 1
    _, profiles = http("GET", f"{base_url}/api/profiles", token=token)
    for profile in profiles or []:
        http("DELETE", f"{base_url}/api/profiles/{profile['id']}", token=token)
        deleted += 1
    print(f"  removed {deleted} existing row(s)")


def seed_via_api(base_url, token):
    print("Upserting profile (PUT /api/profile)...")
    http("PUT", f"{base_url}/api/profile", PROFILE_DATA, token=token)
    created = {"profile": 1}

    for label, path, items in SECTIONS:
        print(f"Posting {len(items)} {label}...")
        for item in items:
            http("POST", base_url + path, item, token=token)
        created[label] = len(items)
    return created


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def main():
    parser = argparse.ArgumentParser(
        description="Seed all portfolio tables through the running REST API (login + POST/PUT via /api/*).",
    )
    parser.add_argument(
        "--api-url",
        default=os.environ.get("API_URL", "http://localhost:8000"),
        help="Base URL of the backend (env: API_URL, default: http://localhost:8000)",
    )
    parser.add_argument("--email", default=os.environ.get("ADMIN_EMAIL"), help="Admin email (env: ADMIN_EMAIL)")
    parser.add_argument("--password", default=os.environ.get("ADMIN_PASSWORD"), help="Admin password (env: ADMIN_PASSWORD)")
    parser.add_argument("--token", default=os.environ.get("TOKEN"), help="Existing Bearer token — skips login (env: TOKEN)")
    parser.add_argument("--reset", action="store_true", help="Delete all existing portfolio data via the API first, then reseed")
    args = parser.parse_args()

    base_url = args.api_url.rstrip("/")
    print(f"Target API: {base_url}")

    token = args.token
    if not token:
        email = args.email or input("Admin email: ").strip()
        password = args.password or getpass.getpass("Admin password: ")
        print("Logging in (POST /api/auth/login)...")
        _, data = http("POST", f"{base_url}/api/auth/login", {"email": email, "password": password})
        token = (data or {}).get("token")
        if not token:
            raise ApiError("Login succeeded but no token was returned.")

    try:
        # Same guard as seed.py: refuse to double-seed unless --reset.
        if args.reset:
            wipe(base_url, token)
        else:
            _, current = http("GET", f"{base_url}/api/portfolio")
            existing = sum(
                len(current.get(key) or [])
                for key in ("experiences", "projects", "skill_groups", "educations", "certifications")
            ) + (1 if current.get("profile") else 0)
            if existing:
                print(
                    "\nData already exists in the database. Nothing was changed.\n"
                    "Re-run with --reset to wipe via the API and reseed."
                )
                return 1

        created = seed_via_api(base_url, token)

        _, final = http("GET", f"{base_url}/api/portfolio")
        print("\n=== Seed via API complete — database now holds: ===")
        print(f"Profile:        {1 if final.get('profile') else 0}")
        print(f"Experiences:    {len(final.get('experiences') or [])}")
        print(f"Projects:       {len(final.get('projects') or [])}")
        print(f"Skill groups:   {len(final.get('skill_groups') or [])}")
        print(f"Educations:     {len(final.get('educations') or [])}")
        print(f"Certifications: {len(final.get('certifications') or [])}")
        print(f"\n{sum(created.values())} record(s) pushed through the API. The portfolio site will now serve them live.")
        return 0
    finally:
        pass


if __name__ == "__main__":
    try:
        sys.exit(main())
    except ApiError as exc:
        print(f"\nError: {exc}", file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        sys.exit(130)
