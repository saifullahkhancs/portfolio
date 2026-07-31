import logging
import os
import time

from dotenv import load_dotenv
from flask_cors import CORS
from flask import Flask, g, request

from .extensions import db, migrate

# Load env vars *before* reading os.environ so that DATABASE_URL,
# ALLOWED_ORIGINS, SECRET_KEY etc. from .env files actually take effect
# (gunicorn / `python wsgi.py` don't load .env on their own).
# backend/.env wins if both exist; the repo-root .env is the fallback.
_BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(os.path.join(".env"))

_DEFAULT_ORIGINS = "http://localhost:5173"


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
    # Basic logging setup
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[
            logging.StreamHandler(),
        ],
    )

    app = Flask(__name__)

    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        raise ValueError(
            "DATABASE_URL is not set. Please set it in your .env file (e.g., 'sqlite:///dev.db' or 'postgresql://...')."
        )

    app.config["SQLALCHEMY_DATABASE_URI"] = _normalize_db_url(db_url)
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    # Set to True to see all SQL queries in the log. Very useful for debugging.
    # Can be controlled by an environment variable.
    app.config["SQLALCHEMY_ECHO"] = os.environ.get("SQLALCHEMY_ECHO", "false").lower() in ("true", "1")

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

    # Add request timing logs
    @app.before_request
    def start_timer():
        g.start_time = time.monotonic()
        app.logger.info(f"Request: {request.method} {request.path} from {request.remote_addr}")

    @app.after_request
    def log_request(response):
        if "start_time" in g:
            duration = time.monotonic() - g.start_time
            app.logger.info(
                f"Response: {response.status_code} in {duration:.4f}s for {request.method} {request.path}"
            )
        return response
    return app


def _normalize_db_url(url: str | None) -> str:
    """
    Ensure the database URL is in the correct format for SQLAlchemy.
    - Replaces `postgres://` with `postgresql+psycopg://` to use the installed `psycopg` v3 driver.
    - This avoids the `ModuleNotFoundError: No module named 'psycopg2'` error.
    """
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    # The raw psycopg driver also uses postgresql://, so we need to handle that too
    # for cases where the user might provide it directly.
    if url.startswith("postgresql://") and not url.startswith("postgresql+psycopg://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url
