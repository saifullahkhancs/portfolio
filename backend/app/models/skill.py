from datetime import datetime, timezone
from app.extensions import db


class SkillGroup(db.Model):
    __tablename__ = "skill_groups"

    id = db.Column(db.Integer, primary_key=True)
    group_name = db.Column(db.String(120), nullable=False)
    items = db.Column(db.JSON, nullable=False, default=list)
    sort_order = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "group": self.group_name,
            "group_name": self.group_name,
            "items": self.items or [],
            "sort_order": self.sort_order,
        }
