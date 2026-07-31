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
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = _engine_options(
        app.config["SQLALCHEMY_DATABASE_URI"]
    )
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
        except Exception as exc:  # noqa: BLE001 - startup must not hard-fail
            # Don't crash on startup if the DB isn't reachable, but do say so —
            # silently swallowing this turns a config problem into a mystery
            # "connection timeout expired" on the first API request.
            app.logger.warning(
                "Could not reach the database at startup (%s: %s). "
                "Check DATABASE_URL. Supabase note: the direct host "
                "db.<ref>.supabase.co is IPv6-only and times out on IPv4-only "
                "networks — use the session pooler host "
                "aws-0-<region>.pooler.supabase.com instead. "
                "Run `python check_db.py` to diagnose.",
                type(exc).__name__,
                exc,
            )

    return app


def _engine_options(url: str) -> dict:
    """Connection-pool settings that keep managed Postgres connections healthy.

    - ``connect_timeout`` makes an unreachable host fail in seconds instead of
      hanging until the driver's default timeout.
    - ``pool_pre_ping`` discards connections that a pooler/idle-timeout killed,
      which otherwise surface as random OperationalErrors.
    - ``pool_recycle`` stays under Supabase/PgBouncer idle limits.
    """
    if not url.startswith("postgresql"):
        return {}
    options: dict = {
        "pool_pre_ping": True,
        "pool_recycle": int(os.environ.get("DB_POOL_RECYCLE", "280")),
        "pool_size": int(os.environ.get("DB_POOL_SIZE", "5")),
        "max_overflow": int(os.environ.get("DB_MAX_OVERFLOW", "5")),
        "connect_args": {
            "connect_timeout": int(os.environ.get("DB_CONNECT_TIMEOUT", "10")),
        },
    }
    # Supabase's transaction pooler (port 6543) can't handle prepared
    # statements; psycopg needs them turned off there.
    if ":6543" in url and "prepare_threshold" not in url:
        options["connect_args"]["prepare_threshold"] = None
    return options


def _normalize_db_url(url: str) -> str:
    """Google Cloud SQL / some providers give postgres:// — SQLAlchemy needs postgresql://"""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url
