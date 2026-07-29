from datetime import datetime, timezone
from app.extensions import db


class Certification(db.Model):
    __tablename__ = "certifications"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    issuer = db.Column(db.String(255), nullable=False, default="")
    year = db.Column(db.String(100), nullable=False, default="")
    detail = db.Column(db.Text, nullable=False, default="")
    image_url = db.Column(db.Text, nullable=False, default="")
    image_key = db.Column(db.String(100), nullable=False, default="")
    sort_order = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "issuer": self.issuer,
            "year": self.year,
            "detail": self.detail,
            "image_url": self.image_url,
            "image": self.image_key,
            "image_key": self.image_key,
            "sort_order": self.sort_order,
        }
