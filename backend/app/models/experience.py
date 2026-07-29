from datetime import datetime, timezone
from app.extensions import db


class Experience(db.Model):
    __tablename__ = "experiences"

    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(160), nullable=False)
    company = db.Column(db.String(160), nullable=False)
    location = db.Column(db.String(160), nullable=False, default="")
    period = db.Column(db.String(120), nullable=False, default="")
    points = db.Column(db.JSON, nullable=False, default=list)
    sort_order = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "role": self.role,
            "company": self.company,
            "location": self.location,
            "period": self.period,
            "points": self.points or [],
            "sort_order": self.sort_order,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
