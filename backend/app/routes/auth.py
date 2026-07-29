from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import Blueprint, jsonify, request, current_app
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from app.models import User

auth_bp = Blueprint("auth", __name__)
def _serializer(): return URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
def token_for(user): return _serializer().dumps({"id": user.id, "email": user.email})
def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        raw = request.headers.get("Authorization", "")
        if not raw.startswith("Bearer "): return jsonify({"message":"Authentication required."}), 401
        try: data = _serializer().loads(raw[7:], max_age=86400)
        except (BadSignature, SignatureExpired): return jsonify({"message":"Invalid or expired session."}), 401
        user = User.query.get(data.get("id"))
        if not user or not user.is_active: return jsonify({"message":"Authentication required."}), 401
        return fn(user, *args, **kwargs)
    return wrapper

@auth_bp.post("/api/auth/login")
def login():
    data=request.get_json(silent=True) or {}; user=User.query.filter_by(email=(data.get("email") or "").strip().lower()).first()
    if not user or not user.check_password(data.get("password") or ""): return jsonify({"message":"Invalid email or password."}), 401
    return jsonify({"token": token_for(user), "user": user.to_dict()})

@auth_bp.get("/api/auth/me")
@auth_required
def me(user): return jsonify(user.to_dict())
