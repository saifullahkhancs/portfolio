from datetime import datetime, timezone
from app.extensions import db


class Education(db.Model):
    __tablename__ = "educations"

    id = db.Column(db.Integer, primary_key=True)
    school = db.Column(db.String(255), nullable=False)
    degree = db.Column(db.String(255), nullable=False)
    period = db.Column(db.String(120), nullable=False, default="")
    cgpa = db.Column(db.String(50), nullable=False, default="")
    coursework = db.Column(db.Text, nullable=False, default="")
    sort_order = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "school": self.school,
            "degree": self.degree,
            "period": self.period,
            "cgpa": self.cgpa,
            "coursework": self.coursework,
            "sort_order": self.sort_order,
        }
