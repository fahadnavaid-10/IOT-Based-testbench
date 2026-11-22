"""Node model for IoT devices."""
from datetime import datetime

from app import db


class Node(db.Model):
    __tablename__ = "nodes"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    node_id = db.Column(db.String(32), unique=True, nullable=False, index=True)  # e.g. NODE-001
    status = db.Column(db.String(20), default="idle", nullable=False)  # idle, reserved, deploying, running, failed, offline
    ip_address = db.Column(db.String(45), nullable=True)
    mac_address = db.Column(db.String(50), nullable=True)
    firmware_version = db.Column(db.String(64), nullable=True)
    battery_level = db.Column(db.Integer, nullable=True)  # 0-100
    last_heartbeat = db.Column(db.DateTime, nullable=True)
    last_active = db.Column(db.DateTime, nullable=True)
    current_experiment_id = db.Column(db.Integer, db.ForeignKey("experiments.id"), nullable=True)
    temperature = db.Column(db.Float, nullable=True)
    humidity = db.Column(db.Float, nullable=True)
    light = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    current_experiment = db.relationship("Experiment", backref="nodes_using", foreign_keys=[current_experiment_id])

    def to_dict(self):
        return {
            "id": self.node_id,
            "status": self.status,
            "ip": self.ip_address or "",
            "mac_address": self.mac_address or "-",
            "firmware": self.firmware_version or "-",
            "battery": self.battery_level,
            "lastActive": self._format_last_active(),
            "experiment": getattr(self.current_experiment, "name", None) or "-",
            "temperature": self.temperature,
            "humidity": self.humidity,
            "light": self.light,
        }

    def _format_last_active(self):
        if not self.last_heartbeat and not self.last_active:
            return "-"
        t = self.last_heartbeat or self.last_active
        if not t:
            return "-"
        delta = datetime.utcnow() - t
        if delta.total_seconds() < 60:
            return "Just now"
        if delta.total_seconds() < 3600:
            return f"{int(delta.total_seconds() / 60)} min ago"
        if delta.total_seconds() < 86400:
            return f"{int(delta.total_seconds() / 3600)} hours ago"
        return f"{delta.days} days ago"
