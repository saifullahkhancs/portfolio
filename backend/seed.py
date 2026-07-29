"""
Seed all portfolio tables in one go from resume data.

Usage:
    python seed.py
    python seed.py --reset  # wipe and reseed

It reads DATABASE_URL from env, defaults to sqlite:///dev.db
If you use Supabase, set DATABASE_URL accordingly before running.
"""

import os
import sys

# ensure app package discoverable
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from app.extensions import db
from app.models import Profile, Experience, Project, SkillGroup, Education, Certification

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

SKILLS = [
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

CERTS = [
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


def seed(reset=False):
    app = create_app()
    with app.app_context():
        print(f"Using DB: {app.config['SQLALCHEMY_DATABASE_URI'][:80]}...")
        db.create_all()
        if reset:
            print("Resetting: deleting existing portfolio data...")
            db.session.query(Certification).delete()
            db.session.query(Education).delete()
            db.session.query(SkillGroup).delete()
            db.session.query(Project).delete()
            db.session.query(Experience).delete()
            db.session.query(Profile).delete()
            db.session.commit()

        # avoid duplicate if already seeded and not reset
        if not reset and Profile.query.first():
            print("Data already exists. Use --reset to wipe and reseed.")
            return

        print("Seeding profile (user_info)...")
        profile = Profile(**PROFILE_DATA)
        db.session.add(profile)

        print("Seeding experiences...")
        for e in EXPERIENCES:
            db.session.add(Experience(**e))

        print("Seeding projects...")
        for p in PROJECTS:
            db.session.add(Project(**p))

        print("Seeding skill groups...")
        for s in SKILLS:
            db.session.add(SkillGroup(group_name=s["group"], items=s["items"], sort_order=s["sort_order"]))

        print("Seeding education...")
        for edu in EDUCATION:
            db.session.add(Education(**edu))

        print("Seeding certifications...")
        for c in CERTS:
            db.session.add(Certification(**c))

        db.session.commit()
        print("\n=== Seed complete ===")
        print(f"Profile: {Profile.query.count()}")
        print(f"Experiences: {Experience.query.count()}")
        print(f"Projects: {Project.query.count()}")
        print(f"SkillGroups: {SkillGroup.query.count()}")
        print(f"Educations: {Education.query.count()}")
        print(f"Certifications: {Certification.query.count()}")
        print("\nTables now exist in your DB and are ready for dashboard CRUD.")
        print("Dashboard can edit via /api/* endpoints with auth token.")


if __name__ == "__main__":
    reset = "--reset" in sys.argv
    seed(reset=reset)
