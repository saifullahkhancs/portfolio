import os
from pathlib import Path
from uuid import uuid4

from flask import Blueprint, current_app, jsonify, request, send_from_directory, url_for
from werkzeug.utils import secure_filename
from app.extensions import db
from app.models import Profile, Experience, SkillGroup, Education, Certification, Project
from .auth import auth_required

portfolio_bp = Blueprint("portfolio", __name__)

# ---------- helpers ----------
IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "bmp"}
VIDEO_EXTENSIONS = {"mp4", "webm", "mov", "m4v", "ogg", "ogv"}
DOCUMENT_EXTENSIONS = {"pdf"}
ALL_UPLOAD_EXTENSIONS = IMAGE_EXTENSIONS | VIDEO_EXTENSIONS | DOCUMENT_EXTENSIONS


def _get_json():
    return request.get_json(silent=True) or {}


def _save_and_return(obj, status=200):
    db.session.add(obj)
    db.session.commit()
    return jsonify(obj.to_dict()), status


def _upload_root() -> str:
    root = (
        current_app.config.get("UPLOAD_FOLDER")
        or os.environ.get("UPLOAD_FOLDER")
        or os.path.abspath(os.path.join(current_app.root_path, "..", "uploads"))
    )
    os.makedirs(root, exist_ok=True)
    return root


def _allowed_for_kind(kind: str):
    kind = (kind or "media").lower()
    if kind in {"image", "photo", "profile", "portrait", "hero", "certificate", "certification"}:
        return IMAGE_EXTENSIONS
    if kind in {"video", "demo"}:
        return VIDEO_EXTENSIONS
    if kind in {"document", "resume", "pdf"}:
        return DOCUMENT_EXTENSIONS
    return ALL_UPLOAD_EXTENSIONS


def _folder_for_extension(ext: str) -> str:
    if ext in IMAGE_EXTENSIONS:
        return "images"
    if ext in VIDEO_EXTENSIONS:
        return "videos"
    if ext in DOCUMENT_EXTENSIONS:
        return "documents"
    return "media"


def _external_upload_url(stored_path: str) -> str:
    return url_for("portfolio.uploaded_file", filename=stored_path, _external=True)

