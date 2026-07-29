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

    # Comma separated list of allowed frontend origins, e.g.
    # "https://your-app.vercel.app,https://yourdomain.com"
    allowed_origins = [
        origin.strip()
        for origin in os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    db.init_app(app)
    migrate.init_app(app, db)

    from .routes.contact import contact_bp
    from .routes.health import health_bp
    from .routes.auth import auth_bp
    from .routes.admin import admin_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)

    return app


def _normalize_db_url(url: str) -> str:
    """Google Cloud SQL / some providers give postgres:// — SQLAlchemy needs postgresql://"""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url
