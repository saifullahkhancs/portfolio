import re

from flask import Blueprint, jsonify, request

from app.extensions import db
from app.models import ContactMessage

contact_bp = Blueprint("contact", __name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@contact_bp.post("/api/contact")
def create_contact_message():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()

    errors = []
    if not name:
        errors.append("Name is required.")
    elif len(name) > 120:
        errors.append("Name is too long.")

    if not email:
        errors.append("Email is required.")
    elif not EMAIL_RE.match(email):
        errors.append("Email is not valid.")

    if not message:
        errors.append("Message is required.")
    elif len(message) > 5000:
        errors.append("Message is too long.")

    if errors:
        return jsonify({"message": " ".join(errors)}), 400

    entry = ContactMessage(name=name, email=email, message=message)
    db.session.add(entry)
    db.session.commit()

    return jsonify({"message": "Message received.", "data": entry.to_dict()}), 201


@contact_bp.get("/api/contact")
def list_contact_messages():
    """Simple listing endpoint, intended for the site owner (add auth before
    exposing this publicly in production).

    Limits to the most recent 100 messages to avoid performance issues.
    """
    limit = int(request.args.get("limit", 100))
    messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).limit(limit).all()
    return jsonify([m.to_dict() for m in messages])
