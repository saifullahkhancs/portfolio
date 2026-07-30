import os

from flask import Flask
from flask_cors import CORS

from .extensions import db, migrate


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

    # Comma separated list of allowed frontend origins, e.g.
    # "https://your-app.vercel.app,https://yourdomain.com"
    allowed_origins = [
        origin.strip()
        for origin in os.environ.get("ALLOWED_ORIGINS", "http://localhost:6175,http://localhost:5175,http://localhost:5173").split(",")
        if origin.strip()
    ]
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

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
