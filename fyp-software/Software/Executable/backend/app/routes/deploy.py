"""OTA deployment: trigger deploy, get status."""
import threading
import time

from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app import db, socketio
from app.models.user import User
from app.models.experiment import Experiment, ExperimentNode
from app.models.node import Node
from app.models.deployment import Deployment, DeploymentNodeStatus
from app.models.system_log import SystemLog

deploy_bp = Blueprint("deploy", __name__)


def _current_user():
    return User.query.get(int(get_jwt_identity()))


def _can_access_experiment(exp):
    if get_jwt().get("role") == "admin":
        return True
    return exp.user_id == int(get_jwt_identity())


def _simulate_ota(app, deployment_id, experiment_id):
    """Background: simulate OTA progress per node and emit via SocketIO."""
    with app.app_context():
        dep = Deployment.query.get(deployment_id)
        if not dep or dep.status not in ("pending", "in_progress"):
            return
        exp = Experiment.query.get(experiment_id)
        if not exp:
            return
        node_ids = [en.node_id for en in exp.experiment_nodes]
        for nid in node_ids:
            ns = DeploymentNodeStatus.query.filter_by(
                deployment_id=deployment_id, node_id=nid
            ).first()
            if not ns:
                ns = DeploymentNodeStatus(
                    deployment_id=deployment_id,
                    node_id=nid,
                    progress=0,
                    status="deploying",
                )
                db.session.add(ns)
        db.session.commit()

        for nid in node_ids:
            ns = DeploymentNodeStatus.query.filter_by(
                deployment_id=deployment_id, node_id=nid
            ).first()
            for p in range(0, 101, 10):
                time.sleep(0.15)
                ns.progress = p
                ns.status = "deploying"
                db.session.commit()
                socketio.emit(
                    "deploy_progress",
                    {
                        "deploymentId": deployment_id,
                        "experimentId": experiment_id,
                        "nodeId": nid,
                        "progress": p,
                        "status": "deploying",
                    },
                    room=f"deploy_{experiment_id}",
                )
            ns.progress = 100
            ns.status = "success"
            db.session.commit()
            socketio.emit(
                "deploy_progress",
                {
                    "deploymentId": deployment_id,
                    "experimentId": experiment_id,
                    "nodeId": nid,
                    "progress": 100,
                    "status": "success",
                },
                room=f"deploy_{experiment_id}",
            )

        dep.status = "completed"
        db.session.commit()
        socketio.emit(
            "deploy_complete",
            {"deploymentId": deployment_id, "experimentId": experiment_id},
            room=f"deploy_{experiment_id}",
        )


@deploy_bp.route("/<int:experiment_id>", methods=["POST"])
@jwt_required()
def start_deploy(experiment_id):
    """POST /deploy/{experiment_id} - start OTA deployment."""
    user = _current_user()
    exp = Experiment.query.get(experiment_id)
    if not exp:
        return jsonify({"error": "Experiment not found"}), 404
    if not _can_access_experiment(exp):
        return jsonify({"error": "Forbidden"}), 403

    existing = Deployment.query.filter_by(experiment_id=experiment_id).first()
    if existing and existing.status in ("pending", "in_progress"):
        return jsonify({"error": "Deployment already in progress", "deploymentId": existing.id}), 409

    dep = Deployment(experiment_id=experiment_id, status="in_progress")
    db.session.add(dep)
    db.session.flush()
    for en in exp.experiment_nodes:
        db.session.add(
            DeploymentNodeStatus(
                deployment_id=dep.id,
                node_id=en.node_id,
                progress=0,
                status="deploying",
            )
        )
    db.session.add(SystemLog(user_id=user.id, action="deploy_start", details=f"Experiment {exp.name}"))
    db.session.commit()

    app = current_app._get_current_object()
    thread = threading.Thread(
        target=_simulate_ota,
        args=(app, dep.id, experiment_id),
        daemon=True,
    )
    thread.start()

    return jsonify({
        "deploymentId": dep.id,
        "experimentId": experiment_id,
        "status": "in_progress",
        "message": "Deployment started",
    }), 202


@deploy_bp.route("/status/<int:experiment_id>", methods=["GET"])
@jwt_required()
def deploy_status(experiment_id):
    """GET /deploy/status/{experiment_id} - get deployment status."""
    exp = Experiment.query.get(experiment_id)
    if not exp:
        return jsonify({"error": "Experiment not found"}), 404
    if not _can_access_experiment(exp):
        return jsonify({"error": "Forbidden"}), 403

    dep = Deployment.query.filter_by(experiment_id=experiment_id).order_by(
        Deployment.started_at.desc()
    ).first()
    if not dep:
        return jsonify({
            "experimentId": experiment_id,
            "deploymentId": None,
            "status": "not_started",
            "nodes": [],
        })

    nodes = [
        {
            "id": ns.node_id,
            "progress": ns.progress,
            "status": ns.status,
            "error": ns.error_message,
            "updatedAt": ns.updated_at.isoformat() if ns.updated_at else None,
        }
        for ns in dep.node_statuses
    ]
    return jsonify({
        "experimentId": experiment_id,
        "deploymentId": dep.id,
        "status": dep.status,
        "startedAt": dep.started_at.isoformat() if dep.started_at else None,
        "completedAt": dep.completed_at.isoformat() if dep.completed_at else None,
        "nodes": nodes,
    })


@deploy_bp.route("", methods=["GET"])
@jwt_required()
def list_deployments():
    """GET /api/deploy - flattened deployment log entries for Deployment Logs page."""
    if get_jwt().get("role") == "admin":
        deployments = Deployment.query.order_by(Deployment.started_at.desc()).limit(100).all()
    else:
        deployments = (
            Deployment.query.join(Experiment)
            .filter(Experiment.user_id == int(get_jwt_identity()))
            .order_by(Deployment.started_at.desc())
            .limit(100)
            .all()
        )
    rows = []
    for dep in deployments:
        exp = dep.experiment
        firmware = exp.firmware_original_name or "-"
        for ns in dep.node_statuses:
            rows.append({
                "experiment": exp.name,
                "experimentId": exp.id,
                "node": ns.node_id,
                "firmware": firmware,
                "time": (ns.updated_at or dep.started_at).isoformat() if (ns.updated_at or dep.started_at) else None,
                "status": ns.status,
                "error": ns.error_message or "",
            })
    return jsonify(rows)
