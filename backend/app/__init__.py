import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from .extensions import db, migrate

# Load env vars *before* reading os.environ so that DATABASE_URL,
# ALLOWED_ORIGINS, SECRET_KEY etc. from .env files actually take effect
# (gunicorn / `python wsgi.py` don't load .env on their own).
# backend/.env wins if both exist; the repo-root .env is the fallback.
_BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(os.path.join(_BACKEND_DIR, ".env"))
load_dotenv(os.path.join(_BACKEND_DIR, "..", ".env"))

_DEFAULT_ORIGINS = "http://localhost:6175,http://localhost:5175,http://localhost:5173"


def _cors_origins() -> str | list[str]:
    """Resolve the ALLOWED_ORIGINS env var.

    Comma-separated list of frontend origins (scheme + host + port, no path),
    e.g. "https://your-app.vercel.app,https://yourdomain.com".
    Use "*" (or "all") to allow every origin — handy for testing from other
    devices on the LAN; keep it restricted in production.
    """
    raw = os.environ.get("ALLOWED_ORIGINS", "").strip()
    if raw.lower() in ("*", "all"):
        return "*"
    origins = [
        origin.strip().rstrip("/")  # a trailing slash would never match
        for origin in (raw or _DEFAULT_ORIGINS).split(",")
        if origin.strip()
    ]
    # dedupe, keep order
    return list(dict.fromkeys(origins))


def create_app(config_object: str | None = None) -> Flask:
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = _normalize_db_url(
        os.environ.get("DATABASE_URL", "sqlite:///dev.db")
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "change-this-in-production")
    app.config["UPLOAD_FOLDER"] = os.environ.get(
        "UPLOAD_FOLDER", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
    )
    app.config["MAX_CONTENT_LENGTH"] = int(os.environ.get("MAX_UPLOAD_MB", "100")) * 1024 * 1024

    # CORS — every route the frontend touches: the JSON API (/api/*) and the
    # uploaded-media route (/uploads/*). Authorization is allowed so the
    # dashboard's Bearer token passes the preflight. Preflight responses are
    # cached by browsers for max_age seconds.
    origins = _cors_origins()
    CORS(
        app,
        resources={
            r"/api/*": {"origins": origins},
            r"/uploads/*": {"origins": origins},
        },
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        max_age=int(os.environ.get("CORS_MAX_AGE", "86400")),
    )

    db.init_app(app)
    migrate.init_app(app, db)

    from .routes.contact import contact_bp
    from .routes.health import health_bp
    from .routes.auth import auth_bp
    from .routes.admin import admin_bp
    from .routes.portfolio_data import portfolio_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(portfolio_bp)

    # Ensure tables visible even without migrations (useful for Supabase)
    # Will not overwrite existing tables
    with app.app_context():
        try:
            db.create_all()
        except Exception:
            # don't crash on startup if DB not reachable
            pass

    return app


def _normalize_db_url(url: str) -> str:
    """Google Cloud SQL / some providers give postgres:// — SQLAlchemy needs postgresql://"""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url
