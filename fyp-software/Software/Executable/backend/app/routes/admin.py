"""Admin: users list, approve user; system stats."""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from datetime import datetime, timezone
from app import db
from app.models.user import User
from app.models.node import Node
from app.models.experiment import Experiment
from app.models.deployment import Deployment
from app.models.system_log import SystemLog

admin_bp = Blueprint("admin", __name__)


def _require_admin():
    if get_jwt().get("role") != "admin":
        return False
    return True


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def list_users():
    """GET /admin/users - list all users (admin only)."""
    if not _require_admin():
        return jsonify({"error": "Admin only"}), 403
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users])


@admin_bp.route("/approve-user/<int:user_id>", methods=["PUT"])
@jwt_required()
def approve_user(user_id):
    """PUT /admin/approve-user/{id} - approve researcher (admin only)."""
    if not _require_admin():
        return jsonify({"error": "Admin only"}), 403
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    user.approved = True
    db.session.commit()
    return jsonify(user.to_dict())


@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
def stats():
    """GET /admin/stats - dashboard stats (admin: system-wide; researcher: own)."""
    claims = get_jwt()
    is_admin = claims.get("role") == "admin"
    user_id = int(get_jwt_identity())

    total_nodes = Node.query.count()
    online_nodes = Node.query.filter(Node.status.in_(["idle", "running", "deploying", "reserved"])).count()
    # Offline = no heartbeat for 2 min; we simplify to status offline
    offline_nodes = Node.query.filter_by(status="offline").count()
    now = datetime.now(timezone.utc)
    
    assigned_nodes = Node.query.filter(
    Node.status.in_(["reserved", "running"])
).count()
    if is_admin:
        active_experiments = Experiment.query.filter(
        Experiment.start_time <= now,
        Experiment.end_time >= now
).count()
        total_users = User.query.count()
        return jsonify({
            "totalNodes": total_nodes,
            "onlineNodes": online_nodes,
            "offlineNodes": offline_nodes,
            "activeExperiments": active_experiments,
            "totalUsers": total_users,
            "systemHealth": "ok",
        })
    else:
        my_experiments = Experiment.query.filter_by(user_id=user_id).count()
        return jsonify({
            "totalNodes": total_nodes,
            "onlineNodes": online_nodes,
            "myActiveExperiments": my_experiments,
            "assignedNodes": assigned_nodes
        })
