"""User model."""
from app import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="researcher")  # admin | researcher
    institution = db.Column(db.String(255), nullable=True)
    research_purpose = db.Column(db.Text, nullable=True)
    approved = db.Column(db.Boolean, default=False, nullable=False)  # researchers need approval
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    experiments = db.relationship("Experiment", back_populates="user", lazy="dynamic")

    def to_dict(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "fullName": self.full_name,
            "role": self.role,
            "institution": self.institution or "",
            "approved": self.approved,
        }
