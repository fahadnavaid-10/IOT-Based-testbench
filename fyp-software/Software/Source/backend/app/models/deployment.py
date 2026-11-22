"""Deployment and per-node deployment status."""
from app import db


class Deployment(db.Model):
    __tablename__ = "deployments"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    experiment_id = db.Column(db.Integer, db.ForeignKey("experiments.id"), nullable=False)
    status = db.Column(db.String(20), default="pending", nullable=False)  # pending, in_progress, completed, failed
    started_at = db.Column(db.DateTime, server_default=db.func.now())
    completed_at = db.Column(db.DateTime, nullable=True)

    experiment = db.relationship("Experiment", back_populates="deployment")
    node_statuses = db.relationship("DeploymentNodeStatus", back_populates="deployment", cascade="all, delete-orphan")


class DeploymentNodeStatus(db.Model):
    __tablename__ = "deployment_node_statuses"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    deployment_id = db.Column(db.Integer, db.ForeignKey("deployments.id"), nullable=False)
    node_id = db.Column(db.String(32), nullable=False)
    progress = db.Column(db.Integer, default=0, nullable=False)  # 0-100
    status = db.Column(db.String(20), default="deploying", nullable=False)  # deploying, success, failed
    error_message = db.Column(db.String(512), nullable=True)
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    deployment = db.relationship("Deployment", back_populates="node_statuses")
