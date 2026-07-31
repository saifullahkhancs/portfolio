from flask import Blueprint, jsonify, current_app
import os
import sqlalchemy as sa
from app.extensions import db

health_bp = Blueprint("health", __name__)


@health_bp.get("/api/health")
def health():
    """Basic liveness probe + helpful debug info for 'why data failing'."""
    db_status = "unknown"
    tables = []
    counts = {}
    error = None
    try:
        # quick connection test
        with db.engine.connect() as conn:
            conn.execute(sa.text("SELECT 1"))
        db_status = "connected"
        insp = sa.inspect(db.engine)
        tables = insp.get_table_names()
        # count key tables if they exist
        try:
            from app.models import Profile, Experience, Project, SkillGroup, Education, Certification

            counts = {
                "profiles": db.session.query(Profile).count(),
                "experiences": db.session.query(Experience).count(),
                "projects": db.session.query(Project).count(),
                "skill_groups": db.session.query(SkillGroup).count(),
                "educations": db.session.query(Education).count(),
                "certifications": db.session.query(Certification).count(),
            }
        except Exception as e:
            error = str(e)
    except Exception as exc:
        db_status = f"error: {exc}"
        error = str(exc)

    return jsonify(
        {
            "status": "ok",
            "db": db_status,
            "tables": tables,
            "counts": counts,
            "error": error,
            "database_url_prefix": (os.environ.get("DATABASE_URL") or "")[:60] + "...",
            "allowed_origins": os.environ.get("ALLOWED_ORIGINS", ""),
            "hint": "If counts are 0, run `python seed.py --reset` or `python seed_via_api.py --reset --email admin@example.com --password <pwd>`",
        }
    )


@health_bp.get("/api/debug/portfolio")
def debug_portfolio():
    """More verbose than /api/portfolio – shows exactly what would break frontend."""
    from app.models import Profile, Experience, Project, SkillGroup, Education, Certification

    try:
        profile = Profile.query.order_by(Profile.id).first()
        experiences = Experience.query.order_by(Experience.sort_order, Experience.id).all()
        projects = Project.query.order_by(Project.sort_order, Project.id).all()
        skill_groups = SkillGroup.query.order_by(SkillGroup.sort_order, SkillGroup.id).all()
        educations = Education.query.order_by(Education.sort_order, Education.id).all()
        certifications = Certification.query.order_by(Certification.sort_order, Certification.id).all()

        return jsonify(
            {
                "profile_exists": profile is not None,
                "profile": profile.to_dict() if profile else None,
                "experiences_len": len(experiences),
                "projects_len": len(projects),
                "skills_len": len(skill_groups),
                "educations_len": len(educations),
                "certifications_len": len(certifications),
                "first_experience": experiences[0].to_dict() if experiences else None,
                "diagnosis": {
                    "would_home_crash": len(experiences) == 0,
                    "reason": "Home.tsx previously accessed experience[0].period without guard – fixed now, but shows why blank screen happened"
                    if len(experiences) == 0
                    else "ok",
                },
            }
        )
    except Exception as e:
        current_app.logger.exception("debug portfolio failed")
        return jsonify({"error": str(e)}), 500
