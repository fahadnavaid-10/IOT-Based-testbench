from datetime import datetime, timezone
from app import db

class Firmware(db.Model):
    __tablename__ = "firmware"

    id = db.Column(db.Integer, primary_key=True)
    version = db.Column(db.String(50), nullable=False)
    filename = db.Column(db.String(200), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "version": self.version,
            "filename": self.filename,
            "uploaded_at": self.uploaded_at
        }