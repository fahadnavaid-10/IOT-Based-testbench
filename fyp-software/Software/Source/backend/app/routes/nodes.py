"""Node management: list, available, create, update, delete."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app import db
from app.models.node import Node
from app.models.user import User

nodes_bp = Blueprint("nodes", __name__)


def _require_admin():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return None
    return get_jwt_identity()


# ===============================
# List all nodes
# ===============================
@nodes_bp.route("", methods=["GET"])
@jwt_required()
def list_nodes():
    """GET /nodes - list all nodes."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    nodes = Node.query.order_by(Node.node_id).all()

    out = [n.to_dict() for n in nodes]

    return jsonify(out)


# ===============================
# Available nodes
# ===============================
@nodes_bp.route("/available", methods=["GET"])
@jwt_required()
def available_nodes():
    """GET /nodes/available - nodes that are idle and can be selected for experiment."""
    nodes = Node.query.filter(
        Node.status.in_(["idle", "offline"])
    ).order_by(Node.node_id).all()

    return jsonify([
        {
            "id": n.node_id,
            "status": n.status
        } for n in nodes
    ])


# ===============================
# Create node (Admin)
# ===============================
@nodes_bp.route("", methods=["POST"])
@jwt_required()
def create_node():

    if not _require_admin():
        return jsonify({"error": "Admin only"}), 403

    data = request.get_json() or {}

    node_id = (data.get("nodeId") or data.get("node_id") or "").strip().upper()

    if not node_id:
        return jsonify({"error": "nodeId is required"}), 400

    if Node.query.filter_by(node_id=node_id).first():
        return jsonify({"error": "Node already exists"}), 409

    node = Node(
    node_id=node_id,
    mac_address=data.get("macAddress") or data.get("mac_address"),
    status=data.get("status", "idle"),
    ip_address=data.get("ipAddress") or data.get("ip_address"),
    firmware_version=data.get("firmwareVersion") or data.get("firmware_version"),
    battery_level=data.get("batteryLevel", data.get("battery_level")),
)

    db.session.add(node)
    db.session.commit()

    return jsonify(node.to_dict()), 201


# ===============================
# Update node
# ===============================
@nodes_bp.route("/<node_id>", methods=["PUT"])
@jwt_required()
def update_node(node_id):

    if not _require_admin():
        return jsonify({"error": "Admin only"}), 403

    node = Node.query.filter_by(node_id=node_id).first()

    if not node:
        return jsonify({"error": "Node not found"}), 404

    data = request.get_json() or {}

    if "status" in data:
        node.status = data["status"]

    if "ipAddress" in data or "ip_address" in data:
        node.ip_address = data.get("ipAddress") or data.get("ip_address")

    if "firmwareVersion" in data or "firmware_version" in data:
        node.firmware_version = data.get("firmwareVersion") or data.get("firmware_version")

    if "batteryLevel" in data or "battery_level" in data:
        node.battery_level = data.get("batteryLevel", data.get("battery_level"))

    if "macAddress" in data or "mac_address" in data:
        node.mac_address = data.get("macAddress") or data.get("mac_address")

    db.session.commit()

    return jsonify(node.to_dict())


# ===============================
# Delete node
# ===============================
@nodes_bp.route("/<node_id>", methods=["DELETE"])
@jwt_required()
def delete_node(node_id):

    if not _require_admin():
        return jsonify({"error": "Admin only"}), 403

    node = Node.query.filter_by(node_id=node_id).first()

    if not node:
        return jsonify({"error": "Node not found"}), 404

    db.session.delete(node)
    db.session.commit()

    return jsonify({"message": "Node deleted"}), 200


# ===============================
# Node Heartbeat (ESP32)
# ===============================
@nodes_bp.route("/heartbeat", methods=["POST"])
def heartbeat():
    """POST /nodes/heartbeat - called by ESP32"""

    data = request.get_json() or {}

    mac_address = (data.get("nodeId") or data.get("node_id") or "").strip()

    if not mac_address:
        return jsonify({"error": "Node ID / MAC address required"}), 400

    node = Node.query.filter((Node.node_id == mac_address) | (Node.mac_address == mac_address)).first()

    if not node:
        return jsonify({"error": "Node not found"}), 404

    from datetime import datetime

    node.last_heartbeat = datetime.utcnow()
    node.last_active = datetime.utcnow()

    if node.status == "offline":
        node.status = "idle"

    if "batteryLevel" in data:
        node.battery_level = data["batteryLevel"]

    if "temperature" in data:
        node.temperature = data["temperature"]

    if "humidity" in data:
        node.humidity = data["humidity"]

    if "light" in data:
        node.light = data["light"]

    # ⭐ Firmware version update
    if "firmwareVersion" in data:
        node.firmware_version = data["firmwareVersion"]

    db.session.commit()

    return jsonify({"status": "ok"})
