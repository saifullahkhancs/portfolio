from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models import Project
from .auth import auth_required
admin_bp=Blueprint("admin", __name__)

@admin_bp.get("/api/projects")
def projects(): return jsonify([p.to_dict() for p in Project.query.order_by(Project.id).all()])
@admin_bp.post("/api/projects")
@auth_required
def create(user):
    d=request.get_json(silent=True) or {}; p=Project(name=(d.get("name") or "").strip(), tagline=d.get("tagline", ""), period=d.get("period", ""), description=d.get("description", ""), stack=d.get("stack", []), project_url=d.get("project_url", ""), video_url=d.get("video_url", ""), sort_order=d.get("sort_order", 0))
    if not p.name: return jsonify({"message":"Project name is required."}),400
    db.session.add(p); db.session.commit(); return jsonify(p.to_dict()),201
@admin_bp.put("/api/projects/<int:project_id>")
@auth_required
def update(user, project_id):
    p=Project.query.get_or_404(project_id); d=request.get_json(silent=True) or {}
    for key in ("name","tagline","period","description","stack","project_url","video_url","sort_order"):
        if key in d: setattr(p,key,d[key])
    db.session.commit(); return jsonify(p.to_dict())
@admin_bp.delete("/api/projects/<int:project_id>")
@auth_required
def delete(user, project_id):
    p=Project.query.get_or_404(project_id); db.session.delete(p); db.session.commit(); return "",204
