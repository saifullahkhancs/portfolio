from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    def to_dict(self):
        return {"id": self.id, "email": self.email, "is_active": self.is_active}

class Project(db.Model):
    __tablename__ = "projects"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(160), nullable=False)
    tagline = db.Column(db.String(255), nullable=False, default="")
    period = db.Column(db.String(120), nullable=False, default="")
    description = db.Column(db.Text, nullable=False, default="")
    stack = db.Column(db.JSON, nullable=False, default=list)
    project_url = db.Column(db.String(500), nullable=False, default="")
    video_url = db.Column(db.String(500), nullable=False, default="")
    featured = db.Column(db.Boolean, nullable=False, default=False)
    sort_order = db.Column(db.Integer, nullable=False, default=0)
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "tagline": self.tagline,
            "period": self.period,
            "description": self.description,
            "stack": self.stack or [],
            "project_url": self.project_url,
            "projectUrl": self.project_url,
            "video_url": self.video_url,
            "videoUrl": self.video_url,
            "featured": self.featured,
            "sort_order": self.sort_order,
        }