# ---------- uploads ----------
@portfolio_bp.get("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(_upload_root(), filename)


@portfolio_bp.post("/api/uploads")
@auth_required
def upload_file(user):
    file = request.files.get("file") or request.files.get("media")
    if not file or not file.filename:
        return jsonify({"message": "No file selected."}), 400

    original_name = secure_filename(file.filename)
    ext = Path(original_name).suffix.lower().lstrip(".")
    kind = (request.form.get("kind") or "media").lower()
    allowed = _allowed_for_kind(kind)

    if not ext or ext not in allowed:
        return jsonify({
            "message": f"Unsupported file type for {kind}. Allowed: {', '.join(sorted(allowed))}."
        }), 400

    stem = secure_filename(Path(original_name).stem)[:80] or "upload"
    folder = _folder_for_extension(ext)
    filename = f"{uuid4().hex}-{stem}.{ext}"
    relative_path = f"{folder}/{filename}"
    target_dir = os.path.join(_upload_root(), folder)
    os.makedirs(target_dir, exist_ok=True)
    target_path = os.path.join(target_dir, filename)
    file.save(target_path)

    size = os.path.getsize(target_path)
    url = _external_upload_url(relative_path)
    return jsonify({
        "url": url,
        "path": relative_path,
        "filename": original_name,
        "content_type": file.mimetype,
        "size": size,
    }), 201


# ---------- aggregate ----------
@portfolio_bp.get("/api/portfolio")
def get_portfolio():
    profile = Profile.query.order_by(Profile.id).first()
    experiences = Experience.query.order_by(Experience.sort_order, Experience.id).all()
    projects = Project.query.order_by(Project.sort_order, Project.id).all()
    skill_groups = SkillGroup.query.order_by(SkillGroup.sort_order, SkillGroup.id).all()
    educations = Education.query.order_by(Education.sort_order, Education.id).all()
    certifications = Certification.query.order_by(Certification.sort_order, Certification.id).all()
    return jsonify({
        "profile": profile.to_dict() if profile else None,
        "experiences": [e.to_dict() for e in experiences],
        "projects": [p.to_dict() for p in projects],
        "skill_groups": [s.to_dict() for s in skill_groups],
        "skills": [s.to_dict() for s in skill_groups],  # alias for frontend
        "educations": [e.to_dict() for e in educations],
        "education": educations[0].to_dict() if educations else None,
        "certifications": [c.to_dict() for c in certifications],
    })

# ---------- profile / user_info ----------
@portfolio_bp.get("/api/profile")
def list_profile():
    p = Profile.query.order_by(Profile.id).first()
    if not p:
        return jsonify(None), 200
    return jsonify(p.to_dict())

@portfolio_bp.get("/api/profiles")
def list_profiles():
    return jsonify([p.to_dict() for p in Profile.query.order_by(Profile.id).all()])

@portfolio_bp.get("/api/profiles/<int:pid>")
def get_profile(pid):
    p = Profile.query.get_or_404(pid)
    return jsonify(p.to_dict())

@portfolio_bp.post("/api/profiles")
@portfolio_bp.post("/api/profile")
@auth_required
def create_profile(user):
    d = _get_json()
    p = Profile(
        name=(d.get("name") or "").strip() or "Saifullah Khan",
        title=(d.get("title") or d.get("role") or "").strip(),
        description=d.get("description") or d.get("summary") or "",
        email=(d.get("email") or "").strip(),
        phone=(d.get("phone") or "").strip(),
        location=(d.get("location") or "").strip(),
        linkedin=(d.get("linkedin") or "").strip(),
        github=(d.get("github") or "").strip(),
        profile_image_url=d.get("profile_image_url") or d.get("portrait") or "",
        hero_banner_url=d.get("hero_banner_url") or "",
        resume_url=d.get("resume_url") or d.get("resume") or "",
    )
    return _save_and_return(p, 201)

@portfolio_bp.put("/api/profiles/<int:pid>")
@portfolio_bp.put("/api/profile")
@portfolio_bp.put("/api/profile/<int:pid>")
@auth_required
def update_profile(user, pid=None):
    d = _get_json()
    if pid is None:
        # singleton update: update first or create
        p = Profile.query.order_by(Profile.id).first()
        if not p:
            p = Profile()
    else:
        p = Profile.query.get_or_404(pid)

    for field in ("name", "title", "role", "description", "summary", "email", "phone", "location", "linkedin", "github", "profile_image_url", "hero_banner_url", "resume_url", "portrait", "resume"):
        if field in d:
            # map aliases
            if field == "role":
                p.title = d[field]
            elif field == "summary":
                p.description = d[field]
            elif field == "portrait":
                p.profile_image_url = d[field]
            elif field == "resume":
                p.resume_url = d[field]
            else:
                setattr(p, field, d[field])

    db.session.add(p)
    db.session.commit()
    return jsonify(p.to_dict())

@portfolio_bp.delete("/api/profiles/<int:pid>")
@portfolio_bp.delete("/api/profile/<int:pid>")
@auth_required
def delete_profile(user, pid):
    p = Profile.query.get_or_404(pid)
    db.session.delete(p)
    db.session.commit()
    return "", 204

# ---------- experiences ----------
@portfolio_bp.get("/api/experiences")
def list_experiences():
    items = Experience.query.order_by(Experience.sort_order, Experience.id).all()
    return jsonify([i.to_dict() for i in items])

@portfolio_bp.get("/api/experiences/<int:eid>")
def get_experience(eid):
    return jsonify(Experience.query.get_or_404(eid).to_dict())

@portfolio_bp.post("/api/experiences")
@auth_required
def create_experience(user):
    d = _get_json()
    if not d.get("role") or not d.get("company"):
        return jsonify({"message": "role and company required"}), 400
    e = Experience(
        role=d.get("role", ""),
        company=d.get("company", ""),
        location=d.get("location", ""),
        period=d.get("period", ""),
        points=d.get("points", []),
        sort_order=d.get("sort_order", 0),
    )
    return _save_and_return(e, 201)

@portfolio_bp.put("/api/experiences/<int:eid>")
@auth_required
def update_experience(user, eid):
    e = Experience.query.get_or_404(eid)
    d = _get_json()
    for k in ("role", "company", "location", "period", "points", "sort_order"):
        if k in d:
            setattr(e, k, d[k])
    db.session.commit()
    return jsonify(e.to_dict())

@portfolio_bp.delete("/api/experiences/<int:eid>")
@auth_required
def delete_experience(user, eid):
    e = Experience.query.get_or_404(eid)
    db.session.delete(e)
    db.session.commit()
    return "", 204

# ---------- projects (additional, admin_bp also has) ----------
# we will NOT duplicate /api/projects GET here to avoid conflict, but provide alias /api/portfolio/projects

@portfolio_bp.get("/api/portfolio/projects")
def list_projects_alias():
    return jsonify([p.to_dict() for p in Project.query.order_by(Project.sort_order, Project.id).all()])

# ---------- skill groups ----------
@portfolio_bp.get("/api/skill-groups")
@portfolio_bp.get("/api/skills")
def list_skills():
    items = SkillGroup.query.order_by(SkillGroup.sort_order, SkillGroup.id).all()
    return jsonify([i.to_dict() for i in items])

@portfolio_bp.get("/api/skill-groups/<int:sid>")
@portfolio_bp.get("/api/skills/<int:sid>")
def get_skill(sid):
    return jsonify(SkillGroup.query.get_or_404(sid).to_dict())

@portfolio_bp.post("/api/skill-groups")
@portfolio_bp.post("/api/skills")
@auth_required
def create_skill(user):
    d = _get_json()
    if not d.get("group") and not d.get("group_name"):
        return jsonify({"message": "group name required"}), 400
    s = SkillGroup(
        group_name=(d.get("group") or d.get("group_name") or "").strip(),
        items=d.get("items", []),
        sort_order=d.get("sort_order", 0),
    )
    return _save_and_return(s, 201)

@portfolio_bp.put("/api/skill-groups/<int:sid>")
@portfolio_bp.put("/api/skills/<int:sid>")
@auth_required
def update_skill(user, sid):
    s = SkillGroup.query.get_or_404(sid)
    d = _get_json()
    if "group" in d:
        s.group_name = d["group"]
    if "group_name" in d:
        s.group_name = d["group_name"]
    if "items" in d:
        s.items = d["items"]
    if "sort_order" in d:
        s.sort_order = d["sort_order"]
    db.session.commit()
    return jsonify(s.to_dict())

@portfolio_bp.delete("/api/skill-groups/<int:sid>")
@portfolio_bp.delete("/api/skills/<int:sid>")
@auth_required
def delete_skill(user, sid):
    s = SkillGroup.query.get_or_404(sid)
    db.session.delete(s)
    db.session.commit()
    return "", 204

# ---------- education ----------
@portfolio_bp.get("/api/educations")
@portfolio_bp.get("/api/education")
def list_educations():
    items = Education.query.order_by(Education.sort_order, Education.id).all()
    # if client asked singular /api/education return first for backward compat? but we return list if plural, first if singular query param
    if request.path.endswith("/api/education") and len(items) > 0:
        # return list for consistency, but also support single
        # check Accept header? For simplicity, if singular and only one requested via GET /api/education, return first dict
        # However to avoid breaking, we return list when Accept expects array? We'll return first if client wants singular via another endpoint
        pass
    return jsonify([i.to_dict() for i in items])

@portfolio_bp.get("/api/educations/<int:eid>")
def get_education(eid):
    return jsonify(Education.query.get_or_404(eid).to_dict())

@portfolio_bp.post("/api/educations")
@portfolio_bp.post("/api/education")
@auth_required
def create_education(user):
    d = _get_json()
    if not d.get("school"):
        return jsonify({"message": "school required"}), 400
    e = Education(
        school=d.get("school", ""),
        degree=d.get("degree", ""),
        period=d.get("period", ""),
        cgpa=d.get("cgpa", ""),
        coursework=d.get("coursework", ""),
        sort_order=d.get("sort_order", 0),
    )
    return _save_and_return(e, 201)

@portfolio_bp.put("/api/educations/<int:eid>")
@portfolio_bp.put("/api/education/<int:eid>")
@auth_required
def update_education(user, eid):
    e = Education.query.get_or_404(eid)
    d = _get_json()
    for k in ("school", "degree", "period", "cgpa", "coursework", "sort_order"):
        if k in d:
            setattr(e, k, d[k])
    db.session.commit()
    return jsonify(e.to_dict())

@portfolio_bp.delete("/api/educations/<int:eid>")
@portfolio_bp.delete("/api/education/<int:eid>")
@auth_required
def delete_education(user, eid):
    e = Education.query.get_or_404(eid)
    db.session.delete(e)
    db.session.commit()
    return "", 204

# ---------- certifications ----------
@portfolio_bp.get("/api/certifications")
def list_certifications():
    items = Certification.query.order_by(Certification.sort_order, Certification.id).all()
    return jsonify([i.to_dict() for i in items])

@portfolio_bp.get("/api/certifications/<int:cid>")
def get_certification(cid):
    return jsonify(Certification.query.get_or_404(cid).to_dict())

@portfolio_bp.post("/api/certifications")
@auth_required
def create_certification(user):
    d = _get_json()
    if not d.get("name"):
        return jsonify({"message": "name required"}), 400
    c = Certification(
        name=d.get("name", ""),
        issuer=d.get("issuer", ""),
        year=d.get("year", ""),
        detail=d.get("detail", ""),
        image_url=d.get("image_url") or d.get("image") or "",
        image_key=d.get("image_key") or d.get("image") or "",
        sort_order=d.get("sort_order", 0),
    )
    # if image_url looks like key (hackerrank etc), map to key
    if c.image_key and c.image_key.startswith("http"):
        c.image_url = c.image_key
    return _save_and_return(c, 201)

@portfolio_bp.put("/api/certifications/<int:cid>")
@auth_required
def update_certification(user, cid):
    c = Certification.query.get_or_404(cid)
    d = _get_json()
    for k in ("name", "issuer", "year", "detail", "image_url", "image_key", "sort_order"):
        if k in d:
            setattr(c, k, d[k])
    # alias: image
    if "image" in d and "image_url" not in d:
        # if value is url keep as url, else key
        val = d["image"]
        if isinstance(val, str) and val.startswith("http"):
            c.image_url = val
        else:
            c.image_key = val
    db.session.commit()
    return jsonify(c.to_dict())

@portfolio_bp.delete("/api/certifications/<int:cid>")
@auth_required
def delete_certification(user, cid):
    c = Certification.query.get_or_404(cid)
    db.session.delete(c)
    db.session.commit()
    return "", 204
