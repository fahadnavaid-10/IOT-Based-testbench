"""Seed initial data (admin user, sample nodes)."""
import bcrypt

from app import db
from app.models.user import User
from app.models.node import Node


def seed_if_empty():
    if User.query.filter_by(role="admin").first():
        return
    # Create default admin
    admin = User(
        email="admin@iot.dev",
        password_hash=bcrypt.hashpw(b"password", bcrypt.gensalt()).decode("utf-8"),
        full_name="Admin User",
        role="admin",
        institution="IoT Lab",
        approved=True,
    )
    db.session.add(admin)
    # Sample researcher (approved for demo)
    researcher = User(
        email="researcher@iot.dev",
        password_hash=bcrypt.hashpw(b"password", bcrypt.gensalt()).decode("utf-8"),
        full_name="Dr. Sarah Chen",
        role="researcher",
        institution="MIT",
        research_purpose="IoT experimentation",
        approved=True,
    )
    db.session.add(researcher)
    # Seed 12 nodes
    for i in range(1, 13):
        node_id = f"NODE-{i:03d}"
        if Node.query.filter_by(node_id=node_id).first():
            continue
        node = Node(
            node_id=node_id,
            status="idle" if i not in (3, 8) else "offline",
            ip_address=f"192.168.1.{100 + i}",
            firmware_version="v2.3.1",
            battery_level=min(100, 70 + (i * 2) % 30),
        )
        db.session.add(node)
    db.session.commit()
