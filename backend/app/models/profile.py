from datetime import datetime, timezone
from app.extensions import db


class Profile(db.Model):
    __tablename__ = "profiles"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(160), nullable=False, default="Saifullah Khan")
    title = db.Column(db.String(255), nullable=False, default="Software Engineer | Full Stack Developer")
    description = db.Column(db.Text, nullable=False, default="")
    email = db.Column(db.String(255), nullable=False, default="")
    phone = db.Column(db.String(50), nullable=False, default="")
    location = db.Column(db.String(255), nullable=False, default="")
    linkedin = db.Column(db.String(500), nullable=False, default="")
    github = db.Column(db.String(500), nullable=False, default="")
    profile_image_url = db.Column(db.Text, nullable=False, default="")
    hero_banner_url = db.Column(db.Text, nullable=False, default="")
    resume_url = db.Column(db.Text, nullable=False, default="")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "title": self.title,
            "role": self.title,
            "description": self.description,
            "summary": self.description,
            "email": self.email,
            "phone": self.phone,
            "location": self.location,
            "linkedin": self.linkedin,
            "github": self.github,
            "profile_image_url": self.profile_image_url,
            "hero_banner_url": self.hero_banner_url,
            "resume_url": self.resume_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
