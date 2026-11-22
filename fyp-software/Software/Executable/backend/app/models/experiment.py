from app import db
from datetime import datetime, timezone


class Experiment(db.Model):
    __tablename__ = "experiments"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_time = db.Column(db.DateTime, nullable=True)
    end_time = db.Column(db.DateTime, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    firmware_path = db.Column(db.String(512), nullable=True)
    firmware_original_name = db.Column(db.String(255), nullable=True)

    created_at = db.Column(db.DateTime, server_default=db.func.now())

    user = db.relationship("User", back_populates="experiments")

    experiment_nodes = db.relationship(
        "ExperimentNode",
        back_populates="experiment",
        cascade="all, delete-orphan"
    )

    deployment = db.relationship(
        "Deployment",
        back_populates="experiment",
        uselist=False,
        cascade="all, delete-orphan"
    )

    def to_dict(self):

        # ⭐ automatic status calculation
        now = datetime.now(timezone.utc)

        if self.start_time and now < self.start_time:
            status = "Scheduled"

        elif self.start_time and self.end_time and self.start_time <= now <= self.end_time:
            status = "Active"

        elif self.end_time and now > self.end_time:
            status = "Completed"

        else:
            status = "Scheduled"

        return {
            "id": self.id,
            "name": self.name,
            "description": self.description or "",
            "startTime": self.start_time.isoformat() if self.start_time else None,
            "endTime": self.end_time.isoformat() if self.end_time else None,
            "status": status,
            "userId": self.user_id,
            "nodeIds": [en.node_id for en in self.experiment_nodes],
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class ExperimentNode(db.Model):
    __tablename__ = "experiment_nodes"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    experiment_id = db.Column(db.Integer, db.ForeignKey("experiments.id"), nullable=False)

    node_id = db.Column(db.String(32), nullable=False)

    experiment = db.relationship("Experiment", back_populates="experiment_nodes")
